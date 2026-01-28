import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';
import { getBusinessUnits } from '../../services/BusinessUnit';

export type ProfileData = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  farm?: string;
  isActive?: boolean;
  businessUnitId?: string | null;
};

type Field = {
  label: string;
  key: keyof ProfileData;
  placeholder?: string;
};

type ProfileModalProps = {
  visible: boolean;
  onClose: () => void;

  data: ProfileData;
  type?: 'user' | 'customer' | 'employee';
  onSave?: (updatedData: ProfileData) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  data,
  type = 'user',
  onSave,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({ ...data });
  const [nameDraft, setNameDraft] = useState(formData.name);
  const [phoneDraft, setPhoneDraft] = useState(formData.phone ?? '');
  const [addressDraft, setAddressDraft] = useState(formData.address ?? '');

  // === DropDown for Poultry Farm / Department ===
  const [buOpen, setBUOpen] = useState(false);
  const [buItems, setBUItems] = useState<{ label: string; value: string }[]>(
    [],
  );
  useEffect(() => {
    if (visible) {
      setFormData({ ...data });
      setNameDraft(data.name);
      setPhoneDraft(data.phone ?? '');
      setAddressDraft(data.address ?? '');
    }
  }, [visible, data]);

  useEffect(() => {
    // Fetch Business Units
    (async () => {
      const units = await getBusinessUnits();
      setBUItems(
        units.map((u: any) => ({ label: u.name, value: u.businessUnitId })),
      );
    })();
  }, []);

  useEffect(() => {
    if (!visible) {
      setEditMode(false);
      setFormData({ ...data });
    } else {
      setFormData({ ...data });
    }
  }, [visible, data]);

  const defaultFields: Field[] = [
    { label: 'Phone Number', key: 'phone', placeholder: '03XX-XXXXXXX' },
    { label: 'Email Address', key: 'email', placeholder: 'example@gmail.com' },
    { label: 'Address', key: 'address', placeholder: 'Enter address' },
  ];

  const handleChange = (key: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const Info = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 'N/A'}</Text>
    </View>
  );

  const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    editable = true,
  }: {
    label: string;
    placeholder?: string;
    value?: string;
    onChangeText: (text: string) => void;
    editable?: boolean;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        style={[styles.input, !editable && { backgroundColor: '#f2f2f2' }]}
      />
    </View>
  );

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
                <Text style={styles.avatarText}>
                  {formData.name?.[0] ?? '?'}
                </Text>
              </View>
              <View>
                {editMode ? (
                  <TextInput
                    style={[styles.name, styles.nameInput]}
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    blurOnSubmit
                  />
                ) : (
                  <Text style={styles.name}>{formData.name}</Text>
                )}
                {formData.isActive !== undefined && (
                  <View
                    style={[
                      styles.activeBadge,
                      {
                        backgroundColor: formData.isActive
                          ? Theme.colors.success
                          : Theme.colors.error,
                      },
                    ]}
                  >
                    <Text style={styles.activeText}>
                      {formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                )}
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

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!editMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {type === 'customer'
                    ? 'Customer Information'
                    : type === 'employee'
                    ? 'Employee Information'
                    : 'User Information'}
                </Text>
                <View style={styles.grid}>
                  {defaultFields.map(field => (
                    <Info
                      key={field.key}
                      label={field.label}
                      value={
                        formData[field.key] !== undefined
                          ? String(formData[field.key])
                          : undefined
                      }
                    />
                  ))}

                  {/* Display Poultry Farm / Department */}
                  {type === 'customer' && (
                    <Info
                      label="Poultry Farm"
                      value={
                        buItems.find(i => i.value === formData.businessUnitId)
                          ?.label ?? '—'
                      }
                    />
                  )}
                  {type === 'employee' && (
                    <Info label="Department" value={formData.farm} />
                  )}
                </View>
              </View>
            )}
            {editMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {type === 'customer'
                    ? 'Customer Information'
                    : type === 'employee'
                    ? 'Employee Information'
                    : 'User Information'}
                </Text>

                <View style={styles.grid}>
                  {/* PHONE */}
                  <Input
                    label="Phone Number"
                    placeholder="03XX-XXXXXXX"
                    value={phoneDraft}
                    onChangeText={setPhoneDraft}
                  />

                  {/* EMAIL (read-only) */}
                  <Input
                    label="Email Address"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChangeText={() => {}}
                    editable={false}
                  />

                  {/* ADDRESS */}
                  <Input
                    label="Address"
                    placeholder="Enter address"
                    value={addressDraft}
                    onChangeText={setAddressDraft}
                  />

                  {/* Dropdown for Poultry Farm / Department */}
                  {(type === 'customer' || type === 'employee') && (
                    <View
                      style={{ width: '50%', marginBottom: 14, zIndex: 1000 }}
                    >
                      <Text style={styles.label}>
                        {type === 'customer' ? 'Poultry Farm' : 'Department'}
                      </Text>
                      <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={buOpen}
                        value={formData.businessUnitId ?? null}
                        items={buItems}
                        setOpen={setBUOpen}
                        setValue={cb =>
                          setFormData(prev => ({
                            ...prev,
                            businessUnitId: cb(prev.businessUnitId),
                          }))
                        }
                        setItems={setBUItems}
                        placeholder={
                          type === 'customer'
                            ? 'Select Poultry Farm'
                            : 'Select Department'
                        }
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        textStyle={styles.dropdownText}
                      />
                    </View>
                  )}
                </View>

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

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      onSave?.({
                        ...formData,
                        name: nameDraft,
                        phone: phoneDraft,
                        address: addressDraft,
                      });

                      setEditMode(false);
                      onClose();
                    }}
                  >
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
    backgroundColor: Theme.colors.white,
    borderRadius: 14,
    padding: 16,
    maxHeight: '90%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#a5a4a4',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 16,
  },

  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dff1e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontWeight: 'bold', color: Theme.colors.black, fontSize: 18 },
  name: { fontSize: 16, fontWeight: 'bold' },
  activeBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  activeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  editBtn: {
    backgroundColor: Theme.colors.buttonPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editText: { color: '#fff', fontSize: 13 },
  divider: {
    height: 2,
    backgroundColor: Theme.colors.buttonPrimary,
    marginVertical: 12,
  },
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  label: { fontSize: 12, color: Theme.colors.dark },
  value: { fontWeight: 'bold', marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#a5a4a4',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  field: { width: '48%', marginBottom: 14 },
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
  discardText: { color: Theme.colors.dark },
  saveBtn: {
    backgroundColor: Theme.colors.buttonPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveText: { color: Theme.colors.black },
  dropdown: {
    borderColor: '#a5a4a4',
    borderRadius: 6,
    backgroundColor: Theme.colors.white,
    minHeight: 36,
  },
  dropdownContainer: {
    borderRadius: 6,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.success,
  },
  dropdownText: { fontSize: 13, color: Theme.colors.black },
});
