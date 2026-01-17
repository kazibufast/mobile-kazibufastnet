import { getToken } from "@/scripts/token";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUser } from "../../scripts/user";

const ResetPassword = () => {
  const router = useRouter();
  const user = getUser();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordUpdate = async () => {
    // Validate all password fields are filled
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }

    // Make sure new and confirm match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New password does not match");
      return;
    }

    setIsLoading(true);

    try {
      const url = `https://${user?.branch.subdomain}.kazibufastnet.com/api/tech/profile/update/password`;
      const token = await getToken();

      const body = {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (responseData.status === "success") {
        Alert.alert("Success", "Password updated successfully", [
          {
            text: "OK",
            onPress: () => {
              // Clear form and go back
              setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              router.back();
            },
          },
        ]);
      } else {
        // Handle backend validation errors
        if (
          responseData.errors?.currentPassword?.includes("incorrect") ||
          responseData.message?.toLowerCase().includes("current password")
        ) {
          Alert.alert("Error", "Current password is incorrect");
        } else {
          const errors = responseData.errors
            ? Object.values(responseData.errors).flat().join("\n")
            : responseData.message || "Password update failed";
          Alert.alert("Error", errors);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Back Button */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Reset Password</Text>
                <Text style={styles.headerSubtitle}>
                  Change your password securely
                </Text>
              </View>
            </View>

            {/* Password Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => handleChange("currentPassword", text)}
                    placeholder="Enter your current password"
                    secureTextEntry={!showCurrent}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrent(!showCurrent)}
                  >
                    <Ionicons
                      name={showCurrent ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    value={passwordData.newPassword}
                    onChangeText={(text) => handleChange("newPassword", text)}
                    placeholder="Enter your new password"
                    secureTextEntry={!showNew}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNew(!showNew)}
                  >
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    placeholder="Confirm your new password"
                    secureTextEntry={!showConfirm}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Password Match Feedback */}
                {passwordData.confirmPassword.length > 0 && (
                  <View style={styles.matchContainer}>
                    <Ionicons
                      name={
                        passwordData.newPassword === passwordData.confirmPassword
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={
                        passwordData.newPassword === passwordData.confirmPassword
                          ? "#4CAF50"
                          : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.matchText,
                        {
                          color:
                            passwordData.newPassword === passwordData.confirmPassword
                              ? "#4CAF50"
                              : "#F44336",
                        },
                      ]}
                    >
                      {passwordData.newPassword === passwordData.confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
                  <Text style={styles.requirementText}>At least 8 characters</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
                  <Text style={styles.requirementText}>Include uppercase letters</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
                  <Text style={styles.requirementText}>Include numbers or symbols</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.resetButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handlePasswordUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Ionicons name="refresh" size={20} color="#fff" />
                ) : (
                  <Ionicons name="key-outline" size={20} color="#fff" />
                )}
                <Text style={styles.buttonText}>
                  {isLoading ? "Updating..." : "Reset Password"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00AF9F",
    paddingTop: 35,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 25,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  matchText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  requirementsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  disabledButton: {
    backgroundColor: "#90CAF9",
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#333",
  },
});

export default ResetPassword;