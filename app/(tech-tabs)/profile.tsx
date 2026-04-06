import { showToast } from '@/components/Toast';
import {
  API,
  API_ENVIRONMENTS,
  getApiBaseUrl,
  getCurrentEnvironment,
  setApiBaseUrl,
} from '@/constants/api';
import { getToken } from '@/scripts/token';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { setToken } from '../../scripts/token';
import { getUser, setUser } from '../../scripts/user';

const Profile: React.FC = () => {
  const router = useRouter();
  const user = getUser();

  const [timedIn, setTimedIn] = useState<boolean | null>(null);

  const checkAttendance = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(API.tech.attendanceStatus(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTimedIn(data.timed_in);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { checkAttendance(); }, [checkAttendance]));

  const [envModalVisible, setEnvModalVisible] = useState(false);
  const [currentEnv, setCurrentEnv] = useState(getCurrentEnvironment());
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/(auth)/login');
  };

  const handleLogoTap = () => {
    tapCount.current += 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 10) {
      tapCount.current = 0;
      setCurrentEnv(getCurrentEnvironment());
      setEnvModalVisible(true);
      return;
    }

    // Reset after 2 seconds of inactivity
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);
  };

  const switchEnvironment = async (url: string) => {
    await setApiBaseUrl(url);
    setCurrentEnv(getCurrentEnvironment());
    setEnvModalVisible(false);

    // Clear session since the backend changed
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['token', 'user']);

    showToast(`Switched to ${getCurrentEnvironment()}. Please log in again.`, 'info');
    router.replace('/(auth)/login');
  };

  const envOptions = [
    {
      label: 'Development',
      sublabel: API_ENVIRONMENTS.development,
      url: API_ENVIRONMENTS.development,
      color: '#F39C12',
    },
    {
      label: 'Production',
      sublabel: API_ENVIRONMENTS.production,
      url: API_ENVIRONMENTS.production,
      color: '#27AE60',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleLogoTap}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/images/kazi.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.mobile_number || ''}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/ProfileSettings/AccountSettings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/ProfileSettings/PrivacySecurity')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/ProfileSettings/HelpSupport')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/ProfileSettings/AboutKazibufast')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.settingText}>About Kazibufast</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>

            <TouchableOpacity style={styles.termsItem} onPress={() => router.push('/ProfileSettings/PrivacyPolicy')}>
              <Text style={styles.termsText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.termsItem} onPress={() => router.push('/ProfileSettings/TermsOfService')}>
              <Text style={styles.termsText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {timedIn === false && (
            <TouchableOpacity
              style={styles.timeInButton}
              onPress={() => router.push('/(time-in)/time-in')}
            >
              <Ionicons name="stopwatch-outline" size={20} color="#fff" />
              <Text style={styles.timeInText}>Time In</Text>
            </TouchableOpacity>
          )}

          {timedIn === true && (
            <TouchableOpacity
              style={styles.timeOutButton}
              onPress={() => router.push('/(time-out)/time-out')}
            >
              <Ionicons name="stopwatch-outline" size={20} color="#fff" />
              <Text style={styles.timeOutText}>Time Out</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Environment Switcher Modal */}
      <Modal
        visible={envModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEnvModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="code-slash" size={24} color="#00afa1" />
              <Text style={styles.modalTitle}>Developer Options</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Current: <Text style={{ fontWeight: '700' }}>{currentEnv}</Text>
            </Text>
            <Text style={styles.modalUrl}>{getApiBaseUrl()}</Text>

            <View style={styles.envOptions}>
              {envOptions.map((opt) => {
                const isActive = getApiBaseUrl() === opt.url;
                return (
                  <TouchableOpacity
                    key={opt.url}
                    style={[
                      styles.envOption,
                      isActive && { borderColor: opt.color, backgroundColor: opt.color + '10' },
                    ]}
                    onPress={() => !isActive && switchEnvironment(opt.url)}
                    disabled={isActive}
                  >
                    <View style={styles.envOptionHeader}>
                      <View style={[styles.envDot, { backgroundColor: opt.color }]} />
                      <Text style={[styles.envLabel, isActive && { color: opt.color }]}>
                        {opt.label}
                      </Text>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={18} color={opt.color} />
                      )}
                    </View>
                    <Text style={styles.envUrl}>{opt.sublabel}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setEnvModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00afa1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  termsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 15,
    color: '#333',
  },
  timeInButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 15,
    backgroundColor: '#27AE60',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  timeInText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeOutButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 15,
    backgroundColor: '#F39C12',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  timeOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 15,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalUrl: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  envOptions: {
    gap: 12,
    marginBottom: 20,
  },
  envOption: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  envOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  envDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  envLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  envUrl: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginLeft: 18,
  },
  modalClose: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default Profile;
