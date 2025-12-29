import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

const TicketButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, styles[variant]]}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,                    
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 0,           
  },
  primary: { backgroundColor: '#3498DB' },
  secondary: { backgroundColor: '#F39C12' },
  danger: { backgroundColor: '#E74C3C' },
  success: { backgroundColor: '#28a745' },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default TicketButton;
