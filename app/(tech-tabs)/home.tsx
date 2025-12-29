import {
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { getToken } from '../../scripts/token';
import { getUser } from '../../scripts/user';

const { width } = Dimensions.get('window');

const scaleSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * Math.min(scale, 1.2));
};

const Home: React.FC = () => {
  const router = useRouter();
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // tickets
  const [openTickets, setOpenTickets] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [completedTickets, setCompletedTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);

  const stats = {
    activeTickets: openTickets,
    pending: pendingTickets,
    completed: completedTickets,
    closed: closedTickets
  };

  const recentTickets = [
    { id: 'KAZ-2021', client: 'John Doe', status: 'In Progress', time: '10:30 AM', priority: 'High' },
    { id: 'KAZ-2022', client: 'Sarah Smith', status: 'Assigned', time: '11:15 AM', priority: 'Medium' },
    { id: 'KAZ-2023', client: 'Mike Johnson', status: 'Completed', time: '9:00 AM', priority: 'Low' },
    { id: 'KAZ-2024', client: 'Lisa Wang', status: 'Pending', time: '2:45 PM', priority: 'Medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#F59E0B';
      case 'Assigned': return '#3B82F6';
      case 'Completed': return '#10B981';
      case 'Pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress': return 'clock';
      case 'Assigned': return 'user-check';
      case 'Completed': return 'check-circle';
      case 'Pending': return 'pause-circle';
      default: return 'file-text';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch('https://staging.kazibufastnet.com/api/tech/home', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to fetch data. Status: ${response.status}, Details: ${errorDetails}`);
      }

      const data = await response.json();
      const tickets = Array.isArray(data.tickets) ? data.tickets : [];

      setOpenTickets(tickets.filter((t: { status: string; }) => t.status === 'open').length);
      setPendingTickets(tickets.filter((t: { status: string; }) => t.status === 'pending').length);
      setCompletedTickets(tickets.filter((t: { status: string; }) => t.status === 'completed').length);
      setClosedTickets(tickets.filter((t: { status: string; }) => t.status === 'closed').length);

    } catch (error: any) {
      setError(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Update time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }));
    }, 60000);

    // Initial call
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Technician';

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00AFA1"
            colors={["#00AFA1"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}
              </Text>
              <Text style={styles.name}>
                {firstName}!
              </Text>
            </View>
          </View>

          <Text style={styles.dateText}>{currentDate}</Text>

          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="toolbox-outline" size={scaleSize(14)} color="#FFFFFF" />
            <Text style={styles.roleText}>Technician</Text>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.quickStatsSection}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#007AFF' }]}
              onPress={() => router.push('/tickets?status=open')}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={scaleSize(24)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.activeTickets}</Text>
              <Text style={styles.quickStatLabel}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#FF9500' }]}
              onPress={() => router.push('/tickets?status=pending')}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="clock-alert-outline" size={scaleSize(24)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.pending}</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#34C759' }]}
              onPress={() => router.push('/tickets?status=completed')}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="check-circle-outline" size={scaleSize(24)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.completed}</Text>
              <Text style={styles.quickStatLabel}>Completed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#8E8E93' }]}
              onPress={() => router.push('/tickets?status=closed')}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="archive-outline" size={scaleSize(24)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.closed}</Text>
              <Text style={styles.quickStatLabel}>Closed</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Recent Tickets Section */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="ticket-outline" size={scaleSize(20)} color="#1F2937" />
                <Text style={styles.sectionTitle}>Recent Tickets</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Recently updated tickets</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/tickets')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={scaleSize(14)} color="#00AFA1" />
            </TouchableOpacity>
          </View>

          <View style={styles.ticketsList}>
            {recentTickets.map((ticket, index) => {
              const statusColor = getStatusColor(ticket.status);
              const priorityColor = getPriorityColor(ticket.priority);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketIdContainer}>
                      <MaterialCommunityIcons
                        name={getStatusIcon(ticket.status)}
                        size={scaleSize(18)}
                        color={statusColor}
                      />
                      <Text style={styles.ticketId}>{ticket.id}</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                        <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                        <Text style={[styles.priorityText, { color: priorityColor }]}>{ticket.priority}</Text>
                      </View>
                    </View>
                    <Text style={styles.ticketTime}>{ticket.time}</Text>
                  </View>

                  <Text style={styles.ticketClient}>{ticket.client}</Text>

                  <View style={styles.ticketFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: statusColor }]}>{ticket.status}</Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={scaleSize(14)} color="#00AFA1" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Empty State for no tickets */}
        {recentTickets.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={scaleSize(64)} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No Recent Tickets</Text>
            <Text style={styles.emptyStateText}>Create your first ticket to get started</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 25,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scaleSize(30),
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(20),
    paddingBottom: scaleSize(20),
    backgroundColor: '#FFFFFF',
    marginBottom: scaleSize(16),

  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleSize(8),
  },
  greeting: {
    fontSize: scaleSize(16),
    fontWeight: '500',
    color: '#64748B',
    marginBottom: scaleSize(4),
  },
  name: {
    fontSize: scaleSize(28),
    fontWeight: '700',
    color: '#1F2937',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(20),
    gap: scaleSize(6),
  },
  timeText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#64748B',
  },
  dateText: {
    fontSize: scaleSize(14),
    color: '#94A3B8',
    marginBottom: scaleSize(16),
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#00AFA1',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(16),
    gap: scaleSize(6),
  },
  roleText: {
    fontSize: scaleSize(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Quick Stats
  quickStatsSection: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(20),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scaleSize(12),
    marginBottom: scaleSize(12),
  },
  quickStatCard: {
    flex: 1,
    borderRadius: scaleSize(20),
    padding: scaleSize(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: scaleSize(12),
  },
  quickStatNumber: {
    fontSize: scaleSize(28),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: scaleSize(4),
  },
  quickStatLabel: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Tickets Section
  ticketsSection: {
    paddingHorizontal: scaleSize(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(20),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    marginBottom: scaleSize(4),
  },
  sectionTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: scaleSize(14),
    color: '#64748B',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(20),
  },
  viewAllText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#00AFA1',
  },
  ticketsList: {
    gap: scaleSize(12),
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    padding: scaleSize(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleSize(12),
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
  },
  ticketId: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: '#3B82F6',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(2),
    borderRadius: scaleSize(10),
    gap: scaleSize(4),
  },
  priorityDot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
  },
  priorityText: {
    fontSize: scaleSize(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ticketTime: {
    fontSize: scaleSize(13),
    color: '#94A3B8',
    fontWeight: '500',
  },
  ticketClient: {
    fontSize: scaleSize(16),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: scaleSize(16),
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
    paddingVertical: scaleSize(5),
    borderRadius: scaleSize(12),
    gap: scaleSize(6),
  },
  statusDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  statusText: {
    fontSize: scaleSize(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  actionText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#00AFA1',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSize(60),
    paddingHorizontal: scaleSize(40),
  },
  emptyStateTitle: {
    fontSize: scaleSize(18),
    fontWeight: '600',
    color: '#64748B',
    marginTop: scaleSize(16),
    marginBottom: scaleSize(8),
  },
  emptyStateText: {
    fontSize: scaleSize(14),
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default Home;