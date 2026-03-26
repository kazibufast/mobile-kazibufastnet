import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { showToast } from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

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

export default function NapDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nap, setNap] = useState<NapItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const napId = Array.isArray(id) ? id[0] : id;

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

  const getMapHtml = (napLat: string, napLng: string) => {
    const userLat = userLocation?.latitude;
    const userLng = userLocation?.longitude;
    const hasUser = userLat && userLng;

    return `
<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
<style>
  html, body, #map { margin:0; padding:0; width:100%; height:100%; }
  .leaflet-routing-container { display:none !important; }
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
<script>
  var map = L.map('map').setView([${napLat}, ${napLng}], ${hasUser ? 14 : 18});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  var napIcon = L.divIcon({
    html: '<div style="background:#00afa1;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [20, 20], iconAnchor: [10, 10], className: ''
  });
  L.marker([${napLat}, ${napLng}], {icon: napIcon}).addTo(map).bindPopup('NAP Location').openPopup();

  ${hasUser ? `
  var userIcon = L.divIcon({
    html: '<div style="background:#3498DB;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [20, 20], iconAnchor: [10, 10], className: ''
  });
  L.marker([${userLat}, ${userLng}], {icon: userIcon}).addTo(map).bindPopup('Your Location');

  L.Routing.control({
    waypoints: [
      L.latLng(${userLat}, ${userLng}),
      L.latLng(${napLat}, ${napLng})
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions: {
      styles: [{ color: '#3498DB', weight: 5, opacity: 0.8 }],
      extendToWaypoints: true,
      missingRouteTolerance: 0
    },
    show: false,
    createMarker: function() { return null; }
  }).addTo(map);

  map.fitBounds([[${userLat}, ${userLng}], [${napLat}, ${napLng}]], { padding: [40, 40] });
  ` : ''}
</script>
</body></html>`;
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push('/(tech-tabs)/naps');
  };

  const getPortCount = (splitterType: string): number => {
    const match = splitterType?.match(/:(\d+)/);
    return match ? parseInt(match[1], 10) : 8;
  };

  const loadNap = useCallback(async () => {
    setRefreshing(true);
    try {
      // Try fetching from API first
      const token = await getToken();
      const response = await fetch(`${API.tech.naps()}/${napId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const napData: NapItem = data.data || data;
        setNap(napData);

        // Check for pending local tags
        const pendingRaw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
        const pending: Record<string, string[]> = pendingRaw ? JSON.parse(pendingRaw) : {};

        if (pending[String(napData.id)]) {
          setTags(pending[String(napData.id)]);
        } else {
          const portCount = getPortCount(napData.splitter_type);
          const existingTags = napData.tags || [];
          setTags([...existingTags, ...Array(Math.max(0, portCount - existingTags.length)).fill('')]);
        }
        return;
      }
    } catch {}

    // Fallback: load from cache
    try {
      const cached = await AsyncStorage.getItem(NAPS_CACHE_KEY);
      if (cached) {
        const allNaps: NapItem[] = JSON.parse(cached);
        const found = allNaps.find(n => String(n.id) === napId);
        if (found) {
          setNap(found);
          const portCount = getPortCount(found.splitter_type);
          const existingTags = found.tags || [];
          setTags([...existingTags, ...Array(Math.max(0, portCount - existingTags.length)).fill('')]);
        }
      }
    } catch {}

    setRefreshing(false);
  }, [napId]);

  useEffect(() => { loadNap(); }, [loadNap]);

  // Update refreshing state when nap loads
  useEffect(() => {
    if (nap) setRefreshing(false);
  }, [nap]);

  const handleTagChange = (index: number, value: string) => {
    setTags(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!nap) return;
    setSaving(true);

    // Always save to local storage first
    try {
      const pendingRaw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
      const pending: Record<string, string[]> = pendingRaw ? JSON.parse(pendingRaw) : {};
      pending[String(nap.id)] = tags;
      await AsyncStorage.setItem(NAPS_PENDING_SYNC_KEY, JSON.stringify(pending));

      // Update cache too
      const cachedRaw = await AsyncStorage.getItem(NAPS_CACHE_KEY);
      if (cachedRaw) {
        const allNaps: NapItem[] = JSON.parse(cachedRaw);
        const idx = allNaps.findIndex(n => n.id === nap.id);
        if (idx >= 0) {
          allNaps[idx] = { ...allNaps[idx], tags };
          await AsyncStorage.setItem(NAPS_CACHE_KEY, JSON.stringify(allNaps));
        }
      }
    } catch {}

    // Attempt API sync
    try {
      const token = await getToken();
      const res = await fetch(API.tech.napTags(nap.id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      });

      if (res.ok) {
        // Remove from pending queue on success
        const pendingRaw = await AsyncStorage.getItem(NAPS_PENDING_SYNC_KEY);
        const pending: Record<string, string[]> = pendingRaw ? JSON.parse(pendingRaw) : {};
        delete pending[String(nap.id)];
        await AsyncStorage.setItem(NAPS_PENDING_SYNC_KEY, JSON.stringify(pending));
        showToast('Tags saved successfully', 'success');
      } else {
        showToast('Saved locally — will sync later', 'info');
      }
    } catch {
      showToast('Saved locally — will sync when online', 'info');
    } finally {
      setSaving(false);
    }
  };

  if (!nap) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00afa1" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  const portCount = getPortCount(nap.splitter_type);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {nap.serial_number}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: 76 + (insets.bottom || 16) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadNap} tintColor="#00afa1" />
          }
        >
          {/* NAP Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NAP Information</Text>

            <View style={styles.row}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>SERIAL NUMBER</Text>
                <Text style={styles.cardValue}>{nap.serial_number}</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>TYPE</Text>
                <Text style={styles.cardValue}>{nap.type?.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>SPLITTER TYPE</Text>
                <Text style={styles.cardValue}>{nap.splitter_type}</Text>
              </View>
              <View style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardLabel}>STATUS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.statusDot, { backgroundColor: nap.active ? '#27AE60' : '#999' }]} />
                  <Text style={styles.cardValue}>{nap.active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
            </View>

            {nap.address ? (
              <View style={styles.fullCard}>
                <Text style={styles.cardLabel}>ADDRESS</Text>
                <Text style={styles.cardValue}>{nap.address}</Text>
              </View>
            ) : null}

            {nap.notes ? (
              <View style={[styles.fullCard, { marginTop: 10 }]}>
                <Text style={styles.cardLabel}>NOTES</Text>
                <Text style={styles.notesText}>{nap.notes}</Text>
              </View>
            ) : null}
          </View>

          {/* Map */}
          {nap.latitude && nap.longitude ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location on Map</Text>
              <WebView
                key={`${refreshing}-${userLocation?.latitude}`}
                originWhitelist={['*']}
                source={{ html: getMapHtml(nap.latitude, nap.longitude) }}
                style={styles.webview}
                javaScriptEnabled
              />
            </View>
          ) : null}

          {/* Tag Inputs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Tag Numbers ({portCount} ports)
            </Text>
            <View style={styles.tagGrid}>
              {Array.from({ length: portCount }).map((_, index) => (
                <View key={index} style={styles.tagInputContainer}>
                  <Text style={styles.tagLabel}>Port {index + 1}</Text>
                  <TextInput
                    style={styles.tagInput}
                    value={tags[index] || ''}
                    onChangeText={(value) => handleTagChange(index, value)}
                    placeholder="Tag #"
                    keyboardType="numeric"
                    maxLength={6}
                    placeholderTextColor="#ccc"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Tags</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#00AF9F',
    paddingTop: 35,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  backButton: {
    padding: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  card: {
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 70,
    justifyContent: 'center',
  },
  halfCard: {
    flex: 1,
  },
  fullCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  notesText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  webview: {
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagInputContainer: {
    width: '47%',
  },
  tagLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 4,
  },
  tagInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  saveButton: {
    backgroundColor: '#00afa1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
