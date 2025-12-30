import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Component props type
interface PhotoPreviewSectionProps {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
}

const PhotoPreviewSection: React.FC<PhotoPreviewSectionProps> = ({ photo, handleRetakePhoto }) => {
    const { width } = Dimensions.get('window');  // Dynamic width for responsiveness

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.box}>
                <Image
                    style={[styles.previewContainer, { width: width - 40 }]} // Dynamic width
                    source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
                    <Fontisto name="trash" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    box: {
        borderRadius: 15,
        padding: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        height: 200, // Adjust as per your desired aspect ratio
        borderRadius: 15,
    },
    buttonContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PhotoPreviewSection;
