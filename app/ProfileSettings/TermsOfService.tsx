import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';

const TermsOfService: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Terms of Service</Text>
              <Text style={styles.headerSubtitle}>Effective April 1, 2026</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.body}>
              These Terms of Service govern your use of the Kazibufast Technician app provided by Kazibu Fast Network. By using this app, you agree to these terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authorized Use</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} This app is exclusively for authorized Kazibu Fast Network technicians.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Access is granted by the company and may be revoked at any time.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Responsibility</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} You are responsible for maintaining the security of your account.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Do not share your OTP or login credentials with anyone.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Report unauthorized access to your account immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceptable Use</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Use the app only for work-related purposes.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Provide accurate information when updating tickets, NAP tags, and time records.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Do not tamper with location data or photo verification features.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} The app and its content are property of Kazibu Fast Network.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} You may not copy, modify, or distribute the app or its components.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} The app is provided "as is" for internal business use.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Kazibu Fast Network is not liable for data loss due to device issues or connectivity problems.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Offline-cached data may not always reflect the latest server state.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termination</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} The company may suspend or terminate your access at any time.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Upon termination, you must uninstall the app from your device.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} We may update these terms at any time.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Continued use of the app constitutes acceptance of updated terms.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.body}>Kazibu Fast Network</Text>
            <Text style={styles.body}>Purok 5 Guiwanon, Tubigon, Bohol</Text>
            <Text style={[styles.body, styles.linkText]}>kazibufast@gmail.com</Text>
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
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 10,
  },
  contactSection: {
    marginBottom: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  linkText: {
    color: '#00afa1ff',
    fontWeight: '600',
  },
});

export default TermsOfService;
