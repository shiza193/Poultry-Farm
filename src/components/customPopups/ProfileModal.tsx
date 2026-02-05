import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getBusinessUnits } from '../../services/BusinessUnit';

export type ProfileData = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  isActive?: boolean;
  businessUnitId?: string | null;

  employeeType?: string;
  salary?: number;
  joiningDate?: string;
  endDate?: string | null;
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
  const { width } = useWindowDimensions();
  const fieldWidth = width < 380 ? '100%' : '48%';

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({ ...data });

  const [nameDraft, setNameDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [addressDraft, setAddressDraft] = useState('');
  const [emailDraft, setEmailDraft] = useState('');

  const [buOpen, setBUOpen] = useState(false);
  const [buItems, setBUItems] = useState<{ label: string; value: string }[]>(
    [],
  );

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const dateIcon = require('../../resources/images/date.png');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [currentDateField, setCurrentDateField] = useState<
    'joiningDate' | 'endDate' | null
  >(null);

  const showDatePicker = (field: 'joiningDate' | 'endDate') => {
    if (!editMode) return; // Only open in edit mode

    setCurrentDateField(field);

    // Use current value if available, otherwise today
    const existing = formData[field] ? new Date(formData[field]!) : new Date();
    setPickerDate(existing);

    setDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setDatePickerVisible(false); // auto close on Android
    if (selectedDate && currentDateField) {
      setFormData(prev => ({
        ...prev,
        [currentDateField]: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      }));
    }
  };

  useEffect(() => {
    if (visible) {
      setFormData({ ...data });
      setNameDraft(data.name ?? '');
      setPhoneDraft(data.phone ?? '');
      setAddressDraft(data.address ?? '');
      setEmailDraft(data.email ?? '');
      setEditMode(false);
    }
  }, [visible, data]);

  useEffect(() => {
    (async () => {
      const units = await getBusinessUnits();
      setBUItems(
        units.map((u: any) => ({
          label: u.name,
          value: u.businessUnitId,
        })),
      );
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      setFormData({ ...data });
      setNameDraft(data.name ?? '');
      // No edit for employee-specific fields (read-only)
      setEditMode(false);
    }
  }, [visible, data]);

  const handleSave = () => {
    const updated =
      type === 'user'
        ? { ...formData, name: nameDraft }
        : type === 'customer'
        ? {
            ...formData,
            name: nameDraft,
            phone: phoneDraft,
            address: addressDraft,
            email: emailDraft,
          }
        : {
            ...formData,
            name: nameDraft,
          };

    onSave?.(updated);
    onClose();
  };

  const renderField = (
    label: string,
    value: string,
    setter?: (v: string) => void,
    editable?: boolean,
  ) => (
    <View style={[styles.field, { width: fieldWidth }]}>
      <Text style={styles.label}>{label}</Text>

      {editable ? (
        <TextInput
          value={value}
          onChangeText={setter}
          style={styles.input}
          placeholder={value ? label : 'N/A'}
          placeholderTextColor="#999"
        />
      ) : (
        <Text style={styles.value}>{value || 'N/A'}</Text>
      )}
    </View>
  );

  const renderDateField = (
    label: string,
    value: string | undefined,
    field: 'joiningDate' | 'endDate',
  ) => (
    <TouchableOpacity
      style={[styles.field, { width: fieldWidth }]}
      onPress={() => showDatePicker(field)}
    >
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.input,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: value ? '#000' : '#999' }}>{value || 'N/A'}</Text>
        {editMode && (
          <Image
            source={dateIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: Theme.colors.buttonPrimary,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{nameDraft?.[0] ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                {/* Name field without label */}
                {editMode ? (
                  <TextInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    style={styles.input}
                    placeholder={nameDraft ? 'Name' : 'N/A'}
                  />
                ) : (
                  <Text style={[styles.value, { fontSize: 16 }]}>
                    {nameDraft || 'N/A'}
                  </Text>
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

            <View style={styles.divider} />

            {/* CONTENT */}
            {/* CONTENT */}
            <ScrollView
              style={{ maxHeight: '70%' }}
              contentContainerStyle={styles.grid}
              keyboardShouldPersistTaps="handled"
            >
              {/* USER SCREEN */}
              {type === 'user' && (
                <>
                  {renderField('Email Address', emailDraft)}
                  {renderField('Created At', formData.createdAt ?? '')}
                </>
              )}

              {/* CUSTOMER SCREEN */}
              {type === 'customer' && (
                <>
                  {renderField('Phone', phoneDraft, setPhoneDraft, editMode)}
                  {renderField('Email', emailDraft, setEmailDraft, editMode)}
                  {renderField(
                    'Address',
                    addressDraft,
                    setAddressDraft,
                    editMode,
                  )}

                  <View style={{ zIndex: 3000, width: fieldWidth }}>
                    <Text style={styles.label}>Poultry Farm</Text>
                    {editMode ? (
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
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                      />
                    ) : (
                      <Text style={styles.value}>
                        {buItems.find(i => i.value === formData.businessUnitId)
                          ?.label || 'N/A'}
                      </Text>
                    )}
                  </View>
                </>
              )}

              {type === 'employee' && (
                <>
                  {renderField(
                    'Employee Type',
                    formData.employeeType ?? 'N/A',
                    undefined,
                    false,
                  )}
                  {renderField(
                    'Salary',
                    formData.salary?.toString() ?? 'N/A',
                    v => setFormData(prev => ({ ...prev, salary: Number(v) })),
                    editMode,
                  )}

                  {renderDateField(
                    'Joining Date',
                    formData.joiningDate,
                    'joiningDate',
                  )}
                  {renderDateField(
                    'End Date',
                    formData.endDate ?? '',
                    'endDate',
                  )}

                  {/* Department Dropdown */}
                  <View style={{ zIndex: 3000, width: fieldWidth }}>
                    <Text style={styles.label}>Department</Text>
                    {editMode ? (
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
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                      />
                    ) : (
                      <Text style={styles.value}>
                        {buItems.find(i => i.value === formData.businessUnitId)
                          ?.label || 'N/A'}
                      </Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
            {isDatePickerVisible && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.discardBtn} onPress={onClose}>
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={editMode ? handleSave : () => setEditMode(true)}
              >
                <Text style={styles.saveText}>
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  activeBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  divider: {
    height: 2,
    backgroundColor: Theme.colors.buttonPrimary,
    marginVertical: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 10 },
  field: { marginBottom: 8 },
  label: { fontSize: 12, color: Theme.colors.dark, marginBottom: 2 },
  value: { fontWeight: '600', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#a5a4a4',
    borderRadius: 6,
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
    borderColor: Theme.colors.borderColor,
  },
});
