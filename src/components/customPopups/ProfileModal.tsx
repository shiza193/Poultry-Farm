import React, { useState } from 'react';
import { useEffect } from 'react';

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  InputAccessoryView,
} from 'react-native';
import Theme from '../../theme/Theme';

const ProfileModal = ({ visible, onClose }: any) => {
  const [editMode, setEditMode] = useState(false);

  const Info = ({ label, value }: any) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  const Input = ({ label, placeholder }: any) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholder={placeholder} style={styles.input} />
    </View>
  );

  useEffect(() => {
  if (!visible) {
    setEditMode(false);
  }
}, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* TOP SECTION */}
          <View style={styles.topRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>S</Text>
              </View>

              <View>
                <Text style={styles.name}>shiza</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>ACTIVE</Text>
                </View>
              </View>
            </View>

            {!editMode && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* GREEN LINE */}
          <View style={styles.divider} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {!editMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Supplier Information</Text>

                <View style={styles.grid}>
                  <Info label="Phone Number" value="N/A" />
                  <Info label="Email Address" value="N/A" />
                  <Info label="Address" value="N/A" />
                </View>

                <Info label="Poultry Farm" value="My poultry" />
              </View>
            )}

            {/* EDIT MODE */}
            {editMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Supplier Information</Text>

                <View style={styles.grid}>
                  <Input label="Phone Number" placeholder="03XX-XXXXXXX" />
                  <Input
                    label="Email Address"
                    placeholder="example@gmail.com"
                  />
                  <Input label="Address" placeholder="Enter address" />
                </View>

                <Input label="Poultry Farm" placeholder="My poultry" />

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.discardBtn}
                    onPress={() => {
                      setEditMode(false);
                      onClose();
                    }}
                  >
                    <Text style={styles.discardText}>Discard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    maxHeight: '90%',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dff1e7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontWeight: 'bold',
    color: Theme.colors.black,
    fontSize: 18,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  activeBadge: {
    backgroundColor: Theme.colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  activeText: {
    color: '#fff',
    fontSize: 11,
  },

  editBtn: {
    backgroundColor: Theme.colors.buttonPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  editText: {
    color: '#fff',
    fontSize: 13,
  },

  divider: {
    height: 2,
    backgroundColor: Theme.colors.buttonPrimary,
    marginVertical: 12,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  label: {
    fontSize: 12,
    color: Theme.colors.black,
  },

  value: {
    fontWeight: 'bold',
    marginTop: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: '#a5a4a4',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },

  field: {
    width: '48%',
    marginBottom: 14,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },

  discardBtn: {
    borderWidth: 2,
    borderColor: Theme.colors.buttonPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  discardText: {
    color: Theme.colors.black,
  },

  saveBtn: {
    backgroundColor: Theme.colors.buttonPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  saveText: {
    color: '#fff',
  },
});
