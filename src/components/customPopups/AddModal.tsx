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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { isValidEmail, isValidPassword } from '../../utils/validation';
import { getEmployeeTypes } from '../../services/EmployeeService';

type ModalType =
  | 'user'
  | 'customer'
  | 'employee'
  | 'vaccination'
  | 'vaccination Schedule';

interface AddModalProps {
  visible: boolean;
  type: ModalType;
  title?: string;
  onClose: () => void;
  onSave: (data: any) => void;
  roleItems?: { label: string; value: string }[];
  vaccineItems?: { label: string; value: number }[];
  supplierItems?: { label: string; value: string }[];
  flockItems?: { label: string; value: string }[];

  isEdit?: boolean;
  initialData?: any;
  hidePoultryFarm?: boolean;
  defaultBusinessUnitId?: string | null;
}

const AddModal: React.FC<AddModalProps> = ({
  visible,
  type,
  title,
  onClose,
  onSave,
  roleItems,
  vaccineItems,
  flockItems,
  supplierItems,
  isEdit = false,
  initialData = null,
  hidePoultryFarm = false,
  defaultBusinessUnitId = null,
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
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedEmployeeTypeId, setSelectedEmployeeTypeId] = useState<
    number | null
  >(null);

  const [typeItems, setTypeItems] = useState<
    { label: string; value: number }[]
  >([]);
  const [showJoiningPicker, setShowJoiningPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  /* ===== VACCINATION ===== */
  const [vaccine, setVaccine] = useState<number | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [vaccineOpen, setVaccineOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [vaccinationDate, setVaccinationDate] = useState<Date | null>(null);
  const [showVaccinationPicker, setShowVaccinationPicker] = useState(false);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  /* ===== VACCINATION PAYMENT STATUS ===== */
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [flockOpen, setFlockOpen] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  /* ===== 🟢 EDIT MODE PREFILL USEEFFECT (YAHAN) ===== */
  useEffect(() => {
    if (type === 'vaccination' && isEdit && initialData) {
      setVaccine(initialData.vaccineId);
      setSupplier(initialData.supplierId);
      setQuantity(initialData.quantity?.toString() || '');
      setPrice(initialData.price?.toString() || '');
      setVaccinationDate(initialData.date ? new Date(initialData.date) : null);
      setNote(initialData.note || '');
      setPaymentStatus(initialData.isPaid ? 'Paid' : 'Unpaid');
    }

    if (type === 'vaccination' && !isEdit) {
      setVaccine(null);
      setSupplier(null);
      setQuantity('');
      setVaccinationDate(null);
      setPrice('');
      setNote('');
      setPaymentStatus('Paid');
    }
  }, [type, isEdit, initialData, visible]);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (type === 'employee') {
      const fetchEmployeeTypes = async () => {
        try {
          const data = await getEmployeeTypes();
          setTypeItems(
            data.map((item: any) => ({
              label: item.name,
              value: item.employeeTypeId,
            })),
          );
        } catch (error) {
          console.log('Employee type error', error);
        }
      };

      fetchEmployeeTypes();
    }
  }, [type]);

  useEffect(() => {
    if (type === 'employee' && hidePoultryFarm && defaultBusinessUnitId) {
      setBusinessUnit(defaultBusinessUnitId);
    }
  }, [type, hidePoultryFarm, defaultBusinessUnitId, visible]);

  useEffect(() => {
    if (type === 'employee') {
      const isValid =
        name.trim().length > 0 &&
        selectedEmployeeTypeId !== null &&
        salary.trim().length > 0 &&
        joiningDate !== null &&
        (hidePoultryFarm ? true : businessUnit !== null);
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
    if (type === 'vaccination') {
      const isValid =
        vaccine !== null &&
        quantity.trim().length > 0 &&
        vaccinationDate !== null &&
        supplier !== null;
      setIsSaveEnabled(isValid);
      return;
    }
    // ===== CUSTOMER =====
    if (type === 'customer') {
      setIsSaveEnabled(name.trim().length > 0 && businessUnit !== null);
    }
    // ADD THIS FOR VACCINATION SCHEDULE
    if (type === 'vaccination Schedule') {
      const isValid =
        vaccine !== null &&
        selectedFlock !== null &&
        vaccinationDate !== null &&
        quantity.trim().length > 0;

      setIsSaveEnabled(isValid);
    }
  }, [
    type,
    name,
    selectedEmployeeTypeId,
    businessUnit,
    salary,
    joiningDate,
    role,
    email,
    password,
    vaccine,
    supplier,
    quantity,
    vaccinationDate,
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
    setVaccine(null);
    setSupplier(null);
    setQuantity('');
    setVaccinationDate(null);
    setPrice('');
    setNote('');
    setPaymentStatus('Paid');
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
      if (!selectedEmployeeTypeId) {
        return;
      }
      onSave({
        name,
        type: selectedEmployeeTypeId,
        poultryFarm: hidePoultryFarm ? defaultBusinessUnitId : businessUnit,
        salary: Number(salary),
        joiningDate,
        endDate,
      });
    } else if (type === 'user') {
      onSave({ name, role, email, password });
    } else if (type === 'customer') {
      onSave({ name, businessUnit, phone, email, address });
    } else if (type === 'vaccination') {
      onSave({
        vaccine,
        quantity,
        date: vaccinationDate,
        supplier,
        price,
        note,
        paymentStatus,
      });
    } else if (type === 'vaccination Schedule') {
      onSave({
        flockId: selectedFlock,
        vaccineId: vaccine,
        scheduledDate: vaccinationDate,
        quantity,
      });
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
          {type !== 'vaccination' && type !== 'vaccination Schedule' && (
            <>
              <Text style={styles.label}>
                Name<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name..."
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          {/* USER */}
          {type === 'user' && (
            <>
              <Text style={styles.label}>
                User Role<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={roleOpen}
                value={role}
                items={roleItems || []}
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
                  onChangeText={text => {
                    setPassword(text);
                    // Show validation error below
                    if (text && !isValidPassword(text)) {
                      setPasswordError(
                        'Password must be 8+ chars, include uppercase, lowercase, number & symbol',
                      );
                    } else {
                      setPasswordError('');
                    }
                  }}
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

              {/* Show password error */}
              {passwordError ? (
                <Text style={{ color: 'red', fontSize: 12, marginBottom: 5 }}>
                  {passwordError}
                </Text>
              ) : null}
            </>
          )}

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
                value={selectedEmployeeTypeId} // ✅ ID
                items={typeItems} // value = employeeTypeId
                setOpen={setTypeOpen}
                setValue={setSelectedEmployeeTypeId} // ✅ ID set hogi
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
              {!hidePoultryFarm && (
                <>
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
                </>
              )}

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
          {type === 'vaccination' && (
            <>
              {/* VACCINE */}
              <Text style={styles.label}>
                Vaccine<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={vaccineOpen}
                value={vaccine}
                items={vaccineItems || []}
                setOpen={setVaccineOpen}
                setValue={setVaccine}
                placeholder="Select vaccine..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
              {/* QUANTITY */}
              <Text style={styles.label}>
                Quantity<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity..."
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />

              {/* DATE */}
              <Text style={styles.label}>
                Date<Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setShowVaccinationPicker(true)}
              >
                <Text style={{ flex: 1 }}>
                  {vaccinationDate
                    ? vaccinationDate.toLocaleDateString()
                    : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.dateIcon} />
              </TouchableOpacity>
              {showVaccinationPicker && (
                <DateTimePicker
                  value={vaccinationDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                      setVaccinationDate(date);
                    }
                    setShowVaccinationPicker(false);
                  }}
                />
              )}

              {/* SUPPLIER */}
              <Text style={styles.label}>
                Supplier<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={supplierOpen}
                value={supplier}
                items={supplierItems || []}
                setOpen={setSupplierOpen}
                setValue={setSupplier}
                placeholder="Select supplier..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* PRICE */}
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              {/* NOTE */}
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter note..."
                multiline
                value={note}
                onChangeText={setNote}
              />
              {/* PAID / UNPAID RADIO TOGGLE */}
              {!isEdit && (
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  {(['Paid', 'Unpaid'] as const).map(status => (
                    <TouchableOpacity
                      key={status}
                      style={styles.radioContainer}
                      onPress={() => setPaymentStatus(status)}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          paymentStatus === status && styles.radioSelected,
                        ]}
                      >
                        {paymentStatus === status && (
                          <View style={styles.radioTick} />
                        )}
                      </View>
                      <Text style={{ marginLeft: 8 }}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {type === 'vaccination Schedule' && (
            <>
              {/* VACCINE */}
              <Text style={styles.label}>Vaccine Name</Text>
              <DropDownPicker
                open={vaccineOpen}
                value={vaccine}
                items={vaccineItems || []}
                setOpen={setVaccineOpen}
                setValue={setVaccine}
                placeholder="Select vaccine..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
              {/* DATE */}
              <Text style={styles.label}>Schedule Date</Text>
              <TouchableOpacity
                style={styles.inputWithIcon}
                onPress={() => setShowVaccinationPicker(true)}
              >
                <Text style={{ flex: 1 }}>
                  {vaccinationDate
                    ? vaccinationDate.toLocaleDateString()
                    : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.dateIcon} />
              </TouchableOpacity>

              {showVaccinationPicker && (
                <DateTimePicker
                  value={vaccinationDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    if (event.type === 'set' && date) {
                      setVaccinationDate(date);
                    }
                    setShowVaccinationPicker(false);
                  }}
                />
              )}
              {/* FLOCK */}
              <Text style={styles.label}>
                Flock<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={flockOpen}
                value={selectedFlock}
                items={flockItems || []}
                setOpen={setFlockOpen}
                setValue={setSelectedFlock}
                placeholder="Select flock..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
              {/* QUANTITY */}
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity..."
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
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
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
  },

  radioSelected: {
    backgroundColor: Theme.colors.primaryYellow,
  },

  radioTick: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.white,
  },
});
