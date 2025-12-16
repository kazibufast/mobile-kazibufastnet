import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Define the Bill type based on your data structure
export interface UpcomingBill {
  id: string;
  date: string;
  amount: string;
  status: string;
  color: string;
  description?: string;
}

// Mock data using your exact structure
const mockUpcomingBills: UpcomingBill[] = [
  {
    id: '1',
    date: 'Mon, Dec 30, 2025',
    amount: 'P1,495.00',
    status: 'Due in 5 days',
    color: '#FF6B6B',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
  {
    id: '2',
    date: 'Tue, Nov 15, 2025',
    amount: 'P1,595.00',
    status: 'Due in 20 days',
    color: '#FFA726',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
  {
    id: '3',
    date: 'Mon, Oct 20, 2025',
    amount: 'P1,495.00',
    status: 'Due in 45 days',
    color: '#00AF9F',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
  {
    id: '4',
    date: 'Sun, Sep 30, 2025',
    amount: 'P1,495.00',
    status: 'Due in 75 days',
    color: '#4CAF50',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
  {
    id: '5',
    date: 'Sat, Aug 15, 2025',
    amount: 'P1,595.00',
    status: 'Due in 105 days',
    color: '#2196F3',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
  {
    id: '6',
    date: 'Fri, Jul 20, 2025',
    amount: 'P1,495.00',
    status: 'Due in 135 days',
    color: '#9C27B0',
    description: 'Don\'t forget to pay your internet bill on time!',
  },
];

const SeeAllUpcomingBills: React.FC = () => {
  const navigation = useNavigation();
  const [bills, setBills] = useState<UpcomingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');

  // Fetch bills
  const fetchBills = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration, add more bills to show scrolling
      const additionalBills = [
        {
          id: '7',
          date: 'Thu, Jun 30, 2025',
          amount: 'P1,495.00',
          status: 'Due in 165 days',
          color: '#FF9800',
          description: 'Don\'t forget to pay your internet bill on time!',
        },
        {
          id: '8',
          date: 'Wed, May 15, 2025',
          amount: 'P1,595.00',
          status: 'Due in 195 days',
          color: '#795548',
          description: 'Don\'t forget to pay your internet bill on time!',
        },
      ];
      
      setBills([...mockUpcomingBills, ...additionalBills]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load upcoming bills');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePayNow = (billId: string) => {
    Alert.alert(
      'Pay Bill',
      'Would you like to proceed with payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: () => {
            Alert.alert('Success', 'Payment initiated successfully!');
            // Add your payment logic here
          }
        },
      ]
    );
  };

  const renderBillItem = ({ item }: { item: UpcomingBill }) => (
    <TouchableOpacity
      style={styles.billCard}
      activeOpacity={0.9}
      onPress={() => console.log('View bill details', item.id)}
    >
      <View style={styles.billContent}>
        <View style={styles.billHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.billDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
            <Text style={[styles.statusTextBadge, { color: item.color }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.billDescription}>
          {item.description || 'Don\'t forget to pay your internet bill on time!'}
        </Text>
        
        <View style={styles.billFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.billAmount}>{item.amount}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => handlePayNow(item.id)}
          >
            <Text style={styles.payButtonText}>PAY NOW</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={styles.payButtonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Upcoming Bills</Text>
      <Text style={styles.emptyStateText}>You're all caught up with payments!</Text>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
          All Bills
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
        onPress={() => setFilter('upcoming')}
      >
        <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.filterButtonTextActive]}>
          Upcoming
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'overdue' && styles.filterButtonActive]}
        onPress={() => setFilter('overdue')}
      >
        <Text style={[styles.filterButtonText, filter === 'overdue' && styles.filterButtonTextActive]}>
          Overdue
        </Text>
      </TouchableOpacity>
    </View>
  );

  const calculateSummary = () => {
    const upcomingCount = bills.filter(bill => 
      bill.status.toLowerCase().includes('due in') && 
      !bill.status.toLowerCase().includes('overdue')
    ).length;
    
    const overdueCount = bills.filter(bill => 
      bill.status.toLowerCase().includes('overdue')
    ).length;
    
    const totalAmount = bills.reduce((sum, bill) => {
      const amount = parseFloat(bill.amount.replace(/[^0-9.-]+/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    return { upcomingCount, overdueCount, totalAmount };
  };

  const { upcomingCount, overdueCount, totalAmount } = calculateSummary();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading upcoming bills...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Bills</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>
              P{totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Ionicons name="time-outline" size={20} color="#FFA726" />
            <Text style={styles.summaryLabel}>Upcoming</Text>
            <Text style={[styles.summaryValue, styles.upcomingCount]}>{upcomingCount}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
            <Text style={styles.summaryLabel}>Overdue</Text>
            <Text style={[styles.summaryValue, styles.overdueCount]}>{overdueCount}</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Bills List */}
      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  upcomingCount: {
    color: '#FFA726',
  },
  overdueCount: {
    color: '#FF6B6B',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  billContent: {
    padding: 16,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  billDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 16,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  payButtonIcon: {
    marginLeft: 6,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SeeAllUpcomingBills;