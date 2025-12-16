import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../../components/Header';
import { getUser } from '../../scripts/user';

const { width, height } = Dimensions.get('window');

const scaleSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * Math.min(scale, 1.2));
};

const Home: React.FC = () => {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  const user = getUser();

  const stats = {
    activeTickets: 8,
    completed: 12,
    pending: 3,
    closed: 4
  };

  const recentTickets = [
    { id: 'KAZ-2021', client: 'John Doe', status: 'In Progress', priority: 'High', time: '10:30 AM' },
    { id: 'KAZ-2022', client: 'Sarah Smith', status: 'Assigned', priority: 'Medium', time: '11:15 AM' },
    { id: 'KAZ-2023', client: 'Mike Johnson', status: 'Completed', priority: 'Low', time: '9:00 AM' },
    { id: 'KAZ-2024', client: 'Lisa Wang', status: 'Pending', priority: 'High', time: '2:45 PM' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#F39C12';
      case 'Assigned': return '#3498DB';
      case 'Completed': return '#2ECC71';
      case 'Pending': return '#95A5A6';
      default: return '#7F8C8D';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return { color: '#E74C3C', bg: '#FDEDEC' };
      case 'Medium': return { color: '#F39C12', bg: '#FEF9E7' };
      case 'Low': return { color: '#27AE60', bg: '#EAFAF1' };
      default: return { color: '#7F8C8D', bg: '#F4F6F6' };
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hi, {user?.name?.split(' ')[0] || 'Technician'}! 👋
            </Text>
            <Text style={styles.welcome}>
              Welcome Technician
            </Text>

          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activeTickets}</Text>
              <Text style={styles.statLabel}>Open Tickets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending Tickets</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed Tickets</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.closed}</Text>
              <Text style={styles.statLabel}>Closed Tickets</Text>
            </View>
          </View>
        </View>


        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Open</Text>
            <TouchableOpacity onPress={() => router.push('/tickets')}>
              <Text style={styles.viewAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ticketsList}>
            {recentTickets.map((ticket, index) => {
              const priorityStyle = getPriorityBadge(ticket.priority);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketId}>{ticket.client}</Text>
                    <Text style={styles.ticketTime}>{ticket.time}</Text>
                  </View>
                 
                  <View style={styles.ticketFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status}
                      </Text>
                    </View>
                   
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  heroSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(20),
    paddingBottom: scaleSize(25),
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    marginBottom: scaleSize(20),
  },
  greetingContainer: {
    justifyContent: 'center'
  },
  greeting: {
    fontSize: scaleSize(32),
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: scaleSize(6),
  },
  welcome: {
    fontSize: scaleSize(18),
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: scaleSize(8),
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scaleSize(10),
  },
  userRole: {
    fontSize: scaleSize(14),
    color: '#718096',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: 20,
    fontWeight: '500',
  },
  userId: {
    fontSize: scaleSize(13),
    color: '#A0AEC0',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
  },
  sectionTitle: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: scaleSize(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scaleSize(12),
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: scaleSize(16),
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: scaleSize(12),
  },
  statIcon: {
    fontSize: scaleSize(24),
    marginBottom: scaleSize(8),
  },
  statNumber: {
    fontSize: scaleSize(28),
    fontWeight: '800',
    color: '#00A8FF',
    marginBottom: scaleSize(4),
  },
  statLabel: {
    fontSize: scaleSize(12),
    color: '#718096',
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(16),
  },
  viewAll: {
    fontSize: scaleSize(14),
    color: '#00A8FF',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scaleSize(12),
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: scaleSize(16),
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: scaleSize(12),
  },
  actionIcon: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSize(12),
  },
  actionIconText: {
    fontSize: scaleSize(24),
  },
  actionTitle: {
    fontSize: scaleSize(16),
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: scaleSize(4),
  },
  actionDescription: {
    fontSize: scaleSize(12),
    color: '#718096',
    lineHeight: scaleSize(16),
  },
  ticketsSection: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
  },
  ticketsList: {
    gap: scaleSize(12),
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: scaleSize(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  ticketId: {
    fontSize: scaleSize(16),
    fontWeight: '700',
    color: '#00A8FF',
  },
  ticketTime: {
    fontSize: scaleSize(12),
    color: '#A0AEC0',
    fontWeight: '500',
  },
  ticketClient: {
    fontSize: scaleSize(15),
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: scaleSize(12),
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(4),
    borderRadius: 12,
  },
  statusDot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: 3,
    marginRight: scaleSize(6),
  },
  statusText: {
    fontSize: scaleSize(12),
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(4),
    borderRadius: 12,
  },
  priorityText: {
    fontSize: scaleSize(11),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  performanceBanner: {
    marginHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    padding: scaleSize(20),
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#fff',
    marginBottom: scaleSize(6),
  },
 
});

export default Home;