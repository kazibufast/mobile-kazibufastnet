import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HelpSupport: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'billing', title: 'Billing & Payments', icon: 'card-outline' },
    { id: 'technical', title: 'Technical Support', icon: 'hardware-chip-outline' },
    { id: 'account', title: 'Account Issues', icon: 'person-outline' },
    { id: 'service', title: 'Service Issues', icon: 'wifi-outline' },
    { id: 'other', title: 'Other', icon: 'help-circle-outline' },
  ];

  const faqs = [
    { question: 'How do I pay my bill?', answer: 'You can pay your bill through the app, online portal, or at any authorized payment center.' },
    { question: 'What should I do if my internet is down?', answer: 'Check your equipment first, then restart your router. If issue persists, contact technical support.' },
    { question: 'How do I upgrade my plan?', answer: 'Go to Subscription screen and select the upgrade option for your current plan.' },
    { question: 'Where can I view my billing history?', answer: 'All billing history is available in the Billing section of the app.' },
  ];

  const handleSendMessage = () => {
    if (!message.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please select a category and enter your message');
      return;
    }
    Alert.alert('Message Sent', 'Our support team will get back to you within 24 hours.');
    setMessage('');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:09508221851');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@kazibufast.com');
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Connecting you to a support agent...');
  };

  return (
     <SafeAreaView style={styles.safeArea} edges={[ 'left', 'right']}>
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style= {{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
         

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help you 24/7</Text>
          </View>
          </View>

          {/* Quick Support Options */}
          <View style={styles.quickSupportSection}>
            <Text style={styles.sectionTitle}>Quick Support</Text>

            <View style={styles.quickSupportGrid}>
              <TouchableOpacity style={styles.supportOption} onPress={handleCallSupport}>
                <Ionicons name="call-outline" size={28} color="#00afa1ff" />
                <Text style={styles.supportOptionText}>Call Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportOption} onPress={handleEmailSupport}>
                <Ionicons name="mail-outline" size={28} color="#00afa1ff" />
                <Text style={styles.supportOptionText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportOption} onPress={handleLiveChat}>
                <Ionicons name="chatbubbles-outline" size={28} color="#00afa1ff" />
                <Text style={styles.supportOptionText}>Live Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {faqs.map((faq, index) => (
              <TouchableOpacity key={index} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <Ionicons name="help-circle-outline" size={20} color="#00afa1ff" />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>

            <Text style={styles.formLabel}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={selectedCategory === category.id ? '#fff' : '#00afa1ff'}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.formLabel}>Your Message</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue in detail..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* Support Hours */}
          <View style={styles.supportHours}>
            <Ionicons name="time-outline" size={24} color="#00afa1ff" />
            <Text style={styles.supportHoursTitle}>Support Hours</Text>
            <Text style={styles.supportHoursText}>24/7 Technical Support</Text>
            <Text style={styles.supportHoursText}>Mon-Fri: 8AM-8PM (Billing & Accounts)</Text>
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
  quickSupportSection: {
    marginBottom: 25,
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
  quickSupportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  supportOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  faqItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 30,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  categoriesScroll: {
    marginBottom: 15,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#00afa1ff',
  },
  categoryButtonActive: {
    backgroundColor: '#00afa1ff',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#00afa1ff',
    marginLeft: 5,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  messageInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 120,
    marginBottom: 15,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00afa1ff',
    paddingVertical: 15,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  supportHours: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  supportHoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  supportHoursText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 3,
  },
});

export default HelpSupport;