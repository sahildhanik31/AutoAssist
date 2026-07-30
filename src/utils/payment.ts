import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import type { TransactionType } from "@/types/workflow";

interface CompletePaymentInput {
  transactionType: TransactionType;
  recordId: string;
  amount: number;
  method: string;
  isCash?: boolean;
  last4?: string;
}

export interface CompletedPayment {
  paymentId: string;
  transactionId: string;
  status: "success" | "cash_pending";
}

export async function completePayment({
  transactionType,
  recordId,
  amount,
  method,
  isCash = false,
  last4,
}: CompletePaymentInput): Promise<CompletedPayment> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Please log in again.");
  if (!recordId) throw new Error("The transaction reference is missing.");
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("The payment amount is invalid.");
  }

  const status = isCash ? "cash_pending" : "success";
  const transactionId = `${isCash ? "CASH" : "TXN"}${Date.now()}`;
  const batch = writeBatch(db);
  const paymentRef = doc(collection(db, "payments"));
  batch.set(paymentRef, {
    userId: uid,
    bookingId: recordId,
    transactionType,
    recordId,
    method,
    amount,
    status,
    transactionId,
    ...(last4 ? { last4 } : {}),
    createdAt: serverTimestamp(),
    paidAt: isCash ? null : serverTimestamp(),
  });

  if (transactionType === "inspection") {
    batch.update(doc(db, "inspectionRequests", recordId), {
      paymentStatus: isCash ? "cash_pending" : "paid",
      status: "confirmed",
      updatedAt: serverTimestamp(),
    });
  } else if (transactionType === "membership") {
    const membershipRef = doc(db, "users", uid, "memberships", "current");
    const membershipSnapshot = await getDoc(membershipRef);
    if (!membershipSnapshot.exists()) {
      throw new Error("The membership selection could not be found.");
    }
    const planId = membershipSnapshot.data().planId;
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    if (planId === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    batch.update(membershipRef, {
      status: "active",
      paymentId: paymentRef.id,
      startDate,
      expiryDate,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, "users", uid), {
      membershipStatus: "active",
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(doc(db, "bookings", recordId), {
      paymentStatus: isCash ? "cash_pending" : "paid",
      bookingStatus: "confirmed",
      updatedAt: serverTimestamp(),
    });
  }

  const notificationRef = doc(collection(db, "users", uid, "notifications"));
  batch.set(notificationRef, {
    title: isCash ? "Booking Confirmed" : "Payment Successful",
    message: isCash
      ? `Your booking is confirmed. ₹${amount.toFixed(2)} is due at service.`
      : `Your payment of ₹${amount.toFixed(2)} was completed successfully.`,
    type: "payment",
    relatedId: paymentRef.id,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();

  return {
    paymentId: paymentRef.id,
    transactionId,
    status,
  };
}
