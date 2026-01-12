import { useRouter } from 'expo-router'; // Import useRouter
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const IndexScreen = () => {
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState('');
  const appName = "KAZIBUFASTNET\n    TECHNICAL";

  const [index, setIndex] = useState(0);

  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Very slow and smooth logo pop-up (2 seconds)
    Animated.parallel([
      // Scale animation - very slow (2 seconds) with custom easing
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Custom smooth easing
        useNativeDriver: true,
      }),
      // Opacity animation - slow fade in (1.5 seconds)
      Animated.timing(logoOpacityAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    // Start typing after logo has mostly appeared
    const typingDelay = setTimeout(() => {
      if (index < appName.length) {
        const timer = setTimeout(() => {
          setText(prev => prev + appName[index]);
          setIndex(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      }
    }, 10); 

   
    const navigationTimer = setTimeout(() => {
      router.push('/login'); 
    }, 1000); 

    return () => {
      clearTimeout(typingDelay);
      clearTimeout(navigationTimer); 
    };
  }, [index, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: logoScaleAnim }], opacity: logoOpacityAnim }]}>
          <Image
            source={require("../../assets/images/kzbu.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.name}>{text}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "ios" ? 35 : 30,
  },
  container: {
    flex: 1,
    justifyContent: 'center',  // Center vertically
    alignItems: 'center',      // Center horizontally
    paddingHorizontal: 20,     // Added horizontal padding to avoid text clipping
  },
  logoWrapper: {
    marginBottom: 50,
  },
  logo: {
    width: 280,  // Even bigger logo
    height: 280, // Even bigger logo
  },
  name: {
    fontSize: 20,  // Larger text
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    top: 20,  // Adjusted for better vertical positioning
  },
});

export default IndexScreen;
