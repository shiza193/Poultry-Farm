import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Theme from "../../theme/Theme";

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isActive, onToggle }) => {
  return (
    <View style={styles.container}>
      {/* Left Label */}
      <View
        style={[
          styles.labelBox,
          {
            borderColor: isActive
              ? Theme.colors.success
              : Theme.colors.error,
          },
        ]}
      >
        <Text
          style={[
            styles.labelText,
            {
              color: isActive
                ? Theme.colors.success
                : Theme.colors.error,
            },
          ]}
        >
          {isActive ? "Active" : "Inactive"}
        </Text>
      </View>

      {/* Tick Button */}
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.tickBox,
          {
            backgroundColor: isActive
              ? Theme.colors.success
              : Theme.colors.error,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.tick}>✓</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StatusToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelBox: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: Theme.colors.white,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tickBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
  },
  tick: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
