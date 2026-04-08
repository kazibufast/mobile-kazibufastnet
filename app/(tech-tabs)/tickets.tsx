import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../../components/Header';
import { Colors } from '@/constants/theme';

interface TicketItem {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  type: string;
  created_at: string;
  client?: { name: string };
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open', color: '#3498DB' },
  { label: 'Pending', value: 'pending', color: '#F39C12' },
  { label: 'Accepted', value: 'accepted', color: '#8E44AD' },
  { label: 'In Progress', value: 'in progress', color: '#E67E22' },
  { label: 'Completed', value: 'completed', color: '#27AE60' },
  { label: 'Closed', value: 'closed', color: '#7F8C8D' },
];

const TYPE_FILTERS = [
  { label: 'All Types', value: '' },
  { label: 'Repair', value: 'repair' },
  { label: 'Installation', value: 'installation' },
];

const Ticket: React.FC = () => {
  const router = useRouter();

  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTickets = useCallback(async (page = 1, append = false, status = statusFilter, type = typeFilter) => {
    try {
      const token = await getToken();
      let url = `${API.tech.tickets()}?page=${page}&per_page=10`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (type) url += `&type=${encodeURIComponent(type)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const newTickets = data.data || [];

      if (append) {
        setTickets(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const unique = newTickets.filter((t: TicketItem) => !existingIds.has(t.id));
          return [...prev, ...unique];
        });
      } else {
        setTickets(newTickets);
      }

      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [statusFilter, typeFilter]);

  useFocusEffect(useCallback(() => { fetchTickets(); }, [fetchTickets]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchTickets(1, false);
  }, [fetchTickets]);

  const onEndReached = useCallback(() => {
    if (loadingMore || currentPage >= lastPage) return;
    setLoadingMore(true);
    fetchTickets(currentPage + 1, true);
  }, [loadingMore, currentPage, lastPage, fetchTickets]);

  const applyStatusFilter = (value: string) => {
    setStatusFilter(value);
    setLoading(true);
    setTickets([]);
    setCurrentPage(1);
    fetchTickets(1, false, value, typeFilter);
  };

  const applyTypeFilter = (value: string) => {
    setTypeFilter(value);
    setLoading(true);
    setTickets([]);
    setCurrentPage(1);
    fetchTickets(1, false, statusFilter, value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { color: '#3498DB', text: 'Just received', bgColor: '#EBF5FB' };
      case 'pending':
        return { color: '#F39C12', text: 'Awaiting action', bgColor: '#FEF5E7' };
      case 'accepted':
        return { color: '#8E44AD', text: 'Accepted', bgColor: '#F4ECF7' };
      case 'in progress':
        return { color: '#E67E22', text: 'Being worked on', bgColor: '#FDF2E9' };
      case 'completed':
        return { color: '#27AE60', text: 'Successfully resolved', bgColor: '#EAFAF1' };
      case 'closed':
        return { color: '#7F8C8D', text: 'Ticket closed', bgColor: '#F2F4F4' };
      default:
        return { color: '#000', text: '', bgColor: '#FFF' };
    }
  };

  const filtered = search
    ? tickets.filter(ticket => {
        const q = search.toLowerCase();
        return (
          (ticket.client?.name || '').toLowerCase().includes(q) ||
          (ticket.subject || '').toLowerCase().includes(q) ||
          (ticket.ticket_number || '').toLowerCase().includes(q)
        );
      })
    : tickets;

  const renderTicket = ({ item: ticket }: { item: TicketItem }) => {
    const statusConfig = getStatusConfig(ticket.status);

    return (
      <TouchableOpacity
        style={[styles.ticketCard, { backgroundColor: statusConfig.bgColor }]}
        onPress={() => router.push(`/tickets/${ticket.id}`)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketIdRow}>
            <Text style={styles.ticketId}>{ticket.client?.name || 'Unknown'}</Text>
            <Text style={styles.timeText}>{getTime(ticket.created_at)}</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(ticket.created_at)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Text style={styles.statusText}>{ticket.status}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{ticket.type || 'N/A'}</Text>
          </View>
        </View>

        <Text style={styles.statusDescription}>{statusConfig.text}</Text>

        {ticket.subject ? (
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectLabel}>Issue:</Text>
            <Text style={styles.subjectText} numberOfLines={2}>{ticket.subject}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Title bar */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>Tickets</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.iconButton}>
              {refreshing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

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
                <TouchableOpacity onPress={() => { setSearch(''); setSearchVisible(false); }}>
                  <Ionicons name="close" size={16} color="#888" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.iconButton} onPress={() => setSearchVisible(true)}>
                <Ionicons name="search-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                active && { backgroundColor: f.color || Colors.primary, borderColor: f.color || Colors.primary },
              ]}
              onPress={() => applyStatusFilter(f.value)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {TYPE_FILTERS.map((f) => {
          const active = typeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
              ]}
              onPress={() => applyTypeFilter(f.value)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={filtered}
        renderItem={renderTicket}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<Text style={styles.emptyText}>No tickets found</Text>}
        contentContainerStyle={styles.listContent}
        onEndReached={search ? undefined : onEndReached}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  iconButton: {
    padding: 6,
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
  // Filter chips
  filterRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 40,
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
    color: Colors.primary,
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
  divider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    textTransform: 'capitalize',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default Ticket;
