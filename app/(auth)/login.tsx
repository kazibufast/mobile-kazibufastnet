import { showToast } from "@/components/Toast";
import { API, API_ENVIRONMENTS, getApiBaseUrl, getCurrentEnvironment, setApiBaseUrl } from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
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

export default function TechLoginScreen() {
    const router = useRouter();
    const otpRefs = useRef<(TextInput | null)[]>([]);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // OTP screen state
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const navigateAfterLogin = async (token: string) => {
        try {
            const hour = new Date().getHours();
            if (hour >= 8 && hour < 13) {
                const res = await fetch(API.tech.attendanceStatus(), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.timed_in) {
                        router.replace('/(time-in)/time-in');
                        return;
                    }
                }
            }
        } catch {}
        router.replace("/(tech-tabs)/home");
    };

    // Auto-login: restore token from AsyncStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const savedToken = await AsyncStorage.getItem("token");
                const savedUser = await AsyncStorage.getItem("user");

                if (savedToken && savedUser) {
                    const userData = JSON.parse(savedUser);
                    setToken(savedToken);
                    setUser(userData);
                    await navigateAfterLogin(savedToken);
                    return;
                }
            } catch {}
            setCheckingSession(false);
        };
        restoreSession();
    }, []);
    const [phoneFocused, setPhoneFocused] = useState(false);

    // Dev menu
    const [envModalVisible, setEnvModalVisible] = useState(false);
    const logoTapCount = useRef(0);
    const logoTapTimer = useRef<ReturnType<typeof setTimeout>>();

    const handleLogoTap = () => {
        logoTapCount.current += 1;
        if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
        if (logoTapCount.current >= 10) {
            logoTapCount.current = 0;
            setEnvModalVisible(true);
            return;
        }
        logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 2000);
    };

    const switchEnvironment = async (url: string) => {
        await setApiBaseUrl(url);
        setEnvModalVisible(false);
        showToast(`Switched to ${getCurrentEnvironment()}.`, "info");
    };

    // Resend timer
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (showOtpScreen && resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [showOtpScreen, resendTimer]);

    const formatPhoneDisplay = (number: string) => {
        const cleaned = number.replace(/\D/g, "");
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    };

    const encryptPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, "");
        if (cleaned.length === 10) {
            return `+63 ${cleaned.slice(0, 1)}** *** ${cleaned.slice(7, 10)}`;
        }
        return `+63 ${cleaned}`;
    };

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (!cleanPhone || !cleanPhone.startsWith("9") || cleanPhone.length !== 10) {
            return Alert.alert("Error", "Please enter a valid 10-digit phone number starting with 9");
        }

        setLoading(true);
        try {
            const response = await fetch(API.techVerifyNumber, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ mobile_number: "+63" + cleanPhone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setShowOtpScreen(true);
            setResendTimer(30);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            Alert.alert("OTP Sent", `Verification code sent to ${encryptPhoneNumber(cleanPhone)}`);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Could not send OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and login
    const handleVerifyOtp = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            return Alert.alert("Error", "Enter the complete 6-digit OTP");
        }

        const cleanPhone = phoneNumber.replace(/\D/g, "");

        try {
            setOtpLoading(true);
            const response = await fetch(API.techOtp, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    mobile_number: "+63" + cleanPhone,
                    otp: otpString,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.token) {
                throw new Error(data.message || "Invalid OTP");
            }

            // Store token and user
            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);

            await navigateAfterLogin(data.token);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Something went wrong");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        setResendTimer(30);
        setCanResend(false);

        try {
            const cleanPhone = phoneNumber.replace(/\D/g, "");
            const response = await fetch(API.techVerifyNumber, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ mobile_number: "+63" + cleanPhone }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to resend OTP");
            }

            Alert.alert("OTP Resent", `A new code has been sent to ${encryptPhoneNumber(cleanPhone)}`);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Could not resend OTP");
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, "");
        const newOtp = [...otp];
        newOtp[index] = numericValue;
        setOtp(newOtp);
        if (index < 5 && numericValue) {
            setTimeout(() => otpRefs.current[index + 1]?.focus(), 10);
        }
    };

    const handleOtpKeyPress = (index: number, e: any) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // ─── Loading while checking session ─────────────────────────
    if (checkingSession) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#30BCBB" />
            </SafeAreaView>
        );
    }

    // ─── OTP Screen ───────────────────────────────────────────────
    if (showOtpScreen) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.innerContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setShowOtpScreen(false)}
                        >
                            <Ionicons name="arrow-back" size={24} color="#30BCBB" />
                        </TouchableOpacity>

                        <View style={styles.headerContainer}>
                            <View style={styles.logoWrapper}>
                                <Image
                                    source={require("../../assets/images/kazi.png")}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.welcomeText}>KAZIBUFAST</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>Verify OTP</Text>
                            <Text style={styles.otpSubtitle}>
                                Enter the 6-digit code sent to{"\n"}
                                <Text style={{ fontWeight: "700", color: "#fff" }}>
                                    {encryptPhoneNumber(phoneNumber)}
                                </Text>
                            </Text>

                            <View style={styles.otpContainer}>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => (otpRefs.current[index] = ref)}
                                        style={[styles.otpInput, otp[index] && styles.otpInputFilled]}
                                        value={otp[index]}
                                        onChangeText={(value) => handleOtpChange(index, value)}
                                        onKeyPress={(e) => handleOtpKeyPress(index, e)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        editable={!otpLoading}
                                        selectTextOnFocus
                                        textAlign="center"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>Didn't receive the code? </Text>
                                <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                                    <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                                        {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, otpLoading && styles.buttonDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={otpLoading}
                                activeOpacity={0.9}
                            >
                                <View style={styles.buttonContent}>
                                    {otpLoading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>Verify & Login</Text>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
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

    // ─── Phone Number Screen ──────────────────────────────────────
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
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.logoWrapper} onPress={handleLogoTap} activeOpacity={0.8}>
                            <Image
                                source={require("../../assets/images/kazi.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                        <Text style={styles.welcomeText}>KAZIBUFAST</Text>
                        <Text style={styles.subtitle}>Sign in to your technician account</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Technician Login</Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIcon}>
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    color={phoneFocused ? "#30BCBB" : "#94A3B8"}
                                />
                            </View>
                            <View style={styles.countryCode}>
                                <Text style={styles.countryCodeText}>+63</Text>
                            </View>
                            <TextInput
                                style={[styles.input, phoneFocused && styles.inputFocused]}
                                placeholder="9XXXXXXXXX"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={formatPhoneDisplay(phoneNumber)}
                                onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, "").slice(0, 10))}
                                onFocus={() => setPhoneFocused(true)}
                                onBlur={() => setPhoneFocused(false)}
                                maxLength={13}
                                onSubmitEditing={handleSendOtp}
                                returnKeyType="send"
                            />
                        </View>

                        <Text style={styles.helperText}>
                            Enter your registered 10-digit number starting with 9
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (phoneNumber.replace(/\D/g, "").length !== 10 || loading) && styles.buttonDisabled,
                            ]}
                            onPress={handleSendOtp}
                            disabled={loading || phoneNumber.replace(/\D/g, "").length !== 10}
                            activeOpacity={0.9}
                        >
                            <View style={styles.buttonContent}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Send OTP</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Environment Switcher Modal */}
            <Modal visible={envModalVisible} transparent animationType="fade" onRequestClose={() => setEnvModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="code-slash" size={24} color="#30BCBB" />
                            <Text style={styles.modalTitle}>Developer Options</Text>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Current: <Text style={{ fontWeight: "700" }}>{getCurrentEnvironment()}</Text>
                        </Text>
                        <Text style={styles.modalUrl}>{getApiBaseUrl()}</Text>
                        <View style={{ gap: 12, marginBottom: 20 }}>
                            {([
                                { label: "Development", url: API_ENVIRONMENTS.development, color: "#F39C12" },
                                { label: "Production", url: API_ENVIRONMENTS.production, color: "#27AE60" },
                            ]).map((opt) => {
                                const isActive = getApiBaseUrl() === opt.url;
                                return (
                                    <TouchableOpacity
                                        key={opt.url}
                                        style={[styles.envOption, isActive && { borderColor: opt.color, backgroundColor: opt.color + "10" }]}
                                        onPress={() => !isActive && switchEnvironment(opt.url)}
                                        disabled={isActive}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: opt.color }} />
                                            <Text style={[styles.envLabel, isActive && { color: opt.color }]}>{opt.label}</Text>
                                            {isActive && <Ionicons name="checkmark-circle" size={18} color={opt.color} />}
                                        </View>
                                        <Text style={styles.envUrlText}>{opt.url}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setEnvModalVisible(false)}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    backButton: {
        alignSelf: "flex-start",
        padding: 10,
        marginBottom: 10,
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
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    inputIcon: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    countryCode: {
        paddingRight: 8,
        borderRightWidth: 1,
        borderRightColor: "rgba(255, 255, 255, 0.15)",
        marginRight: 8,
    },
    countryCodeText: {
        fontSize: 16,
        color: "#9CA3AF",
        fontWeight: "600",
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        paddingRight: 16,
        paddingLeft: 3,
        fontSize: 16,
        color: "#fff",
        fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
        width: "100%",
    },
    inputFocused: {
        borderColor: "#30BCBB",
        shadowColor: "#30BCBB",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    helperText: {
        fontSize: 12,
        color: "#9CA3AF",
        fontStyle: "italic",
        marginLeft: 4,
        marginBottom: 20,
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
    // OTP styles
    otpSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    otpInput: {
        width: 46,
        height: 54,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 22,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        textAlign: "center",
        color: "#fff",
    },
    otpInputFilled: {
        borderColor: "#30BCBB",
        backgroundColor: "rgba(48, 188, 187, 0.1)",
    },
    resendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    resendText: {
        color: "#9CA3AF",
        fontSize: 14,
    },
    resendLink: {
        color: "#30BCBB",
        fontSize: 14,
        fontWeight: "600",
    },
    resendLinkDisabled: {
        color: "#666",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    modalUrl: {
        fontSize: 12,
        color: "#999",
        fontFamily: "monospace",
        marginBottom: 20,
    },
    envOption: {
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        padding: 16,
    },
    envLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    envUrlText: {
        fontSize: 12,
        color: "#999",
        fontFamily: "monospace",
        marginLeft: 18,
        marginTop: 4,
    },
    modalClose: {
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
});
