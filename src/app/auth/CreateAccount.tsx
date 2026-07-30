import { router } from "expo-router";
import { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,ActivityIndicator,Alert,} from"react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateOtp } from "@/utils/otp";
import { sendOtpEmail } from "@/utils/emailjs";
import { setPendingSignup } from "@/utils/pendingAuth";
import {collapseSpaces,isStrongPassword,isValidGmail,isValidName,sanitizeGmail,sanitizeName,} from "@/utils/validation";
import { Image } from "react-native";
import AppBackButton from "@/components/common/AppBackButton";
export default function CreateAccountScreen() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
async function handleCreateAccount() {
    setError("");
    const normalizedName = collapseSpaces(name);
    const normalizedEmail = sanitizeGmail(email);
    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            Alert.alert("Missing Information", "Please fill in all fields.");
            return;
        }
        if (!isValidName(normalizedName)) {
            setError("Please enter a valid name using letters only.");
            Alert.alert("Invalid Name", "Please enter a valid name using letters only.");
            return;
        }
        if (!isValidGmail(normalizedEmail)) {
            setError("Please enter a valid Gmail address ending with @gmail.com.");
            Alert.alert("Invalid Email", "Please enter a valid Gmail address ending with @gmail.com.");
            return;
        }
        if (!isStrongPassword(password)) {
            setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            Alert.alert("Weak Password", "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Password and confirm password do not match.");
            Alert.alert("Password Mismatch", "Password and confirm password do not match.");
            return;
        }

        setLoading(true);
        try {
            setPendingSignup({
                name: normalizedName,
                email: normalizedEmail,
                password,
            });

            const { code, expiresAt } = generateOtp(normalizedEmail);
            await sendOtpEmail(normalizedEmail, code, expiresAt);

            router.push({
                pathname: "/auth/OtpVerification",
                params: { mode: "signup", email: normalizedEmail },
            });
        }  catch (err: any) {
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
                    <AppBackButton fallbackRoute="/auth/Login" />
                    <View style={styles.container}>
                        <View style={styles.card}>
                            <Image
  source={require("@/assets/images/logo.png")}
  style={styles.logo}
/>

                            <Text style={styles.appName}>Create Account</Text>
                            <Text style={styles.tagline}>Join AutoAssist</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#888888"
                                value={name}
                                onChangeText={(value) => setName(sanitizeName(value))}
                                maxLength={50}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#888888"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={(value) => setEmail(sanitizeGmail(value))}
                                maxLength={100}
                            />

                            <View style={styles.passwordWrapper}>
    <TextInput
        style={styles.passwordInput}
        placeholder="Password"
        placeholderTextColor="#888888"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        maxLength={64}
    />
    <TouchableOpacity
        style={styles.showHideButton}
        onPress={() => setShowPassword((prev) => !prev)}
    >
        <Text style={styles.showHideText}>
            {showPassword ? "Hide" : "Show"}
        </Text>
    </TouchableOpacity>
</View>

<View style={styles.passwordWrapper}>
    <TextInput
        style={styles.passwordInput}
        placeholder="Confirm Password"
        placeholderTextColor="#888888"
        secureTextEntry={!showConfirmPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        maxLength={64}
    />
    <TouchableOpacity
        style={styles.showHideButton}
        onPress={() => setShowConfirmPassword((prev) => !prev)}
    >
        <Text style={styles.showHideText}>
            {showConfirmPassword ? "Hide" : "Show"}
        </Text>
    </TouchableOpacity>
</View>
                            {!!error && <Text style={styles.errorText}>{error}</Text>}

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleCreateAccount}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        Create Account
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.forgotText}>
                                    Already have an account? Log in
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
    width: 185,
    height: 92,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 14,
  },

  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#123A7A",
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 7,
  },

  tagline: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.3,
    lineHeight: 21,
  },

  input: {
    width: "100%",
    height: 58,
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#D7E2F0",
    borderRadius: 16,
    paddingHorizontal: 17,
    fontSize: 15,
    fontWeight: "500",
    color: "#172033",
    marginBottom: 16,

    shadowColor: "#153E90",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  passwordWrapper: {
    width: "100%",
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFF",
    borderWidth: 1.5,
    borderColor: "#D7E2F0",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",

    shadowColor: "#153E90",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 17,
    fontSize: 15,
    fontWeight: "500",
    color: "#172033",
  },

  showHideButton: {
    height: "100%",
    minWidth: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#EDF4FF",
    borderLeftWidth: 1,
    borderLeftColor: "#D7E2F0",
  },

  showHideText: {
    color: "#174A97",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
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
    marginBottom: 16,
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
    marginTop: 7,
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
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
    paddingVertical: 8,
    letterSpacing: 0.1,
  },
});