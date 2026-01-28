import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";
import Theme from "../../theme/Theme";
import InputField from "../customInputs/Input";
import DropDownPicker from "react-native-dropdown-picker";

interface BusinessUnitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: { name: string; location: string }) => void;
  onResetPassword?: (data: { newPassword: string; confirmPassword: string }) => void;
  initialData?: { name: string; location: string };
  mode?: "add" | "edit" | "filter" | "reset";
  flockItems?: { label: string; value: string }[];
  supplierItems?: { label: string; value: string }[];
  selectedFlockId?: string | null;
  selectedSupplier?: string | null;
  onApplyFilter?: (flockId: string | null, supplierId: string | null) => void;
}

const BusinessUnitModal: React.FC<BusinessUnitModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  onResetPassword,
  mode = "add",
  flockItems = [],
  supplierItems = [],
  selectedFlockId: initialFlockId,
  selectedSupplier: initialSupplier,
  onApplyFilter,
}) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);

  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(
    initialFlockId || null
  );
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(
    initialSupplier || null
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
    } else {
      setName("");
      setLocation("");
    }
    setSelectedFlockId(initialFlockId || null);
    setSelectedSupplier(initialSupplier || null);
  }, [initialData, initialFlockId, initialSupplier, visible]);

  useEffect(() => {
    if (mode === "reset") {
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [visible, mode]);

  const isSaveDisabled = name.trim() === "" || location.trim() === "";

  const handleSave = () => {
    if (isSaveDisabled || !onSave) return;
    onSave({ name, location });
    onClose();
  };

  const handleResetFilter = () => {
    setSelectedFlockId(null);
    setSelectedSupplier(null);
    if (onApplyFilter) onApplyFilter(null, null);
    onClose();
  };

  const handleApplyFilter = () => {
    if (onApplyFilter) onApplyFilter(selectedFlockId, selectedSupplier);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* ===== FILTER MODE ===== */}
          {mode === "filter" && (
            <>
              <Text style={styles.title}>Flock Filter</Text>

              <Text style={styles.inputLabel}>Flock</Text>
              <DropDownPicker
                open={dropdownOpen}
                value={selectedFlockId}
                items={flockItems}
                setOpen={setDropdownOpen}
                setValue={setSelectedFlockId}
                setItems={() => { }}
                placeholder="Select flock"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                dropDownDirection="BOTTOM"
                zIndex={3000}
                zIndexInverse={1000}
              />

              <Text style={styles.inputLabel}>Supplier</Text>
              <DropDownPicker
                open={supplierDropdownOpen}
                value={selectedSupplier}
                items={supplierItems}
                setOpen={setSupplierDropdownOpen}
                setValue={setSelectedSupplier}
                setItems={() => { }}
                placeholder="Select supplier"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetFilter}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilter}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ===== RESET PASSWORD MODE ===== */}
          {mode === "reset" && (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <InputField
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  style={{  paddingRight: 40, paddingVertical: 5 }} 
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowNewPassword(prev => !prev)}
                >
                  <Image
                    source={showNewPassword ? Theme.icons.showPassword : Theme.icons.hidePassword}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <InputField
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword} 
                  secureTextEntry={!showConfirmPassword}
                  style={{  paddingRight: 40, paddingVertical: 5 }} 
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowConfirmPassword(prev => !prev)}
                >
                  <Image
                    source={showConfirmPassword ? Theme.icons.showPassword : Theme.icons.hidePassword}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, styles.discardText]}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    (newPassword.trim() === "" || confirmPassword.trim() === "") && styles.saveButtonDisabled
                  ]}
                  disabled={newPassword.trim() === "" || confirmPassword.trim() === ""}
                  onPress={() => {
                    if (onResetPassword) {
                      onResetPassword({ newPassword, confirmPassword });
                    }
                    onClose();
                  }}
                >
                  <Text style={[styles.buttonText, styles.saveText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}


          {/* ===== ADD / EDIT MODE ===== */}
          {(mode === "add" || mode === "edit") && (
            <>
              <Text style={styles.title}>
                {mode === "add" ? "Add Poultry Farm" : "Edit Poultry Farm"}
              </Text>

              <InputField
                label="Name"
                placeholder="Enter name..."
                value={name}
                onChangeText={setName}
              />

              <InputField
                label="Location"
                placeholder="Enter location..."
                value={location}
                onChangeText={setLocation}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, styles.discardText]}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    isSaveDisabled && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  activeOpacity={isSaveDisabled ? 1 : 0.7}
                  disabled={isSaveDisabled}
                >
                  <Text style={[styles.buttonText, styles.saveText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default BusinessUnitModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#050505",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    minHeight: 45,
    marginBottom: 12,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  resetButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    borderWidth: 2,
    borderColor: Theme.colors.secondaryYellow,
    alignItems: "center",
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Theme.colors.primaryYellow,
    alignItems: "center",
  },
  resetText: {
    color: Theme.colors.secondaryYellow,
    fontWeight: "600",
  },
  applyText: {
    color: Theme.colors.white,
    fontWeight: "600",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    minHeight: 45,
  },
  eyeIconContainer: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  discardButton: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.secondaryYellow,
  },
  saveButton: {
    backgroundColor: Theme.colors.secondaryYellow,
  },
  saveButtonDisabled: {
    backgroundColor: Theme.colors.buttonDisabled,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  discardText: {
    color: Theme.colors.secondaryYellow,
  },
  saveText: {
    color: Theme.colors.white,
  },
});
