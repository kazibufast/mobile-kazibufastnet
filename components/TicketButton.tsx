import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  style?: StyleProp<ViewStyle>;
}

const TicketButton: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, styles[variant], style]}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
