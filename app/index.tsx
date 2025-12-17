import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function LoginScreen() {
    const router = useRouter();
    const otpRefs = useRef<(TextInput | null)[]>([]);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (showOtpScreen && resendTimer > 0) {
            timer = setTimeout(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }

        if (showOtpScreen && resendTimer === 0 && !canResend) {
            setCanResend(true);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showOtpScreen, resendTimer, canResend]);


    const formatPhoneDisplay = (number: string) => {
        const cleaned = number.replace(/\D/g, "");
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        } else {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
                6,
                10
            )}`;
        }
    };

    const encryptPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, "");

        if (cleaned.length === 10) {
            const firstThree = cleaned.slice(0, 3);
            const lastThree = cleaned.slice(7, 10);
            return `+63 ${firstThree.slice(0, 1)}** *** ${lastThree}`;
        }

        return `+63 ${cleaned}`;
    };

    const handleSendOtp = async () => {
        if (!phoneNumber.trim()) {
            Alert.alert("Error", "Please enter your phone number");
            return;
        }

        const cleanPhone = phoneNumber.replace(/\D/g, "");

        if (cleanPhone.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        if (!cleanPhone.startsWith("9")) {
            Alert.alert("Error", "Phone number must start with 9");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            const encryptedPhone = encryptPhoneNumber(cleanPhone);
            Alert.alert(
                "OTP Sent",
                `Verification code has been sent to ${encryptedPhone}`,
                [{ text: "OK" }]
            );

            setShowOtpScreen(true);
            setResendTimer(30);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
        }, 1500);

        // staging api call for sending otp
        const response = await fetch(
            "https://staging.kazibufastnet.com/api/verify_number",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mobile_number: "+63" + cleanPhone,
                }),
            }
        );
    };

    // Otp handlers
    const handleVerifyOtp = async () => {
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            Alert.alert("Error", "Please enter the complete 6-digit OTP");
            return;
        }

        try {
            setOtpLoading(true);

            const response = await fetch(
                "https://staging.kazibufastnet.com/api/otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        mobile_number: "+63" + phoneNumber.replace(/\D/g, ""),
                        otp: otpString,
                    }),
                }
            );

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (!response.ok) {
                throw new Error(data?.message || "Invalid OTP");
            }

            Alert.alert("Success", "Phone number verified successfully!");
            router.push({
                pathname: "/setup-pin",
                params: {
                    phone: "+63" + phoneNumber,
                    verified: "true",
                },
            });
        } catch (error: any) {
            Alert.alert("Error", error.message || "Something went wrong");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = () => {
        if (!canResend) return;

        setResendTimer(30);
        setCanResend(false);

        setOtp(["", "", "", "", "", ""]);

        Alert.alert(
            "OTP Resent",
            "A new verification code has been sent to your phone."
        );
    };

    const handleOtpChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, "");

        if (numericValue) {
            const newOtp = [...otp];
            newOtp[index] = numericValue;
            setOtp(newOtp);

            if (index < 5 && numericValue) {
                setTimeout(() => {
                    otpRefs.current[index + 1]?.focus();
                }, 10);
            }
        } else {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    };

    const handleOtpKeyPress = (index: number, e: any) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleBackToPhone = () => {
        setShowOtpScreen(false);
        setOtp(["", "", "", "", "", ""]);
    };

    const handleSignIn = () => {
        router.push("/mpin-login");
    };

    if (showOtpScreen) {
        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBackToPhone}
                        >
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>

                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../assets/images/kazi.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <View style={{ flexDirection: "row" }}>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 24,
                                            fontWeight: "900",
                                            color: "#00afa1ff",
                                            marginRight: 2,
                                        }}
                                    >
                                        KAZIBU
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: 24,
                                            fontWeight: "900",
                                            color: "#000000ff",
                                        }}
                                    >
                                        FAST
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.title}>Verify Phone Number</Text>
                        <Text style={styles.subtitle}>
                            Enter the 6-digit code sent to{"\n"}
                            <Text style={styles.phoneNumberText}>
                                {encryptPhoneNumber(phoneNumber)}
                            </Text>
                        </Text>

                        <View style={styles.otpContainer}>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        otpRefs.current[index] = ref;
                                    }}
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
                                <Text
                                    style={[
                                        styles.resendLink,
                                        !canResend && styles.resendLinkDisabled,
                                    ]}
                                >
                                    {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, otpLoading && styles.buttonDisabled]}
                            onPress={handleVerifyOtp}
                            disabled={otpLoading}
                        >
                            {otpLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../assets/images/kazi.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={{ flexDirection: "row" }}>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: "900",
                                        color: "#00afa1ff",
                                        marginRight: 2,
                                    }}
                                >
                                    KAZIBU
                                </Text>
                            </View>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: "900",
                                        color: "#00afa1ff",
                                    }}
                                >
                                    FAST
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Verify Phone Number</Text>

                            <View style={styles.phoneInputContainer}>
                                <View style={styles.countryCodeBox}>
                                    <Text style={styles.countryCodeText}>+63</Text>
                                </View>

                                <View style={styles.separator} />

                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="9XXXXXXXXX"
                                    placeholderTextColor="#999"
                                    value={formatPhoneDisplay(phoneNumber)}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/\D/g, "").slice(0, 10);
                                        setPhoneNumber(cleaned);
                                    }}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    editable={!loading}
                                    maxLength={12}
                                    onSubmitEditing={handleSendOtp}
                                    returnKeyType="send"
                                />
                            </View>

                            <Text style={styles.exampleText}>
                                Enter 10-digit number starting with 9 (e.g., 9123456789)
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                                phoneNumber.replace(/\D/g, "").length !== 10 &&
                                styles.buttonDisabled,
                            ]}
                            onPress={handleSendOtp}
                            disabled={loading || phoneNumber.replace(/\D/g, "").length !== 10}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Verification Code</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>
                                If you already have an account
                            </Text>
                            <TouchableOpacity
                                style={styles.signInButton}
                                onPress={handleSignIn}
                            >
                                <Text style={styles.signInButtonText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#0C1824",
        minHeight: "100%",
    },
    backButton: {
        alignSelf: "flex-start",
        padding: 8,
        bottom: 120,
    },
    backButtonText: {
        color: "#00afa1ff",
        fontSize: 26,
        fontWeight: "900",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 35,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000000ff",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 8,
        color: "#ffffffff",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#ebebebff",
        marginBottom: 40,
        textAlign: "center",
        lineHeight: 22,
    },
    phoneNumberText: {
        fontWeight: "600",
        color: "#ecececff",
    },
    formContainer: {
        width: "100%",
        maxWidth: 400,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
        color: "#e6e6e6ff",
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: "#f9f9f9",
        overflow: "hidden",
    },
    countryCodeBox: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#f0f0f0",
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    separator: {
        width: 1,
        height: 30,
        backgroundColor: "#ddd",
    },
    phoneInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#333",
    },
    exampleText: {
        fontSize: 12,
        color: "#e2e2e2ff",
        fontStyle: "italic",
        marginLeft: 4,
        marginTop: 8,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 20,
        backgroundColor: "#f9f9f9",
        textAlign: "center",
    },
    otpInputFilled: {
        borderColor: "#00afa1ff",
        backgroundColor: "#fff",
    },
    demoContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: "#f0f8ff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#00afa1ff",
    },
    demoText: {
        fontSize: 14,
        color: "#00afa1ff",
        textAlign: "center",
        fontStyle: "italic",
    },
    resendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    resendText: {
        color: "#e9e9e9ff",
        fontSize: 14,
    },
    resendLink: {
        color: "#00afa1ff",
        fontSize: 14,
        fontWeight: "600",
    },
    resendLinkDisabled: {
        color: "#999",
    },
    button: {
        width: "100%",
        backgroundColor: "#30BCBB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 15,
        marginBottom: 10,
        shadowColor: "#00afa1ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: "#ffffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    signInContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    signInText: {
        color: "#e4e3e3ff",
        fontSize: 14,
    },
    signInButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    signInButtonText: {
        color: "#00afa1ff",
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});