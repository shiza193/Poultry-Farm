import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';
import { getBusinessUnits } from '../../services/BusinessUnit';
import DateTimePicker from '@react-native-community/datetimepicker';

import { isValidEmail, isValidPassword } from '../../utils/validation';
import { getEmployeeTypes } from '../../services/EmployeeService';

type ModalType = 'user' | 'customer' | 'employee';

interface AddModalProps {
  visible: boolean;
  type: ModalType;
  title?: string;
  onClose: () => void;
  onSave: (data: any) => void;
  roleItems?: { label: string; value: string }[];
}

const AddModal: React.FC<AddModalProps> = ({
  visible,
  type,
  title,
  onClose,
  onSave,
  roleItems,
}) => {
  /* ===== COMMON ===== */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  /* ===== USER ===== */
  const [role, setRole] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  /* ===== CUSTOMER ===== */
  const [businessUnit, setBusinessUnit] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  /* ===== DROPDOWNS ===== */
  const [roleOpen, setRoleOpen] = useState(false);

  const [buOpen, setBuOpen] = useState(false);
  const [buItems, setBuItems] = useState<{ label: string; value: string }[]>(
    [],
  );

  // Inside AddModal component
  const [poultryFarm, setPoultryFarm] = useState<string | null>(null);
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);

const [employeeType, setEmployeeType] = useState<string | null>(null);
const [typeItems, setTypeItems] = useState<{ label: string; value: string }[]>([]);

  const [showJoiningPicker, setShowJoiningPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);



  useEffect(() => {
  if (type === 'employee') {
    const fetchEmployeeTypes = async () => {
      try {
        const data = await getEmployeeTypes();
        setTypeItems(
          data.map((item: any) => ({
            label: item.name,
            value: item.employeeTypeId,
          }))
        );
      } catch (error) {
        console.log('Employee type error', error);
      }
    };

    fetchEmployeeTypes();
  }
}, [type]);

  /* ===== VALIDATION ===== */
  useEffect(() => {
  if (type === 'employee') {
    const isValid =
      name.trim().length > 0 &&
      employeeType !== null &&
      businessUnit !== null && // poultry farm
      salary.trim().length > 0 &&
      joiningDate !== null; // REQUIRED

    setIsSaveEnabled(isValid);
    return;
  }

  // ===== USER =====
  if (type === 'user') {
    const isValid =
      name.trim().length > 0 &&
      role !== null &&
      isValidEmail(email) &&
      isValidPassword(password);

    setIsSaveEnabled(isValid);
    return;
  }

  // ===== CUSTOMER =====
  if (type === 'customer') {
    setIsSaveEnabled(name.trim().length > 0 && businessUnit !== null);
  }
}, [
  type,
  name,
  employeeType,
  businessUnit,
  salary,
  joiningDate,
  role,
  email,
  password,
]);


  const reset = () => {
    setName('');
    setEmail('');
    setRole(null);
    setPassword('');
    setShowPassword(false);
    setBusinessUnit(null);
    setPhone('');
    setAddress('');
    setRoleOpen(false);
    setBuOpen(false);
    setEmailError('');
  };

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      const units = await getBusinessUnits();
      if (units && Array.isArray(units)) {
        setBuItems(
          units.map((u: any) => ({ label: u.name, value: u.businessUnitId })),
        );
      }
    };
    fetchBusinessUnits();
  }, []);

  /* ===== SAVE ===== */
  const handleSave = () => {
  if (type === 'employee') {
    onSave({
      name,
      employeeType,
      poultryFarm: businessUnit, 
      salary,
      joiningDate,
      endDate,
    });
  } else if (type === 'user') {
    onSave({ name, role, email, password });
  } else {
    onSave({ name, businessUnit, phone, email, address });
  }

  reset();
  onClose();
};


  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>
            {title ?? (type === 'user' ? 'Add User' : 'Add Customer')}
          </Text>

          {/* NAME */}
          <Text style={styles.label}>
            Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name..."
            value={name}
            onChangeText={setName}
          />

          {/* USER */}
          {type === 'user' && (
            <>
              <Text style={styles.label}>
                User Role<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={roleOpen}
                value={role}
                items={roleItems || []} // use prop from screen
                setOpen={setRoleOpen}
                setValue={setRole}
                // setItems={setRoleItems} // you can remove this if screen manages the state
                placeholder="Select role..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              <Text style={styles.label}>
                Email<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email..."
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (text && !isValidEmail(text)) {
                    setEmailError('Enter a valid email');
                  } else {
                    setEmailError('');
                  }
                }}
              />
              {emailError ? (
                <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text>
              ) : null}

              <Text style={styles.label}>
                Password<Text style={styles.required}>*</Text>
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, { paddingRight: 45 }]}
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: 12 }}
                >
                  <Image
                    source={
                      showPassword
                        ? Theme.icons.showPassword
                        : Theme.icons.hidePassword
                    }
                    style={{ width: 25, height: 25 }}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* CUSTOMER */}
          {/* CUSTOMER */}
          {type === 'customer' && (
            <>
              {/* BUSINESS UNIT */}
              <Text style={styles.label}>
                Business Units<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={buOpen}
                value={businessUnit}
                items={buItems}
                setOpen={setBuOpen}
                setValue={setBusinessUnit}
                setItems={setBuItems}
                placeholder="Select business unit..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* PHONE */}
              <Text style={styles.label}>Phone No</Text>
              <TextInput
                style={styles.input}
                placeholder="03XX-XXXXXXX"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {/* EMAIL */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email..."
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (text && !isValidEmail(text)) {
                    setEmailError('Enter a valid email');
                  } else {
                    setEmailError('');
                  }
                }}
              />
              {emailError ? (
                <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text>
              ) : null}

              {/* ADDRESS */}
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter address..."
                multiline
                value={address}
                onChangeText={setAddress}
              />
            </>
          )}

          {type === 'employee' && (
            <>
              <Text style={styles.label}>
                Type<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
  open={typeOpen}
  value={employeeType}
  items={typeItems}
  setOpen={setTypeOpen}
  setValue={setEmployeeType}
  placeholder="Select type..."
  style={styles.dropdown}
  dropDownContainerStyle={styles.dropdownContainer}
/>


              <Text style={styles.label}>
                Salary<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter salary..."
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
              />
              <Text style={styles.label}>
                Poultry Farm<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={buOpen}
                value={businessUnit}
                items={buItems}
                setOpen={setBuOpen}
                setValue={setBusinessUnit}
                setItems={setBuItems}
                placeholder="Select Poultry Farm..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
              {/* ===== EMPLOYEE DATES ===== */}
              <Text style={styles.label}>
                Joining Date<Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setShowJoiningPicker(true)}
              >
                <Text style={{ flex: 1 }}>
                  {joiningDate
                    ? joiningDate.toLocaleDateString()
                    : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.dateIcon} />
              </TouchableOpacity>
              {showJoiningPicker && (
                <DateTimePicker
                  value={joiningDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowJoiningPicker(false);
                    if (date) setJoiningDate(date);
                  }}
                />
              )}

              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ flex: 1 }}>
                  {endDate ? endDate.toLocaleDateString() : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.dateIcon} />
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </>
          )}
          {/* BUTTONS */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.discardButton]}
              onPress={onClose}
            >
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                isSaveEnabled ? styles.saveButton : styles.saveButtonDisabled,
              ]}
              disabled={!isSaveEnabled}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    color: Theme.colors.black,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  required: {
    color: Theme.colors.primaryYellow,
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: Theme.colors.lightGrey,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownContainer: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.borderLight,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 0.45,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.primaryYellow,
  },
  discardText: {
    color: Theme.colors.primaryYellow,
    fontWeight: 'bold',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 10,
  },

  dateIcon: {
    width: 20,
    height: 20,
    tintColor: Theme.colors.buttonPrimary,
    marginLeft: 10,
  },

  saveButton: {
    backgroundColor: Theme.colors.primaryYellow,
  },
  saveButtonDisabled: {
    backgroundColor: Theme.colors.buttonDisabled,
  },
  saveText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
  },
});
