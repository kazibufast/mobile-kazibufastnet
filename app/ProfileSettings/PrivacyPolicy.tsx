import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';

const PrivacyPolicy: React.FC = () => {
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
              <Text style={styles.headerTitle}>Privacy Policy</Text>
              <Text style={styles.headerSubtitle}>Effective April 1, 2026</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.body}>
              Kazibu Fast Network ("we", "us", or "our") is committed to protecting the privacy of our technicians who use the Kazibufast Technician app. This Privacy Policy explains how we collect, use, store, and share your information.
            </Text>
            <Text style={styles.body}>
              Kazibu Fast Network is located at Purok 5 Guiwanon, Tubigon, Bohol. This is an internal technician app intended exclusively for authorized company personnel.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.body}>
              We collect the following information when you use the app:
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Phone number -- used for OTP-based authentication to verify your identity.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Location data -- precise GPS location used for calculating distance to NAP boxes and time-in/time-out verification.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Photos -- camera capture used for time-in/time-out attendance verification.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Device information -- collected for app functionality and troubleshooting purposes.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Work-related data -- including ticket updates, NAP tag numbers, and team assignments.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Authenticate your identity via OTP verification.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Track attendance and work hours through time-in/time-out records.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Manage service tickets and team assignments.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Calculate distances to Network Access Points (NAPs).
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Improve app performance and functionality.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Storage</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Some data is stored locally on your device (authentication tokens, NAP cache) for offline functionality.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Work data is transmitted to and stored on company servers at sys.kazibufastnet.com.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Photos taken during time-in/time-out are transmitted to company servers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} We do not sell or share your personal data with third parties.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Data is accessible only to authorized company personnel.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} No third-party analytics or tracking services are used.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Your data is retained for the duration of your employment or contract with Kazibu Fast Network.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Upon termination, data may be retained as required by company policy or applicable law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Request access to your personal data.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Request correction of inaccurate data.
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Request deletion of your data (subject to company policy).
            </Text>
            <Text style={styles.bulletItem}>
              {'\u2022'} Contact us at kazibufast@gmail.com for privacy-related concerns.
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

export default PrivacyPolicy;
