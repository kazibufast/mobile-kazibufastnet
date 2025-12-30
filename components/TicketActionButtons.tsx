import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getToken } from '../scripts/token';
import RejectedButton from './Modal/RejectedButton';
import RescheduleButton from './Modal/RescheduleButton';
import TicketButton from './TicketButton';

/* ---------------- TYPES ---------------- */

type TicketStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

interface TicketItem {
    id: string;
    ticketNumber: string;
    accountNumber: string;
    accountName: string;
    installationAddress: string;
    mobileNumber: string;
    status: TicketStatus;
    type?: string;
    date: string;
    subject: string;
    pictureCause: string;
    pictureReading: string;
}

/* ---------------- COMPONENT ---------------- */

const TicketActionButtons: React.FC = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [status, setStatus] = useState<TicketStatus>('pending');
    const [ticket, setTicket] = useState<TicketItem | null>(null);

    const [remarks, setRemarks] = useState('');
    const [deviceUse, setDeviceUse] = useState('');  // Device use for wireless
    const [ipAddress, setIpAddress] = useState('');  // IP Address
    const [macAddress, setMacAddress] = useState(''); // Mac Address
    const [pppoeName, setPppoeName] = useState('');   // PPPOE Name for wireless
    const [lcpNumber, setLcpNumber] = useState('');    // LCP number for wired
    const [napNumber, setNapNumber] = useState('');    // NAP number for wired
    const [portNumber, setPortNumber] = useState('');  // Port number for wired
    const [tagNumber, setTagNumber] = useState('');    // Tag number for wired
    const [connectionType, setConnectionType] = useState('');
    const [vlanId, setVlanId] = useState('');
    const [location, setLocation] = useState('');
    const [pictureCause, setPictureCause] = useState<string | null>(null);
    const [pictureReading, setPictureReading] = useState<string | null>(null);
    const [installationDate, setInstallationDate] = useState(new Date()); // Default date
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [isCompleted, setIsCompleted] = useState(false);  // To track completion status

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsModalVisible(true); // Show the modal
    };

    const handleCloseModal = () => {
        setIsModalVisible(false); // Hide the modal
        setSelectedImage(null); // Clear the selected image
    };

    /* ---------------- FETCH TICKET ---------------- */

    const fetchTicket = async () => {
        try {
            const token = await getToken();

            const res = await fetch(
                `https://staging.kazibufastnet.com/api/tech/tickets/view/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (!res.ok) throw new Error('Failed to fetch ticket');

            const { ticket: t } = await res.json();

            const normalizedStatus: TicketStatus =
                t.status === 'accepted'
                    ? 'accepted'
                    : t.status === 'in_progress'
                        ? 'in_progress'
                        : 'pending';

            setTicket({
                id: String(t.id),
                ticketNumber: t.ticket_number ?? 'N/A',
                accountNumber: t.subscription_id ?? 'N/A',
                accountName: t.client?.name ?? 'Unknown',
                installationAddress: t.subscription?.installation_address ?? 'N/A',
                mobileNumber: t.client?.mobile_number ?? 'N/A',
                status: normalizedStatus,
                type: t.type,
                date: t.created_at,
                subject: t.subject,
                pictureCause: t.picture,
                pictureReading: t.picture_reading,
            });

            console.log(ticket?.pictureCause);


            setStatus(normalizedStatus);

            // Check if the ticket is already completed
            if (t.status === 'completed') {

                setIsCompleted(true);
                setRemarks(t.remarks || 'No remarks provided');
                setPictureCause(t.picture || null);
                setPictureReading(t.picture_reading || null);
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to load ticket');
        }
    };

    useEffect(() => {
        if (id) fetchTicket();
    }, [id]);

    /* ---------------- ACTIONS ---------------- */

    const handleAccept = async () => {
        try {
            const token = await getToken();

            await fetch(
                `https://staging.kazibufastnet.com/api/tech/tickets/accepted/${id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setStatus('accepted');
            Alert.alert('Success', 'Ticket accepted');
        } catch {
            Alert.alert('Error', 'Failed to accept ticket');
        }
    };

    const handleInProgress = async () => {
        try {
            const token = await getToken();

            await fetch(
                `https://staging.kazibufastnet.com/api/tech/tickets/in_progress/${id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setStatus('in_progress');
            Alert.alert('Started', 'Work started');
        } catch {
            Alert.alert('Error', 'Failed to start work');
        }
    };

    const handleReject = () => {
        Alert.alert('Rejected', 'Ticket has been rejected');
    };

    const handleRescheduleConfirm = () => {
        Alert.alert('Rescheduled', 'Ticket rescheduled successfully');
    };

    /* ---------------- LOCATION ---------------- */

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Location permission is required');
            return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(
            `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`
        );
        Alert.alert('Location Updated', 'Current location has been added');
    };

    /* ---------------- IMAGE PICKER ---------------- */

    const pickImage = async (setter: (uri: string | null) => void, label: string) => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to photos');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setter(result.assets[0].uri);
            Alert.alert('Success', `${label} picture attached`);
        }
    };

    const removeImage = (setter: (uri: string | null) => void, label: string) => {
        setter(null);
        Alert.alert('Removed', `${label} picture removed`);
    };

    const handleSubmitCompleted = async (
        remarks: string,
        location: string,
        pictureCause: string | null,
        pictureReading: string | null
    ) => {
        const url = `https://staging.kazibufastnet.com/api/tech/tickets/completed/${id}`;

        try {
            const token = await getToken();

            const formData = new FormData();
            formData.append('remarks', remarks);
            formData.append('location', location);

            formData.append('device_use', deviceUse);
            formData.append('ip_address', ipAddress);
            formData.append('mac_address', macAddress);
            formData.append('installation_date', installationDate.toLocaleDateString());
            formData.append('type', connectionType);

            // Append PPPOE Name for wireless
            if (connectionType === 'wireless') {
                formData.append('pppoe_name', pppoeName);
            }

            // Append fields for wired connection (LCP number, NAP number, etc.)
            if (connectionType === 'wired') {
                formData.append('lcp_number', lcpNumber);
                formData.append('nap_number', napNumber);
                formData.append('port_number', portNumber);
                formData.append('tag_number', tagNumber);
                formData.append('vlan_id', vlanId);
            }

            const appendImage = (fieldName: string, uri: string | null) => {
                if (!uri) return;

                // Convert URI to file for React Native fetch
                const filename = uri.split('/').pop()!;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append(fieldName, {
                    uri,
                    name: filename,
                    type,

                } as any);
            };

            appendImage('picture_cause', pictureCause);
            appendImage('picture_reading', pictureReading); // <-- use pending, not reading

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    // DO NOT set Content-Type! fetch handles multipart boundary
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data);

            if (data.status === 'success') {
                setIsCompleted(true);  // Mark the ticket as completed
                setRemarks(remarks);   // Save the remarks after completion
                setPictureCause(pictureCause);  // Save the image
                setPictureReading(pictureReading);  // Save the image
                Alert.alert('Success!', 'Ticket completed successfully');
                router.push('/(tech-tabs)/tickets');
            } else {
                console.warn('Submission failed:', data);
                Alert.alert('Error', 'Submission failed. Check console for details.');
            }
        } catch (error) {
            console.error('POST ERROR:', error);
            Alert.alert('Error', 'An error occurred while submitting the ticket.');
        }
    };


    //handle accept and start work
    const handleAcceptAndStartWork = async () => {
        try {
            const token = await getToken();

            await fetch(
                `https://staging.kazibufastnet.com/api/tech/tickets/in_progress/${id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            setStatus('in_progress');
            Alert.alert('Started', 'Work started');
        } catch {
            Alert.alert('Error', 'Failed to start work');
        }
    };
    const ImageMessage = (ticket: TicketItem | null): string => {
        if (ticket === null || ticket.type === undefined) {
            return "No Ticket";
        }

        // Now we can safely access ticket.type
        const type = ticket.type;
        if (type === 'repair') {
            return "Picture-Cause";
        } else {
            return "Picture of Client/Speed Test";
        }
    };

    const handleConnectionTypeChange = (itemValue: string) => {
        setConnectionType(itemValue);  // Set the selected connection type
        // Reset fields based on the selected connection type
        if (itemValue === 'wireless') {
            setDeviceUse('');  // Reset wireless-specific fields
            setPppoeName('');
        } else if (itemValue === 'wired') {
            setLcpNumber('');  // Reset wired-specific fields
            setNapNumber('');
            setPortNumber('');
            setTagNumber('');
            setVlanId('');
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || installationDate;
        setShowDatePicker(false); // Close date picker after selecting
        setInstallationDate(currentDate); // Set the selected date
    };

    console.log("hi " + ticket?.type);
    




    return (
        <View style={styles.actionButtonsContainer}>
            {status === 'pending' && !isCompleted && (
                <View style={styles.pendingContainer}>
                    <Text style={styles.sectionTitle}>Ticket Actions</Text>
                    <View style={styles.buttonRow}>
                        <RejectedButton onReject={handleReject} style={styles.flexButton} />
                        <TicketButton
                            label="Accept Ticket"
                            onPress={handleAccept}
                            style={styles.flexButton}
                        />



                    </View>

                    <View style={{ marginTop: 10 }}>
                        <TicketButton
                            label="Accept & Start Work"
                            onPress={handleAcceptAndStartWork}
                            style={styles.acceptButton}
                        />
                    </View>

                </View>

            )}


            {status === 'accepted' && !isCompleted && (
                <View style={styles.acceptedContainer}>
                    <Text style={styles.sectionTitle}>Schedule Actions</Text>
                    <View style={styles.buttonRow}>
                        <RescheduleButton
                            onConfirm={handleRescheduleConfirm}
                            style={styles.flexButton}
                        />
                        <TicketButton
                            label="Start Work"
                            onPress={handleInProgress}
                            style={styles.flexButton}
                        />
                    </View>
                </View>
            )}

            {status === 'in_progress' && !isCompleted && (
                <View style={styles.completionContainer}>
                    <Text style={styles.completionTitle}>Complete Ticket</Text>
                    <Text style={styles.completionSubtitle}>
                        Fill in the required details to complete this ticket
                    </Text>


                    {ticket?.type === 'installation' && (
                        <>
                            {/* Installation Date Section */}
                            <View style={styles.formSection}>
                                <Text style={styles.inputLabel}>Installation Date</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.inputText}>
                                        {installationDate ? installationDate.toLocaleDateString() : 'Select a date'}
                                    </Text>
                                </TouchableOpacity>
                                {/* Show date picker if required */}
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={installationDate}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                )}
                            </View>

                            {/* Connection Type Section */}
                            <View style={styles.formSection}>
                                <Text style={styles.inputLabel}>Connection Type</Text>
                                <Picker
                                    selectedValue={connectionType}
                                    onValueChange={handleConnectionTypeChange}
                                    style={[styles.input, styles.dropdown]}
                                >
                                    <Picker.Item label="Select connection type" value="" />
                                    <Picker.Item label="Wireless" value="wireless" />
                                    <Picker.Item label="Wired" value="wired" />
                                </Picker>
                            </View>

                            {/* Wireless Specific Fields */}
                            {connectionType === 'wireless' && (
                                <>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>Device Use</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter device use"
                                            value={deviceUse}
                                            onChangeText={setDeviceUse}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>IP Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter IP Address"
                                            value={ipAddress}
                                            onChangeText={setIpAddress}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>Mac Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter MAC Address"
                                            value={macAddress}
                                            onChangeText={setMacAddress}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>PPPOE Name</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter PPPOE Name"
                                            value={pppoeName}
                                            onChangeText={setPppoeName}
                                        />
                                    </View>
                                </>
                            )}

                            {/* Wired Specific Fields */}
                            {connectionType === 'wired' && (
                                <>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>IP Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter IP Address"
                                            value={ipAddress}
                                            onChangeText={setIpAddress}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>Mac Address</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter MAC Address"
                                            value={macAddress}
                                            onChangeText={setMacAddress}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>LCP Number</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter LCP Number"
                                            value={lcpNumber}
                                            onChangeText={setLcpNumber}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>NAP Number</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter NAP Number"
                                            value={napNumber}
                                            onChangeText={setNapNumber}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>Port Number</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter Port Number"
                                            value={portNumber}
                                            onChangeText={setPortNumber}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>Tag Number</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter Tag Number"
                                            value={tagNumber}
                                            onChangeText={setTagNumber}
                                        />
                                    </View>
                                    <View style={styles.formSection}>
                                        <Text style={styles.inputLabel}>VLAN ID</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Enter VLAN ID"
                                            value={vlanId}
                                            onChangeText={setVlanId}
                                        />
                                    </View>
                                </>
                            )}
                        </>
                    )}






                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Remarks *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter detailed remarks about the work performed..."
                            placeholderTextColor="#94A3B8"
                            value={remarks}
                            onChangeText={setRemarks}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Location</Text>
                        <View style={styles.locationContainer}>
                            <TextInput
                                style={[styles.input, styles.locationInput]}
                                placeholder="Enter location or use current location..."
                                placeholderTextColor="#94A3B8"
                                value={location}
                                onChangeText={setLocation}
                            />
                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={getCurrentLocation}
                            >
                                <Ionicons name="location-outline" size={20} color="#3B82F6" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>
                            {ImageMessage(ticket)}
                        </Text>
                        {pictureCause ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: pictureCause }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(setPictureCause, 'Cause')}
                                >
                                    <Text style={styles.removeImageText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => pickImage(setPictureCause, 'Cause')}
                            >
                                <Text style={styles.uploadButtonText}>+ Attach Cause Picture</Text>
                            </TouchableOpacity>
                        )}
                    </View>



                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Picture of Reading</Text>
                        {pictureReading ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: pictureReading }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(setPictureReading, 'Pending')}
                                >
                                    <Text style={styles.removeImageText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => pickImage(setPictureReading, 'Pending')}
                            >
                                <Text style={styles.uploadButtonText}>+ Attach Pending Picture</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.submitButton, !remarks.trim() && styles.submitButtonDisabled]}
                            disabled={!remarks.trim()}
                            onPress={() =>
                                handleSubmitCompleted(
                                    remarks,
                                    location,
                                    pictureCause,
                                    pictureReading
                                )
                            }
                        >
                            <Text style={styles.submitButtonText}>Submit Completion</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* When ticket is completed */}
            {isCompleted && (
                <View style={styles.completedContainer}>
                    <Text style={styles.sectionTitle}>Ticket Completed</Text>

                    <View style={styles.completionDetails}>
                        <Text style={styles.inputLabel}>Remarks</Text>
                        <Text style={styles.remarksText}>{remarks || 'No remarks added'}</Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}> {ImageMessage(ticket)}</Text>
                        {pictureCause ? (
                            <Image source={{ uri: 'https://staging.kazibufastnet.com/storage/' + ticket?.pictureCause }} style={styles.imagePreview} />
                        ) : (
                            <Text>No picture attached</Text>
                        )}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}> Picture Reading</Text>
                        {pictureReading ? (
                            <Image source={{ uri: 'https://staging.kazibufastnet.com/storage/' + ticket?.pictureReading }} style={styles.imagePreview} />
                        ) : (
                            <Text>No picture attached</Text>
                        )}
                    </View>

                    {!isCompleted && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => Alert.alert('Completed', 'This ticket is already marked as completed.')}
                            >
                                <Text style={styles.submitButtonText}>Ticket Completed</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    actionButtonsContainer: { width: '100%' },
    pendingContainer: { width: '100%', marginBottom: 8 },
    acceptedContainer: { width: '100%', marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
    buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
    flexButton: { flex: 1, minHeight: 50 },
    acceptButton: {


    },
    completionContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    completionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
    completionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
    formSection: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    textArea: { minHeight: 50, textAlignVertical: 'top' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    locationInput: { flex: 1 },
    locationButton: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 18,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
    },
    dropdown: {
        height: 60,  // Adjust height if necessary
        marginTop: 2,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    uploadButtonText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
    imagePreviewContainer: { position: 'relative' },
    imagePreview: { width: '100%', height: 200, borderRadius: 8 },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    removeImageText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10 },
    submitButton: { flex: 2, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#3B82F6', alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: '#9CA3AF', opacity: 0.7 },
    submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

    completedContainer: {
        backgroundColor: '#F7FAFC',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 16,
    },
    completionDetails: {
        marginBottom: 16,
    },

    remarksText: {
        fontSize: 14, // Sets the font size for the remarks text
        color: '#2D3748', // A dark gray color for the text to make it easily readable
        lineHeight: 20, // Ensures enough space between lines for readability
        marginBottom: 16, // Adds space below the remarks text (creates distance from the next section)
    },

});

export default TicketActionButtons;
