import { API } from "@/constants/api";
import { getToken } from "@/scripts/token";
import { getUser } from "@/scripts/user";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import TicketActionButtons from "../../components/TicketActionButtons";

interface TicketItem {
  id: string;
  ticketNumber: string;
  accountNumber: string;
  accountName: string;
  installationAddress: string;
  mobileNumber: string;
  status: string;
  type: string;
  date: string;
  subject: string;
  latitude: string;
  longitude: string;
  tagNumber: string;
  napId: number | null;
  pppoeName: string;
  pppoePassword: string;
  branch_id: number | null;
}

interface NapItem {
  id: number;
  type: string;
  serial_number: string;
  latitude: string;
  longitude: string;
  splitter_type: string;
  address: string;
  notes: string;
  active: boolean;
  branch_id: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const NAPS_CACHE_KEY = "@naps_cache";

const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  Alert.alert("Copied!", "Text copied to clipboard.");
};

export default function TicketDetails() {
  const { id } = useLocalSearchParams();
  const user = getUser();

  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // NAP state
  const [allNaps, setAllNaps] = useState<NapItem[]>([]);
  const [napSearch, setNapSearch] = useState("");
  const [showNapDropdown, setShowNapDropdown] = useState(false);
  const [selectedNapId, setSelectedNapId] = useState<number | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/(tech-tabs)/tickets");
  };

  const mapUrl = `https://maps.google.com/maps?q=${ticket?.latitude},${ticket?.longitude}&z=18&output=embed`;

  const fetchTicketDetails = useCallback(async () => {
    const ticketId = Array.isArray(id) ? id[0] : id;

    if (!ticketId) return;

    setRefreshing(true);

    try {
      const token = await getToken();

      const response = await fetch(
        API.tech.viewTicket(ticketId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data?.ticket) {
        throw new Error("Ticket missing");
      }

      const t = data.ticket;

      setTicket({
        id: String(t.id),
        ticketNumber: String(t.ticket_number ?? "N/A"),
        accountNumber: t.subscription?.subscription_id?.toString() ?? "N/A",
        accountName: t.client?.name ?? "Unknown",
        installationAddress: t.subscription?.installation_address ?? "N/A",
        mobileNumber: t.client?.mobile_number ?? "N/A",
        status: t.status
          ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
          : "N/A",
        type: t.type?.toLowerCase() === "repair" ? "Repair" : "Installation",
        date: t.created_at ?? new Date().toISOString(),
        subject: t.subject ?? "N/A",
        latitude: t.subscription?.latitude ?? null,
        longitude: t.subscription?.longitude ?? null,

        tagNumber: t.subscription?.job_order?.span_no ?? "N/A",
        napId: t.subscription?.job_order?.nap_id ?? null,
        pppoeName: t.subscription?.job_order?.pppoe_name ?? "N/A",
        pppoePassword: t.subscription?.job_order?.pppoe_password ?? "N/A",
        branch_id: t.branch_id ?? t.branch?.id ?? null,
      });

      // Set NAP state from ticket data (don't overwrite local selection)
      const existingNapId = t.subscription?.job_order?.nap_id ?? null;
      if (existingNapId) {
        setSelectedNapId(existingNapId);
      }
      // If no nap_id from API, preserve any locally selected NAP
      // (selectedNapId state is kept as-is)
    } catch (error) {
      Alert.alert("Notice", "Ticket not available", [
        {
          text: "OK",
          onPress: () => router.back(), // ⬅ safer than push
        },
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  /* ---------- FETCH & CACHE NAPS ---------- */

  const fetchNaps = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(NAPS_CACHE_KEY);
      if (cached) setAllNaps(JSON.parse(cached));

      const token = await getToken();
      const res = await fetch(API.tech.naps(), {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const list: NapItem[] = data.naps ?? data.data ?? data ?? [];
        setAllNaps(list);
        await AsyncStorage.setItem(NAPS_CACHE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      console.log("Failed to fetch naps", e);
    }
  }, []);

  useEffect(() => {
    fetchNaps();
  }, [fetchNaps]);

  // Resolve selected NAP details
  const resolvedNap = useMemo(
    () => allNaps.find((n) => n.id === selectedNapId) ?? null,
    [allNaps, selectedNapId],
  );

  // Filter NAPs for search dropdown (by branch_id + query)
  const filteredNaps = useMemo(() => {
    let filtered = allNaps;
    if (ticket?.branch_id) {
      filtered = filtered.filter((n) => n.branch_id === ticket.branch_id);
    }
    if (napSearch.trim()) {
      const q = napSearch.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.serial_number.toLowerCase().includes(q) ||
          n.address.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allNaps, ticket?.branch_id, napSearch]);

  const handleSelectNap = (nap: NapItem) => {
    setSelectedNapId(nap.id);
    setNapSearch("");
    setShowNapDropdown(false);
  };

  const statusLower = ticket?.status?.toLowerCase() ?? "";
  const canEditNap = statusLower === "in progress" || statusLower === "accepted";

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const cardMargin = 8;
  const screenPadding = 16;
  const getCardWidth = () => (width - screenPadding * 2 - cardMargin) / 2;

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#3498DB"
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Ticket Details
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 76 + (insets.bottom || 16) },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTicketDetails}
              tintColor="#3498DB"
            />
          }
        >
          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticket Information</Text>
            <View style={styles.row}>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>TICKET NUMBER</Text>
                <Text style={styles.cardValue}>{ticket.ticketNumber}</Text>
              </View>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>ACCOUNT NUMBER</Text>
                <Text style={styles.cardValue}>{ticket.accountNumber}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>ACCOUNT NAME</Text>
                <Text style={styles.cardValue}>
                  {ticket.accountName?.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>MOBILE NUMBER</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Text style={styles.cardValue}>{ticket.mobileNumber}</Text>

                  <Pressable
                    onPress={() =>
                      Linking.openURL(
                        `tel:${ticket.mobileNumber.replace(/[^0-9+]/g, "")}`,
                      )
                    }
                  >
                    <Ionicons name="call-outline" size={24} color="#16a34a" />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>DATE</Text>
                <Text style={styles.cardValue}>
                  {formatDateTime(ticket.date?.toUpperCase())}
                </Text>
              </View>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <Text style={styles.cardLabel}>TYPE</Text>
                <Text style={styles.cardValue}>
                  {ticket.type?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Installation Address */}
            <View style={styles.section}>
              <View style={styles.fullCard}>
                <Text style={styles.fullCardLabel}>INSTALLATION ADDRESS</Text>
                <Text style={styles.fullCardValue}>
                  {ticket.installationAddress?.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <View style={styles.labelRow}>
                  <Text style={styles.cardLabel}>PPPOE Name</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(ticket.pppoeName)}
                  >
                    <MaterialIcons name="content-copy" size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardValue}>{ticket.pppoeName}</Text>
              </View>

              <View style={[styles.card, { width: getCardWidth() }]}>
                <View style={styles.labelRow}>
                  <Text style={styles.cardLabel}>PPPOE Password</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(ticket.pppoePassword)}
                  >
                    <MaterialIcons name="content-copy" size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardValue}>{ticket.pppoePassword}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.card, { width: getCardWidth() }]}>
                <View style={styles.labelRow}>
                  <Text style={styles.cardLabel}>Tag Number</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(ticket.tagNumber)}
                  >
                    <MaterialIcons name="content-copy" size={18} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardValue}>{ticket.tagNumber}</Text>
              </View>
            </View>

            {/* NAP Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NAP Details</Text>
              {canEditNap && !resolvedNap ? (
                /* Editable: searchable NAP selector */
                <View>
                  <TextInput
                    style={[styles.napInput, !selectedNapId && { borderColor: "#EF4444" }]}
                    placeholder="Search NAP by serial number or address..."
                    placeholderTextColor="#94A3B8"
                    value={napSearch}
                    onChangeText={(text) => {
                      setNapSearch(text);
                      setShowNapDropdown(true);
                    }}
                    onFocus={() => setShowNapDropdown(true)}
                  />
                  {showNapDropdown && napSearch.trim().length > 0 && (
                    <View style={styles.napDropdown}>
                      {filteredNaps.length === 0 ? (
                        <Text style={styles.napDropdownEmpty}>
                          No NAPs found{ticket?.branch_id ? " for this branch" : ""}
                        </Text>
                      ) : (
                        <FlatList
                          data={filteredNaps.slice(0, 10)}
                          keyExtractor={(item) => String(item.id)}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                          style={{ maxHeight: 200 }}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.napDropdownItem}
                              onPress={() => handleSelectNap(item)}
                            >
                              <Text style={styles.napDropdownSerial}>
                                {item.serial_number}
                              </Text>
                              <Text style={styles.napDropdownAddress} numberOfLines={1}>
                                {item.type.toUpperCase()} · {item.splitter_type}
                              </Text>
                            </TouchableOpacity>
                          )}
                        />
                      )}
                    </View>
                  )}
                  <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>
                    * Required — select a NAP before completing the ticket
                  </Text>
                </View>
              ) : resolvedNap ? (
                /* Display resolved NAP info */
                <View>
                  <View style={styles.row}>
                    <View style={[styles.card, { width: getCardWidth() }]}>
                      <View style={styles.labelRow}>
                        <Text style={styles.cardLabel}>Serial Number</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(resolvedNap.serial_number)}
                        >
                          <MaterialIcons name="content-copy" size={18} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cardValue}>{resolvedNap.serial_number}</Text>
                    </View>
                    <View style={[styles.card, { width: getCardWidth() }]}>
                      <Text style={styles.cardLabel}>Type</Text>
                      <Text style={styles.cardValue}>{resolvedNap.type.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.card, { width: getCardWidth() }]}>
                      <Text style={styles.cardLabel}>Splitter Type</Text>
                      <Text style={styles.cardValue}>{resolvedNap.splitter_type}</Text>
                    </View>
                  </View>
                  {canEditNap && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNapId(null);
                        setNapSearch("");
                      }}
                      style={styles.changeNapButton}
                    >
                      <Text style={styles.changeNapButtonText}>Change NAP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                /* No NAP assigned */
                <View style={styles.fullCard}>
                  <Text style={{ color: "#6B7280", fontStyle: "italic" }}>
                    No NAP assigned
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subject Details</Text>
            <View style={styles.fullCard}>
              <Text style={styles.subjectText}>
                {ticket.subject?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location on Map</Text>
            <WebView
              key={`${refreshing}`}
              source={{
                uri:
                  API.tech.clientMap(ticket.latitude, ticket.longitude),
              }}
              style={styles.webview}
            />
          </View>

          {/* Action Buttons */}
          <TicketActionButtons ticket={ticket} onStatusChange={fetchTicketDetails} napId={selectedNapId} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00AF9F",
    paddingTop: 35,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  webview: {
    height: 300,
  },

  backButton: {
    padding: 5,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    textAlign: "center",
    flex: 1,
  },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 5 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 70,
    justifyContent: "center",
    flexShrink: 1,
  },
  cardLabel: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardValue: { fontSize: 15, fontWeight: "600", color: "#2D3748" },
  fullCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fullCardLabel: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fullCardValue: { fontSize: 15, fontWeight: "600", color: "#2D3748" },
  subjectText: { fontSize: 14, color: "#2D3748", lineHeight: 20 },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  napInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  napDropdown: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FFFFFF",
    maxHeight: 220,
    zIndex: 100,
  },
  napDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  napDropdownSerial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  napDropdownAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  napDropdownEmpty: {
    padding: 14,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
  },
  changeNapButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3B82F6",
    marginTop: 4,
  },
  changeNapButtonText: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
  },
});
