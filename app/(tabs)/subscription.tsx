import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../../components/Header';
import Overlay from '../../components/Overlay';
import { getToken } from '../../scripts/token';

interface Billing {
    amount_due: number;
    due_date: string;
}

interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    transaction_date: string;
    installed_date: string | null;
    start_date: string;
    end_date: string | null;
    status: string;
    installation_address: string;
    installation_fee: number;
    balance: number | null;
    remarks: string;
    subscription_id: string;
    billing: Billing[];
}

const SubscriptionScreen: React.FC = () => {
    const [fetchData, setFetchData] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);


    const fetchSubscriptionData = async () => {
        try {
            const token = getToken();

            const response = await fetch('https://staging.kazibufastnet.com/api/subscriptions/1000', {
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

            const data: Subscription[] = await response.json();
            setFetchData(data);
        } catch (error: any) {
            setError(`Failed to fetch data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return '₱0.00';
        return `₱${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <Overlay />

            <View style={styles.contentContainer}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchSubscriptionData}
                            tintColor="#00afa1"
                            colors={["#00afa1"]} 
                        />
                    }
                >
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>My Subscriptions</Text>
                    </View>
                    {fetchData.map((subscription) => (
                        <View key={subscription.id} style={styles.subscriptionCard}>
                            <Text style={styles.accountNumber}>
                                Account Number: {subscription.subscription_id}
                            </Text>
                            <Text style={styles.address}>
                                Address: {subscription.installation_address}
                            </Text>

                            <View style={styles.spacer} />

                            {subscription.status === 'active' && (
                                <Text style={styles.dueDate}>
                                    Due Date:{' '}
                                    {subscription.billing && subscription.billing.length > 0
                                        ? formatDate(subscription.billing[0].due_date)
                                        : 'unavailable'}
                                </Text>
                            )}

                            <View style={styles.statusRow}>
                                {subscription.status === 'active' ? (
                                    <Text style={styles.activeStatus}>ACTIVE</Text>
                                ) : (
                                    <Text style={styles.endedStatus}>ENDED</Text>
                                )}
                                <Text style={styles.amount}>
                                    {subscription.billing && subscription.billing.length > 0
                                        ? formatCurrency(subscription.billing[0].amount_due)
                                        : formatCurrency(0)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    contentContainer: { flex: 1 },
    titleContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
    titleText: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    subscriptionCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    accountNumber: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    address: { fontSize: 14, color: '#666', marginBottom: 8 },
    spacer: { height: 1, backgroundColor: '#ddd', marginVertical: 12 },
    dueDate: { fontSize: 14, color: '#666', marginBottom: 8 },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    activeStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00afa1',
        backgroundColor: '#e0f7f5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    endedStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff6b6b',
        backgroundColor: '#ffebee',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    amount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    loadingText: { fontSize: 18, color: '#00afa1', textAlign: 'center', marginTop: 50 },
    errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 50 },
});

export default SubscriptionScreen;
