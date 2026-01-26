import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';

interface Props {
  title?: string;          
  onPress?: () => void;     
  disabled?: boolean;     
}

const PdfButton: React.FC<Props> = ({ title = 'PDF', onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        styles.button,
        disabled ? styles.disabled : null,
      ]}
    >
      <Image source={Theme.icons.pdf} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PdfButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.buttonPrimary, 
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  disabled: {
    backgroundColor: Theme.colors.buttonDisabled,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 6,

    resizeMode: 'contain',
  },
  text: {
    color: Theme.colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
});
