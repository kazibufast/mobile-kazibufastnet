import { getUser } from "@/scripts/user";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { getToken } from "../../scripts/token";


interface TicketItem {
  id: string;
  clientName: string;
  status:
    | "Open"
    | "Pending"
    | "InProgress"
    | "Accepted"
    | "Completed"
    | "Closed";
  type: "Repair" | "Installation" | null;
  subject: string;
  date: string;
  priority_level: string;
}

const Ticket: React.FC = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "open" | "pending" | "accepted" | "inProgress" | "completed"
  >("all");

  const [hasTeam, setHasTeam] = useState<boolean>(true);
  const user = getUser();


  const fetchTickets = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const token = await getToken();
      const user = getUser();
      const response = await fetch(
        "https://tub.kazibufastnet.com/api/tech/tickets",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Failed to fetch tickets. Status: ${response.status}, Details: ${errorDetails}`
        );
      }

      const data = await response.json();

     

      const normalizeStatus = (status: string): TicketItem["status"] => {
        const s = status.toLowerCase();
        if (s === "open") return "Open";
        if (s === "pending") return "Pending";
        if (s === "accepted") return "Accepted";
        if (s === "completed") return "Completed";
        if (s === "closed") return "Closed";
        if (s === "in progress") return "InProgress";
        return "Open"; // fallback
      };

      const mappedTickets: TicketItem[] = data.tickets.map((t: any) => ({
        id: t.id.toString(),
        clientName: t.client?.name || "Unknown",
        status: normalizeStatus(t.status),
        type: t.type
          ? t.type.toLowerCase() === "repair"
            ? "Repair"
            : "Installation"
          : null,
        subject: t.subject || "No subject",
        date: t.created_at || new Date().toISOString(),
        priority_level: t.priority_level || "",
      }));

      setTickets(mappedTickets);
    } catch (error: any) {
      // console.error("Fetch tickets error:", error.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    
    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusConfig = (status: TicketItem["status"]) => {
    switch (status) {
      case "Open":
        return { color: "#2563EB", bgColor: "#DBEAFE", icon: "time-outline" };
      case "Pending":
        return {
          color: "#D97706",
          bgColor: "#FEF3C7",
          icon: "hourglass-outline",
        };
      case "InProgress":
        return {
          color: "#D97706",
          bgColor: "#f0dac2ff",
          icon: "hourglass-outline",
        };
      case "Accepted":
        return {
          color: "#464646ff",
          bgColor: "#c7daf0ff",
          icon: "checkmark-circle-outline",
        };
      case "Completed":
        return {
          color: "#059669",
          bgColor: "#D1FAE5",
          icon: "checkmark-done-circle-outline",
        };
      case "Closed":
        return {
          color: "#6B7280",
          bgColor: "#F3F4F6",
          icon: "lock-closed-outline",
        };
      default:
        return { color: "#000", bgColor: "#FFF", icon: "help-circle-outline" };
    }
  };

  const getPriorityStatus = (priority_level: TicketItem["priority_level"]) => {
    switch (priority_level) {
      case "low priority":
        return { icon: "build-outline", color: "#059669" };
      case "high priority":
        return { icon: "construct-outline", color: "#D97706" };
      default:
        return { icon: "help-circle-outline", color: "#EF4444" };
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "Repair":
        return { icon: "build-outline", color: "#EF4444" };
      case "Installation":
        return { icon: "construct-outline", color: "#3B82F6" };
      default:
        return { icon: "help-circle-outline", color: "#6B7280" };
    }
  };

  const filteredTickets = tickets
    .filter((ticket) => {
      switch (filter) {
        case "all":
          return true;
        case "open":
          return ticket.status === "Open";
        case "pending":
          return ticket.status === "Pending";
        case "accepted":
          return ticket.status === "Accepted";
        case "inProgress":
          return ticket.status === "InProgress";
        case "completed":
          return ticket.status === "Completed" || ticket.status === "Closed";
        default:
          return true;
      }
    })
    .filter(
      (ticket) =>
        ticket.clientName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <Header />

        {/* Fixed Header with Search */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <Text style={styles.mainTitle}>My Tickets</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="search" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Quick Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {[
              { key: "all", label: "All", count: tickets.length },
              {
                key: "open",
                label: "Open",
                count: tickets.filter((t) => t.status === "Open").length,
              },
              {
                key: "accepted",
                label: "Accepted",
                count: tickets.filter((t) => t.status === "Accepted").length,
              },
              {
                key: "pending",
                label: "Pending",
                count: tickets.filter((t) => t.status === "Pending").length,
              },
              {
                key: "inProgress",
                label: "In Progress",
                count: tickets.filter((t) => t.status === "InProgress").length,
              },
              {
                key: "completed",
                label: "Completed",
                count: tickets.filter(
                  (t) => t.status === "Completed" || t.status === "Closed"
                ).length,
              },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && styles.filterTabActive,
                ]}
                onPress={() => setFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.filterCount,
                    filter === tab.key && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      filter === tab.key && styles.filterCountTextActive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Overlay */}
        {showSearch && (
          <View style={styles.searchOverlay}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  autoFocus
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search tickets..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                  onSubmitEditing={() => setShowSearch(false)}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.searchClose}
                onPress={() => setShowSearch(false)}
              >
                <Text style={styles.searchCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={["#3B82F6"]}
              />
            }
          >
            {/* Loading State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading tickets...</Text>
              </View>
            ) : user?.team_id == null ? (
              // NO TEAM STATE
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No Team Assigned</Text>
                <Text style={styles.emptySubtitle}>
                  You are not currently assigned to a team. Please contact
                  admin.
                </Text>
              </View>
            ) : filteredTickets.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color="#D1D5DB"
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {search ? "No matching tickets" : "No tickets found"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {search
                    ? "Try adjusting your search terms"
                    : "You currently have no tickets assigned"}
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={fetchTickets}
                >
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ticketsContainer}>
                <Text style={styles.resultsCount}>
                  {filteredTickets.length} ticket
                  {filteredTickets.length !== 1 ? "s" : ""} found
                </Text>

                {filteredTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const typeConfig = getTypeIcon(ticket.type);
                  const priority_level = getPriorityStatus(
                    ticket.priority_level
                  );

                  return (
                    <TouchableOpacity
                      key={ticket.id}
                      style={styles.ticketCard}
                      onPress={() => router.push(`/tickets/${ticket.id}`)}
                      activeOpacity={0.7}
                    >
                      {/* Compact Header Row */}
                      <View style={styles.headerRow}>
                        <View style={styles.idStatusContainer}>
                          <View style={styles.ticketId}>
                            <Ionicons
                              name="ticket-outline"
                              size={12}
                              color="#6B7280"
                            />
                            <Text style={styles.ticketIdText}>{ticket.id}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusConfig.bgColor },
                            ]}
                          >
                            <Ionicons
                              name={statusConfig.icon as any}
                              size={10}
                              color={statusConfig.color}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                { color: statusConfig.color },
                              ]}
                            >
                              {ticket.status}
                            </Text>
                          </View>
                        </View>

                        {ticket.type && (
                          <View style={styles.typeBadge}>
                            <Ionicons
                              name={typeConfig.icon as any}
                              size={12}
                              color={typeConfig.color}
                            />
                            <Text
                              style={[
                                styles.typeText,
                                { color: typeConfig.color },
                              ]}
                              numberOfLines={1}
                            >
                              {ticket.type}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Compact Content */}
                      <View style={styles.contentRow}>
                        <View style={styles.textContainer}>
                          <Text style={styles.subjectText} numberOfLines={2}>
                            {ticket.subject}
                          </Text>
                          <View style={styles.clientRow}>
                            <Ionicons
                              name="person-outline"
                              size={12}
                              color="#6B7280"
                            />
                            <Text style={styles.clientName} numberOfLines={1}>
                              {ticket.clientName}
                            </Text>
                          </View>
                        </View>
                        <View>
                          <View style={styles.dateTime}>
                            <Ionicons
                              name="calendar-outline"
                              size={12}
                              color="#9CA3AF"
                            />
                            <Text style={styles.dateText} numberOfLines={1}>
                              {formatDate(ticket.date)}
                            </Text>
                          </View>
                          <View>
                            <Text
                              style={[
                                styles.priority,
                                { color: priority_level.color },
                              ]}
                            >
                              {ticket.priority_level.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Card Shadow Effect */}
                      <View style={styles.cardShadow} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00AF9F",
    paddingTop: 35,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerSection: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    marginHorizontal: -4,
  },
  filterContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#00AF9F",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFF",
  },
  filterCount: {
    backgroundColor: "#e4e4e4ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: "#2b8f87ff",
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  filterCountTextActive: {
    color: "#FFF",
  },
  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    zIndex: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  searchClose: {
    paddingVertical: 8,
  },
  searchCloseText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  ticketsContainer: {
    gap: 10,
  },
  resultsCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 6,
  },

  ticketCard: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
    minHeight: 120,
    maxHeight: 120,
  },
  cardShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    zIndex: -1,
  },
  // COMPACT HEADER ROW
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  idStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  ticketId: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ticketIdText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    minWidth: 70,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    flexShrink: 0,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  // COMPACT CONTENT ROW
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 20,
    marginBottom: 6,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  clientName: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
    paddingTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  priority: {
    paddingTop: 4,
    alignSelf: "flex-end",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Ticket;
