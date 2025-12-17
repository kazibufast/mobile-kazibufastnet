import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../../components/Header";
import { getToken } from '../../scripts/token';

const { width } = Dimensions.get("window");



export default function TeamScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [comment, setComment] = useState<string>("");
    const [team, setTeam] = useState<TeamInfo | null>(null);
    const [members, setMembers] = useState<Members[] | null>(null);

    const user = getToken();

    const onRefresh = useCallback(() => {
        console.log('ssdad');

        fetchTeam();
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    const handleSaveComment = (): void => {
        if (!comment.trim()) return;

        console.log("Saved Comment:", comment);
    };

    type TeamInfo = {
        teamName: string;
        shift: string;
        date: string;
        status: string;
        members: Members[];
    };
    type Members = {
        members: string[];
    };

    const fetchTeam = async () => {
        try {
            const token = getToken();
            const response = await fetch('https://staging.kazibufastnet.com/api/tech/team', {
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
            console.log(data);

            const teamInfo: TeamInfo = {
                teamName: data.team?.name,
                shift: data.team?.shift,
                date: data.team?.date,
                status: data.team?.status,
                members: Array.isArray(data.team?.members)
                    ? data.team.members
                    : data.team?.members?.split(",").map((m: string) => m.trim()) || [],

            };


            // Update state with the fetched team data
            setTeam(teamInfo);

        } catch (error: any) {
            console.error('Fetch team error:', error.message);
        }
    };


    useEffect(() => {
        fetchTeam();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00AFA1"
                        colors={["#00AFA1"]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Team Details</Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>TEAM</Text>
                            <Text style={styles.detailValue}>{team?.teamName}</Text>

                        </View>

                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>STATUS</Text>
                            <Text style={styles.detailValue}>{team?.status}</Text>
                        </View>

                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>SHIFT</Text>
                            <Text style={styles.detailValue}>{team?.shift}</Text>
                        </View>

                        <View style={styles.detailCell}>
                            <Text style={styles.detailLabel}>DATE</Text>
                            <Text style={styles.detailValue}>{team?.date}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.membersSection}>
                        <Text style={styles.membersTitle}>Team Members</Text>

                        {team?.members?.length ? (
                            team.members.map((i, index) => (
                                <View key={index} style={styles.memberRow}>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName} >
                                            {i}
                                        </Text>
                                        <Text style={styles.memberRole}>Technician</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: "#64748B", fontStyle: "italic" }}>
                                No members found.
                            </Text>
                        )}
                    </View>



                </View>


                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Comments</Text>

                    <View style={styles.commentContainer}>
                        <TextInput
                            value={comment}
                            onChangeText={(text: string) => setComment(text)}
                            style={styles.commentInput}
                            placeholder="Write a comment about the team's progress..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />

                        {/* Character Count */}
                        <Text style={styles.charCount}>
                            {comment.length}/500
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !comment.trim() && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSaveComment}
                            disabled={!comment.trim()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitText}>Save Comment</Text>
                        </TouchableOpacity>
                    </View>
                </View>



            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC"
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24
    },

    commentContainer: {
        marginTop: 8,
    },

    commentInput: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: "#1E293B",
        minHeight: 100,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    commentHint: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 8,
    },

    charCount: {
        fontSize: 11,
        color: "#64748B",
        textAlign: "right",
        marginTop: 4,
    },

    submitButton: {
        marginTop: 12,
        backgroundColor: "#00AFA1",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },

    submitButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },

    submitText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },



    // Info Card
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 20,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,
    },
    detailCell: {
        width: "50%",
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 5,
    },
    membersSection: {
        marginTop: 16,
    },

    membersTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 12,
    },

    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
        color: "#00AFA1",
        fontSize: 15,
        fontWeight: "700",
    },

    memberInfo: {
        flex: 1,
    },

    memberName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
    },

    memberRole: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },


    // Status Badge
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 80,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },

    // History Card
    historyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    taskCountBadge: {
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    taskCountText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#00AFA1",
    },
    tasksList: {
        marginBottom: 20,
    },
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#00AFA1",
    },
    taskNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E0F2FE",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    taskNumberText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#0369A1",
    },
    taskContent: {
        flex: 1,
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    taskDate: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    taskStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        minWidth: 80,
        alignItems: "center",
    },
    taskStatusText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    taskStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 16,
    },

});