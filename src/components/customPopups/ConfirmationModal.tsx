import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Theme from "../../theme/Theme";

type ConfirmationModalProps = {
  type?: "logout" | "delete";
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string; 
};

const ConfirmationModal = ({
  type = "logout",
  visible,
  onClose,
  onConfirm,
  title,
}: ConfirmationModalProps) => {
  // ===== DYNAMIC TITLE =====
  const defaultTitle =
    type === "delete"
      ? "Are you sure you want to delete this poultry farm?"
      : "Are you sure you want to logout ?";

  const modalTitle = title || defaultTitle; // use custom title if provided

  // ===== DYNAMIC ICON =====
  const icon = type === "delete" ? Theme.icons.bin : Theme.icons.logout1;

  // ===== ICON TINT (ONLY FOR DELETE) =====
  const iconTint = type === "delete" ? Theme.colors.error : undefined;

  // ===== DYNAMIC CONFIRM BUTTON STYLE =====
  const confirmBtnStyle =
    type === "delete" ? [styles.btn, styles.deleteBtn] : [styles.btn, styles.yesBtn];
  const confirmTextStyle = type === "delete" ? styles.deleteText : styles.yesText;
  const confirmText = type === "delete" ? "Delete" : "Yes";

  // ===== DYNAMIC CANCEL BUTTON STYLE =====
  const cancelBtnStyle =
    type === "delete" ? [styles.btn, styles.cancelDeleteBtn] : [styles.btn, styles.cancelBtn];
  const cancelTextStyle = type === "delete" ? styles.cancelDeleteText : styles.cancelText;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* ===== TOP ICON ===== */}
          <Image source={icon} style={[styles.icon, iconTint ? { tintColor: iconTint } : {}]} />

          {/* ===== TITLE ===== */}
          <Text style={styles.title}>{modalTitle}</Text>

          {/* ===== BUTTONS ===== */}
          <View style={styles.row}>
            {/* CONFIRM BUTTON */}
            <TouchableOpacity onPress={onConfirm} style={confirmBtnStyle}>
              <Text style={confirmTextStyle}>{confirmText}</Text>
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity onPress={onClose} style={cancelBtnStyle}>
              <Text style={cancelTextStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: Theme.colors.white,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 8,
    minWidth: 110,
    alignItems: "center",
  },
  // CONFIRM BUTTONS
  yesBtn: {
    backgroundColor: Theme.colors.primaryYellow,
  },
  yesText: {
    color: Theme.colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: Theme.colors.error,
  },
  deleteText: {
    color: Theme.colors.textWhite,
    fontWeight: "700",
    fontSize: 14,
  },
  // CANCEL BUTTONS
  cancelBtn: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.borderYellow,
  },
  cancelText: {
    color: Theme.colors.primaryYellow,
    fontWeight: "700",
    fontSize: 14,
  },
  cancelDeleteBtn: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.borderYellow,
  },
  cancelDeleteText: {
  color: Theme.colors.primaryYellow,
    fontWeight: "700",
    fontSize: 14,
  },
});
