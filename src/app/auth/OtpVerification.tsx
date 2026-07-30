import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateOtp, verifyOtp, RESEND_COOLDOWN_SECONDS } from "@/utils/otp";
import { sendOtpEmail } from "@/utils/emailjs";
import { consumePendingSignup } from "@/utils/pendingAuth";
import { auth } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Image } from "react-native";
import AppBackButton from "@/components/common/AppBackButton";

export default function OtpVerificationScreen() {
    const { mode, email: emailParam } = useLocalSearchParams<{
        mode: string;
        email: string;
    }>();
    const email = emailParam ?? "";
    const isSignup = mode === "signup";

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((c) => (c > 0 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    async function handleResend() {
        setError("");
        if (!isSignup || !email) {
            router.replace("/auth/Login");
            return;
        }
        setResending(true);
        try {
           const { code, expiresAt } = generateOtp(email);
await sendOtpEmail(email, code, expiresAt);
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError("Couldn't resend the code. Please try again.");
        } finally {
            setResending(false);
        }
    }

    async function handleVerify() {
        if (!isSignup || !email) {
            router.replace("/auth/Login");
            return;
        }
        if (!/^\d{6}$/.test(code)) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }
        setLoading(true);
        setError("");
        const result = verifyOtp(email, code);
        if (!result.success) {
            setError(result.error ?? "Invalid code.");
            setLoading(false);
            return;
        }
        try {
            if (isSignup) {
                const pending = consumePendingSignup();
                if (!pending) {
                    setError("Your signup session expired. Please start again.");
                    setLoading(false);
                    return;
                }

                try {
                    const credential = await createUserWithEmailAndPassword(
                        auth,
                        pending.email,
                        pending.password
                    );

                    await updateProfile(credential.user, { displayName: pending.name });

                    await setDoc(doc(db, "users", credential.user.uid), {
                        name: pending.name,
                        email: pending.email,
                        phone: "",
                        profileImageUrl: "",
                        membershipStatus: "none",
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                } catch (signupErr: any) {
                    if (signupErr?.code === "auth/email-already-in-use") {
                        setError(
                            "An account with this email already exists. Please log in instead."
                        );
                    } else {
                        setError(signupErr?.message ?? "Couldn't create your account. Please try again.");
                    }
                    setLoading(false);
                    return;
                }
            }
            router.replace({
                pathname: "/bookings/VehicleSelection",
                params: {
                    vehicleType: "four",
                    onboarding: "true",
                    source: "onboarding",
                    returnTo: "/tabs/HomeScreen",
                },
            });
        } catch (err: any) {
            console.log(err);
            setError(err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.card}>
                            <AppBackButton fallbackRoute="/auth/CreateAccount" />
                            <Image
                            source={require("@/assets/images/logo.png")}
                            style={styles.logo}/>
                            <Text style={styles.appName}>Verify your email</Text>
                            <Text style={styles.tagline}>
                                We sent a 6-digit code to{"\n"}
                                {email}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="6-digit code"
                                placeholderTextColor="#888888"
                                keyboardType="number-pad"
                                maxLength={6}
                                value={code}
                                onChangeText={(text) =>
                                    setCode(text.replace(/[^0-9]/g, ""))
                                }
                            />
                            {!!error && <Text style={styles.errorText}>{error}</Text>}
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleVerify}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Verify</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={cooldown > 0 || resending}
                            >
                                <Text style={styles.forgotText}>
                                    {resending
                                        ? "Resending..."
                                        : cooldown > 0
                                        ? `Resend code in ${cooldown}s`
                                        : "Resend code"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 36,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 30,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#0F2F5F",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },

  logo: {
    width: 175,
    height: 90,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 14,
  },

  appName: {
    fontSize: 29,
    fontWeight: "800",
    color: "#123A7A",
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    letterSpacing: 0.2,
  },

  input: {
    width: "100%",
    height: 64,
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#C9D8EC",
    borderRadius: 17,
    paddingHorizontal: 18,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 11,
    textAlign: "center",
    color: "#123A7A",
    marginBottom: 18,

    shadowColor: "#153E90",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  errorText: {
    width: "100%",
    backgroundColor: "#FFF1F2",
    color: "#C62828",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 13,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#F7C7CD",
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#0D2D62",

    shadowColor: "#123A7A",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  forgotText: {
    color: "#174A97",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 8,
    letterSpacing: 0.1,
  },
});