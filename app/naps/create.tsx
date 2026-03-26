import { API } from '@/constants/api';
import { getToken } from '@/scripts/token';
import { showToast } from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLITTER_OPTIONS = ['1:4', '1:8', '1:16', '1:32'];
const TYPE_OPTIONS = ['plc', 'fbt'];

export default function CreateNap() {
  const router = useRouter();
  const { serial } = useLocalSearchParams<{ serial?: string }>();

  const [saving, setSaving] = useState(false);
  const [serialNumber, setSerialNumber] = useState(serial || '');
  const [type, setType] = useState('plc');
  const [splitterType, setSplitterType] = useState('1:8');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
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

    // Extract last segment of URL as serial number
    const trimmed = data.replace(/\/+$/, '');
    const segments = trimmed.split('/');
    const serial = segments[segments.length - 1];

    if (serial) {
      setSerialNumber(decodeURIComponent(serial));
      showToast(`Serial: ${decodeURIComponent(serial)}`, 'success');
    } else {
      showToast('Could not extract serial number', 'error');
    }

    setScannerOpen(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push('/(tech-tabs)/naps');
  };

  const useCurrentLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission denied', 'error');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(String(loc.coords.latitude));
      setLongitude(String(loc.coords.longitude));
      showToast('Location captured', 'success');
    } catch {
      showToast('Failed to get location', 'error');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!serialNumber.trim()) {
      showToast('Serial number is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(API.tech.storeNap(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serial_number: serialNumber.trim(),
          type,
          splitter_type: splitterType,
          latitude: latitude || null,
          longitude: longitude || null,
          address: address.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('NAP created successfully', 'success');
        router.back();
      } else {
        showToast(data.message || 'Failed to create NAP', 'error');
      }
    } catch {
      showToast('Network error — check your connection', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add NAP</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            {/* Serial Number */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Serial Number *</Text>
                <TouchableOpacity onPress={handleQrScan} style={styles.qrButton}>
                  <Ionicons name="qr-code-outline" size={16} color="#00afa1" />
                  <Text style={styles.qrButtonText}>Scan QR</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="e.g. NAP-20240301-001"
                placeholderTextColor="#ccc"
                autoCapitalize="characters"
              />
            </View>

            {/* Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Type *</Text>
              <View style={styles.chipRow}>
                {TYPE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, type === opt && styles.chipActive]}
                    onPress={() => setType(opt)}
                  >
                    <Text style={[styles.chipText, type === opt && styles.chipTextActive]}>
                      {opt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Splitter Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Splitter Type *</Text>
              <View style={styles.chipRow}>
                {SPLITTER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, splitterType === opt && styles.chipActive]}
                    onPress={() => setSplitterType(opt)}
                  >
                    <Text style={[styles.chipText, splitterType === opt && styles.chipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Address */}
            <View style={styles.field}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. Blk 5 Lot 12, Sunrise Village"
                placeholderTextColor="#ccc"
              />
            </View>

            {/* Location */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>GPS Location</Text>
                <TouchableOpacity onPress={useCurrentLocation} disabled={gpsLoading} style={styles.gpsButton}>
                  {gpsLoading ? (
                    <ActivityIndicator size="small" color="#00afa1" />
                  ) : (
                    <>
                      <Ionicons name="locate-outline" size={16} color="#00afa1" />
                      <Text style={styles.gpsButtonText}>Use Current</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.coordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="Latitude"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="Longitude"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Mounted on pole near gate"
                placeholderTextColor="#ccc"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
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
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Create NAP</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide">
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerOpen(false)} style={styles.backButton}>
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
  content: { padding: 16, paddingBottom: 40 },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D3748',
  },
  textArea: {
    minHeight: 80,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  chipActive: {
    backgroundColor: '#00afa1',
    borderColor: '#00afa1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsButtonText: {
    fontSize: 13,
    color: '#00afa1',
    fontWeight: '600',
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
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrButtonText: {
    fontSize: 13,
    color: '#00afa1',
    fontWeight: '600',
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
