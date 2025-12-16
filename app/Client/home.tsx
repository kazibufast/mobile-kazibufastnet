import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../../components/Header';
import Overlay from '../../components/Overlay';
import { getUser } from '../../scripts/user';


const { width, height } = Dimensions.get('window');
const user = getUser();

const scaleSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * Math.min(scale, 1.2));
};


interface QuickAction {
  title: string;
  icon: any;
  route: any;
  color: string;
}

const Home: React.FC = () => {
  const router = useRouter();
  const [scrollY] = useState(new Animated.Value(0));
  const user = getUser();

  console.log(user);


  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const quickActions: QuickAction[] = [
    {
      title: 'SUBSCRIPTION',
      icon: require("../../assets/icons/receipt.png"),
      route: '/(tabs)/subscription',
      color: '#00AF9F',
    },
    {
      title: 'PAY BILL',
      icon: require("../../assets/icons/wallet.png"),
      route: '/(tabs)/billing',
      color: '#4A90E2',
    },
    {
      title: 'PROMO',
      icon: require("../../assets/icons/pricetag.png"),
      route: '/(tabs)/promo',
      color: '#FF6B6B',
    },
    {
      title: 'TICKET',
      icon: require("../../assets/icons/ticket.png"),
      route: '/(tabs)/ticket',
      color: '#FFA726',
    },
  ];

  const handleRoutePress = (route: any) => {
    if (typeof route === 'string') {
      router.push(route as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header/>
      <Overlay/>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hi, {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </Text>

            <Text style={styles.welcome}>Welcome to Kazibufast</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How can we help you today?</Text>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { backgroundColor: action.color + '15' }]}
                onPress={() => handleRoutePress(action.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                  <Image
                    source={action.icon}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="megaphone-outline" size={scaleSize(20)} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/UserAnnouncement/seeAllAnnouncements')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons
                name="chevron-forward"
                size={scaleSize(16)}
                color="#FF6B6B"
              />
            </TouchableOpacity>

          </View>

          <View style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <Ionicons name="alert-circle" size={scaleSize(24)} color="#FF6B6B" />
              <Text style={styles.announcementLabel}>IMPORTANT</Text>
            </View>
            <Text style={styles.announcementTitle}>
              Christmas Party Cancellation Notice
            </Text>
            <Text style={styles.announcementDescription}>
              Due to unfavorable weather conditions, our annual Christmas party has been postponed. Stay tuned for further updates and new date announcements.
            </Text>
            <View style={styles.announcementFooter}>
              <Text style={styles.announcementDate}>Posted: Dec 10, 2025</Text>
              <TouchableOpacity>
                <Text style={styles.readMoreText}>Read more →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar-outline" size={scaleSize(20)} color="#00AF9F" />
              <Text style={styles.sectionTitle1}>Upcoming Bills</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/UserAnnouncement/seeAllUpcomingBills')}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={scaleSize(16)} color="#00AF9F" />
            </TouchableOpacity>
          </View>

          {[
            {
              date: 'Mon, Dec 30, 2025',
              amount: 'P1,495.00',
              status: 'Due in 5 days',
              color: '#FF6B6B',
            },
            {
              date: 'Tue, Nov 15, 2025',
              amount: 'P1,595.00',
              status: 'Due in 20 days',
              color: '#FFA726',
            },
            {
              date: 'Mon, Oct 20, 2025',
              amount: 'P1,495.00',
              status: 'Due in 45 days',
              color: '#00AF9F',
            },
          ].map((bill, index) => (
            <TouchableOpacity
              key={index}
              style={styles.billCard}
              activeOpacity={0.9}
            >
              <View style={styles.billContent}>
                <View style={styles.billHeader}>
                  <Text style={styles.billDate}>{bill.date}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: bill.color + '20' }]}>
                    <Text style={[styles.statusTextBadge, { color: bill.color }]}>{bill.status}</Text>
                  </View>
                </View>
                <Text style={styles.billDescription}>Don't forget to pay your internet bill on time!</Text>
                <View style={styles.billFooter}>
                  <Text style={styles.billAmount}>{bill.amount}</Text>
                  <TouchableOpacity style={styles.payButton}>
                    <Text style={styles.payButtonText}>PAY NOW</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  heroSection: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(20),
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 3,
    marginBottom: scaleSize(20),
  },
  greetingContainer: {
    justifyContent: 'center'
  },
  greeting: {
    fontSize: scaleSize(28),
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: scaleSize(4),
  },
  welcome: {
    fontSize: scaleSize(16),
    color: '#718096',
    marginBottom: scaleSize(12),
  },
  sectionContainer: {
    paddingHorizontal: scaleSize(20),
    marginBottom: scaleSize(25),
  },
  sectionTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: scaleSize(5),
  },
  sectionTitle1: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#2D3748',
  },
  quickActionsContainer: {
    paddingRight: scaleSize(10),
    gap: scaleSize(5),
  },
  quickActionCard: {
    width: scaleSize(110),
    padding: scaleSize(16),
    borderRadius: scaleSize(16),
    alignItems: 'center',
    marginRight: scaleSize(10),
    shadowColor: '#fffcfcff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleSize(12),
  },
  actionIcon: {
    width: scaleSize(24),
    height: scaleSize(24),
    tintColor: '#fff',
  },
  quickActionText: {
    fontSize: scaleSize(12),
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: scaleSize(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(16),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
  },
  seeAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(4),
  },
  seeAllText: {
    fontSize: scaleSize(14),
    color: '#00AF9F',
    fontWeight: '600',
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: scaleSize(16),
    marginBottom: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  billContent: {
    padding: scaleSize(16),
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  billDate: {
    fontSize: scaleSize(14),
    color: '#718096',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(12),
  },
  statusTextBadge: {
    fontSize: scaleSize(12),
    fontWeight: '600',
  },
  billDescription: {
    fontSize: scaleSize(15),
    color: '#2D3748',
    marginBottom: scaleSize(16),
    lineHeight: scaleSize(22),
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billAmount: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: '#2D3748',
  },
  payButton: {
    backgroundColor: '#00AF9F',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(8),
  },
  payButtonText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: '#fff',
  },
  announcementCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    borderLeftWidth: scaleSize(4),
    borderLeftColor: '#FF6B6B',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    marginBottom: scaleSize(12),
  },
  announcementLabel: {
    fontSize: scaleSize(12),
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: 1,
  },
  announcementTitle: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: scaleSize(8),
    lineHeight: scaleSize(24),
  },
  announcementDescription: {
    fontSize: scaleSize(14),
    color: '#718096',
    lineHeight: scaleSize(20),
    marginBottom: scaleSize(16),
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementDate: {
    fontSize: scaleSize(12),
    color: '#A0AEC0',
  },
  readMoreText: {
    fontSize: scaleSize(14),
    color: '#FF6B6B',
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
  },
  statusDotActive: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: '#00AF9F',
  },
  statusTextActive: {
    fontSize: scaleSize(14),
    color: '#00AF9F',
    fontWeight: '600',
  },
  serviceStatusCard: {
    backgroundColor: '#fff',
    borderRadius: scaleSize(16),
    padding: scaleSize(20),
    gap: scaleSize(16),
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(12),
  },
  serviceText: {
    fontSize: scaleSize(15),
    color: '#2D3748',
    fontWeight: '500',
    flex: 1,
  },
  serviceStatus: {
    fontSize: scaleSize(14),
    color: '#00AF9F',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: scaleSize(20),
  },
});

export default Home;