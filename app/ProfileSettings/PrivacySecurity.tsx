import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';

const PrivacySecurity: React.FC = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    activityNotifications: true,
    marketingEmails: false,
    dataCollection: true,
    locationServices: false,
  });

  const toggleSwitch = (setting: string) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data', style: 'destructive', onPress: () => {
            Alert.alert('Success', 'Data cleared successfully');
          }
        }
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert('Download Data', 'Your data will be prepared for download and sent to your email.');
  };

  return (
    <View style={styles.container}>
      <Header />


      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <View style= {{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Privacy & Security</Text>
            <Text style={styles.headerSubtitle}>Manage your privacy and security settings</Text>
          </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>Add an extra layer of security to your account</Text>
                </View>
              </View>
              <Switch
                value={settings.twoFactorAuth}
                onValueChange={() => toggleSwitch('twoFactorAuth')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>Use fingerprint or face ID to log in</Text>
                </View>
              </View>
              <Switch
                value={settings.biometricLogin}
                onValueChange={() => toggleSwitch('biometricLogin')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Activity Notifications</Text>
                  <Text style={styles.settingDescription}>Get notified about account activity</Text>
                </View>
              </View>
              <Switch
                value={settings.activityNotifications}
                onValueChange={() => toggleSwitch('activityNotifications')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Marketing Emails</Text>
                  <Text style={styles.settingDescription}>Receive promotional emails and offers</Text>
                </View>
              </View>
              <Switch
                value={settings.marketingEmails}
                onValueChange={() => toggleSwitch('marketingEmails')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="analytics-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Data Collection</Text>
                  <Text style={styles.settingDescription}>Allow anonymous usage data collection</Text>
                </View>
              </View>
              <Switch
                value={settings.dataCollection}
                onValueChange={() => toggleSwitch('dataCollection')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={22} color="#00afa1ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Location Services</Text>
                  <Text style={styles.settingDescription}>Allow app to access your location</Text>
                </View>
              </View>
              <Switch
                value={settings.locationServices}
                onValueChange={() => toggleSwitch('locationServices')}
                trackColor={{ false: '#ddd', true: '#00afa1ff' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>

            <TouchableOpacity style={styles.dataActionItem} onPress={handleDownloadData}>
              <View style={styles.dataActionLeft}>
                <Ionicons name="download-outline" size={22} color="#00afa1ff" />
                <Text style={styles.dataActionText}>Download Your Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dataActionItem} onPress={handleClearData}>
              <View style={styles.dataActionLeft}>
                <Ionicons name="trash-outline" size={22} color="#ff6b6b" />
                <Text style={[styles.dataActionText, styles.dangerText]}>Clear All Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          {/* Privacy Policy Link */}
          <View style={styles.privacyPolicyContainer}>
            <Text style={styles.privacyPolicyText}>
              By using our services, you agree to our{' '}
              <Text style={styles.linkText}>Privacy Policy</Text> and{' '}
              <Text style={styles.linkText}>Terms of Service</Text>.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  dataActionItem: {
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
  dataActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataActionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  dangerText: {
    color: '#ff6b6b',
  },
  privacyPolicyContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  privacyPolicyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#00afa1ff',
    fontWeight: '600',
  },
});

export default PrivacySecurity;