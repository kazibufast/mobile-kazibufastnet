import { getToken } from '@/scripts/token';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import TicketActionButtons from '../../components/TicketActionButtons';

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
}

export default function TicketDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [ticket, setTicket] = useState<TicketItem | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) router.back();
        else router.push('/(tech-tabs)/tickets');
    };

    const mapUrl = `https://maps.google.com/maps?q=${ticket?.latitude},${ticket?.longitude}&z=18&output=embed`;

    const fetchTicketDetails = useCallback(async () => {
        if (!id) return;

        setRefreshing(true);
        try {
            const token = await getToken();
            const response = await fetch(`https://staging.kazibufastnet.com/api/tech/tickets/view/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`Failed to fetch ticket. Status: ${response.status}, Details: ${errorDetails}`);
            }

            const data = await response.json();
            const t = data.ticket;

            setTicket({
                id: t.id?.toString() ?? '',
                ticketNumber: t.ticket_number?.toString() ?? 'N/A',
                accountNumber: t.subscription_id?.toString() ?? 'N/A',
                accountName: t.client?.name ?? 'Unknown',
                installationAddress: t.subscription.installation_address ?? 'N/A',
                mobileNumber: t.client?.mobile_number ?? 'N/A',
                status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'N/A',
                type: t.type ? (t.type.toLowerCase() === 'repair' ? 'Repair' : 'Installation') : 'N/A',
                date: t.created_at ?? new Date().toISOString(),
                subject: t.subject ?? 'N/A',
                latitude: t.subscription?.latitude,
                longitude: t.subscription?.longitude,
            });

        } catch (error: any) {
            console.error('Fetch ticket error:', error.message);
        } finally {
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    const formatDateTime = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const cardMargin = 8;
    const screenPadding = 16;
    const getCardWidth = () => (width - screenPadding * 2 - cardMargin) / 2;

    if (!ticket) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
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
                contentContainerStyle={[styles.content, { paddingBottom: 76 + (insets.bottom || 16) }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTicketDetails} tintColor="#3498DB" />}
            >
                {/* Account Info */}
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
                            <Text style={styles.cardValue}>{formatDateTime(ticket.date)}</Text>
                        </View>
                        <View style={[styles.card, { width: getCardWidth() }]}>
                            <Text style={styles.cardLabel}>TYPE</Text>
                            <Text style={styles.cardValue}>{ticket.type}</Text>
                        </View>
                    </View>
                </View>

                {/* Installation Address */}
                <View style={styles.section}>
                    <View style={styles.fullCard}>
                        <Text style={styles.fullCardLabel}>INSTALLATION ADDRESS</Text>
                        <Text style={styles.fullCardValue}>{ticket.installationAddress}</Text>
                    </View>
                </View>

                {/* Subject */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subject Details</Text>
                    <View style={styles.fullCard}>
                        <Text style={styles.subjectText}>{ticket.subject}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location on Map</Text>
                    <WebView
                        source={{ uri: 'https://staging.kazibufastnet.com/client/map/' + ticket.latitude + "/" + ticket.longitude }}
                        style={styles.webview}
                    />
                </View>


                {/* Action Buttons */}
                <TicketActionButtons ticket={ticket} />
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
    webview: {
        height: 300, 
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
    fullCard: { backgroundColor: '#F7FAFC', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    fullCardLabel: { fontSize: 11, color: '#718096', fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
    fullCardValue: { fontSize: 15, fontWeight: '600', color: '#2D3748' },
    subjectText: { fontSize: 14, color: '#2D3748', lineHeight: 20 },
});
