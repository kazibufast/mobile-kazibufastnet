import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { getToken } from "../../scripts/token";
import { getUser } from "../../scripts/user";

const { width, height } = Dimensions.get("window");

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
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

const Home: React.FC = () => {
  type Ticket = {
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
    created_at: string;
    team_id: string;
    technician_id?: string;
    priority_level?: string;
  };

 interface WeatherData {
    name: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: { main: string, icon: string, description: string }[];
  }

  const router = useRouter();
  const user = getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // tickets
  const [openTickets, setOpenTickets] = useState(0);
  const [pendingTickets, setPendingTickets] = useState(0);
  const [completedTickets, setCompletedTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [greeting] = useState(new Animated.Value(0));

  const stats = {
    activeTickets: openTickets,
    pending: pendingTickets,
    completed: completedTickets,
    closed: closedTickets,
  };

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "in progress":
        return "#F59E0B";
      case "assigned":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "pending":
        return "#6B7280";
      case "closed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high priority":
        return "#EF4444";
      case "medium priority":
        return "#F59E0B";
      case "low priority":
        return "#10B981";
      default:
        return "#ffffffff";
    }
  };

  const assignedTickets = tickets.filter(
    (ticket) =>
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
        `https://${user?.branch.subdomain}.kazibufastnet.com/api/tech/home`,
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
        throw new Error(errorDetails);
      }

      const data = await response.json();

      const mappedTickets: Ticket[] = data.tickets.map((t: any) => ({
        id: t.id.toString(),
        clientName: t.client?.name || "Unknown",
        status: t.status,
        type: t.type
          ? t.type.toLowerCase() === "repair"
            ? "Repair"
            : "Installation"
          : null,
        subject: t.subject || "No subject",
        date: t.date_issued || new Date().toISOString(),
        team_id: t.team_id || "",
        priority_level: t.priority_level,
      }));

      const apiTickets: Ticket[] = Array.isArray(data.tickets)
        ? data.tickets
        : [];

      setTickets(mappedTickets);

      // Stats
      setOpenTickets(
        apiTickets.filter((t) => t.status?.toLowerCase() === "open").length
      );
      setPendingTickets(
        apiTickets.filter((t) => t.status?.toLowerCase() === "pending").length
      );
      setCompletedTickets(
        apiTickets.filter((t) => t.status?.toLowerCase() === "completed").length
      );
      setClosedTickets(
        apiTickets.filter((t) => t.status?.toLowerCase() === "closed").length
      );
    } catch (err: any) {
      setOpenTickets(0);
      setPendingTickets(0);
      setCompletedTickets(0);
      setClosedTickets(0);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    getUserLocation();

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    }, 60000);

    // Initial call
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name?.split(" ")[0] || "Technician";

  // Animated greeting
  useEffect(() => {
    Animated.spring(greeting, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const greetingStyle = {
    transform: [
      {
        translateY: greeting.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
    opacity: greeting,
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();

    let imageSource;

    switch (desc) {
      case "clear sky":
        imageSource = require("../../assets/images/clear-sky.png");
        break;
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
      case "overcast clouds":
        imageSource = require("../../assets/images/cloudy.png");
        break;
      case "light rain":
      case "moderate rain":
      case "heavy intensity rain":
        imageSource = require("../../assets/images/rainy-day.png");
        break;
      case "thunderstorm":
        imageSource = require("../../assets/images/thunderstorm.png");
        break;
      case "light snow":
        imageSource = require("../../assets/images/snowy.png");
        break;
      case "mist":
      case "haze":
      case "fog":
        imageSource = require("../../assets/images/foggy.png");
        break;
      default:
        imageSource = require("../../assets/images/clear-sky.png");
        break;
    }

    return (
      <Image
        source={imageSource}
        style={styles.icon}
        resizeMode="contain"
      />
    );
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      setError("Unable to get location");
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      console.log("Invalid coordinates:", lat, lon);
      return;
    }

    setWeatherLoading(true);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=20c5be33c71294fe1a5100a7ae1ff885`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const text = await response.text();
        console.error("Weather API error:", text);
        throw new Error("Weather fetch failed");
      }
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError("Error fetching weather data");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (
      coords &&
      typeof coords.latitude === "number" &&
      typeof coords.longitude === "number"
    ) {
      fetchWeather(coords.latitude, coords.longitude);
    }
  }, [coords]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00AF9F"
            colors={["#00AF9F"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {/* Welcome Section */}
        <Animated.View style={[styles.welcomeSection, greetingStyle]}>
          <View style={styles.welcomeHeader}>
            <View>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
              </View>
              <Text style={styles.name}>{firstName?.toUpperCase()}</Text>
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>

            {weather && !weatherLoading ? (
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {/* Convert temperature from Kelvin to Celsius */}
                  {Math.round (weather.main.temp )}°C ·{" "}
                  {weather.weather[0].main}
                </Text>

                {/* Render the image dynamically */}
                {getWeatherIcon(weather.weather[0].description)}
              </View>
            ) : (
              <View>
                <ActivityIndicator size="small" color="#b8b8b8ff"/>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={scaleSize(20)}
              color="#1F2937"
            />
            <Text style={styles.statsTitle}>Ticket Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/tickets?status=open")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#DBEAFE" },
                ]}
              >
                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={scaleSize(22)}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.statNumber}>{stats.activeTickets}</Text>
              <Text style={styles.statLabel}>Open Tickets</Text>
              <View
                style={[styles.statIndicator, { backgroundColor: "#3B82F6" }]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/tickets?status=pending")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#FEF3C7" },
                ]}
              >
                <MaterialCommunityIcons
                  name="clock-alert"
                  size={scaleSize(22)}
                  color="#F59E0B"
                />
              </View>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending Tickets</Text>
              <View
                style={[styles.statIndicator, { backgroundColor: "#F59E0B" }]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/tickets?status=completed")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#D1FAE5" },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={scaleSize(22)}
                  color="#10B981"
                />
              </View>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed Tickets</Text>
              <View
                style={[styles.statIndicator, { backgroundColor: "#10B981" }]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/tickets?status=closed")}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#F3F4F6" },
                ]}
              >
                <MaterialCommunityIcons
                  name="archive-check"
                  size={scaleSize(22)}
                  color="#6B7280"
                />
              </View>
              <Text style={styles.statNumber}>{stats.closed}</Text>
              <Text style={styles.statLabel}>Closed Tickets</Text>
              <View
                style={[styles.statIndicator, { backgroundColor: "#6B7280" }]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tickets Section */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons
                  name="ticket-account"
                  size={scaleSize(22)}
                  color="#1F2937"
                />
                <Text style={styles.sectionTitle}>Assigned Tickets</Text>
                <View style={styles.ticketCountBadge}>
                  <Text style={styles.ticketCountText}>
                    {assignedTickets.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>
                Tickets assigned to you and your team
              </Text>
            </View>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingState}>
              {[1, 2].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonIcon} />
                  <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonSubtitle} />
                    <View style={styles.skeletonMeta} />
                  </View>
                  <View style={styles.skeletonArrow} />
                </View>
              ))}
            </View>
          )}

          {/* Tickets List */}
          {!loading && assignedTickets.length > 0 && (
            <View style={styles.ticketsList}>
              {assignedTickets.slice(0, 3).map((ticket, index) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={[
                    styles.ticketCard,
                    index === assignedTickets.slice(0, 3).length - 1 &&
                      styles.lastCard,
                  ]}
                  onPress={() => router.push(`/tickets/${ticket.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketSubject} numberOfLines={2}>
                        {ticket.subject}
                      </Text>
                      <View style={styles.ticketMeta}>
                        <View style={styles.clientInfo}>
                          <MaterialCommunityIcons
                            name="account-outline"
                            size={scaleSize(12)}
                            color="#6B7280"
                          />
                          <Text style={styles.ticketClient} numberOfLines={1}>
                            {ticket.clientName}
                          </Text>
                        </View>

                        <View style={styles.separator} />
                        <Text style={styles.ticketDate}>
                          {formatDate(ticket.date)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ticketRightSection}>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              getPriorityColor(ticket.priority_level) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            {
                              color: getPriorityColor(ticket.priority_level),
                            },
                          ]}
                        >
                          {ticket.priority_level?.split(" ")[0] || ""}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={scaleSize(20)}
                        color="#D1D5DB"
                      />
                    </View>
                  </View>
                  <View style={styles.ticketFooter}>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(ticket.status) },
                        ]}
                      />
                      <Text style={styles.ticketStatus}>
                        {ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1).toLowerCase()}
                      </Text>
                    </View>
                    <View style={styles.ticketId}>
                      <Text style={styles.ticketIdText}>#{ticket.id}</Text>
                    </View>
                  </View>
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
              </View>
              <Text style={styles.emptyStateTitle}>No tickets assigned</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tickets assigned to your team will appear here
              </Text>
              <TouchableOpacity
                style={styles.refreshEmptyButton}
                onPress={fetchTickets}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={scaleSize(16)}
                  color="#FFFFFF"
                />
                <Text style={styles.refreshEmptyText}>Refresh</Text>
              </TouchableOpacity>
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
              <Text style={styles.retryText}>Try Again</Text>
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
    backgroundColor: "#00AF9F",
    paddingTop: Platform.OS === "ios" ? 35 : 35,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scaleSize(40),
    backgroundColor: "#fff",
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(20),
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: scaleSize(24),
    borderBottomRightRadius: scaleSize(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: scaleSize(12),
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(4),
  },
  waveIcon: {
    marginRight: scaleSize(8),
  },
  greeting: {
    fontSize: scaleSize(15),
    fontWeight: "500",
    color: "#64748B",
  },
  name: {
    fontSize: scaleSize(32),
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    gap: scaleSize(6),
  },
  timeText: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#000000",
  },
  dateText: {
    fontSize: scaleSize(14),
    color: "#64748B",
    marginBottom: scaleSize(10),
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#0F766E",
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    gap: scaleSize(6),
  },
  roleText: {
    fontSize: scaleSize(13),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  teamButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
    gap: scaleSize(6),
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  teamButtonText: {
    fontSize: scaleSize(13),
    fontWeight: "600",
    color: "#00AF9F",
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(24),
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(16),
    gap: scaleSize(10),
  },
  statsTitle: {
    fontSize: scaleSize(18),
    fontWeight: "700",
    color: "#1F2937",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -scaleSize(6),
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginHorizontal: scaleSize(3),
    marginBottom: scaleSize(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statIconContainer: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleSize(12),
  },
  statNumber: {
    fontSize: scaleSize(28),
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: scaleSize(4),
  },
  statLabel: {
    fontSize: scaleSize(13),
    fontWeight: "600",
    color: "#64748B",
    marginBottom: scaleSize(8),
  },
  statIndicator: {
    height: scaleSize(4),
    borderRadius: scaleSize(2),
    width: "100%",
  },

  // Tickets Section
  ticketsSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(24),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: scaleSize(16),
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: scaleSize(10),
    marginBottom: scaleSize(6),
  },
  sectionTitle: {
    fontSize: scaleSize(18),
    flex: 1,
    fontWeight: "700",
    color: "#1F2937",
  },
  ticketCountBadge: {
    backgroundColor: "#00AF9F",
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(12),
    minWidth: scaleSize(24),
    alignItems: "center",
    justifyContent: "center",
  },
  ticketCountText: {
    fontSize: scaleSize(12),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: scaleSize(14),
    color: "#64748B",
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(4),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(12),
    backgroundColor: "#F0FDFA",
  },
  viewAllText: {
    fontSize: scaleSize(14),
    fontWeight: "600",
    color: "#00AF9F",
  },

  // Tickets List
  ticketsList: {
    gap: scaleSize(12),
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lastCard: {
    marginBottom: 0,
  },
  ticketHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scaleSize(12),
  },
  ticketTypeIndicator: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(8),
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scaleSize(12),
  },
  ticketInfo: {
    flex: 1,
    marginRight: scaleSize(12),
  },
  ticketSubject: {
    fontSize: scaleSize(15),
    fontWeight: "600",
    color: "#111827",
    lineHeight: scaleSize(20),
    marginBottom: scaleSize(8),
  },
  ticketMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(8),
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(4),
    flex: 1,
  },
  ticketClient: {
    fontSize: scaleSize(12),
    color: "#6B7280",
    fontWeight: "500",
  },
  separator: {
    width: 1,
    height: scaleSize(12),
    backgroundColor: "#E5E7EB",
  },
  ticketDate: {
    fontSize: scaleSize(12),
    color: "#9CA3AF",
    fontWeight: "500",
  },
  ticketRightSection: {
    alignItems: "flex-end",
    gap: scaleSize(8),
  },
  priorityBadge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(6),
  },
  priorityText: {
    fontSize: scaleSize(11),
    fontWeight: "700",
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: scaleSize(12),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleSize(6),
  },
  statusDot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  ticketStatus: {
    fontSize: scaleSize(12),
    fontWeight: "600",
    color: "#4B5563",
  },
  ticketId: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(6),
  },
  ticketIdText: {
    fontSize: scaleSize(11),
    fontWeight: "600",
    color: "#6B7280",
  },

  icon: {
    width: scaleSize(80), 
    height: scaleSize(80),
    backgroundColor: "#FFFFFFCC", 
    borderRadius: scaleSize(16),
    padding: scaleSize(10), 
    margin: 0,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, 
    shadowRadius: scaleSize(4), 
    
  },


  // Loading State
  loadingState: {
    gap: scaleSize(12),
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: scaleSize(16),
    backgroundColor: "#F9FAFB",
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  skeletonIcon: {
    width: scaleSize(32),
    height: scaleSize(32),
    borderRadius: scaleSize(8),
    backgroundColor: "#E5E7EB",
    marginRight: scaleSize(12),
  },
  skeletonContent: {
    flex: 1,
    gap: scaleSize(8),
  },
  skeletonTitle: {
    height: scaleSize(16),
    width: "70%",
    backgroundColor: "#E5E7EB",
    borderRadius: scaleSize(4),
  },
  skeletonSubtitle: {
    height: scaleSize(14),
    width: "50%",
    backgroundColor: "#E5E7EB",
    borderRadius: scaleSize(4),
  },
  skeletonMeta: {
    height: scaleSize(12),
    width: "30%",
    backgroundColor: "#E5E7EB",
    borderRadius: scaleSize(4),
  },
  skeletonArrow: {
    width: scaleSize(20),
    height: scaleSize(20),
    backgroundColor: "#E5E7EB",
    borderRadius: scaleSize(4),
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: scaleSize(48),
    paddingHorizontal: scaleSize(16),
    backgroundColor: "#F9FAFB",
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyIconContainer: {
    marginBottom: scaleSize(20),
  },
  emptyStateTitle: {
    fontSize: scaleSize(18),
    fontWeight: "700",
    color: "#374151",
    marginBottom: scaleSize(8),
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: scaleSize(14),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: scaleSize(24),
    lineHeight: scaleSize(20),
  },
  refreshEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00AF9F",
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(12),
    gap: scaleSize(8),
  },
  refreshEmptyText: {
    color: "#FFFFFF",
    fontSize: scaleSize(15),
    fontWeight: "600",
  },

  // Error State
  errorContainer: {
    alignItems: "center",
    padding: scaleSize(24),
    marginHorizontal: scaleSize(20),
    backgroundColor: "#FEF2F2",
    borderRadius: scaleSize(16),
    marginTop: scaleSize(20),
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: {
    fontSize: scaleSize(18),
    fontWeight: "600",
    color: "#DC2626",
    marginTop: scaleSize(12),
    marginBottom: scaleSize(8),
  },
  errorText: {
    fontSize: scaleSize(14),
    color: "#991B1B",
    textAlign: "center",
    marginBottom: scaleSize(20),
    lineHeight: scaleSize(20),
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(12),
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: scaleSize(15),
    fontWeight: "600",
  },

  // Refresh Hint
  refreshHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleSize(12),
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  refreshHintText: {
    fontSize: scaleSize(12),
    color: "#64748B",
    marginLeft: scaleSize(6),
  },
});

export default Home;
