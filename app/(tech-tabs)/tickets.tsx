import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';




// Define types for ticket data
interface TicketItem {
  id: string;
  clientName: string;
  status: 'Open' | 'Pending' | 'Accepted' | 'Completed' | 'Closed';
  type: 'Repair' | 'Installation';
  subject: string;
  date: string;
}

const Ticket: React.FC = () => {
  const router = useRouter();

  const [searchVisible, setSearchVisible] = React.useState(false);
  const [search, setSearch] = React.useState('');


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get time for display
  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Sample ticket data
  const tickets: TicketItem[] = [
    {
      id: 'KAZ-1101',
      clientName: 'John Smith',
      status: 'Open',
      type: 'Repair',
      subject: 'Internet connection dropping intermittently',
      date: new Date().toISOString(), // Today

    },
    {
      id: 'KAZ-1102',
      clientName: 'Sarah Johnson',
      status: 'Pending',
      type: 'Installation',
      subject: 'Slow internet speeds in downtown area',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday

    },
    {
      id: 'KAZ-1103',
      clientName: 'Robert Chen',
      status: 'Completed',
      type: 'Repair',
      subject: 'Invoice discrepancy for December billing',
      date: '2024-01-13T09:15:00',

    },
    {
      id: 'KAZ-1104',
      clientName: 'Maria Garcia',
      status: 'Pending',
      type: 'Repair',
      subject: 'Router replacement needed',
      date: '2024-01-12T16:20:00',

    },
    {
      id: 'KAZ-1105',
      clientName: 'David Wilson',
      status: 'Accepted',
      type: 'Installation',
      subject: 'Upgrade to higher speed plan',
      date: new Date().toISOString(),

    },
    {
      id: 'KAZ-1106',
      clientName: 'Lisa Thompson',
      status: 'Closed',
      type: 'Installation',
      subject: 'New modem installation completed',
      date: '2024-01-10T13:30:00',

    }
  ];

  const getStatusConfig = (status: TicketItem['status']) => {
    switch (status) {
      case 'Open':
        return {
          color: '#3498DB',
          text: 'Just received',
          bgColor: '#EBF5FB'
        };
      case 'Pending':
        return {
          color: '#F39C12',
          text: 'Being worked on',
          bgColor: '#FEF5E7'
        };
      case 'Accepted':
        return {
          color: '#95A5A6',
          text: 'Awaiting response',
          bgColor: '#F4F6F6'
        };
      case 'Completed':
        return {
          color: '#27AE60',
          text: 'Successfully resolved',
          bgColor: '#EAFAF1'
        };
      case 'Closed':
        return {
          color: '#7F8C8D',
          text: 'Ticket closed',
          bgColor: '#F2F4F4'
        };
      default:
        return {
          color: '#000',
          text: '',
          bgColor: '#FFF'
        };
    }
  };

  const getTypeEmoji = (type: TicketItem['type']) => {
    switch (type) {
      case 'Repair': return '';
      case 'Installation': return '';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>Tickets</Text>

              {searchVisible ? (
                <View style={styles.inlineSearch}>
                  <Ionicons name="search-outline" size={16} color="#888" />

                  <TextInput
                    style={styles.inlineInput}
                    placeholder="Search..."
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                  />

                  <TouchableOpacity onPress={() => {
                    setSearch('');
                    setSearchVisible(false);
                  }}>
                   
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setSearchVisible(true)}
                >
                  <Ionicons name="search-outline" size={22} color="#00afa1" />
                </TouchableOpacity>
              )}
            </View>
          </View>




          <View style={styles.sectionContainer}>

            {tickets
              .filter(ticket =>
                ticket.clientName.toLowerCase().includes(search.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
                ticket.id.toLowerCase().includes(search.toLowerCase())
              )
              .map((ticket) => {

                const statusConfig = getStatusConfig(ticket.status);


                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[styles.ticketCard, { backgroundColor: statusConfig.bgColor }]}
                    onPress={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <View style={styles.ticketHeader}>
                      <View style={styles.ticketIdRow}>
                        <Text style={styles.ticketId}>{ticket.clientName}</Text>
                        <Text style={styles.timeText}>
                          {getTime(ticket.date)}
                        </Text>
                      </View>

                      <View style={styles.dateTimeContainer}>
                        <Text style={styles.dateText}>
                          {formatDate(ticket.date)}
                        </Text>

                      </View>
                    </View>

                    <View style={styles.clientRow}>

                    </View>

                    <View style={styles.statusRow}>
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                          <Text style={styles.statusText}>{ticket.status}</Text>
                        </View>
                      </View>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeEmoji}>{getTypeEmoji(ticket.type)}</Text>
                        <Text style={styles.typeText}>{ticket.type}</Text>
                      </View>
                    </View>

                    <Text style={styles.statusDescription}>
                      {statusConfig.text}
                    </Text>

                    <View style={styles.subjectContainer}>
                      <Text style={styles.subjectLabel}>Issue:</Text>
                      <Text style={styles.subjectText} numberOfLines={2}>
                        {ticket.subject}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  searchButton: {
    padding: 6,
  },

  searchContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },

  inlineSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    width: 180,
  },

  inlineInput: {
    flex: 1,
    marginHorizontal: 6,
    fontSize: 14,
    color: '#333',
  },


  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#252222ff',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  newTicketButton: {
    backgroundColor: '#00afa1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newTicketText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00afa1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    marginBottom: 12,
  },
  ticketIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00afa1',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priorityDot: {
    fontSize: 8,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  clientLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  typeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  subjectContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  subjectLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default Ticket;