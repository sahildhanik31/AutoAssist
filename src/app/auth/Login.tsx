import { router } from "expo-router";
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { isValidGmail, sanitizeGmail } from "@/utils/validation";
import { Colors, Spacing, Radius, FontSize, FontWeight, ControlHeight, CardShadow } from "@/constants/AppTheme";
import { Image } from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setError("");

        const normalizedEmail = sanitizeGmail(email);

        if (normalizedEmail === "" || password === "") {
            setError("Please enter your email and password.");
            return;
        }
        if (!isValidGmail(normalizedEmail)) {
            setError("Please enter a valid Gmail address ending with @gmail.com.");
            return;
        }

        setLoading(true);
        try {
            try {
                await signInWithEmailAndPassword(auth, normalizedEmail, password);
            } catch (signInErr: any) {
                if (
                    signInErr?.code === "auth/invalid-credential" ||
                    signInErr?.code === "auth/wrong-password" ||
                    signInErr?.code === "auth/user-not-found"
                ) {
                    setError("Incorrect email or password.");
                } else if (signInErr?.code === "auth/invalid-email") {
                    setError("Please enter a valid Gmail address.");
                } else if (signInErr?.code === "auth/too-many-requests") {
                    setError("Too many login attempts. Please try again later.");
                } else if (
                    signInErr?.code === "auth/network-request-failed"
                ) {
                    setError("Unable to connect. Check your internet connection and try again.");
                } else {
                    setError("Login failed. Please try again.");
                }
                return;
            }

            router.replace("/tabs/HomeScreen");
        } catch (err: any) {
            console.log(err);
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleCreateAccount() {
        router.push("/auth/CreateAccount");
    }

    function handleForgotPassword() {
        Alert.alert("Coming Soon", "Password reset will be available soon.");
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

                            <Image
  source={require("@/assets/images/logo.png")}
  style={styles.logo}
/>

                            <Text style={styles.appName}>AutoAssist</Text>
                            <Text style={styles.tagline}>
                                Smart Vehicle Assistance
                            </Text>

                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@gmail.com"
                                placeholderTextColor={Colors.textMuted}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={(value) => setEmail(sanitizeGmail(value))}
                            />

                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
                                    placeholderTextColor={Colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
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

                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrapper}>
                                <Text style={styles.forgotText}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            {!!error && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.textOnPrimary} />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        Login
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleCreateAccount}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Create Account
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
    height: 94,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 12,
  },

  appName: {
    fontSize: 31,
    fontWeight: "800",
    color: "#123A7A",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 5,
  },

  tagline: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.4,
    lineHeight: 21,
  },

  inputLabel: {
    width: "100%",
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 3,
    letterSpacing: 0.2,
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
    marginBottom: 17,

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
    marginBottom: 8,
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
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  forgotWrapper: {
    alignSelf: "flex-end",
    marginBottom: 19,
    marginTop: 4,
    paddingVertical: 4,
  },

  forgotText: {
    color: "#174A97",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  errorBox: {
    width: "100%",
    backgroundColor: "#FFF1F2",
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#F7C7CD",
  },

  errorText: {
    color: "#C62828",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 19,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#123A7A",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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

  buttonDisabled: {
    opacity: 0.58,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  secondaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#F7FAFF",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#174A97",
  },

  secondaryButtonText: {
    color: "#174A97",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});