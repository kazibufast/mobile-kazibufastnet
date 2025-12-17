import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';

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
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const tickets: TicketItem[] = [
    {
      id: 'KAZ-1101',
      clientName: 'John Smith',
      status: 'Open',
      type: 'Repair',
      subject: 'Internet connection dropping intermittently',
      date: new Date().toISOString(),
    },
    {
      id: 'KAZ-1102',
      clientName: 'Sarah Johnson',
      status: 'Pending',
      type: 'Installation',
      subject: 'Slow internet speeds in downtown area',
      date: new Date(Date.now() - 86400000).toISOString(),
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
        return { color: '#3498DB', bgColor: '#EBF5FB' };
      case 'Pending':
        return { color: '#F39C12', bgColor: '#FEF5E7' };
      case 'Accepted':
        return { color: '#95A5A6', bgColor: '#F4F6F6' };
      case 'Completed':
        return { color: '#27AE60', bgColor: '#EAFAF1' };
      case 'Closed':
        return { color: '#7F8C8D', bgColor: '#F2F4F4' };
      default:
        return { color: '#000', bgColor: '#FFF' };
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3498DB" />
          }
        >
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Tickets</Text>

            <View style={styles.searchWrapper}>
              {!showSearch ? (
                <TouchableOpacity
                  style={styles.searchIconButton}
                  onPress={() => setShowSearch(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search-outline" size={22} color="#333" />
                </TouchableOpacity>
              ) : (
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={18} color="#999" />
                  <TextInput
                    autoFocus
                    value={search}
                    onChangeText={(text: string) => setSearch(text)}
                    placeholder="Search..."
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    onBlur={() => setShowSearch(false)}
                  />
                </View>
              )}
            </View>
          </View>

          <View style={styles.ticketsContainer}>
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
                    style={styles.ticketCard}
                    onPress={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <View style={styles.firstRow}>
                      <View style={styles.clientInfo}>
                        <Text style={styles.clientName} numberOfLines={1}>
                          {ticket.clientName}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {ticket.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.subjectText} numberOfLines={2}>
                      {ticket.subject}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        {formatDate(ticket.date)} • {getTime(ticket.date)}
                      </Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{ticket.type}</Text>
                      </View>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
  titleSection: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 15, gap: 12 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  searchWrapper: {
    flex: 1,
    alignItems: "flex-end",
  },

  searchIconButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "100%",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333333ff",
  },

  ticketsContainer: { gap: 8 },
  ticketCard: { backgroundColor: '#fff', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e5e5e5', minHeight: 90 },
  firstRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  clientInfo: { flex: 1, marginRight: 10 },
  clientName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, minWidth: 70, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  subjectText: { fontSize: 14, color: '#333', lineHeight: 18, marginBottom: 8, flex: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12, color: '#666', fontWeight: '500' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f0f0f0' },
  typeText: { fontSize: 12, color: '#333', fontWeight: '500', textTransform: 'uppercase' },
});

export default Ticket;
