import { getToken } from "@/scripts/token";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUser, setUser } from "../../scripts/user";

const AccountSettings: React.FC = () => {
  const router = useRouter();
  const user = getUser();
  const [userData, setUserData] = useState({
    fullName: user?.name,
    email: user?.email,
    phone: user?.mobile_number,
    address: user?.address,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const resetPassword = () => {
    Alert.alert(
      "Are you sure you want to reset your password?",
      "",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK", // Confirm button
          onPress: () => {
            router.push({
              pathname: "/ProfileSettings/ResetPassword",
              params: {
                phone: userData?.phone,
                verified: "true",
              },
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

const handleUpdate = async (
  name: string,
  email: string,
  address: string,
  phoneNumber: string,
  currentPassword?: string,
  newPassword?: string,
  confirmPassword?: string
) => {
  const url = `https://tub.kazibufastnet.com/api/tech/profile/update/${user?.id}`;

  try {
    const token = await getToken();

    // Validate phone number first
    if (!phoneNumber?.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    const body: any = {
      name,
      email,
      address,
      phoneNumber,
    };

    // Optional password change
    if (currentPassword || newPassword || confirmPassword) {
      // Make sure all fields are filled
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert("Error", "Please fill all password fields");
        return;
      }

      // Make sure new and confirm match
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New password and confirmation do not match");
        return;
      }

      body.current_password = currentPassword; // Send current password
      body.password = newPassword;
      body.password_confirmation = confirmPassword;
    }

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
      Alert.alert("Success", "Profile updated successfully");
      setUser(responseData.user);
      router.push("/ProfileSettings/AccountSettings");
    } else {
      // Handle backend validation errors
      const errors = responseData.errors
        ? Object.values(responseData.errors).flat().join("\n")
        : responseData.message || "Update failed";

      // Specific alert if current password is invalid
      if (
        responseData.errors?.currentPassword?.includes("incorrect") ||
        responseData.message?.toLowerCase().includes("current password")
      ) {
        Alert.alert("Error", "Current password is incorrect");
      } else {
        Alert.alert("Error", errors);
      }

      // console.error("Update failed:", responseData);
    }
  } catch (error) {
    console.error("Update request failed:", error);
    Alert.alert("Error", "Failed to update profile. Please try again.");
  }
};

  const onPressHandler = (event: GestureResponderEvent) => {
    handleUpdate(
      userData.fullName,
      userData.email,
      userData.address,
      userData.phone,
      userData.currentPassword,
      userData.newPassword,
      userData.confirmPassword
    );
  };

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              ></TouchableOpacity>

              <View style={styles.header}>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <Text style={styles.headerSubtitle}>
                  Manage your personal information
                </Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={userData.fullName}
                    onChangeText={(text) => handleChange("fullName", text)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <Text style={styles.value}>{userData.fullName}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={userData.email}
                    onChangeText={(text) => handleChange("email", text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.value}>{userData.email}</Text>
                )}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={userData.phone}
                    onChangeText={(text) => handleChange("phone", text)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.value}>{userData.phone}</Text>
                )}
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={userData.address}
                    onChangeText={(text) => handleChange("address", text)}
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                  />
                ) : (
                  <Text style={styles.value}>{userData.address}</Text>
                )}
              </View>
              {isEditing && (
                <>
                  {/* Reset Password Header */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.sectionTitle}>Reset Password</Text>
                  </View>

                  {/* Current Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={userData.currentPassword}
                        onChangeText={(text) =>
                          handleChange("currentPassword", text)
                        }
                        placeholder="Enter current password"
                        secureTextEntry={!showCurrent}
                      />
                      <TouchableOpacity
                        onPress={() => setShowCurrent(!showCurrent)}
                        style={{ marginLeft: 10 }}
                      >
                        <Ionicons
                          name={showCurrent ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={userData.newPassword}
                        onChangeText={(text) =>
                          handleChange("newPassword", text)
                        }
                        placeholder="Enter new password"
                        secureTextEntry={!showNew}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNew(!showNew)}
                        style={{ marginLeft: 10 }}
                      >
                        <Ionicons
                          name={showNew ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={userData.confirmPassword}
                        onChangeText={(text) =>
                          handleChange("confirmPassword", text)
                        }
                        placeholder="Confirm new password"
                        secureTextEntry={!showConfirm}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirm(!showConfirm)}
                        style={{ marginLeft: 10 }}
                      >
                        <Ionicons
                          name={showConfirm ? "eye-off-outline" : "eye-outline"}
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    {/* Password Match Feedback */}
                    {userData.confirmPassword.length > 0 && (
                      <Text
                        style={{
                          marginTop: 8,
                          color:
                            userData.newPassword === userData.confirmPassword
                              ? "green"
                              : "red",
                          fontWeight: "500",
                          textAlign:"center",
                        }}
                      >
                        {userData.newPassword === userData.confirmPassword
                          ? "Passwords match!! 😊"
                          : "Passwords do not match !! 😔"}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={onPressHandler}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
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

  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 25,
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  value: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 4,
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
  editButton: {
    backgroundColor: "#4caf50",
  },
  saveButton: {
    backgroundColor: "#4caf50",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  securityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  securityTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: "#666",
  },
});

export default AccountSettings;
