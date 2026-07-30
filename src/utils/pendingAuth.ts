/**
 * Holds signup details in memory while the user is on the OTP screen, so we
 * don't have to pass a plaintext password through expo-router URL params.
 * Cleared as soon as it's consumed (or the app restarts).
 */

type PendingSignup = {
    name: string;
    email: string;
    password: string;
};

let pendingSignup: PendingSignup | null = null;

export function setPendingSignup(data: PendingSignup): void {
    pendingSignup = data;
}

export function consumePendingSignup(): PendingSignup | null {
    const data = pendingSignup;
    pendingSignup = null;
    return data;
}