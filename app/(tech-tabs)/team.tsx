import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { getToken } from "../../scripts/token";
import { getUser } from "../../scripts/user";

const { width } = Dimensions.get("window");

export default function TeamScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const user = getToken();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeam();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  type TeamInfo = {
    teamName: string;
    shift: string;
    date: string;
    status: string;
    id: number;
    members: string[];
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const user = getUser();
      const response = await fetch(
        "https://tub.kazibufastnet.com/api/tech/team/" + user?.team_id,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      const data = await response.json();

      if (!data.team || data.team_id != null) {
        setTeam(null);
        return;
      }

      const teamInfo: TeamInfo = {
        teamName: data.team?.name,
        shift: data.team?.shift,
        date: data.team?.date,
        status: data.team?.status,
        id: data.team?.id,
        members: Array.isArray(data.team?.members)
          ? data.team.members
          : data.team?.members?.split(",").map((m: string) => m.trim()) || [],
      };

      setTeam(teamInfo);
    } catch (error: any) {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleComment = async (comments: string) => {
    if (!team?.id) return;

    const url = `https://tub.kazibufastnet.com/api/tech/team/comments/${team.id}`;

    try {
      const token = await getToken();
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comments: comments,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Comment submitted successfully!");
        setComment("");
      } else {
        Alert.alert("Error", "Failed to submit comment");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const onPressHandler = () => {
    if (comment.trim()) {
      handleComment(comment);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <Header title="Team Details" showBack={true} />

      {/* ⏳ LOADING */}
      {loading && (
        <View style={styles.center}>
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={40} color="#00AF9F" />
            <Text style={styles.loadingText}>Loading team...</Text>
          </View>
        </View>
      )}

      {/* 🚫 NO TEAM */}
      {!loading && team === null && (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={80}
                color="#CBD5E1"
              />
            </View>
            <Text style={styles.emptyTitle}>No Team Assigned</Text>
            <Text style={styles.emptyMessage}>
              You are not currently assigned to any team. Please contact your
              office to be added to a team.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color="#FFFFFF"
                style={styles.refreshIcon}
              />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ✅ TEAM EXISTS */}
      {!loading && team && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Team Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerContent}>
              <View style={styles.teamNameContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.teamName}>{team.teamName}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(team.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {team.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Team Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#00AF9F"
              />
              <Text style={styles.cardTitle}>Team Information</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color="#64748B"
                  />
                </View>
                <View>
                  <Text style={styles.detailLabel}>SHIFT</Text>
                  <Text style={styles.detailValue}>{team.shift || "—"}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#64748B"
                  />
                </View>
                <View>
                  <Text style={styles.detailLabel}>DATE</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(team.date)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Team Members Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={20}
                color="#00AF9F"
              />
              <Text style={styles.cardTitle}>Team Members</Text>
              <View style={styles.memberCountBadge}>
                <Text style={styles.memberCountText}>
                  {team.members?.length || 0}
                </Text>
              </View>
            </View>

            {team.members?.length ? (
              <View style={styles.membersList}>
                {team.members.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {member}
                      </Text>
                      <Text style={styles.memberRole}>Technician</Text>
                    </View>
                    <View style={styles.memberIndex}>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyMembers}>
                <MaterialCommunityIcons
                  name="account-remove-outline"
                  size={40}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyMembersText}>No members found</Text>
              </View>
            )}
          </View>

          {/* Comments Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={20}
                color="#00AF9F"
              />
              <Text style={styles.cardTitle}>Team Comments</Text>
            </View>

            <View style={styles.commentContainer}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  style={styles.commentInput}
                  placeholder="Share updates or notes about the team..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.charCountContainer}>
                  <Text style={styles.charCount}>
                    {comment.length}/500 characters
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !comment.trim() && styles.submitButtonDisabled,
                ]}
                onPress={onPressHandler}
                disabled={!comment.trim()}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color="#FFFFFF"
                  style={styles.submitIcon}
                />
                <Text style={styles.submitText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Refresh Hint */}
          <View style={styles.hintContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color="#64748B"
            />
            <Text style={styles.hintText}>
              Pull down to refresh team information
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 30
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyWrapper: {
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00AF9F",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#00AF9F",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#00AF9F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  detailItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  memberCountBadge: {
    marginLeft: "auto",
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00AF9F",
  },
  membersList: {
    marginTop: 4,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00AF9F",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    color: "#64748B",
  },
  memberIndex: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberIndexText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  emptyMembers: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyMembersText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  commentContainer: {
    marginTop: 4,
  },
  commentInputContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  commentInput: {
    padding: 16,
    fontSize: 15,
    color: "#1E293B",
    minHeight: 100,
  },
  charCountContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
  },
  charCount: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#00AF9F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
  },
});