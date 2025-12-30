import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const scaleSize = (size: number) => {
  const scale = width / 375;
  return Math.round(size * scale);
};

const Header: React.FC = () => {
  const responsive = {
    height: Platform.OS === 'ios' ? scaleSize(100) : scaleSize(80),
    logoSize: scaleSize(60),
    iconSize: scaleSize(28),
    padding: scaleSize(16),
  };

  const [notificationModalVisible, setNotificationModalVisible] = React.useState(false);

  const supportInfo = {
    facebookPage: 'https://www.facebook.com/messages/t/116319363610666',
    phoneNumber: '+9505358971',
  };

  const handleFacebookRedirect = () => {
    Linking.openURL(supportInfo.facebookPage).catch(() => {
      Alert.alert('Error', 'Could not open Facebook Messenger.');
    });
  };

  const handleCallSupport = async () => {
    const phoneUrl = `tel:${supportInfo.phoneNumber}`;

    try {
      const canMakeCalls = await Linking.canOpenURL(phoneUrl);

      if (canMakeCalls) {
        Alert.alert(
          'Call Support',
          `Do you want to call ${supportInfo.phoneNumber}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call',
              onPress: async () => {
                try {
                  await Linking.openURL(phoneUrl);
                } catch {
                  showPhoneFallback();
                }
              }
            }
          ]
        );
      } else {
        showPhoneFallback();
      }
    } catch {
      showPhoneFallback();
    }
  };

  const showPhoneFallback = () => {
    Alert.alert(
      'Call Support',
      `Device cannot make calls.\n\nSupport Number: ${supportInfo.phoneNumber}`,
      [
        {
          text: 'Copy Number',
          onPress: async () => {
            await Clipboard.setStringAsync(supportInfo.phoneNumber);
            Alert.alert('Copied', 'Phone number copied!');
          }
        },
        {
          text: 'Open Dialer',
          onPress: () => {
            const dialerUrl = Platform.select({
              ios: `telprompt:${supportInfo.phoneNumber}`,
              android: `tel:${supportInfo.phoneNumber}`,
            });

            if (dialerUrl) {
              Linking.openURL(dialerUrl).catch(() =>
                Alert.alert('Error', 'Cannot open dialer.')
              );
            }
          }
        },
        { text: 'OK' }
      ]
    );
  };


  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={[styles.headerContainer, { height: responsive.height }]}>

          <Pressable onPress={() => router.push('/home')}>
            <Image
              source={require("../assets/images/kazi.png")}
              style={[styles.logo, { width: responsive.logoSize, height: responsive.logoSize }]}
              resizeMode="contain"
            />
          </Pressable>

          <View style={[styles.header, { gap: responsive.padding }]}>

            {/* <Pressable onPress={() => setNotificationModalVisible(true)}>
              <Image
                source={require("../assets/icons/notifications.png")}
                style={{ width: responsive.iconSize, height: responsive.iconSize }}
                resizeMode="contain"
              />
            </Pressable> */}

            <Pressable onPress={handleCallSupport}>
              <Image
                source={require("../assets/icons/call.png")}
                style={{ width: responsive.iconSize, height: responsive.iconSize }}
                resizeMode="contain"
              />
            </Pressable>

            {/* FACEBOOK */}
            <Pressable onPress={handleFacebookRedirect}>
              <Image
                source={require("../assets/icons/fb.png")}
                style={{ width: responsive.iconSize, height: responsive.iconSize }}
                resizeMode="contain"
              />
            </Pressable>

          </View>
        </View>
      </SafeAreaView>

    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0C1824',
   
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C1824',
    paddingHorizontal: 16,
    padding: 25,
    justifyContent: 'space-between',

  },
  header: {
    flexDirection: 'row',
    marginRight: 10,
  },
  logo: {
    marginLeft: 5,
  },
});

export default Header;
