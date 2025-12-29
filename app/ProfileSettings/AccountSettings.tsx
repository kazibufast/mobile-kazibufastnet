import { getToken } from '@/scripts/token';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, GestureResponderEvent, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser } from '../../scripts/user';

const AccountSettings: React.FC = () => {
  const router = useRouter();
  const user = getUser();
  const [userData, setUserData] = useState({
    fullName: user?.name,
    email: user?.email,
    phone: user?.mobile_number,
    address: user?.address,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const resetPassword = () => {
    Alert.alert(
      'Are you sure you want to reset your password?',
      '', 
      [
        {
          text: 'Cancel', 
          style: 'cancel', 
        },
        {
          text: 'OK', // Confirm button
          onPress: () => {
            router.push({
              pathname: "/(auth)/setup-pin",
              params: {
                phone: userData?.phone,
                verified: "true",
              },
            });
          },
        },
      ],
      { cancelable: false }
    )
  }


  const handleUpdate = async (name: string, email: string, address: string, phoneNumber: string) => {
    const url = `https://staging.kazibufastnet.com/api/tech/profile/update/${user?.id}`;

    try {
      const token = await getToken();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          address: address,
          phoneNumber: phoneNumber,
        }),
      });

      // Check the response status
      if (response.ok) {
        const responseData = await response.json();
        console.log('Reschedule successful:', responseData);
        if (responseData.status === 'success') {
          // Handle success (navigate to a different page, etc.)

          Alert.alert('Successfully update!');

          router.push('/ProfileSettings/AccountSettings');

        } else {
          console.error('Error rescheduling:', responseData.message || responseData);
          // Handle error (show error message, etc.)
        }
        // router.push('/(tech-tabs)/tickets');


      } else {
        const errorData = await response.json();
        console.error('Error rescheduling:', errorData);
        // Handle error (show error message, etc.)
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      // Handle fetch error (network error, etc.)
    }
  };


  const onPressHandler = (event: GestureResponderEvent) => {
    handleUpdate(userData.fullName, userData.email, userData.address, userData.phone);

  }




  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'left', 'right']}>
      <View style={styles.container}>


        <View style={styles.contentContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >

              </TouchableOpacity>

              <View style={styles.header}>

                <Text style={styles.headerTitle}>Account Settings</Text>
                <Text style={styles.headerSubtitle}>Manage your personal information</Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{user?.name}</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={userData.fullName}
                    onChangeText={(text) => handleChange('fullName', text)}
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
                    onChangeText={(text) => handleChange('email', text)}
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
                    onChangeText={(text) => handleChange('phone', text)}
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
                    onChangeText={(text) => handleChange('address', text)}
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                  />
                ) : (
                  <Text style={styles.value}>{userData.address}</Text>
                )}
              </View>

              {/* Account ID (Read Only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number</Text>
                <Text style={styles.value}>ACC-2023-001</Text>
              </View>

              {/* Member Since (Read Only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Member Since</Text>
                <Text style={styles.value}>January 2023</Text>
              </View>
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
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
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

            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>

              <TouchableOpacity style={styles.securityItem} onPress={resetPassword}>
                <View style={styles.securityLeft}>
                  <Ionicons name="key-outline" size={22} color="#00afa1ff" />
                  <View style={styles.securityTextContainer}>
                    <Text style={styles.securityTitle}>Reset Password</Text>

                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
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
    backgroundColor: '#f6f7f8ff',
    paddingBottom: 40,
    paddingTop: 30
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  backButton: {
    position: 'absolute',
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
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#00afa1ff',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default AccountSettings;