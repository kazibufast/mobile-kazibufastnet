import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { showToast } from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Colors } from '@/constants/theme';

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

const NAPS_CACHE_KEY = '@naps_cache';
const NAPS_PENDING_SYNC_KEY = '@naps_pending_sync';

const Naps: React.FC = () => {
  const router = useRouter();

  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [naps, setNaps] = useState<NapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handleQrScan = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        showToast('Camera permission denied', 'error');
        return;
      }
    }
    setScanned(false);
    setScannerOpen(true);
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannerOpen(false);

    // Extract last segment of URL as serial number
    const trimmed = data.replace(/\/+$/, '');
    const segments = trimmed.split('/');
    const serial = decodeURIComponent(segments[segments.length - 1]);

    if (!serial) {
      showToast('Could not read QR code', 'error');
      return;
    }

    // Find matching NAP by serial number
    const match = naps.find(n => n.serial_number === serial);
    if (match) {
      router.push(`/naps/${match.id}`);
    } else {
      // Not found — go to create with serial pre-filled
      router.push(`/naps/create?serial=${encodeURIComponent(serial)}`);
      showToast(`NAP not found — create new`, 'info');
    }
  };

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();
  }, []);

  // Load pending sync count
  const loadPendingCount = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
      const pending = raw ? JSON.parse(raw) : {};
      const ids = Object.keys(pending);
      setPendingCount(ids.length);
      setPendingIds(new Set(ids));
    } catch {}
  }, []);

  const fetchNaps = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(API.tech.naps(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Fetch failed');

      const data = await response.json();
      const fetchedNaps: NapItem[] = data.data || data;

      // Merge with pending local changes
      const pendingRaw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
      const pending: Record<string, string[]> = pendingRaw ? JSON.parse(pendingRaw) : {};

      const merged = fetchedNaps.map(nap => {
        if (pending[String(nap.id)]) {
          return { ...nap, tags: pending[String(nap.id)] };
        }
        return nap;
      });

      setNaps(merged);
      await AsyncStorage.setItem(NAPS_CACHE_KEY, JSON.stringify(merged));
    } catch {
      // Load from cache if fetch fails
      const cached = await AsyncStorage.getItem(NAPS_CACHE_KEY);
      if (cached) {
        setNaps(JSON.parse(cached));
        showToast('Loaded from cache (offline)', 'info');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadPendingCount();
    }
  }, [loadPendingCount]);

  useFocusEffect(useCallback(() => { fetchNaps(); }, [fetchNaps]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNaps();
  }, [fetchNaps]);

  // Manual sync
  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const pendingRaw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
      const pending: Record<string, string[]> = pendingRaw ? JSON.parse(pendingRaw) : {};
      const ids = Object.keys(pending);

      if (ids.length === 0) {
        showToast('Nothing to sync', 'info');
        setSyncing(false);
        return;
      }

      const token = await getToken();
      let successCount = 0;
      let failCount = 0;

      for (const napId of ids) {
        try {
          const res = await fetch(API.tech.napTags(napId), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tags: pending[napId] }),
          });

          if (res.ok) {
            delete pending[napId];
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      await AsyncStorage.setItem(NAPS_PENDING_SYNC_KEY, JSON.stringify(pending));
      loadPendingCount();

      if (failCount === 0) {
        showToast(`Synced ${successCount} NAP(s) successfully`, 'success');
      } else {
        showToast(`Synced ${successCount}, failed ${failCount}`, 'error');
      }
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  }, [loadPendingCount]);

  // Calculate distance in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (nap: NapItem): string => {
    if (!userLocation || !nap.latitude || !nap.longitude) return '';
    const dist = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(nap.latitude),
      parseFloat(nap.longitude)
    );
    if (dist < 1) return `${Math.round(dist * 1000)}m away`;
    return `${dist.toFixed(1)}km away`;
  };

  const filtered = search
    ? naps.filter(nap => {
        const q = search.toLowerCase();
        return (
          (nap.serial_number || '').toLowerCase().includes(q) ||
          (nap.address || '').toLowerCase().includes(q)
        );
      })
    : naps;

  const renderNap = ({ item: nap }: { item: NapItem }) => {
    const distance = formatDistance(nap);
    const isUnsynced = pendingIds.has(String(nap.id));

    return (
      <TouchableOpacity
        style={[styles.napCard, isUnsynced && styles.napCardUnsynced]}
        onPress={() => router.push(`/naps/${nap.id}`)}
      >
        <View style={styles.napHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={styles.napSerial}>{nap.serial_number}</Text>
            {isUnsynced && (
              <View style={styles.unsyncedBadge}>
                <Ionicons name="cloud-offline-outline" size={12} color="#E67E22" />
                <Text style={styles.unsyncedText}>Unsynced</Text>
              </View>
            )}
          </View>
          <View style={[styles.activeBadge, { backgroundColor: nap.active ? '#EAFAF1' : '#F2F4F4' }]}>
            <View style={[styles.activeDot, { backgroundColor: nap.active ? '#27AE60' : '#999' }]} />
            <Text style={[styles.activeText, { color: nap.active ? '#27AE60' : '#999' }]}>
              {nap.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.napInfo}>
          <View style={styles.napInfoRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{nap.type?.toUpperCase()}</Text>
            </View>
            <View style={styles.splitterBadge}>
              <Ionicons name="git-network-outline" size={14} color={Colors.primary} />
              <Text style={styles.splitterText}>{nap.splitter_type}</Text>
            </View>
            <View style={styles.tagCountBadge}>
              <Ionicons name="pricetag-outline" size={14} color="#718096" />
              <Text style={styles.tagCountText}>
                {nap.tags.filter(t => t && t.trim() !== '').length}/{nap.tags.length}
              </Text>
            </View>
          </View>

          {nap.address ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.addressText} numberOfLines={1}>{nap.address}</Text>
            </View>
          ) : null}

          {distance ? (
            <View style={styles.distanceRow}>
              <Ionicons name="navigate-outline" size={14} color={Colors.primary} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>Naps</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* QR Scan button */}
            <TouchableOpacity onPress={handleQrScan} style={styles.iconButton}>
              <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>

            {/* Add NAP button */}
            <TouchableOpacity onPress={() => router.push('/naps/create')} style={styles.iconButton}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>

            {/* Sync button */}
            <TouchableOpacity onPress={handleSync} disabled={syncing} style={styles.iconButton}>
              {syncing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
                  {pendingCount > 0 && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Refresh button */}
            <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.iconButton}>
              {refreshing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            {/* Search */}
            {searchVisible ? (
              <View style={styles.inlineSearch}>
                <Ionicons name="search-outline" size={16} color="#888" />
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Search serial..."
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                />
                <TouchableOpacity onPress={() => { setSearch(''); setSearchVisible(false); }}>
                  <Ionicons name="close" size={16} color="#888" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.iconButton} onPress={() => setSearchVisible(true)}>
                <Ionicons name="search-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={filtered}
        renderItem={renderNap}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>No NAPs found</Text>}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* QR Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide">
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerOpen(false)} style={{ padding: 5 }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan NAP QR Code</Text>
            <View style={{ width: 40 }} />
          </View>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
          />
          <View style={styles.scannerHint}>
            <Text style={styles.scannerHintText}>
              Point your camera at the NAP QR code
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  iconButton: {
    padding: 6,
  },
  pendingBadge: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 4,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  inlineSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    width: 180,
  },
  inlineInput: {
    flex: 1,
    marginHorizontal: 6,
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 40,
  },
  napCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  napCardUnsynced: {
    borderColor: '#E67E22',
    borderLeftWidth: 4,
  },
  unsyncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF5E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unsyncedText: {
    fontSize: 10,
    color: '#E67E22',
    fontWeight: '700',
  },
  napHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  napSerial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  napInfo: {
    gap: 6,
  },
  napInfoRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  splitterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF9F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  splitterText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  tagCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagCountText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerHint: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  scannerHintText: {
    color: '#ccc',
    fontSize: 14,
  },
});

export default Naps;
