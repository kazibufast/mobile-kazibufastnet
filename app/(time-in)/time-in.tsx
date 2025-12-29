import Camera from "@/components/Camera";
import { getToken } from "@/scripts/token";
import { getUser } from "@/scripts/user";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const scaleSize = (size: number) => {
    const baseWidth = 375;
    const scale = width / baseWidth;
    return Math.round(size * Math.min(scale, 1.3));
};

export default function TimeInScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isClocking, setIsClocking] = useState(false);
    const [technician, setTechnician] = useState<any>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [isPictureTaken, setIsPictureTaken] = useState(false);

    const { id } = useLocalSearchParams<{ id: string }>();

    const [time, setTime] = useState<Date>(new Date());   // Set current time
    const [picture, setPicture] = useState<string>('');
    const [locationText, setLocationText] = useState<string>("");




    // Start pulse animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Update current time and date every second
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            // Update time
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            setCurrentTime(timeString);

            // Update date
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            setCurrentDate(dateString);
        };

        updateDateTime(); // Initial call
        const timer = setInterval(updateDateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            // Get technician data from storage
            const userJson = await AsyncStorage.getItem('user');
            const user = getUser();

            if (user) {
                setTechnician(user);

                // Check if technician has already clocked in
                const timeInStatus = await AsyncStorage.getItem('time_in_status');
                setIsClockedIn(timeInStatus === 'true');
            }


        } catch (error) {
            console.error('Error loading initial data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const getLocation = async () => {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setLocationText("Location permission denied.");
            return;
        }

        try {
            // Get current position
            const position = await Location.getCurrentPositionAsync({});
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Reverse geocoding via OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

            const response = await fetch(url, {
                headers: {
                    // Required by Nominatim usage policy
                    "User-Agent": "expo-app",
                },
            });

            const data = await response.json();
            const addr = data.address || {};

            const barangay =
                addr.suburb ||
                addr.neighbourhood ||
                addr.hamlet ||
                addr.quarter ||
                addr.city_district ||
                "";

            const city =
                addr.city ||
                addr.town ||
                addr.municipality ||
                addr.village ||
                "";

            const province = addr.state || "";

            let text = "";
            if (barangay) text += `Barangay ${barangay}, `;
            if (city) text += `${city}, `;
            if (province) text += `${province}`;

            setLocationText(text || "Location not found.");
        } catch (error) {
            setLocationText("Unable to retrieve location.");
        }
    };
    useEffect(() => {
        if (location) {
            getLocation();
        }
    }, [location]);




    const handleCapture = async (cameraRef: any) => {
        if (cameraRef.current) {
            const options = {
                quality: 1,  // High quality
                base64: true,  // Get base64 string of the photo
                exif: false,  // Don't include EXIF data
            };

            // Capture photo and store in the state
            const photo = await cameraRef.current.takePictureAsync(options);
            setPicture(photo.base64);  // Set the captured photo's base64 string to the state
            setShowCamera(false);  // Close camera after taking the picture
        }
    };



    const handleTakePicture = (): void => {
        Alert.alert(
            'Take Picture',
            'This feature will open the camera to take a photo for verification.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Camera',
                    onPress: () => {
                        setShowCamera(true);  // Show the camera
                        setIsPictureTaken(true);  // Make sure the picture hasn't been taken yet when opening the camera
                    }

                },
            ]
        );
    };


    useEffect(() => {
        if (location) {
            getLocation();
        }
    }, [location]);



    useEffect(() => {
        if (picture) {
            console.log('Picture updated:', picture); // Check if the picture is updated correctly
        }
    }, [picture]);


    const handleTimein = async (location: { latitude: number; longitude: number }) => {
        const url = `https://staging.kazibufastnet.com/api/tech/time_in/${technician?.id}`;

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: location,
                    time: new Date().toISOString(),

                }),
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Time In successful:', responseData);

                setIsPictureTaken(false);
                // Redirect to the tickets page after success
                router.push('/(tech-tabs)/home');
            } else {
                const errorData = await response.json();
                console.error('Error in Time In request:', errorData);
                Alert.alert('Error', 'Failed to submit time in request.');
            }
        } catch (error) {
            console.error('Failed to send Time In request:', error);
            Alert.alert('Error', 'There was an error processing your request.');
        }
    };

    // Handle the button press to send the request
    const handleTimeIn = async () => {


        if (!location) {
            Alert.alert('Missing Location.');
            return;
        }

        await handleTimein(location);
        setIsPictureTaken(false);
    };

    const handlePictureTaken = () => {
        setIsPictureTaken(true);
        setShowCamera(false);
    };

    const renderLocationCard = () => {
        return (
            <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                    <Ionicons name="location" size={scaleSize(20)} color="#00AFA1" />
                    <Text style={styles.locationTitle}>CURRENT LOCATION</Text>
                    
                </View>

                <View style={styles.locationCurrent}>
                    {locationText ? (
                        <View style={{ flex: 1 }}>
                            <Text  numberOfLines={1} ellipsizeMode="tail" style={{ color: "#00AFA1", fontSize: 14, fontWeight: "600" }}>
                                {locationText}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <ActivityIndicator size="small" color="#00AFA1" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#999", fontSize: 12 }}>
                                Getting your location...
                            </Text>
                        </View>
                    )}
                </View>

            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="#0C1824" barStyle="light-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00AFA1" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#0C1824" barStyle="light-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.container}>
                    {/* Header with Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={loadInitialData}
                        >
                            <Ionicons name="refresh" size={scaleSize(20)} color="#00AFA1" />
                        </TouchableOpacity>
                    </View>

                    {/* Technician Info */}
                    <View style={styles.technicianInfoContainer}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle" size={scaleSize(60)} color="#00AFA1" />
                        </View>
                        <View style={styles.technicianDetails}>
                            <Text style={styles.technicianName}>
                                {technician?.name || 'Technician Name'}
                            </Text>
                            <Text style={styles.technicianRole}>
                                {technician?.user_type || 'Technician'}
                            </Text>

                        </View>
                    </View>

                    {/* Current Date & Time */}
                    <View style={styles.datetimeContainer}>
                        <View style={styles.dateContainer}>
                            <Ionicons name="calendar-outline" size={scaleSize(20)} color="#00AFA1" />
                            <Text style={styles.dateText}>{currentDate}</Text>
                        </View>

                        <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={scaleSize(20)} color="#00AFA1" />
                            <Text style={styles.timeText}>{currentTime}</Text>
                        </View>
                    </View>



                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>

                        {showCamera && (
                            <View style={styles.cameraWrapper}>
                                <Camera onPictureTaken={handlePictureTaken} />
                            </View>
                        )}

                        {renderLocationCard()}

                        {!isPictureTaken && (
                            <TouchableOpacity
                                style={styles.pictureButton}
                                onPress={handleTakePicture}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera-outline" size={scaleSize(24)} color="#fff" />
                                <Text style={styles.pictureButtonText}>TAKE PICTURE</Text>
                            </TouchableOpacity>
                        )}

                        {isPictureTaken && (
                            <TouchableOpacity
                                style={styles.pictureButton}
                                onPress={handleTimeIn}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera-outline" size={scaleSize(24)} color="#fff" />
                                <Text style={styles.pictureButtonText}>TIME IN</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    {/* Footer Info */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            <Ionicons name="information-circle-outline" size={scaleSize(14)} color="#999" />{' '}
                            Note: Location and time are recorded for verification purposes.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0C1824',
        paddingBottom: 40,
        paddingTop: 10,
    },
    container: {
        flex: 1,
        paddingHorizontal: scaleSize(20),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0C1824',
    },
    loadingText: {
        color: '#fff',
        marginTop: 20,
        fontSize: scaleSize(16),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: scaleSize(20),
        borderBottomWidth: 1,
        borderBottomColor: '#1A2C3A',
    },
    backButton: {
        padding: scaleSize(8),
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: scaleSize(18),
        fontWeight: '700',
        letterSpacing: scaleSize(1),
    },
    refreshButton: {
        padding: scaleSize(8),
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'center',
        alignContent: 'center'
    },
    technicianInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2C3A',
        borderRadius: scaleSize(15),
        padding: scaleSize(20),
        marginTop: scaleSize(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        marginRight: scaleSize(15),
    },
    technicianDetails: {
        flex: 1,
    },
    technicianName: {
        color: '#fff',
        fontSize: scaleSize(20),
        fontWeight: '700',
        marginBottom: scaleSize(5),
    },
    technicianRole: {
        color: '#00AFA1',
        fontSize: scaleSize(14),
        fontWeight: '600',
        marginBottom: scaleSize(10),
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: scaleSize(15),
        paddingVertical: scaleSize(6),
        borderRadius: scaleSize(20),
    },
    statusText: {
        color: '#fff',
        fontSize: scaleSize(12),
        fontWeight: '700',
        letterSpacing: scaleSize(0.5),
    },
    datetimeContainer: {
        marginTop: scaleSize(20),
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2C3A',
        padding: scaleSize(15),
        borderRadius: scaleSize(10),
        marginBottom: scaleSize(10),
    },
    dateText: {
        color: '#fff',
        fontSize: scaleSize(16),
        fontWeight: '600',
        marginLeft: scaleSize(10),
        flex: 1,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2C3A',
        padding: scaleSize(15),
        borderRadius: scaleSize(10),
    },
    timeText: {
        color: '#fff',
        fontSize: scaleSize(28),
        fontWeight: '700',
        marginLeft: scaleSize(10),
        flex: 1,
        letterSpacing: scaleSize(1),
    },
    locationContainer: {
        marginTop: scaleSize(20),
        backgroundColor: '#1A2C3A',
        borderRadius: scaleSize(15),
        padding: scaleSize(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scaleSize(15),
    },
    locationTitle: {
        color: '#fff',
        fontSize: scaleSize(14),
        fontWeight: '600',
        flex: 1,
        marginLeft: scaleSize(10),
    },
    locationCurrent: {
        alignItems: 'center',
        backgroundColor: '#1A2C3A',
        padding: scaleSize(15),
        borderRadius: scaleSize(10),
        marginBottom: scaleSize(10),
    },
    locationErrorContainer: {
        alignItems: 'center',
        padding: scaleSize(30),
    },
    locationErrorText: {
        color: '#FF6B6B',
        fontSize: scaleSize(14),
        textAlign: 'center',
        marginVertical: scaleSize(10),
    },
    retryButton: {
        backgroundColor: '#00AFA1',
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(10),
        borderRadius: scaleSize(8),
        marginTop: scaleSize(10),
    },
    retryButtonText: {
        color: '#fff',
        fontSize: scaleSize(14),
        fontWeight: '600',
    },
    mapContainer: {
        height: scaleSize(250),
        borderRadius: scaleSize(10),
        overflow: 'hidden',
        marginBottom: scaleSize(10),
    },
    map: {
        flex: 1,
    },
    coordinatesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 175, 161, 0.1)',
        padding: scaleSize(15),
        borderRadius: scaleSize(10),
    },
    coordinatesText: {
        color: '#00AFA1',
        fontSize: scaleSize(12),
        fontFamily: 'monospace',
    },
    locationLoading: {
        alignItems: 'center',
        padding: scaleSize(30),
    },
    locationLoadingText: {
        color: '#fff',
        fontSize: scaleSize(14),
        marginTop: scaleSize(10),
    },
    actionsContainer: {
        marginTop: scaleSize(30),
        gap: scaleSize(15),
    },
    clockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scaleSize(18),
        borderRadius: scaleSize(15),
        gap: scaleSize(12),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    clockButtonText: {
        color: '#fff',
        fontSize: scaleSize(18),
        fontWeight: '700',
        letterSpacing: scaleSize(1),
    },
    pictureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2C3E50',
        paddingVertical: scaleSize(18),
        borderRadius: scaleSize(15),
        gap: scaleSize(12),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    pictureButtonText: {
        color: '#fff',
        fontSize: scaleSize(16),
        fontWeight: '600',
        letterSpacing: scaleSize(0.5),
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: scaleSize(20),
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: scaleSize(12),
        textAlign: 'center',
        lineHeight: scaleSize(18),
    },
    closeCameraButton: {
        color: 'white',


    }
});