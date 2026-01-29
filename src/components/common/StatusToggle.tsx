import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Theme from "../../theme/Theme";

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isActive, onToggle }) => {
  const activeColor = isActive
    ? Theme.colors.success
    : Theme.colors.error;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[
        styles.container,
        { borderColor: activeColor },
      ]}
    >
      {/* Tick Circle */}
      <View
        style={[
          styles.tickCircle,
          {
            backgroundColor: activeColor,
            left: isActive ? 6 : undefined,
            right: !isActive ? 6 : undefined,
          },
        ]}
      >
        <Text style={styles.tick}>✓</Text>
      </View>
      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            color: activeColor,
            marginLeft: isActive ? 28 : 0,
            marginRight: !isActive ? 28 : 0,
          },
        ]}
      >
        {isActive ? "Active" : "Inactive"}
      </Text>
    </TouchableOpacity>
  );
};

export default StatusToggle;
const styles = StyleSheet.create({
  container: {
    height: 34,
    minWidth: 90,
    borderWidth: 1.5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 12,
    position: "relative",
  },
  tickCircle: {
    width: 24,
    height: 24,
    borderRadius: 5,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: -1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
