import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from "react-native";
import { setToken } from '../../scripts/token';
import { setUser } from '../../scripts/user';

const { width, height } = Dimensions.get("window");

const scaleSize = (size: number) => {
    const baseWidth = 375;
    const scale = width / baseWidth;
    return Math.round(size * Math.min(scale, 1.3));
};

export default function MpinLoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [message, setMessage] = useState("");

    const [mpin, setMpin] = useState(["", "", "", "", "", ""]);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
   

    const hasEnteredNumber = mpin.some(digit => digit !== "");


    useEffect(() => {
        const loadPhoneNumber = async () => {
            if (params.phone) {
                setPhoneNumber(params.phone as string);
            } else {
                const storedNumber = await AsyncStorage.getItem("phone_number");
                if (storedNumber) setPhoneNumber(storedNumber);
            }
        };
        loadPhoneNumber();
    }, []);

    const loginRequest = async (mobile_number: string, mpin: string) => {
        const url = "https://staging.kazibufastnet.com/api/login";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    mobile_number: mobile_number,
                    pin: mpin,
                }),
            });
            const data = await response.json();

            if (data.status === "success" && data.token) {
                setToken(data.token);
                setUser(data.user);

                console.log("Session stored in memory:", data.token);
                setIsVerifying(false);

                if (data.user.user_type.toLowerCase() === "technician") {
                    if (data.user.status === 'active') {
                        router.replace("/(tech-tabs)/home");
                    } else {
                        router.replace("/(time-in)/time-in")
                    }

                } else {
                    router.replace("/(client-tabs)/home");
                }
            } else {
                setIsVerifying(false);
                setMessage(data.message);
                resetMpinWithDelay();
            }

        } catch (error) {
            console.error("POST ERROR:", error);
            setIsVerifying(false);
            throw error;
        }
    };

    const handleLogin = async (enteredPin: string) => {
        if (enteredPin.length !== 6) return;

        setIsLoading(true);
        setIsVerifying(true);
        setMessage("Verifying MPIN...");

        try {
            await loginRequest(phoneNumber, enteredPin);
        } catch (error) {
            Alert.alert("Error", "Could not connect to server.");
            setIsVerifying(false);
        }

        setIsLoading(false);
    };

    const resetMpinWithDelay = () => {
        setTimeout(() => {
            setMpin(["", "", "", "", "", ""]);
            setCurrentPosition(0);
        }, 300);
    };

    const handleKeyPress = (key: number | string) => {

        if (isVerifying) return;

        if (key === "⌫") {
            if (currentPosition > 0) {
                const newPosition = currentPosition - 1;
                const newMpin = [...mpin];
                newMpin[newPosition] = "";
                setMpin(newMpin);
                setCurrentPosition(newPosition);
            }
        } else {
            const newMpin = [...mpin];
            newMpin[currentPosition] = key.toString();
            setMpin(newMpin);
            const nextPosition = currentPosition + 1;
            setCurrentPosition(nextPosition);
            if (nextPosition > 5) {
                const enteredPin = newMpin.join("");
                handleLogin(enteredPin);
            }
        }

        Vibration.vibrate(10);

    };

    const resetMpin = () => {
        setMpin(["", "", "", "", "", ""]);
        setCurrentPosition(0);
    };

    const handleForgotMpin = () => {
        Alert.alert(
            "Forgot MPIN?",
            "For security reasons, please contact customer support to reset your MPIN.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Contact Support",
                    onPress: () => {
                        Alert.alert("Contact Support", "Please call 1-800-123-4567 for assistance.");
                    },
                },
            ]
        );
    };

    const handleChangeNumber = async () => {
        Alert.alert(
            "Change Number",
            "Do you want to use a different phone number?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            // Set the phone number to null in AsyncStorage
                            await AsyncStorage.setItem("phone_number", '');
                            router.replace('/')
                        } catch (error) {
                            console.error("Error clearing phone number:", error);
                        }
                    }
                }
            ]
        );
    };

    const renderKeypad = () => {
        const numbers = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [null, 0, hasEnteredNumber ? "⌫" : null]
        ];

        const keySize = Math.min(Math.max(width * 0.18, 60), 85);
        const keySpacing = Math.min(width * 0.05, 20);

        const isKeypadDisabled = isVerifying;

        return (
            <View style={[styles.keypadContainer, { marginBottom: scaleSize(20) }]}>
                {numbers.map((row, rowIndex) => (
                    <View
                        key={`row-${rowIndex}`}
                        style={[styles.keypadRow, { marginBottom: keySpacing }]}
                    >
                        {row.map((item, colIndex) => {
                            if (item === null) {
                                return (
                                    <View
                                        key={`empty-${colIndex}`}
                                        style={[styles.keypadKeyEmpty, { width: keySize, height: keySize }]}
                                    />
                                );
                            }

                            const isBackspace = item === "⌫";
                            return (
                                <TouchableOpacity
                                    key={`key-${item}`}
                                    style={[
                                        styles.keypadKey,
                                        isBackspace && styles.keypadKeyBackspace,
                                        isKeypadDisabled && styles.keypadKeyDisabled,
                                        {
                                            width: keySize,
                                            height: keySize,
                                            borderRadius: keySize / 2
                                        }
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => !isKeypadDisabled && handleKeyPress(item)}
                                    onLongPress={() => {
                                        if (!isKeypadDisabled && isBackspace) {
                                            resetMpin();
                                            Vibration.vibrate(50);
                                        }
                                    }}
                                    disabled={isKeypadDisabled}
                                >
                                    {isBackspace ? (
                                        <Text style={[
                                            styles.keypadKeyTextBackspace,
                                            { fontSize: scaleSize(22) },
                                            isKeypadDisabled && styles.keypadKeyTextDisabled
                                        ]}>⌫</Text>
                                    ) : (
                                        <Text style={[
                                            styles.keypadKeyText,
                                            { fontSize: scaleSize(26) },
                                            isKeypadDisabled && styles.keypadKeyTextDisabled
                                        ]}>{item}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    const renderMpinDots = () => {
        const dotSize = scaleSize(20);
        const dotSpacing = scaleSize(20);

        return (
            <View style={[
                styles.mpinDotsContainer,
                { gap: dotSpacing }
                
            ]}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View key={`dot-${index}`} style={styles.mpinDotContainer}>
                        {isVerifying ? (
                            <View
                                style={[
                                    styles.skeletonDot,
                                    {
                                        width: dotSize,
                                        height: dotSize,
                                        borderRadius: dotSize / 2
                                    }
                                ]}
                            />
                        ) : (
                            <>
                                <View
                                    style={[
                                        styles.mpinDot,
                                        mpin[index] && styles.mpinDotFilled,
                                        {
                                            width: dotSize,
                                            height: dotSize,
                                            borderRadius: dotSize / 2
                                        }
                                    ]}
                                >
                                    {mpin[index] && <View style={[styles.mpinDotInner, {
                                        width: dotSize * 0.4,
                                        height: dotSize * 0.4,
                                        borderRadius: dotSize * 0.2
                                    }]} />}
                                </View>
                                {index === currentPosition &&
                                    currentPosition < 6 &&
                                    !isLoading && (
                                        <View style={[{
                                            width: scaleSize(2),
                                            height: scaleSize(4),
                                            bottom: scaleSize(-8)
                                        }]} />
                                    )}
                            </>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#00AFA1" barStyle="light-content" />

            <View style={styles.container}>
                <View style={{ flex: height < 700 ? 0.05 : 0.1 }} />

                <View style={[styles.logoContainer, { marginBottom: scaleSize(20) }]}>
                    <Image
                        source={require("../../assets/images/kazi.png")}
                        style={[styles.logo, {
                            width: scaleSize(100),
                            height: scaleSize(100)
                        }]}
                        resizeMode="contain"
                    />
                    <View style={styles.logoTextContainer}>
                        <Text style={[styles.appName, { fontSize: scaleSize(22) }]}>KAZIBUFAST</Text>
                    </View>
                </View>

                {/* Phone Number Section */}
                <View style={[styles.phoneSection, { marginBottom: scaleSize(30) }]}>
                    <Text style={[styles.phoneNumber, { fontSize: scaleSize(18) }]}> +63{phoneNumber}</Text>
                    <TouchableOpacity onPress={handleChangeNumber} disabled={isVerifying}>
                        <Ionicons name="create-outline" size={scaleSize(22)} color={isVerifying ? "#666" : "#00AFA1"} />
                    </TouchableOpacity>
                </View>

                {/* MPIN Input Section */}
                <View style={[styles.mpinContainer, { marginBottom: scaleSize(40) }]}>
                    <Text style={[styles.securityWarning, {
                        fontSize: scaleSize(16),
                        marginBottom: scaleSize(30)
                    }]} id="message">
                        {message || "Enter your MPIN to log in."}
                    </Text>

                    {/* Skeleton loading overlay when verifying */}
                    {isVerifying && (
                        <View style={styles.skeletonOverlay}>
                            <View style={styles.skeletonLoadingContainer}>
                                <View style={styles.skeletonLoadingDot} />
                                <View style={styles.skeletonLoadingDot} />
                                <View style={styles.skeletonLoadingDot} />
                                <View style={styles.skeletonLoadingDot} />
                                <View style={styles.skeletonLoadingDot} />
                                <View style={styles.skeletonLoadingDot} />
                            </View>
                            <Text style={styles.skeletonLoadingText}>Verifying MPIN...</Text>
                        </View>
                    )}

                    {renderMpinDots()}
                </View>

                <View style={styles.keypadWrapper}>
                    {renderKeypad()}
                </View>

                <View style={[styles.bottomSection, {
                    marginTop: height < 700 ? scaleSize(10) : scaleSize(20)
                }]}>
                    <TouchableOpacity
                        style={styles.forgotMpinButton}
                        onPress={handleForgotMpin}
                        activeOpacity={0.7}
                        disabled={isVerifying}
                    >
                        <Text style={[
                            styles.forgotMpinText,
                            { fontSize: scaleSize(16) },
                            isVerifying && styles.disabledText
                        ]}>Forgot MPIN?</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: height < 700 ? 0.05 : 0.1 }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0C1824",
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: scaleSize(20),
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        marginBottom: scaleSize(10),
    },
    logoTextContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    appName: {
        fontWeight: "700",
        color: "#00afa1ff",
        letterSpacing: scaleSize(1),
    },
    phoneSection: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    phoneNumber: {
        fontWeight: "600",
        color: "#f1f1f1ff",
        marginRight: scaleSize(10),
    },
    mpinContainer: {
        alignItems: "center",
        width: '100%',
        position: 'relative',
    },
    securityWarning: {
        color: "#e9e9e9ff",
        textAlign: "center",
        lineHeight: scaleSize(20),
        maxWidth: "90%",
    },
    mpinDotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: 'relative',
    },
    mpinDotContainer: {
        alignItems: "center",
        position: "relative",
        justifyContent: 'space-evenly',
        padding: 3
    },
    mpinDot: {
        borderWidth: 2,
        borderColor: "#ddd",
        backgroundColor: "#0C1824",
        justifyContent: "center",
        alignItems: "center",
    },
    mpinDotFilled: {
        backgroundColor: "#00AFA1",
        borderColor: "#00AFA1",
    },
    mpinDotInner: {
        backgroundColor: "#fff",
    },
    keypadWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxHeight: 300,
    },
    keypadContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    keypadRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        maxWidth: 300,
    },
    keypadKey: {
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    keypadKeyEmpty: {
        backgroundColor: "transparent",
    },
    keypadKeyText: {
        color: "#333",
        fontWeight: "600",
    },
    keypadKeyTextBackspace: {
        color: "#666",
        fontWeight: "600",
    },
    keypadKeyBackspace: {
        backgroundColor: "#f5f5f5",
    },
    keypadKeyDisabled: {
        backgroundColor: "#f0f0f0",
        opacity: 0.6,
    },
    keypadKeyTextDisabled: {
        color: "#999",
    },
    bottomSection: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    forgotMpinButton: {
        paddingVertical: scaleSize(10),
        paddingHorizontal: scaleSize(20),
    },
    forgotMpinText: {
        color: "#00AFA1",
        fontWeight: "500",
    },
    disabledText: {
        color: "#666",
        opacity: 0.6,
    },


    skeletonOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(12, 24, 36, 0.😎',
        borderRadius: 10,
        zIndex: 10,
    },
    skeletonLoadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    skeletonLoadingDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#00AFA1',
        marginHorizontal: 8,
        opacity: 0.6,
    },
    skeletonLoadingText: {
        color: '#00AFA1',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 10,
    },
    skeletonDot: {
        backgroundColor: '#ddd',
        opacity: 0.6,
    },
});