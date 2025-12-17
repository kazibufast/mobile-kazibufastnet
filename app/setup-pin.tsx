import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type SetupPinParams = {
  phone?: string;
  verified?: string;
};
export default function SetupPinScreen() {
  const params = useLocalSearchParams<SetupPinParams>();

  const phone = typeof params.phone === "string" ? params.phone : "";
  const verified = params.verified === "true";

  const router = useRouter();
  const pinRefs = useRef<(TextInput | null)[]>([]);
  const confirmPinRefs = useRef<(TextInput | null)[]>([]);

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    const numericValue = value.replace(/\D/g, "");

    if (isConfirm) {
      const newConfirmPin = [...confirmPin];
      newConfirmPin[index] = numericValue;
      setConfirmPin(newConfirmPin);

      if (numericValue && index < 5) {
        setTimeout(() => {
          confirmPinRefs.current[index + 1]?.focus();
        }, 10);
      }
    } else {
      const newPin = [...pin];
      newPin[index] = numericValue;
      setPin(newPin);

      if (numericValue && index < 5) {
        setTimeout(() => {
          pinRefs.current[index + 1]?.focus();
        }, 10);
      }

      if (index === 5 && newPin.every((digit) => digit !== "")) {
        setTimeout(() => {
          confirmPinRefs.current[0]?.focus();
        }, 300);
      }
    }
  };

  const handlePinKeyPress = (index: number, e: any, isConfirm = false) => {
    if (e.nativeEvent.key === "Backspace") {
      if (isConfirm) {
        if (!confirmPin[index] && index > 0) {
          confirmPinRefs.current[index - 1]?.focus();
        }
      } else {
        if (!pin[index] && index > 0) {
          pinRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
  const pinString = pin.join("");
  const confirmPinString = confirmPin.join("");

  if (pinString.length !== 6) {
    Alert.alert("Error", "Please enter a 6-digit PIN");
    pinRefs.current[0]?.focus();
    return;
  }

  if (confirmPinString.length !== 6) {
    Alert.alert("Error", "Please confirm your 6-digit PIN");
    confirmPinRefs.current[0]?.focus();
    return;
  }

  if (pinString !== confirmPinString) {
    Alert.alert("Error", "PINs don't match");
    setConfirmPin(["", "", "", "", "", ""]);
    confirmPinRefs.current[0]?.focus();
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      "https://staging.kazibufastnet.com/api/setup_pin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile_number: phone,
          pin: pinString,
        }),
      }
    );

    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text }; 
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to set PIN");
    }

    await AsyncStorage.setItem("phone_number", phone);

    // Navigate to MPIN login page
    router.replace({
      pathname: "/mpin-login",
      params: { phone },
    });
  } catch (err: any) {
    Alert.alert("Error", err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity> */}
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

        <Text style={styles.title}>Create Your PIN</Text>

        <Text style={styles.subtitle}>
          Create a 6-digit PIN for secure access to your account
        </Text>

        <View style={styles.pinContainer}>
          <View style={styles.pinSection}>
            <View style={styles.pinHeader}>
              <Text style={styles.pinLabel}>Enter 6-digit PIN</Text>
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={() => setShowPin(!showPin)}
              >
                <Text style={styles.visibilityButtonText}>
                  {showPin ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pinInputsContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={`pin-${index}`}
                  ref={(ref) => (pinRefs.current[index] = ref)}
                  style={[styles.pinInput, pin[index] && styles.pinInputFilled]}
                  value={showPin ? pin[index] : pin[index] ? "•" : ""}
                  onChangeText={(value) => handlePinChange(index, value, false)}
                  onKeyPress={(e) => handlePinKeyPress(index, e, false)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                  textAlign="center"
                  autoFocus={index === 0 && pin[0] === ""}
                />
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.pinSection}>
            <View style={styles.pinHeader}>
              <Text style={styles.pinLabel}>Confirm 6-digit PIN</Text>
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={() => setShowConfirmPin(!showConfirmPin)}
              >
                <Text style={styles.visibilityButtonText}>
                  {showConfirmPin ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pinInputsContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={`confirm-${index}`}
                  ref={(ref) => (confirmPinRefs.current[index] = ref)}
                  style={[
                    styles.pinInput,
                    confirmPin[index] && styles.pinInputFilled,
                    pin.join("") === confirmPin.join("") &&
                      confirmPin[index] &&
                      styles.pinInputMatched,
                  ]}
                  value={
                    showConfirmPin
                      ? confirmPin[index]
                      : confirmPin[index]
                      ? "•"
                      : ""
                  }
                  onChangeText={(value) => handlePinChange(index, value, true)}
                  onKeyPress={(e) => handlePinKeyPress(index, e, true)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>
          </View>

          <View style={styles.statusContainer}>
            {pin.join("").length === 6 && confirmPin.join("").length === 6 ? (
              pin.join("") === confirmPin.join("") ? (
                <Text style={styles.statusTextSuccess}>✓ PINs match</Text>
              ) : (
                <Text style={styles.statusTextError}>✗ PINs don't match</Text>
              )
            ) : (
              <Text style={styles.statusText}>
                Enter 6-digit PIN in both fields
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
            (pin.join("").length !== 6 || confirmPin.join("").length !== 6) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            loading ||
            pin.join("").length !== 6 ||
            confirmPin.join("").length !== 6
          }
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Set PIN</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    color: "#00afa1ff",
    fontSize: 26,
    fontWeight: "600",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#00afa1ff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    color: "#ffffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#f8f8f8ff",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  pinContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 30,
  },
  pinSection: {
    marginBottom: 25,
  },
  pinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f0f0f0ff",
  },
  visibilityButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  visibilityButtonText: {
    color: "#00afa1ff",
    fontSize: 12,
    fontWeight: "600",
  },
  pinInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  pinInput: {
    width: 48,
    height: 60,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 22,
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },
  pinInputFilled: {
    borderColor: "#00afa1ff",
    backgroundColor: "#fff",
  },
  pinInputMatched: {
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  statusTextSuccess: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    textAlign: "center",
  },
  statusTextError: {
    fontSize: 14,
    color: "#f44336",
    fontWeight: "600",
    textAlign: "center",
  },
  securityContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  securityTip: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#30BCBB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#00afa1ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});