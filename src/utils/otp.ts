/**
 * Lightweight, in-memory OTP store.
 *
 * NOTE: This is a client-only implementation, chosen because AutoAssist doesn't
 * have a backend yet. It's fine for a personal/demo project, but it means the
 * OTP is generated and checked entirely on the device. Anyone who can inspect
 * the app's JS bundle could theoretically read or bypass this logic. If you
 * later add a server, move this file's logic there and have the app just call
 * `/send-otp` and `/verify-otp` endpoints instead.
 */

type OtpRecord = {
    code: string;
    expiresAt: number;
    attempts: number;
};

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes — matches the EmailJS template wording
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

const otpStore = new Map<string, OtpRecord>();

function normalize(email: string): string {
    return email.trim().toLowerCase();
}

/** Generates and stores a fresh 6-digit code for the given email. Returns the
 * code plus the timestamp it expires at, so the caller can show/send that time. */
export function generateOtp(email: string): { code: string; expiresAt: number } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_TTL_MS;
    otpStore.set(normalize(email), {
        code,
        expiresAt,
        attempts: 0,
    });
    return { code, expiresAt };
}

/** Checks a submitted code against the stored one. Consumes the code on success. */
export function verifyOtp(
    email: string,
    submittedCode: string
): { success: boolean; error?: string } {
    const key = normalize(email);
    const record = otpStore.get(key);

    if (!record) {
        return { success: false, error: "No code was requested for this email." };
    }
    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return { success: false, error: "This code has expired. Request a new one." };
    }
    if (record.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(key);
        return { success: false, error: "Too many incorrect attempts. Request a new code." };
    }

    record.attempts += 1;

    if (record.code !== submittedCode.trim()) {
        return { success: false, error: "Incorrect code. Please try again." };
    }

    otpStore.delete(key);
    return { success: true };
}

export function clearOtp(email: string): void {
    otpStore.delete(normalize(email));
}

export { RESEND_COOLDOWN_SECONDS };