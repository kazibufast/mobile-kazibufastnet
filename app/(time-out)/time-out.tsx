import { getToken } from '@/scripts/token';
import { getUser } from '@/scripts/user';
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraCapturedPicture, CameraType, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const scaleSize = (size: number) => {
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * Math.min(scale, 1.3));
};

interface Technician {
  id: string;
  name: string;
  user_type: string;
}

export default function TimeInScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [locationText, setLocationText] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionMessage, setPermissionMessage] = useState('');

  const cameraRef = useRef<CameraView | null>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [facing, setFacing] = useState<CameraType>('back');

  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for Time out button
  useEffect(() => {
    if (photo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [photo]);

  // Clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user & location
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = getUser();
        setTechnician(user);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationText('Location permission denied.');
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocationCoords({ latitude: lat, longitude: lon });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'User-Agent': 'expo-app' } }
        );
        const data = await res.json();
        const addr = data.address || {};
        let text = '';
        if (addr.suburb || addr.neighbourhood || addr.hamlet) text += `Barangay ${addr.suburb || addr.neighbourhood || addr.hamlet}, `;
        if (addr.city || addr.town || addr.village) text += `${addr.city || addr.town || addr.village}, `;
        if (addr.state) text += `${addr.state}`;
        setLocationText(text || 'Location not found.');

        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          setPermissionMessage('Camera permission denied.');
          setHasPermission(false);
        } else {
          setPermissionMessage('Camera permission granted.');
          setHasPermission(true);
        }
      } catch (error) {
        setLocationText('Unable to retrieve location.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    const options = { quality: 0.8, base64: true };
    const takenPhoto: CameraCapturedPicture = await cameraRef.current.takePictureAsync(options);
    setPhoto(takenPhoto);
    setShowCamera(false);
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  const toggleCameraFacing = () => setFacing(f => (f === 'back' ? 'front' : 'back'));

  const handleTimeIn = async () => {
    if (!locationCoords || !photo) {
      Alert.alert('Error', 'Missing location or picture.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`https://tub.kazibufastnet.com/api/tech/time_out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: locationCoords,
          time: new Date().toISOString(),
          picture: photo.base64,
        }),
      });

      if (res.ok) {
        Alert.alert('Success', 'Time Out recorded successfully!');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        const err = await res.json();
        Alert.alert('Error', 'Failed to submit Time Out. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00AFA1" />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0C1824" barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >


        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle" size={scaleSize(50)} color="#00AFA1" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{technician?.name?.toUpperCase() || 'Technician Name'}</Text>
            <Text style={styles.profileRole}>{technician?.user_type?.toUpperCase() || 'Technician'}</Text>
          </View>
        </View>

        {/* Date & Time Card */}
        <View style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <MaterialIcons name="access-time" size={24} color="#00AFA1" />
            <Text style={styles.timeHeaderText}>Current Time</Text>
          </View>
          <View style={styles.timeContent}>
            <Text style={styles.timeText}>{currentTime}</Text>
            <Text style={styles.dateText}>{currentDate?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location-sharp" size={24} color="#00AFA1" />
            <Text style={styles.locationHeaderText}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>{locationText?.toUpperCase()}</Text>
          {locationCoords && (
            <Text style={styles.coordinatesText}>
              {locationCoords.latitude.toFixed(6)}, {locationCoords.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Camera Section */}
        {showCamera ? (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Take Attendance Photo</Text>
              <Text style={styles.cameraSubtitle}>Make sure your face is visible</Text>
            </View>
            <View style={styles.cameraWrapper}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                ratio="16:9"
              >
                <View style={styles.cameraOverlay}>
                  <View style={styles.faceGuide} />
                </View>
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    onPress={toggleCameraFacing}
                    style={styles.cameraControlButton}
                  >
                    <Ionicons name="camera-reverse" size={28} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={styles.captureButton}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                  <View style={{ width: 60 }} />
                </View>
              </CameraView>
            </View>
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : photo ? (
          <View style={styles.photoContainer}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoTitle}>Photo Preview</Text>
              <Text style={styles.photoSubtitle}>Check if the photo is clear</Text>
            </View>
            <Image
              source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
              style={styles.photoPreview}
            />
            <View style={styles.photoActions}>
              <TouchableOpacity
                onPress={handleRetakePhoto}
                style={[styles.actionButton, styles.retakeButton]}
              >
                <Fontisto name="trash" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTimeIn}
                disabled={isSubmitting}
                style={[styles.actionButton, styles.submitButton]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Time Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.photoPrompt}>
            <View style={styles.photoPromptHeader}>
              <Ionicons name="camera-outline" size={32} color="#00AFA1" />
              <Text style={styles.photoPromptTitle}>Attendance Photo Required</Text>
            </View>
            <Text style={styles.photoPromptText}>
              Take a clear photo of yourself for attendance verification. Make sure your face is visible.
            </Text>
            <TouchableOpacity
              onPress={() => setShowCamera(true)}
              style={styles.takePhotoButton}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.takePhotoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}

       
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C1824',
  },
  scrollContainer: {
    paddingHorizontal: scaleSize(20),
    paddingBottom: 40,
    paddingTop: 45
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C1824'
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: scaleSize(16),
    opacity: 0.8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A2C3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: scaleSize(20),
    fontWeight: '700',
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2C3A',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,

  },
  profileIconContainer: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: scaleSize(18),
    fontWeight: '700',
    marginBottom: 4,
  },
  profileRole: {
    color: '#00AFA1',
    fontSize: scaleSize(14),
    fontWeight: '600',
    opacity: 0.9,
  },

  // Time Card
  timeCard: {
    backgroundColor: '#1A2C3A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeHeaderText: {
    color: '#00AFA1',
    fontSize: scaleSize(16),
    fontWeight: '600',
    marginLeft: 10,
  },
  timeContent: {
    alignItems: 'flex-start',
  },
  timeText: {
    color: '#fff',
    fontSize: scaleSize(32),
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  dateText: {
    color: '#B0BEC5',
    fontSize: scaleSize(14),
    textAlign: 'center',
    opacity: 0.8,
  },

  // Location Card
  locationCard: {
    backgroundColor: '#1A2C3A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationHeaderText: {
    color: '#00AFA1',
    fontSize: scaleSize(16),
    fontWeight: '600',
    marginLeft: 10,
  },
  locationText: {
    color: '#fff',
    fontSize: scaleSize(14),
    lineHeight: 20,
    marginBottom: 10,
  },
  coordinatesText: {
    color: '#B0BEC5',
    fontSize: scaleSize(12),
    fontFamily: 'monospace',
    opacity: 0.7,
  },

  // Camera Container
  cameraContainer: {
    marginBottom: 20,
  },
  cameraHeader: {
    marginBottom: 15,
  },
  cameraTitle: {
    color: '#fff',
    fontSize: scaleSize(18),
    fontWeight: '600',
    marginBottom: 5,
  },
  cameraSubtitle: {
    color: '#B0BEC5',
    fontSize: scaleSize(14),
  },
  cameraWrapper: {
    height: 350,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraControlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: scaleSize(16),
    fontWeight: '600',
  },

  // Photo Container
  photoContainer: {
    marginBottom: 20,
  },
  photoHeader: {
    marginBottom: 15,
  },
  photoTitle: {
    color: '#fff',
    fontSize: scaleSize(18),
    fontWeight: '600',
    marginBottom: 5,
  },
  photoSubtitle: {
    color: '#B0BEC5',
    fontSize: scaleSize(14),
  },
  photoPreview: {
    width: '100%',
    height: 350,
    borderRadius: 15,
    marginBottom: 15,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  retakeButton: {
    backgroundColor: '#D32F2F',
  },
  submitButton: {
    backgroundColor: '#00AFA1',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: scaleSize(16),
    fontWeight: '600',
  },

  // Photo Prompt
  photoPrompt: {
    backgroundColor: '#1A2C3A',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  photoPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  photoPromptTitle: {
    color: '#fff',
    fontSize: scaleSize(18),
    fontWeight: '600',
    marginLeft: 15,
  },
  photoPromptText: {
    color: '#B0BEC5',
    fontSize: scaleSize(14),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00AFA1',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
    width: '100%',
  },
  takePhotoButtonText: {
    color: '#fff',
    fontSize: scaleSize(16),
    fontWeight: '700',
  },

});