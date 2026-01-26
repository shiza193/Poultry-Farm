import React from "react";
import { View, Text, Image, ViewStyle } from "react-native";
import Toast from "react-native-toast-message";
import Theme from "../theme/Theme"; 

// Base style for all toasts
const baseToastStyle: ViewStyle = {
  width: "90%",
  minHeight: 70,
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 6,
  flexDirection: "row",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
  alignSelf: "center",
};

// Custom Toast Config
export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View
      style={{
        ...baseToastStyle,
        backgroundColor: Theme.colors.toast,
        borderLeftWidth: 6,
        borderLeftColor: Theme.colors.error,
      }}
    >
      <Image
        source={Theme.icons.happy}
        style={{  width: 90, height: 90,  marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Theme.colors.black,
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          {text1}
        </Text>
        {text2 ? (
          <Text
            style={{
              color: Theme.colors.textSecondary,
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View
      style={{
        ...baseToastStyle,
        backgroundColor: "#FFEDED",
        borderLeftWidth: 6,
        borderLeftColor: Theme.colors.error,
      }}
    >
      <Image
        source={Theme.icons.anger}
        style={{ width: 90, height: 90, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Theme.colors.error,
            fontWeight: "700",
            fontSize: 16,
          }}
        >
          {text1}
        </Text>
        {text2 ? (
          <Text
            style={{
              color: "#B91C1C",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  ),

  stateChange: ({ props }: any) => (
    <View
      style={{
        ...baseToastStyle,
        backgroundColor: props.isActive ? "#FFF8E1" : "#FFEDED",
        borderLeftWidth: 6,
        borderLeftColor: props.isActive
          ? Theme.colors.success
          : Theme.colors.error,
      }}
    >
      <Image
        source={props.isActive ? Theme.icons.happy : Theme.icons.anger}
        style={{ width: 36, height: 36, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: props.isActive ? Theme.colors.black : Theme.colors.error,
            fontWeight: "700",
            fontSize: 15,
          }}
        >
          {props.itemName} {props.isActive ? "Activated" : "Deactivated"}
        </Text>
        <Text
          style={{
            color: props.isActive
              ? Theme.colors.textSecondary
              : "#B91C1C",
            fontSize: 14,
            marginTop: 2,
          }}
        >
          The {props.itemName} is now {props.isActive ? "Active" : "Inactive"}
        </Text>
      </View>
    </View>
  ),

  occupiedChange: ({ props }: any) => (
    <View
      style={{
        ...baseToastStyle,
        backgroundColor: props.isOccupied ? "#FFF8E1" : "#FFEDED",
        borderLeftWidth: 6,
        borderLeftColor: props.isOccupied
          ? Theme.colors.success
          : Theme.colors.error,
      }}
    >
      <Image
        source={props.isOccupied ? Theme.icons.happy : Theme.icons.anger}
        style={{ width: 36, height: 36, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: props.isOccupied ? Theme.colors.black : Theme.colors.error,
            fontWeight: "700",
            fontSize: 15,
          }}
        >
          {props.isOccupied
            ? "Occupied Successfully"
            : "Unoccupied Successfully"}
        </Text>
      </View>
    </View>
  ),
};

// General-purpose toasts
export const showSuccessToast = (message: string, subMessage = "") => {
  Toast.show({
    type: "success",
    text1: message,
    text2: subMessage,
    position: "top",
    visibilityTime: 3000,
  });
};

export const showErrorToast = (message: string, subMessage = "") => {
  Toast.show({
    type: "error",
    text1: message,
    text2: subMessage,
    position: "top",
    visibilityTime: 3000,
  });
};

export const showStateToast = (itemName: string, isActive: boolean) => {
  Toast.show({
    type: "stateChange",
    position: "top",
    visibilityTime: 3000,
    props: { itemName, isActive },
  });
};

export const showOccupiedToast = (itemName: string, isOccupied: boolean) => {
  Toast.show({
    type: "occupiedChange",
    position: "top",
    visibilityTime: 3000,
    props: { itemName, isOccupied },
  });
};

// Shortcuts for add/update/delete success
export const toastAddSuccess = () => showSuccessToast("Added Successfully!");
export const toastUpdateSuccess = () => showSuccessToast("Updated Successfully!");
export const toastDeleteSuccess = () => showSuccessToast("Deleted Successfully!");
