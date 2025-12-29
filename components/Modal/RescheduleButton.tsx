import { getToken } from '@/scripts/token';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RescheduleButtonProps {
  onConfirm: (date: Date, reason: string) => void;
  style?: object;
}

const RescheduleButton: React.FC<RescheduleButtonProps> = ({ onConfirm, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleComment, setRescheduleComment] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  // Handle reschedule
  const handleReschedule = async (date: string, notes: string) => {
    const url = `https://staging.kazibufastnet.com/api/tech/tickets/reschedule/${id}`;

    try {
      const token = await getToken();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json', 
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          date: date,
          notes: notes,
        }),
      });

      // Check the response status
      if (response.ok) {
        const responseData = await response.json();
        console.log('Reschedule successful:', responseData);

        router.push('/(tech-tabs)/tickets');  

        setRescheduleComment('');
        setModalVisible(false); 
      } else {
        const errorData = await response.json();
        console.error('Error rescheduling:', errorData);
        // Handle error (show error message, etc.)
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      // Handle fetch error (network error, etc.)
    }
  };

  const confirmReschedule = () => {
    if (!rescheduleComment.trim()) return;
   
    handleReschedule(rescheduleDate.toISOString(), rescheduleComment.trim()); 
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} style={[styles.button, style]}>
        <Text style={styles.buttonText}>Reschedule</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reschedule Ticket</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{rescheduleDate.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={rescheduleDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setRescheduleDate(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.inputLabel}>Reason for reschedule</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter reason..."
              value={rescheduleComment}
              onChangeText={setRescheduleComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancel]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirm,
                  !rescheduleComment.trim() && { opacity: 0.5 },
                ]}
                onPress={confirmReschedule}
                disabled={!rescheduleComment.trim()}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};



export default RescheduleButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F39C12',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2D3748',
    textAlign: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#F7FAFC',
  },
  dateText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    minHeight: 100,
    marginBottom: 24,
    backgroundColor: '#F7FAFC',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#CBD5E0',
  },
  confirm: {
    backgroundColor: '#F39C12',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
