import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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
    { id: 'KAZ-2021', client: 'John Doe', status: 'In Progress', time: '10:30 AM'},
    { id: 'KAZ-2022', client: 'Sarah Smith', status: 'Assigned', time: '11:15 AM' },
    { id: 'KAZ-2023', client: 'Mike Johnson', status: 'Completed', time: '9:00 AM' },
    { id: 'KAZ-2024', client: 'Lisa Wang', status: 'Pending', time: '2:45 PM' },
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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const firstName = user?.name?.split(' ')[0] + '!' || 'Technician';

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      setCurrentDate(
        now.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateDateTime(); // run immediately

    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);


  



  return (
    <SafeAreaView style={styles.safeArea}>
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
          />
        }
      >

        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text
              style={styles.greeting}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}
            >
              {getGreeting()}
            </Text>
          </View>

          <View style={styles.welcomeLeft}>
            <Text
              style={styles.name}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}
            >
            {firstName}
            </Text>
          </View>


          <View style={styles.welcomeLeft}>
            <Text
              style={styles.currentTime}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}
            >
              {currentTime}
            </Text>
          </View>
          <View style={styles.welcomeLeft}>
            <Text
              style={styles.currentDate}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}
            >
               {currentDate}
            </Text>
          </View>

        
         
        </View>



        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.openCard]}>
              <View style={styles.statHeader}>

                <Text style={styles.statNumber}>{stats.activeTickets}</Text>
              </View>
              <Text style={styles.statLabel}>Open</Text>
              <Text style={styles.statSubText}>Need attention</Text>
            </View>

            <View style={[styles.statCard, styles.pendingCard]}>
              <View style={styles.statHeader}>

                <Text style={styles.statNumber}>{stats.pending}</Text>
              </View>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statSubText}>Awaiting action</Text>
            </View>

            <View style={[styles.statCard, styles.completedCard]}>
              <View style={styles.statHeader}>

                <Text style={styles.statNumber}>{stats.completed}</Text>
              </View>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statSubText}>Today's success</Text>
            </View>

            <View style={[styles.statCard, styles.closedCard]}>
              <View style={styles.statHeader}>

                <Text style={styles.statNumber}>{stats.closed}</Text>
              </View>
              <Text style={styles.statLabel}>Closed</Text>
              <Text style={styles.statSubText}>Resolved tickets</Text>
            </View>
          </View>
        </View>

        {/* Recent Tickets */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Tickets</Text>
              <Text style={styles.sectionSubtitle}>Last updated tickets</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/tickets')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ticketsList}>
            {recentTickets.map((ticket, index) => {
              const statusColor = getStatusColor(ticket.status);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketIdContainer}>
                      <Text style={styles.ticketId}>{ticket.id}</Text>
                    
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
                      <Text style={styles.actionText}>View Details →</Text>
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
  // Safe Area & Scroll
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scaleSize(30),
  },

  // Welcome Section
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(20),
    padding: scaleSize(24),
    marginHorizontal: scaleSize(16),
    marginTop: scaleSize(16),
    marginBottom: scaleSize(20),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },

  welcomeSection: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSize(18),
    paddingVertical: scaleSize(16),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: scaleSize(24),
    borderBottomRightRadius: scaleSize(24),
    marginBottom: scaleSize(12),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  welcomeLeft: {
    flex: 1,
    marginRight: scaleSize(10),
  },

  greeting: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: '#1A202C',
  },
  name: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: '#1A202C',
  },
  currentTime: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: '#1A202C',
  },
  currentDate: {
    fontSize: scaleSize(9),
    fontWeight: '700',
    color: '#1A202C',
  },

  role: {
    fontSize: scaleSize(14),
    color: '#718096',
    marginTop: scaleSize(2),
  },

  time: {
    fontSize: scaleSize(21),
    fontWeight: '800',
    color: '#00AFA1',
    lineHeight: scaleSize(30),
  },

  date: {
    fontSize: scaleSize(12),
    color: '#718096',
    marginTop: scaleSize(2),
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: scaleSize(16),
    marginBottom: scaleSize(24),
  },
  sectionTitle: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: scaleSize(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scaleSize(12),
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleSize(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  openCard: {
    borderTopWidth: scaleSize(4),
    borderTopColor: '#007bff',
  },
  pendingCard: {
    borderTopWidth: scaleSize(4),
    borderTopColor: '#F59E0B',
  },
  completedCard: {
    borderTopWidth: scaleSize(4),
    borderTopColor: '#10B981',
  },
  closedCard: {
    borderTopWidth: scaleSize(4),
    borderTopColor: '#6B7280',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(12),
  },
  statNumber: {
    fontSize: scaleSize(32),
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: scaleSize(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: scaleSize(4),
  },
  statSubText: {
    fontSize: scaleSize(12),
    color: '#6B7280',
    fontWeight: '500',
  },

  // Tickets Section
  ticketsSection: {
    paddingHorizontal: scaleSize(16),
    marginBottom: scaleSize(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(16),
  },
  sectionSubtitle: {
    fontSize: scaleSize(14),
    color: '#6B7280',
    fontWeight: '500',
    marginTop: scaleSize(4),
  },
  viewAllButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(12),
    borderWidth: scaleSize(1),
    borderColor: '#E5E7EB',
  },
  viewAllText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#374151',
  },
  ticketsList: {
    gap: scaleSize(12),
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    fontSize: scaleSize(16),
    fontWeight: '700',
    color: '#3B82F6',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(12),
    gap: scaleSize(4),
  },
  priorityDot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
  },
  priorityText: {
    fontSize: scaleSize(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ticketTime: {
    fontSize: scaleSize(13),
    color: '#6B7280',
    fontWeight: '500',
  },
  ticketClient: {
    fontSize: scaleSize(18),
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
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(12),
    gap: scaleSize(6),
  },
  statusDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  statusText: {
    fontSize: scaleSize(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  actionButton: {
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(12),
  },
  actionText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#00AFA1',
  },

});


export default Home;