import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import Overlay from '../../components/Overlay';

const Billing: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header />
      <Overlay/>

      <View style={styles.contentContainer}>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
           <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Billing</Text>
        </View>

          <View style={styles.sectionContainer}>
            <View style={styles.currentBillCard}>
              <Text style={styles.billAmount}>P1,495.00</Text>
              <Text style={styles.dueDate}>Due Date: Dec 30, 2025</Text>
              <TouchableOpacity style={styles.payNowButton}>
                <Text style={styles.payNowButtonText}>PAY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>Dec 15, 2025</Text>
                <Text style={styles.paidStatus}>PAID</Text>
              </View>
              <Text style={styles.historyAmount}>P1,495.00</Text>
              <Text style={styles.historyDescription}>Internet Bill</Text>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>Nov 30, 2025</Text>
                <Text style={styles.paidStatus}>PAID</Text>
              </View>
              <Text style={styles.historyAmount}>P1,495.00</Text>
              <Text style={styles.historyDescription}>Internet Bill</Text>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>Oct 30, 2025</Text>
                <Text style={styles.paidStatus}>PAID</Text>
              </View>
              <Text style={styles.historyAmount}>P1,495.00</Text>
              <Text style={styles.historyDescription}>Internet Bill</Text>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>Sep 30, 2025</Text>
                <Text style={styles.paidStatus}>PAID</Text>
              </View>
              <Text style={styles.historyAmount}>P1,495.00</Text>
              <Text style={styles.historyDescription}>Internet Bill</Text>
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
    paddingBottom:5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  currentBillCard: {
    backgroundColor: '#00afa1ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  billAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  dueDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  payNowButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  payNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00afa1ff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00afa1ff',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  paidStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  navItem: {
    fontSize: 10,
    fontWeight: '500',
    color: '#888',
    textAlign: 'center',
  },
  activeNavItem: {
    color: '#00afa1ff',
    fontWeight: 'bold',
  },
});

export default Billing;

// import React from 'react';
// import { Platform, StyleSheet, View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import Header from '../../components/Header';
// import Overlay from '../../components/Overlay';

// export default function BillingWebView() {
//   if (Platform.OS === 'web') {
//     return (
//       <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//         <Header />
//         <iframe
//           src="https://kazibufastnet.com/payment-portal/138234"
//           style={{ flex: 1, border: 'none', width: '100%' }}
//         />
//       </div>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Header />
//       <Overlay/>
//       <WebView
//         source={{ uri: 'https://kazibufastnet.com/payment-portal/138234' }}
//         style={styles.webview}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webview: {
//     flex: 1,
//   },
// });

