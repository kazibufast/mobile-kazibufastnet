import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { getToken } from "../scripts/token";
import RejectedButton from "./Modal/RejectedButton";
import RescheduleButton from "./Modal/RescheduleButton";
import TicketButton from "./TicketButton";

/* ---------------- TYPES ---------------- */

type TicketStatus = "pending" | "accepted" | "in progress" | "completed";
type TicketButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

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
  const [status, setStatus] = useState<TicketStatus>("pending");
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [remarks, setRemarks] = useState("");
  const [deviceUse, setDeviceUse] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [pppoeName, setPppoeName] = useState("");
  const [lcpNumber, setLcpNumber] = useState("");
  const [napNumber, setNapNumber] = useState("");
  const [portNumber, setPortNumber] = useState("");
  const [tagNumber, setTagNumber] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [vlanId, setVlanId] = useState("");
  const [location, setLocation] = useState("");
  const [pictureCause, setPictureCause] = useState<string | null>(null);
  const [pictureReading, setPictureReading] = useState<string | null>(null);
  const [installationDate, setInstallationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Modal states
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [modalImageTitle, setModalImageTitle] = useState<string>("");

  /* ---------------- FETCH TICKET ---------------- */

  const fetchTicket = async () => {
    try {
      const token = await getToken();

      const res = await fetch(
        `https://tub.kazibufastnet.com/api/tech/tickets/view/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch ticket");

      const { ticket: t } = await res.json();

      const normalizedStatus: TicketStatus =
        t.status === "accepted"
          ? "accepted"
          : t.status === "in progress"
          ? "in progress"
          : "pending";

      setTicket({
        id: String(t.id),
        ticketNumber: t.ticket_number ?? "N/A",
        accountNumber: t.subscription_id ?? "N/A",
        accountName: t.client?.name ?? "Unknown",
        installationAddress: t.subscription?.installation_address ?? "N/A",
        mobileNumber: t.client?.mobile_number ?? "N/A",
        status: normalizedStatus,
        type: t.type,
        date: t.created_at,
        subject: t.subject,
        pictureCause: t.picture,
        pictureReading: t.picture_reading,
      });

      setStatus(normalizedStatus);

      // Check if the ticket is already completed
      if (t.status === "completed") {
        setIsCompleted(true);
        setRemarks(t.remarks || "No remarks provided");
        setPictureCause(t.picture || null);
        setPictureReading(t.picture_reading || null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to load ticket");
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
        `https://tub.kazibufastnet.com/api/tech/tickets/accepted/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setStatus("accepted");
      Alert.alert("Success", "Ticket accepted");
    } catch {
      Alert.alert("Error", "Failed to accept ticket");
    }
  };

  const handleInProgress = async () => {
    try {
      const token = await getToken();

      await fetch(
        `https://tub.kazibufastnet.com/api/tech/tickets/in_progress/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setStatus("in progress");
      Alert.alert("Started", "Work started");
    } catch {
      Alert.alert("Error", "Failed to start work");
    }
  };

  const handleReject = () => {
    Alert.alert("Rejected", "Ticket has been rejected");
  };

  const handleRescheduleConfirm = () => {
    Alert.alert("Rescheduled", "Ticket rescheduled successfully");
  };

  /* ---------------- MODAL FUNCTIONS ---------------- */

  const openImageModal = (imageUrl: string, title: string) => {
    if (!imageUrl) {
      Alert.alert("No Image", "No image available to preview");
      return;
    }
    
    // Construct full URL for images from backend
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `https://tub.kazibufastnet.com/storage/${imageUrl}`;
    
    setModalImageUrl(fullImageUrl);
    setModalImageTitle(title);
    setIsImageModalVisible(true);
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    setModalImageUrl("");
    setModalImageTitle("");
  };

  /* ---------------- LOCATION ---------------- */

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Location permission is required");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(
      `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`
    );
    Alert.alert("Location Updated", "Current location has been added");
  };

  /* ---------------- IMAGE PICKER ---------------- */

  const pickImage = async (
    setter: (uri: string | null) => void,
    label: string
  ) => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to photos");
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
      Alert.alert("Success", `${label} picture attached`);
    }
  };

  const removeImage = (setter: (uri: string | null) => void, label: string) => {
    setter(null);
    Alert.alert("Removed", `${label} picture removed`);
  };

  const handleSubmitCompleted = async (
    remarks: string,
    location: string,
    pictureCause: string | null,
    pictureReading: string | null
  ) => {
    if (!location) {
      Alert.alert("Error", "Please fill out all required fields");
      return;
    }
    const url = `https://tub.kazibufastnet.com/api/tech/tickets/completed/${id}`;

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append("remarks", remarks);
      formData.append("location", location);

      formData.append("device_use", deviceUse || "");
      formData.append("ip_address", ipAddress || "");
      formData.append("mac_address", macAddress || "");
      formData.append(
        "installation_date",
        installationDate.toLocaleDateString()
      );
      formData.append("type", connectionType);

      // Append PPPOE Name for wireless
      if (connectionType === "wireless") {
        formData.append("pppoe_name", pppoeName);
      }

      // Append fields for wired connection (LCP number, NAP number, etc.)
      if (connectionType === "wired") {
        formData.append("lcp_no", lcpNumber || "");
        formData.append("nap_no", napNumber || "");
        formData.append("port_no", portNumber || "");
        formData.append("tag_no", tagNumber || "");
        formData.append("vlan_id", vlanId || "");
      }

      const appendImage = (fieldName: string, uri: string | null) => {
        if (!uri) return;

        // Convert URI to file for React Native fetch
        const filename = uri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append(fieldName, {
          uri,
          name: filename,
          type,
        } as any);
      };

      appendImage("picture_cause", pictureCause);
      appendImage("picture_reading", pictureReading);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      if (data.status === "success") {
        setIsCompleted(true);
        setRemarks(remarks);
        setPictureCause(pictureCause);
        setPictureReading(pictureReading);
        Alert.alert("Success!", "Ticket completed successfully");
        router.push("/(tech-tabs)/tickets");
      } else {
        console.warn("Submission failed:", data);
        Alert.alert("Error", "Please fill out all fields.");
      }
    } catch (error) {
      console.error("POST ERROR:", error);
      Alert.alert("Error", "An error occurred while submitting the ticket.");
    }
  };

  //handle accept and start work
  const handleAcceptAndStartWork = async () => {
    try {
      const token = await getToken();

      await fetch(
        `https://tub.kazibufastnet.com/api/tech/tickets/in_progress/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setStatus("in progress");
      Alert.alert("Started", "Work started");
    } catch {
      Alert.alert("Error", "Failed to start work");
    }
  };
  
  const ImageMessage = (ticket: TicketItem | null): string => {
    if (ticket === null || ticket.type === undefined) {
      return "No Ticket";
    }

    const type = ticket.type;
    if (type === "repair") {
      return "Photo of Cause";
    } else {
      return "Photo of Client/Speed Test";
    }
  };

  const handleConnectionTypeChange = (itemValue: string) => {
    setConnectionType(itemValue);
    if (itemValue === "wireless") {
      setDeviceUse("");
      setPppoeName("");
    } else if (itemValue === "wired") {
      setLcpNumber("");
      setNapNumber("");
      setPortNumber("");
      setTagNumber("");
      setVlanId("");
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate ?? installationDate;
    setShowDatePicker(false);
    setInstallationDate(currentDate);
  };

  return (
    <View style={styles.actionButtonsContainer}>
      {/* IMAGE PREVIEW MODAL */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalImageTitle}</Text>
              <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: modalImageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
            
            
          </View>
        </View>
      </Modal>

      {status === "pending" && !isCompleted && (
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

      {status === "accepted" && !isCompleted && (
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

      {status === "in progress" && !isCompleted && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>Complete Ticket</Text>
          <Text style={styles.completionSubtitle}>
            Fill in the required details to complete this ticket
          </Text>

          {ticket?.type === "installation" && (
            <>
              {/* Installation Date Section */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>Installation Date</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputText}>
                    {installationDate
                      ? installationDate.toLocaleDateString()
                      : "Select a date"}
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
              {connectionType === "wireless" && (
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
              {connectionType === "wired" && (
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
            <Text style={styles.inputLabel}>{ImageMessage(ticket)}</Text>
            {pictureCause ? (
              <View style={styles.imagePreviewContainer}>
                <TouchableOpacity 
                  onPress={() => openImageModal(pictureCause, ImageMessage(ticket))}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: pictureCause }}
                    style={styles.imagePreview}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(setPictureCause, "Cause")}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage(setPictureCause, "Cause")}
              >
                <Text style={styles.uploadButtonText}>
                  + Attach Cause Picture
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Photo of Reading</Text>
            {pictureReading ? (
              <View style={styles.imagePreviewContainer}>
                <TouchableOpacity 
                  onPress={() => openImageModal(pictureReading, "Photo of Reading")}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: pictureReading }}
                    style={styles.imagePreview}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(setPictureReading, "Pending")}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage(setPictureReading, "Pending")}
              >
                <Text style={styles.uploadButtonText}>
                  + Attach Pending Picture
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!remarks.trim() || !location) && styles.submitButtonDisabled,
              ]}
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
            <Text style={styles.remarksText}>
              {remarks || "No remarks added"}
            </Text>
          </View>
          
          {/* Cause Picture */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>{ImageMessage(ticket)}</Text>
            {ticket?.pictureCause ? (
              <TouchableOpacity 
                onPress={() => openImageModal(ticket.pictureCause, ImageMessage(ticket))}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: `https://tub.kazibufastnet.com/storage/${ticket.pictureCause}`,
                  }}
                  style={styles.imagePreview}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.noImageText}>No photo attached</Text>
            )}
          </View>

          {/* Reading Picture */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Photo of Reading</Text>
            {ticket?.pictureReading ? (
              <TouchableOpacity 
                onPress={() => openImageModal(ticket.pictureReading, "Photo of Reading")}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: `https://tub.kazibufastnet.com/storage/${ticket.pictureReading}`,
                  }}
                  style={styles.imagePreview}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.noImageText}>No photo attached</Text>
            )}
          </View>

          {!isCompleted && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() =>
                  Alert.alert(
                    "Completed",
                    "This ticket is already marked as completed."
                  )
                }
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  actionButtonsContainer: { width: "100%" },
  pendingContainer: { width: "100%", marginBottom: 8 },
  acceptedContainer: { width: "100%", marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  buttonRow: { flexDirection: "row", gap: 12, width: "100%" },
  flexButton: { flex: 1, minHeight: 50 },
  acceptButton: {},
  completionContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  formSection: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  inputText: {},
  textArea: { minHeight: 50, textAlignVertical: "top" },
  locationContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationInput: { flex: 1 },
  locationButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  dropdown: {
    height: 60,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  uploadButtonText: { color: "#6B7280", fontSize: 15, fontWeight: "500" },
  imagePreviewContainer: { position: "relative" },
  imagePreview: { 
    width: "100%", 
    height: 200, 
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  removeImageText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#9CA3AF", opacity: 0.7 },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  completedContainer: {
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
  },
  completionDetails: {
    marginBottom: 16,
  },
  remarksText: {
    fontSize: 14,
    color: "#2D3748",
    lineHeight: 20,
    marginBottom: 16,
  },
  noImageText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  
  // Modal Styles
   modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },

  modalContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },

  modalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalImage: {
    width: width,
    height: height,
  },

  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  closeModalButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TicketActionButtons;