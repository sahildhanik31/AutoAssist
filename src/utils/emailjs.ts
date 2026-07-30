import emailjs from "@emailjs/react-native";

// Filled in from .env at build time (see .env.example). Values prefixed with
// EXPO_PUBLIC_ are bundled into the client app, so only put your EmailJS
// PUBLIC key here — never a private/API key.
const SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

function formatExpiryTime(expiresAt: number): string {
    return new Date(expiresAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Sends the OTP email via EmailJS, using EmailJS's built-in "One-Time Password"
 * template field names:
 *   To Email: {{email}}
 *   Content:  {{passcode}}  and  {{time}}
 */
export async function sendOtpEmail(
    toEmail: string,
    otpCode: string,
    expiresAt: number
) {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        throw new Error(
            "EmailJS isn't configured yet. Add EXPO_PUBLIC_EMAILJS_* values to your .env file and restart the dev server."
        );
    }

    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            email: toEmail,
            passcode: otpCode,
            time: formatExpiryTime(expiresAt),
        },
        { publicKey: PUBLIC_KEY }
    );
}