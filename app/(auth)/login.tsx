import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { setToken } from "../../scripts/token";
import { setUser } from "../../scripts/user";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleLogin = async (email: string, password: string) => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        const url = "https://tub.kazibufastnet.com/api/tech/login";

        setLoading(true);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const data = await response.json();

            if (!response.ok || data.status !== "success") {
                throw new Error(data.message || "Login failed");
            }

            // Store token and user in memory / local storage
            await AsyncStorage.setItem("token", data.token);
            setUser(data.user);
            setToken(data.token);

            

            // Navigate depending on user type and status
            if (data.user.user_type.toLowerCase() === "technician") {
                if (data.user.status === "active") {
                    router.replace("/(tech-tabs)/home");
                } else {
                    router.replace("/(time-in)/time-in");
                }
            } else {
                // default redirect for other users
                router.replace("/");
            }

        } catch (error: any) {
            Alert.alert("Error", "Oops! We can't find your account");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        handleLogin(email, password);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.innerContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces
                >

                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require("../../assets/images/kazi.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.welcomeText}>KAZIBUFAST</Text>
                        <Text style={styles.subtitle}>Sign in to your technician account</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Login</Text>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={emailFocused ? "#30BCBB" : "#94A3B8"}
                                />
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    emailFocused && styles.inputFocused
                                ]}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={passwordFocused ? "#30BCBB" : "#94A3B8"}
                                />
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    passwordFocused && styles.inputFocused
                                ]}
                                placeholder="Enter your password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!email || !password || loading) && styles.buttonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={loading || !email || !password}
                            activeOpacity={0.9}
                        >
                            <View style={styles.buttonContent}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Sign In</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0C1824",
        paddingTop: 35,

    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },

    innerContainer: {
        flex: 1,
        padding: 15,
        marginTop: -50,
    },


    headerContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    logoWrapper: {
        position: "relative",
        marginBottom: 10,
    },
    logo: {
        width: 150,
        height: 150,
    },
    welcomeText: {
        fontSize: 34,
        fontWeight: "900",
        color: "#fff",
        marginBottom: 6,
        letterSpacing: 0.5,
    },

    subtitle: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 22,
    },

    formContainer: {
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 24,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 10,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },

    inputIcon: {
        paddingLeft: 16,
        paddingRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        paddingRight: 40,
        paddingLeft: 3,
        fontSize: 16,
        color: "#fff",
        fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
        width: '100%',
    },
    inputFocused: {
        borderColor: "#30BCBB",
        shadowColor: "#30BCBB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },

    eyeIcon: {
        paddingHorizontal: 16,
        position: "absolute",
        right: 0,
        height: "100%",
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#30BCBB",
        borderRadius: 16,
        paddingVertical: 18,
        marginBottom: 24,
        shadowColor: "#30BCBB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0.1,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});
