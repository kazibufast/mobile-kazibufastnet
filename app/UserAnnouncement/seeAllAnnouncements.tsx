import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Define the Announcement type
export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    author: string;
    category?: string;
    isImportant?: boolean;
}

// Mock data - replace with your actual data source
const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'System Maintenance',
        content: 'The system will undergo maintenance on Saturday from 2 AM to 4 AM.',
        date: '2024-01-15',
        author: 'Admin',
        category: 'System',
        isImportant: true,
    },
    {
        id: '2',
        title: 'New Features Released',
        content: 'Check out the new dashboard features in the latest update.',
        date: '2024-01-14',
        author: 'Development Team',
        category: 'Update',
    },
    {
        id: '3',
        title: 'Holiday Schedule',
        content: 'Office will be closed on Monday for public holiday.',
        date: '2024-01-13',
        author: 'HR Department',
        category: 'Holiday',
        isImportant: true,
    },
    {
        id: '4',
        title: 'Meeting Reminder',
        content: 'Quarterly review meeting at 3 PM in Conference Room A.',
        date: '2024-01-12',
        author: 'Management',
        category: 'Meeting',
    },
    {
        id: '5',
        title: 'Policy Update',
        content: 'Please review the updated remote work policy document.',
        date: '2024-01-11',
        author: 'HR Department',
        category: 'Policy',
    },
];

const SeeAllAnnouncements: React.FC = () => {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch announcements (replace with your actual API call)
    const fetchAnnouncements = async () => {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Replace this with your actual API call
            // const response = await fetch('your-api-endpoint');
            // const data = await response.json();

            setAnnouncements(mockAnnouncements);
        } catch (error) {
            Alert.alert('Error', 'Failed to load announcements');
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnnouncements();
    };

    const handleBack = () => {
        router.push('/(tabs)/home');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
        <View style={[
            styles.announcementCard,
            item.isImportant && styles.importantCard
        ]}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    {item.isImportant && (
                        <Ionicons name="alert-circle" size={16} color="#FF6B6B" style={styles.importantIcon} />
                    )}
                    <Text style={[
                        styles.title,
                        item.isImportant && styles.importantTitle
                    ]}>
                        {item.title}
                    </Text>
                </View>
                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.content} numberOfLines={3}>
                {item.content}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.author}>{item.author}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No announcements available</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading announcements...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Announcements</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>

            {/* Announcements List */}
            <FlatList
                data={announcements}
                renderItem={renderAnnouncementItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    headerRightPlaceholder: {
        width: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666666',
    },
    listContent: {
        padding: 16,
    },
    announcementCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    importantCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    importantIcon: {
        marginRight: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    importantTitle: {
        color: '#D32F2F',
    },
    categoryBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1976D2',
    },
    content: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    author: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '500',
    },
    date: {
        fontSize: 12,
        color: '#999999',
    },
    separator: {
        height: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999999',
        marginTop: 16,
    },
});

export default SeeAllAnnouncements;