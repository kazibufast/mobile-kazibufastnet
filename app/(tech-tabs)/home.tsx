import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { getUser } from '../../scripts/user';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

const scaleSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * Math.min(scale, 1.2));
};

interface Stats {
  open: number;
  pending: number;
  accepted: number;
  in_progress: number;
  completed: number;
  closed: number;
}

interface RecentTicket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  type: string;
  created_at: string;
  client?: { name: string };
}

const Home: React.FC = () => {
  const router = useRouter();
  const user = getUser();

  const [stats, setStats] = useState<Stats>({ open: 0, pending: 0, accepted: 0, in_progress: 0, completed: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHome = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(API.tech.home(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      setStats(data.stats);
      setRecentTickets(data.recent_tickets || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchHome(); }, [fetchHome]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHome();
  }, [fetchHome]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in progress': return '#F39C12';
      case 'accepted': return '#3498DB';
      case 'completed': return '#2ECC71';
      case 'pending': return '#95A5A6';
      case 'open': return '#E74C3C';
      case 'closed': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryAlt} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryAlt} colors={[Colors.primaryAlt]} />
        }
      >
        <View style={styles.heroSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hi, {user?.name?.split(' ')[0] || 'Technician'}!
            </Text>
            <Text style={styles.welcome}>Welcome Technician</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.refreshButton}>
              {refreshing ? (
                <ActivityIndicator size="small" color={Colors.primaryAlt} />
              ) : (
                <Ionicons name="refresh" size={20} color={Colors.primaryAlt} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.open}</Text>
              <Text style={styles.statLabel}>Open</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.in_progress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity onPress={() => router.push('/(tech-tabs)/tickets')}>
              <Text style={styles.viewAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ticketsList}>
            {recentTickets.length === 0 ? (
              <Text style={styles.emptyText}>No active tickets</Text>
            ) : (
              recentTickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                >
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketClient}>{ticket.client?.name || 'Unknown'}</Text>
                    <Text style={styles.ticketTime}>{formatTime(ticket.created_at)}</Text>
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
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
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
    color: Colors.textDark,
    marginBottom: scaleSize(6),
  },
  welcome: {
    fontSize: scaleSize(18),
    color: Colors.textMedium,
    fontWeight: '600',
    marginBottom: scaleSize(8),
  },
  statsSection: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
  },
  sectionTitle: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: Colors.textBody,
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
  statNumber: {
    fontSize: scaleSize(28),
    fontWeight: '800',
    color: Colors.primaryAlt,
    marginBottom: scaleSize(4),
  },
  statLabel: {
    fontSize: scaleSize(12),
    color: Colors.textMuted,
    fontWeight: '500',
  },
  ticketsSection: {
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
    color: Colors.primaryAlt,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
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
  ticketClient: {
    fontSize: scaleSize(16),
    fontWeight: '700',
    color: Colors.primaryAlt,
  },
  ticketTime: {
    fontSize: scaleSize(12),
    color: Colors.textLight,
    fontWeight: '500',
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
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: scaleSize(14),
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 30,
  },
});

export default Home;
