import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import Overlay from '../../components/Overlay';

interface PromoItem {
  title: string;
  description: string;
  image: any;
  endDate: string; // ISO string
  isActive: boolean;
}

const PROMOS: PromoItem[] = [
  {
    title: 'Internet Promo',
    description: 'Unlock Exclusive Deals! – Limited Time Only!',
    image: require('../../assets/images/promo.png'),
    endDate: '2025-12-16T23:59:59',
    isActive: true,
  },
  {
    title: 'Raffle',
    description: 'Get a chance to WIN in our Wi-Fi Raffle Promo!',
    image: require('../../assets/images/raffle.png'),
    endDate: '2025-12-19T23:59:59',
    isActive: true,
  },
  {
    title: 'Plans Promo',
    description: 'Unlock Exclusive Deals! – Limited Time Only!',
    image: require('../../assets/images/plans.png'),
    endDate: '2025-11-16T23:59:59',
    isActive: false,
  },
];

const Promo: React.FC = () => {
  const [countdowns, setCountdowns] = useState<string[]>([]);

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newCountdowns = PROMOS.map((promo) => {
        const end = new Date(promo.endDate).getTime();
        const diff = end - now;

        if (diff <= 0) return 'EXPIRED';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <Overlay />

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Promo</Text>
          </View>

          {PROMOS.map((promo, index) => (
            <View style={styles.promoCardContainer} key={index}>
              <View style={styles.promoCard}>
                <Image
                  source={promo.image}
                  style={styles.promoImage}
                  resizeMode="cover"
                />
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoDescription}>{promo.description}</Text>
                  <View style={styles.promoDetails}>
                    <Text>Ends in: {countdowns[index]}</Text>
                    <Text style={promo.isActive ? styles.activeStatus : styles.inactiveStatus}>
                      {promo.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>WORK-RELIABLE PLAN</Text>
            <View style={styles.planRow}>
              {['995','1495','1695','1995','2495'].map((price, idx) => (
                <TouchableOpacity style={styles.planBox} key={idx}>
                  <Text style={styles.planPrice}>PLAN {price}</Text>
                  <Text style={styles.planSpeed}>{['15','35','50','75','100'][idx]}Mbps</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.freeInstallation}>FREE INSTALLATION!!!</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Promo;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000ff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  promoCardContainer: {
    marginBottom: 20,
  },
  promoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promoImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  promoContent: {
    padding: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  promoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    flex: 1,
  },
  promoEndLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  countdownTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00afa1ff',
    backgroundColor: '#f0f9f8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  expiredTimer: {
    color: '#ff6b6b',
    backgroundColor: '#ffebee',
  },
  activeStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00afa1ff',
    backgroundColor: '#e0f7f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  plansContainer: {
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00afa1ff',
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00afa1ff',
    marginBottom: 8,
  },
  planSpeed: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  freeInstallation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00afa1ff',
    textAlign: 'center',
    marginTop: 10,
  },
});

