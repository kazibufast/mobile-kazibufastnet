import { getToken } from '@/scripts/token';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface RejectedButtonProps {
  onReject: (reason: string) => void;
  style?: object;
}

const RejectedButton: React.FC<RejectedButtonProps> = ({ onReject, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleReject = async (notes: string) => {
    const url = `https://staging.kazibufastnet.com/api/tech/tickets/reject/${id}`;

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
          notes: notes,
        }),
      });

      // Check the response status
      if (response.ok) {
        const responseData = await response.json();
        console.log('Rejection successful:', responseData);

        // Redirect to tickets page after rejection
        router.push('/(tech-tabs)/tickets');

        setComment('');
        setModalVisible(false);
      } else {
        const errorData = await response.json();
        console.error('Error rejecting ticket:', errorData);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      // Optionally show an error message to the user
    }
  };

  const handleSubmit = () => {
    if (!comment.trim()) return;
    handleReject(comment.trim());
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, styles.danger, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Reject Ticket</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reject Ticket</Text>

            <Text style={styles.label}>Reason for rejection</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter reason..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancel]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirm,
                  !comment.trim() && { opacity: 0.5 },
                ]}
                onPress={handleSubmit}
                disabled={!comment.trim()}
                activeOpacity={comment.trim() ? 0.8 : 1}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RejectedButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    marginBottom: 0,
  },
  danger: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2D3748',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancel: {
    backgroundColor: '#CBD5E0',
  },
  confirm: {
    backgroundColor: '#E74C3C',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
