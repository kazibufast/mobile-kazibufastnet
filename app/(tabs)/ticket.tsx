import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../../components/Header';
import Overlay from '../../components/Overlay';

const Ticket: React.FC = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Header />
      <Overlay />
      <View style={styles.contentContainer}>


        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Kazibufast Network</Text>
            <Text style={styles.subTitle}>Support Tickets</Text>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.ticketContainer}>
              <Text style={styles.sectionTitle}>My tickets</Text>
             
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1101</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                dksjflkdsjflkdsjflksdjflksdjflkdsjflkdsjflkdsjflksdjflksdjfl...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1101</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                dksjflkdsjflkdsjflksdjflksdjflkdsjflkdsjflkdsjflksdjflksdjfl...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1101</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                dksjflkdsjflkdsjflksdjflksdjflkdsjflkdsjflkdsjflksdjflksdjfl...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1101</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                dksjflkdsjflkdsjflksdjflksdjflkdsjflkdsjflkdsjflksdjflksdjfl...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1102</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                Network connectivity issue in downtown area...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1103</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                Billing inquiry for December 2025...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1104</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                Request for speed upgrade on current plan...
              </Text>
            </View>

            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>KAZ-1105</Text>
              <Text style={styles.subjectLabel}>Subject:</Text>
              <Text style={styles.subjectText}>
                Equipment replacement needed...
              </Text>
            </View>
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
  contentContainer: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 15,
    color: '#000000ff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  ticketContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1, 
  },
  addTicketsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTicketsText: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
    
  },
  ticketCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00afa1ff',
    marginBottom: 8,
  },
  subjectLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default Ticket;