import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';

const AboutKazibufast: React.FC = () => {
    const router = useRouter();
    const handleOpenWebsite = () => {
        Linking.openURL('https://kazibufastnet.com');
    };

    const handleOpenFacebook = () => {
        Linking.openURL('https://facebook.com/kazibufast');
    };

    const handleOpenInstagram = () => {
        Linking.openURL('https://instagram.com/kazibufast');
    };

    const handleOpenTwitter = () => {
        Linking.openURL('https://twitter.com/kazibufast');
    };

    const appVersion = '2.1.0';
    const buildNumber = '2024.01.15';
    

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}

                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/kazi.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.companyName}>Kazibufast</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Us</Text>
                        <Text style={styles.description}>
                            Kazibufast is a leading internet service provider committed to delivering
                            high-speed, reliable, and affordable internet connectivity to homes and
                            businesses across the region. Founded with the vision of bridging the
                            digital divide, we continue to innovate and expand our services to meet
                            the growing demands of the digital age.
                        </Text>
                    </View>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <TouchableOpacity style={styles.contactItem} onPress={handleOpenWebsite}>
                            <Ionicons name="globe-outline" size={22} color="#00afa1ff" />
                            <Text style={styles.contactText}>www.kazibufastnet.com</Text>
                        </TouchableOpacity>

                        <View style={styles.contactItem}>
                            <Ionicons name="call-outline" size={22} color="#00afa1ff" />
                            <Text style={styles.contactText}>0950-822-1851</Text>
                        </View>

                        <View style={styles.contactItem}>
                            <Ionicons name="mail-outline" size={22} color="#00afa1ff" />
                            <Text style={styles.contactText}>support@kazibufast.com</Text>
                        </View>

                        <View style={styles.contactItem}>
                            <Ionicons name="location-outline" size={22} color="#00afa1ff" />
                            <Text style={styles.contactText}>Guiwanon, Tubigon, Bohol, Philippines</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Follow Us</Text>
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton} onPress={handleOpenFacebook}>
                                <Ionicons name="logo-facebook" size={28} color="#1877F2" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton} onPress={handleOpenInstagram}>
                                <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton} onPress={handleOpenTwitter}>
                                <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.appInfoSection}>
                        <Text style={styles.appInfoTitle}>App Information</Text>
                        
                        <View style={styles.appInfoRow}>
                            <Text style={styles.appInfoLabel}>Version</Text>
                            <Text style={styles.appInfoValue}>{appVersion}</Text>
                        </View>
                        <View style={styles.appInfoRow}>
                            <Text style={styles.appInfoLabel}>Build Number</Text>
                            <Text style={styles.appInfoValue}>{buildNumber}</Text>
                        </View>
                        <View style={styles.appInfoRow}>
                            <Text style={styles.appInfoLabel}>Last Updated</Text>
                            <Text style={styles.appInfoValue}>January 15, 2024</Text>
                        </View>
                    </View>
                    <View style={styles.legalSection}>
                        <Text style={styles.legalText}>
                            © 2024 Kazibufast Network. All rights reserved.
                        </Text>
                        <Text style={[styles.legalText, styles.legalSubtext]}>
                            Kazibufast and the Kazibufast logo are trademarks of Kazibufast Network.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 0,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 8,
    },
    contentContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    companyName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00afa1ff',
        marginBottom: 5,
    },
    companyTagline: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        textAlign: 'justify',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    appInfoSection: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    appInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    appInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    appInfoLabel: {
        fontSize: 14,
        color: '#666',
    },
    appInfoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    legalSection: {
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 10,
    },
    legalText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    legalSubtext: {
        marginTop: 5,
        fontSize: 10,
    },
});

export default AboutKazibufast;