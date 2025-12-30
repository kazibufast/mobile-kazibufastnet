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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const Home: React.FC = () => {

  type Ticket = {
    id: string;
    clientName: string;
    status: 'Open' | 'Pending' | 'InProgress' | 'Accepted' | 'Completed' | 'Closed';
    type: 'Repair' | 'Installation' | null;
    subject: string;
    date: string;
    created_at: string;
    team_id: string;
    technician_id?: string;
    priority?: string;
  };

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

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const stats = {
    activeTickets: openTickets,
    pending: pendingTickets,
    completed: completedTickets,
    closed: closedTickets
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'in progress': return '#F59E0B';
      case 'assigned': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'pending': return '#6B7280';
      case 'closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'in progress': return 'clock';
      case 'assigned': return 'account-check';
      case 'completed': return 'check-circle';
      case 'pending': return 'pause-circle';
      case 'closed': return 'archive-check';
      default: return 'ticket-outline';
    }
  };


  const assignedTickets = tickets.filter(ticket =>
    ticket.team_id === user.team_id &&
    (!ticket.technician_id || ticket.technician_id === user.id)
  );

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
      const response = await fetch(
        'https://staging.kazibufastnet.com/api/tech/home',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(errorDetails);
      }

      const data = await response.json();

      const mappedTickets: Ticket[] = data.tickets.map((t: any) => ({
        id: t.id.toString(),
        clientName: t.client?.name || 'Unknown',
        status: t.status,
        type: t.type ? (t.type.toLowerCase() === 'repair' ? 'Repair' : 'Installation') : null,
        subject: t.subject || 'No subject',
        date: t.date_issued || new Date().toISOString(),
        team_id: t.team_id || '',
      }));

      const apiTickets: Ticket[] = Array.isArray(data.tickets)
        ? data.tickets
        : [];
      console.log(mappedTickets);


      setTickets(mappedTickets);


      // Stats
      setOpenTickets(apiTickets.filter(t => t.status?.toLowerCase() === 'open' || t.status?.toLowerCase() === 'in progress').length);
      setPendingTickets(apiTickets.filter(t => t.status?.toLowerCase() === 'pending').length);
      setCompletedTickets(apiTickets.filter(t => t.status?.toLowerCase() === 'completed').length);
      setClosedTickets(apiTickets.filter(t => t.status?.toLowerCase() === 'closed').length);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
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
              style={[styles.quickStatCard, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push('/tickets?status=open')}
              activeOpacity={0.85}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="ticket-confirmation" size={scaleSize(26)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.activeTickets}</Text>
              <Text style={styles.quickStatLabel}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#F59E0B' }]}
              onPress={() => router.push('/tickets?status=pending')}
              activeOpacity={0.85}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="clock-alert" size={scaleSize(26)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.pending}</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/tickets?status=completed')}
              activeOpacity={0.85}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="check-circle" size={scaleSize(26)} color="#FFFFFF" />
              </View>
              <Text style={styles.quickStatNumber}>{stats.completed}</Text>
              <Text style={styles.quickStatLabel}>Completed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickStatCard, { backgroundColor: '#6B7280' }]}
              onPress={() => router.push('/tickets?status=closed')}
              activeOpacity={0.85}
            >
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons name="archive-check" size={scaleSize(26)} color="#FFFFFF" />
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
                <MaterialCommunityIcons name="ticket-account" size={scaleSize(22)} color="#1F2937" />
                <Text style={styles.sectionTitle}>Assigned Tickets</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {assignedTickets.length} ticket{assignedTickets.length !== 1 ? 's' : ''} • Tap to view details
              </Text>
            </View>
            {assignedTickets.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/tickets')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={scaleSize(16)} color="#00AFA1" />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingState}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonIcon} />
                  <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonSubtitle} />
                    <View style={styles.skeletonMeta} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Tickets List */}
          {!loading && assignedTickets.length > 0 && (
            <View style={styles.ticketsList}>
              {assignedTickets.slice(0, 5).map((ticket, index) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={[
                    styles.ticketCard,
                    index === assignedTickets.slice(0, 5).length - 1 && styles.lastCard,
                  ]}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                  activeOpacity={0.7}
                >

                  {/* Ticket Info */}
                  <View style={styles.ticketInfo}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketSubject} numberOfLines={1}>
                        {ticket.subject}
                      </Text>

                    </View>

                    <View style={styles.clientRow}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={scaleSize(14)}
                        color="#6B7280"
                      />
                      <Text style={styles.ticketClient}>{ticket?.clientName || "NULL"}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.statusContainer}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(ticket.status) }
                          ]}
                        />
                        <Text style={styles.ticketStatus}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()}
                        </Text>
                      </View>

                      <View style={styles.separator} />

                      <View style={styles.timeContainer}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={scaleSize(12)}
                          color="#9CA3AF"
                        />
                        <Text style={styles.ticketDate}>
                          {formatDate(ticket.date)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Arrow indicator */}
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={scaleSize(20)}
                    color="#D1D5DB"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading && assignedTickets.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                  name="ticket-outline"
                  size={scaleSize(64)}
                  color="#E5E7EB"
                />
                <View style={styles.emptyIconOverlay}>
                  <MaterialCommunityIcons
                    name="plus"
                    size={scaleSize(24)}
                    color="#9CA3AF"
                  />
                </View>
              </View>
              <Text style={styles.emptyStateTitle}>
                No tickets assigned
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Tickets assigned to your team will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={scaleSize(48)}
              color="#EF4444"
            />
            <Text style={styles.errorTitle}>Unable to load tickets</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTickets}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#00AF9F',
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scaleSize(30),
    backgroundColor: '#fff'
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(20),
    paddingBottom: scaleSize(20),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(12),
    gap: scaleSize(6),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#475569',
  },
  dateText: {
    fontSize: scaleSize(14),
    color: '#64748B',
    marginBottom: scaleSize(16),
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#00AFA1',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    gap: scaleSize(6),
    shadowColor: '#00AFA1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: scaleSize(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Quick Stats
  quickStatsSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(24),
    paddingBottom: scaleSize(16),
    backgroundColor: '#F8FAFC',
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
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statIconContainer: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSize(12),
  },
  quickStatNumber: {
    fontSize: scaleSize(32),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: scaleSize(4),
  },
  quickStatLabel: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
  },

  // Tickets Section
  ticketsSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(24),
    paddingBottom: scaleSize(40),
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleSize(20),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
    marginBottom: scaleSize(6),
  },
  sectionTitle: {
    fontSize: scaleSize(20),
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
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(12),
    backgroundColor: '#F0FDFA',
  },
  viewAllText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#00AFA1',
  },

  // Tickets List
  ticketsList: {
    gap: scaleSize(12),
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lastCard: {
    marginBottom: 0,
  },
  statusIndicator: {
    width: scaleSize(44),
    height: scaleSize(44),
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSize(12),
  },
  ticketInfo: {
    flex: 1,
    gap: scaleSize(8),
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketSubject: {
    fontSize: scaleSize(15),
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: scaleSize(8),
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(6),
    gap: scaleSize(4),
  },
  priorityText: {
    fontSize: scaleSize(11),
    fontWeight: '600',
    color: '#EF4444',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  ticketClient: {
    fontSize: scaleSize(13),
    color: '#6B7280',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  statusDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  ticketStatus: {
    fontSize: scaleSize(12),
    fontWeight: '600',
    color: '#4B5563',
  },
  separator: {
    width: 1,
    height: scaleSize(12),
    backgroundColor: '#E5E7EB',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  ticketDate: {
    fontSize: scaleSize(12),
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Loading State
  loadingState: {
    gap: scaleSize(12),
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaleSize(16),
    backgroundColor: '#F9FAFB',
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skeletonIcon: {
    width: scaleSize(44),
    height: scaleSize(44),
    borderRadius: scaleSize(12),
    backgroundColor: '#E5E7EB',
    marginRight: scaleSize(12),
  },
  skeletonContent: {
    flex: 1,
    gap: scaleSize(8),
  },
  skeletonTitle: {
    height: scaleSize(16),
    width: '70%',
    backgroundColor: '#E5E7EB',
    borderRadius: scaleSize(4),
  },
  skeletonSubtitle: {
    height: scaleSize(14),
    width: '50%',
    backgroundColor: '#E5E7EB',
    borderRadius: scaleSize(4),
  },
  skeletonMeta: {
    height: scaleSize(12),
    width: '30%',
    backgroundColor: '#E5E7EB',
    borderRadius: scaleSize(4),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: scaleSize(48),
    paddingHorizontal: scaleSize(16),
    backgroundColor: '#F9FAFB',
    borderRadius: scaleSize(16),
    marginTop: scaleSize(8),
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: scaleSize(20),
  },
  emptyIconOverlay: {
    position: 'absolute',
    bottom: -scaleSize(4),
    right: -scaleSize(4),
    backgroundColor: '#F3F4F6',
    borderRadius: scaleSize(12),
    padding: scaleSize(6),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emptyStateTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#374151',
    marginBottom: scaleSize(8),
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: scaleSize(24),
    lineHeight: scaleSize(20),
  },


  // Error State
  errorContainer: {
    alignItems: 'center',
    padding: scaleSize(24),
    marginHorizontal: scaleSize(20),
    backgroundColor: '#FEF2F2',
    borderRadius: scaleSize(16),
    marginTop: scaleSize(20),
  },
  errorTitle: {
    fontSize: scaleSize(18),
    fontWeight: '600',
    color: '#DC2626',
    marginTop: scaleSize(12),
    marginBottom: scaleSize(8),
  },
  errorText: {
    fontSize: scaleSize(14),
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: scaleSize(20),
    lineHeight: scaleSize(20),
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(12),
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: scaleSize(15),
    fontWeight: '600',
  },
});

export default Home;