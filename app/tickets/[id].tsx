import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TicketDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push("/(tech-tabs)/tickets");
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate fetching data
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const cardMargin = 8;
    const screenPadding = 16;
    const buttonHeight = 70;
    const getCardWidth = () => (width - screenPadding * 2 - cardMargin) / 2;

    const ticket = {
        id,
        ticketNumber: '123123114124',
        accountNumber: '12321342131',
        accountName: 'John Smith',
        installationAddress: 'Guiwanon, Tubigon, Bohol',
        mobileNumber: '09508221851',
        status: 'Open',
        type: 'Repair',
        date: 'Jan 14, 2025',
        subject: 'Internet connection dropping intermittently.',
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#2D3748" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Ticket Details
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: buttonHeight + insets.bottom + 16 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3498DB" />
                }
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
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
                            <Text style={styles.cardValue}>{ticket.accountName}</Text>
                        </View>
                        <View style={[styles.card, { width: getCardWidth() }]}>
                            <Text style={styles.cardLabel}>MOBILE NUMBER</Text>
                            <Text style={styles.cardValue}>{ticket.mobileNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.card, { width: getCardWidth() }]}>
                            <Text style={styles.cardLabel}>DATE</Text>
                            <Text style={styles.cardValue}>{ticket.date}</Text>
                        </View>
                        <View style={[styles.card, { width: getCardWidth() }]}>
                            <Text style={styles.cardLabel}>TYPE</Text>
                            <Text style={styles.cardValue}>{ticket.type}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.fullCard}>
                        <Text style={styles.fullCardLabel}>INSTALLATION ADDRESS</Text>
                        <Text style={styles.fullCardValue}>{ticket.installationAddress}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subject Details</Text>
                    <View style={styles.fullCard}>
                        <Text style={styles.subjectText}>{ticket.subject}</Text>
                    </View>
                </View>

                <View style={[styles.stickyButton, { bottom: insets.bottom + 16 }]}>
                    <TouchableOpacity style={styles.acceptButton}>
                        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accept Ticket</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: { padding: 5, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', textAlign: 'center', flex: 1 },
    scrollView: { flex: 1 },
    content: { padding: 16 },
    section: { marginBottom: 5 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    card: {
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 70,
        justifyContent: 'center',
        flexShrink: 1,
    },
    cardLabel: { fontSize: 11, color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    cardValue: { fontSize: 15, fontWeight: '600', color: '#2D3748' },
    fullCard: { backgroundColor: '#F7FAFC', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 80 },
    fullCardLabel: { fontSize: 11, color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
    fullCardValue: { fontSize: 15, fontWeight: '500', color: '#2D3748', lineHeight: 22 },
    subjectText: { fontSize: 15, color: '#4A5568', lineHeight: 22 },
    stickyButton: {
        position: 'absolute',
        left: 16,
        right: 16,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498DB',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        minHeight: 52,
    },
    acceptButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 10 },
});
