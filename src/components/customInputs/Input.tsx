import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import Theme from '../../theme/Theme';

interface InputFieldProps extends TextInputProps {
  label?: string; 
  inputStyle?: object;
}

const InputField: React.FC<InputFieldProps> = ({ label, inputStyle, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#050505",
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",           // soft grey border like your screenshot
    borderRadius: 12,              // slightly more rounded
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",    // light background
    fontSize: 16,
    color: "#222",                 // text color
  },
});
