import { API } from "@/constants/api";
import { getToken } from "@/scripts/token";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../../components/Header";

interface TeamInfo {
    id: number;
    name: string;
    date: string;
    shift: string;
    status: string;
}

interface TeamMember {
    id: number;
    name: string;
    mobile_number: string;
    email: string;
    user_type: string;
}

export default function TeamScreen() {
    const [team, setTeam] = useState<TeamInfo | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTeam = useCallback(async () => {
        try {
            const token = await getToken();
            const response = await fetch(API.tech.team(), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            setTeam(data.team);
            setMembers(data.members || []);
        } catch {} finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTeam();
    }, [fetchTeam]);

    const handleCall = (phone: string) => {
        const cleaned = phone.replace(/[^0-9+]/g, "");
        Linking.openURL(`tel:${cleaned}`);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#00AFA1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00AFA1" colors={["#00AFA1"]} />
                }
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>My Team</Text>
                    <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.refreshButton}>
                        {refreshing ? (
                            <ActivityIndicator size="small" color="#00AFA1" />
                        ) : (
                            <Ionicons name="refresh" size={20} color="#00AFA1" />
                        )}
                    </TouchableOpacity>
                </View>

                {team ? (
                    <View style={styles.teamInfoCard}>
                        <Text style={styles.teamName}>{team.name}</Text>
                        <View style={styles.teamDetails}>
                            <View style={styles.teamDetail}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.teamDetailText}>{formatDate(team.date)}</Text>
                            </View>
                            <View style={styles.teamDetail}>
                                <Ionicons name="time-outline" size={16} color="#666" />
                                <Text style={styles.teamDetailText}>{team.shift || "N/A"}</Text>
                            </View>
                            <View style={styles.teamDetail}>
                                <Ionicons name="people-outline" size={16} color="#666" />
                                <Text style={styles.teamDetailText}>{members.length} members</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {!team ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={60} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No Team Today</Text>
                        <Text style={styles.emptyText}>You are not assigned to any team for today. Contact your supervisor for assignment.</Text>
                    </View>
                ) : members.length === 0 ? (
                    <Text style={styles.emptyText}>No team members found</Text>
                ) : (
                    members.map((member) => (
                        <View key={member.id} style={styles.memberCard}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.name}>{member.name}</Text>
                                <Text style={styles.role}>{member.user_type}</Text>
                                <Text style={styles.phone}>{member.mobile_number}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.callButton}
                                onPress={() => handleCall(member.mobile_number)}
                            >
                                <Ionicons name="call" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 20,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
    },
    refreshButton: {
        padding: 8,
    },
    teamInfoCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: "#00AFA1",
    },
    teamName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#00AFA1",
        marginBottom: 12,
    },
    teamDetails: {
        gap: 8,
    },
    teamDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    teamDetailText: {
        fontSize: 14,
        color: "#666",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#4A5568",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#A0AEC0",
        textAlign: "center",
        lineHeight: 20,
    },
    memberCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        alignItems: "center",
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#00AFA1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },
    role: {
        fontSize: 13,
        color: "#00AFA1",
        fontWeight: "500",
        textTransform: "capitalize",
        marginTop: 2,
    },
    phone: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#27AE60",
        justifyContent: "center",
        alignItems: "center",
    },
});
