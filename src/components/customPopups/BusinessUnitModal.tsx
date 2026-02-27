import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Theme from '../../theme/Theme';
import InputField from '../customInputs/Input';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { isValidPassword } from '../../utils/validation';

export type SaleFilterModel = {
  fromDate: Date | null;
  toDate: Date | null;
  customerId: string | null;
  searchKey?: string;
};

type AccountHeadPayload = {
  name: string;
  accountType: string;
  isActive: boolean;
};
interface BusinessUnitModalProps {
  visible: boolean;
  onClose: () => void;
  accountTypeItems?: { label: string; value: string }[];
  accountOptions?: { label: string; value: string }[];
  voucherTypeOptions?: { label: string; value: number }[];
  initialSaleFilters?: SaleFilterModel;
  onResetPassword?: (data: {
    newPassword: string;
    confirmPassword: string;
  }) => void;

  selectedFlockId?: string | null;
  selectedSupplier?: string | null;
  isComplete?: boolean;
  onApplyFilter?: (
    flockId: string | null,
    supplierId: string | null,
    isComplete: boolean | null,
  ) => void;
  onApplyvoucherFilter?: (
    fromDate: Date | null,
    toDate: Date | null,
    accountId: string | null,
    voucherTypeId: number | null,
  ) => void;
  // mode
  mode?:
  | 'add'
  | 'edit'
  | 'filter'
  | 'reset'
  | 'singleField'
  | 'accountHead'
  | 'saleFilter'
  | 'voucher';

  // Add/Edit mode
  onSave?: (data: {
    name: string;
    location: string;
    businessTypeId?: number;
  }) => void;

  // SingleField mode
  onSaveSingleField?: (data: { value: string }) => void;
  onApplySaleFilter?: (filters: SaleFilterModel) => void;
  customerItems?: { label: string; value: string }[];

  onSaveAccountHead?: (data: AccountHeadPayload) => void;

  initialData?: { name: string; location: string };
  modalTitle?: string;
  singleFieldLabel?: string;
  singleFieldValue?: string;
  flockItems?: {
    label: string;
    id: string;
  }[];

  supplierItems?: {
    label: string;
    id: string;
  }[];
}

const BusinessUnitModal: React.FC<BusinessUnitModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  onSaveAccountHead,
  onResetPassword,
  onSaveSingleField,
  isComplete,
  mode = 'add',
  initialSaleFilters,
  flockItems = [],
  supplierItems = [],
  selectedFlockId: initialFlockId,
  selectedSupplier: initialSupplier,
  onApplyFilter,
  onApplyvoucherFilter,
  singleFieldLabel,
  onApplySaleFilter,
  customerItems = [],
  singleFieldValue,
  modalTitle,
  accountTypeItems = [],
  accountOptions = [],
  voucherTypeOptions = [],
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(
    initialFlockId || null,
  );
  const [complete, setComplete] = useState<boolean>(false);

  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(
    initialSupplier || null,
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordBlur = () => {
    if (!isValidPassword(newPassword)) {
      setPasswordError(
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.'
      );
    } else {
      setPasswordError(null);
    }
  };
  /* ===== ACCOUNT HEAD ===== */
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [accountTypeOpen, setAccountTypeOpen] = useState(false);

  const [isActive, setIsActive] = useState<'Active' | 'Inactive'>('Active');
  /* ===== Voucher ===== */
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [accountId, setAccountId] = useState<string | null>(null);
  const [voucherTypeId, setVoucherTypeId] = useState<number | null>(null);

  // sale filter
  const [saleFromDate, setSaleFromDate] = useState<Date | null>(null);
  const [saleToDate, setSaleToDate] = useState<Date | null>(null);
  const [saleCustomer, setSaleCustomer] = useState<string | null>(null);

  const [showSaleFromPicker, setShowSaleFromPicker] = useState(false);
  const [showSaleToPicker, setShowSaleToPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
    } else {
      setName('');
      setLocation('');
    }
    setSelectedFlockId(initialFlockId || null);
    setSelectedSupplier(initialSupplier || null);
  }, [initialData, initialFlockId, initialSupplier, visible]);
  useEffect(() => {
    if (mode === 'reset') {
      // Clear password fields
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordError(null);
      setPasswordMismatch(false);
    }
  }, [visible, mode]);
  // ===== PREFILL DATA =====
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
    }

    if (mode === 'singleField') {
      setName(singleFieldValue || '');
    }
    if (mode === 'reset') {
      setNewPassword('');
      setConfirmPassword('');
    }

    setSelectedFlockId(initialFlockId || null);
    setSelectedSupplier(initialSupplier || null);
  }, [mode, initialData, singleFieldValue, visible]);

  // ===== TITLE LOGIC  =====
  const getTitle = () => {
    if (modalTitle) return modalTitle;

    if (mode === 'singleField') return singleFieldLabel || 'Add Item';
    if (mode === 'add') return 'Add Poultry Farm';
    if (mode === 'edit') return 'Edit Poultry Farm';
    if (mode === 'filter') return 'Flock Filter';
    if (mode === 'reset') return 'Reset Password';
    if (mode === 'accountHead') return 'Add Account';
    if (mode === 'voucher') return 'Voucher Filters';
    if (mode === 'saleFilter') return 'Sale Filters';

    return '';
  };

  const handleSave = () => {
    if (mode === 'singleField') {
      onSaveSingleField?.({ value: name });
    } else {
      onSave?.({ name, location });
    }
    onClose();
  };
  useEffect(() => {
    if (mode === 'reset') {
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [visible, mode]);
  useEffect(() => {
    if (visible && mode === 'saleFilter') {
      setSaleFromDate(initialSaleFilters?.fromDate || null);
      setSaleToDate(initialSaleFilters?.toDate || null);
      setSaleCustomer(initialSaleFilters?.customerId || null);
    }
  }, [visible, mode, initialSaleFilters]);
  useEffect(() => {
    if (!visible || mode !== 'filter') return;

    setComplete(isComplete ?? false);
  }, [visible, mode, isComplete]);

  const isSaveDisabled =
    mode === 'singleField'
      ? name.trim() === ''
      : name.trim() === '' || location.trim() === '';

  const handleResetFilter = () => {
    setSelectedFlockId(null);
    setSelectedSupplier(null);
    setComplete(false);

    onApplyFilter?.(null, null, null);
    onClose();
  };

  const handleApplyFilter = () => {
    onApplyFilter?.(selectedFlockId, selectedSupplier, complete);
    onClose();
  };

  const handleResetVoucherFilter = () => {
    setFromDate(null);
    setToDate(null);
    setAccountId(null);
    setVoucherTypeId(null);

    onApplyvoucherFilter?.(null, null, null, null);
    onClose();
  };

  const handleApplyVoucherFilter = () => {
    onApplyvoucherFilter?.(fromDate, toDate, accountId, voucherTypeId);
    onClose();
  };
  useEffect(() => {
    if (mode === 'singleField') {
      setName(singleFieldValue || '');
    }
  }, [mode, singleFieldValue, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{getTitle()}</Text>

          {/* ===== FILTER MODE ===== */}
          {mode === 'filter' && (
            <>
              {/* <Text style={styles.title}>Flock Filter</Text> */}

              <Text style={styles.inputLabel}>Status</Text>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 8,
                }}
                onPress={() => setComplete(prev => !prev)}
              >
                <View
                  style={[
                    styles.checkboxSmall,
                    complete && { backgroundColor: Theme.colors.primaryYellow },
                  ]}
                />
                <Text style={{ marginLeft: 8 }}>Complete</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Flock</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={flockItems}
                labelField="label"
                valueField="id"
                placeholder="Select flock"
                value={selectedFlockId}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => {
                  setSelectedFlockId(item.id);
                }}
              />

              <Text style={styles.inputLabel}>Supplier</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={supplierItems}
                labelField="label"
                valueField="id"
                placeholder="Select supplier"
                value={selectedSupplier}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => {
                  setSelectedSupplier(item.id);
                }}
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
          {/* ===== Voucher MODE ===== */}
          {mode === 'voucher' && (
            <>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={styles.dateItem}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={styles.dateLabel}>From:</Text>
                  <Text style={styles.dateValue}>
                    {fromDate
                      ? fromDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YY'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.dateDash}>—</Text>

                <TouchableOpacity
                  style={styles.dateItem}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={styles.dateLabel}>To:</Text>
                  <Text style={styles.dateValue}>
                    {toDate ? toDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ACCOUNT DROPDOWN */}
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={accountOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Account"
                value={accountId}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => setAccountId(item.value)}
              />

              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={voucherTypeOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Voucher Type"
                value={voucherTypeId}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                onChange={item => setVoucherTypeId(item.value)}
              />

              {showFromPicker && (
                <DateTimePicker
                  value={fromDate || new Date()}
                  mode="date"
                  onChange={(event, date) => {
                    setShowFromPicker(false);
                    if (event.type === 'set' && date) {
                      setFromDate(date);
                    }
                  }}
                />
              )}

              {showToPicker && (
                <DateTimePicker
                  value={toDate || new Date()}
                  mode="date"
                  onChange={(event, date) => {
                    setShowToPicker(false);
                    if (event.type === 'set' && date) {
                      setToDate(date);
                    }
                  }}
                />
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetVoucherFilter}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyVoucherFilter}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ===== RESET PASSWORD MODE ===== */}
          {mode === 'reset' && (
            <>
              {/* <Text style={styles.title}>Reset Password</Text> */}
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <InputField
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onBlur={handlePasswordBlur}
                  secureTextEntry={!showNewPassword}
                  style={{ paddingRight: 40, paddingVertical: 5 }}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setShowNewPassword(prev => !prev)}
                >
                  <Image
                    source={
                      showNewPassword
                        ? Theme.icons.showPassword
                        : Theme.icons.hidePassword
                    }
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={{ color: 'red', marginTop: -4 }}>{passwordError}</Text>
              )}
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                <View style={styles.passwordContainer}>
                  <InputField
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);

                      if (newPassword === text) {
                        setPasswordMismatch(false);
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    onBlur={() => {
                      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                        setPasswordMismatch(true);
                      } else {
                        setPasswordMismatch(false);
                      }
                    }}
                    style={{ paddingRight: 40, paddingVertical: 5 }}
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

                {/* Validation text below field */}
                {passwordMismatch && (
                  <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    Password do not match
                  </Text>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, styles.discardText]}>
                    Discard
                  </Text>
                </TouchableOpacity>
                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    (newPassword.trim() === '' ||
                      confirmPassword.trim() === '' ||
                      newPassword !== confirmPassword) &&
                    styles.saveButtonDisabled
                  ]}
                  disabled={
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  onPress={() => {
                    if (newPassword !== confirmPassword) {
                      setPasswordMismatch(true);
                      return;
                    }

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
          {(mode === 'add' || mode === 'edit') && (
            <>
              {/* <Text style={styles.title}>
                {modalTitle
                  ? modalTitle
                  : mode === 'add'
                  ? 'Add Poultry Farm'
                  : mode === 'edit'
                  ? 'Edit Poultry Farm'
                  : singleFieldLabel || 'Add Item'}
              </Text> */}

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
                  <Text style={[styles.buttonText, styles.discardText]}>
                    Discard
                  </Text>
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
          {/* ===== SINGLE FIELD MODE ===== */}
          {mode === 'singleField' && (
            <>
              {/* INPUT LABEL */}
              <Text style={styles.inputLabel}>
                {singleFieldLabel || 'Value'}
              </Text>

              {/* INPUT FIELD */}
              <InputField
                placeholder={`Enter ${singleFieldLabel?.toLowerCase() || 'value'
                  }...`}
                value={name}
                onChangeText={setName}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onClose}
                >
                  <Text style={styles.discardText}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    name.trim() === '' && styles.saveButtonDisabled,
                  ]}
                  disabled={name.trim() === ''}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {/* ===== ACCOUNT HEAD MODE ===== */}
          {mode === 'accountHead' && (
            <>
              {/* ACCOUNT NAME */}
              <Text style={styles.inputLabel}>
                Account Name<Text style={styles.required}>*</Text>
              </Text>
              <InputField
                placeholder="Enter account name..."
                value={accountName}
                onChangeText={setAccountName}
              />

              {/* ACCOUNT TYPE / PARENT ACCOUNT */}
              <Text style={styles.inputLabel}>
                Parent Account<Text style={styles.required}>*</Text>
              </Text>
              <DropDownPicker
                open={accountTypeOpen}
                value={accountType}
                items={accountTypeItems || []}
                setOpen={setAccountTypeOpen}
                setValue={setAccountType}
                placeholder="Select parent account..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />

              {/* STATUS */}
              <Text style={styles.inputLabel}>Status</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {(['Active', 'Inactive'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={styles.radioContainer}
                    onPress={() => setIsActive(status)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        isActive === status && styles.radioSelected,
                      ]}
                    >
                      {isActive === status && <View style={styles.radioTick} />}
                    </View>
                    <Text style={{ marginLeft: 8 }}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* BUTTONS */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onClose}
                >
                  <Text style={styles.discardText}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    (!accountName || !accountType) && styles.saveButtonDisabled,
                  ]}
                  disabled={!accountName || !accountType}
                  onPress={() => {
                    onSaveAccountHead?.({
                      name: accountName,
                      accountType: accountType!, // parentId
                      isActive: isActive === 'Active',
                    });
                    onClose();
                  }}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {mode === 'saleFilter' && (
            <>
              {/* DATE RANGE */}
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={styles.dateItem}
                  onPress={() => setShowSaleFromPicker(true)}
                >
                  <Text style={styles.dateLabel}>From:</Text>
                  <Text style={styles.dateValue}>
                    {saleFromDate
                      ? saleFromDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YY'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.dateDash}>—</Text>

                <TouchableOpacity
                  style={styles.dateItem}
                  onPress={() => setShowSaleToPicker(true)}
                >
                  <Text style={styles.dateLabel}>To:</Text>
                  <Text style={styles.dateValue}>
                    {saleToDate
                      ? saleToDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YY'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CUSTOMER DROPDOWN */}
              <Text style={styles.inputLabel}>Customer</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={customerItems || []}
                labelField="label"
                valueField="value"
                placeholder="Select customer"
                value={saleCustomer || null} // value must match Dropdown's valueField
                onChange={item => setSaleCustomer(String(item.value))} // ensure string
              />

              {/* BUTTONS */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSaleFromDate(null);
                    setSaleToDate(null);
                    setSaleCustomer(null);
                    onApplySaleFilter?.({
                      fromDate: null,
                      toDate: null,
                      customerId: null,
                    });
                    onClose();
                  }}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => {
                    onApplySaleFilter?.({
                      fromDate: saleFromDate,
                      toDate: saleToDate,
                      customerId: saleCustomer,
                    });
                    onClose();
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* DATE PICKERS */}
              {showSaleFromPicker && (
                <DateTimePicker
                  value={saleFromDate || new Date()}
                  mode="date"
                  onChange={(e, d) => {
                    setShowSaleFromPicker(false);
                    if (e.type === 'set' && d) setSaleFromDate(d);
                  }}
                />
              )}
              {showSaleToPicker && (
                <DateTimePicker
                  value={saleToDate || new Date()}
                  mode="date"
                  onChange={(e, d) => {
                    setShowSaleToPicker(false);
                    if (e.type === 'set' && d) setSaleToDate(d);
                  }}
                />
              )}
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: Theme.colors.black,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.black,
    marginBottom: 6,
    marginTop: 8,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: 4,
    marginRight: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dropdownContainer: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
  },
  dropdownPlaceholder: {
    color: Theme.colors.black,
    fontSize: 14,
    marginLeft: 10,
  },

  dropdownText: {
    color: '#000',
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
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
  required: {
    color: Theme.colors.primaryYellow,
    fontWeight: 'bold',
    fontSize: 20,
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

  resetButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    borderWidth: 2,
    borderColor: Theme.colors.secondaryYellow,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Theme.colors.primaryYellow,
    alignItems: 'center',
  },
  resetText: {
    color: Theme.colors.secondaryYellow,
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Theme.colors.secondaryYellow,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusActive: {
    backgroundColor: Theme.colors.secondaryYellow,
  },
  statusInactive: {
    backgroundColor: Theme.colors.white,
  },
  activeText: {
    color: Theme.colors.white,
    fontWeight: '700',
  },
  inactiveText: {
    color: Theme.colors.secondaryYellow,
    fontWeight: '700',
  },

  applyText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    minHeight: 45,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dateItem: {
    flexDirection: 'row', // 🔥 SAME ROW

    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
  },

  dateLabel: {
    fontSize: 13,
    color: Theme.colors.black,
  },

  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.success,
  },

  dateDash: {
    marginHorizontal: 8,
    fontSize: 18,
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
    fontWeight: '700',
  },
  discardText: {
    color: Theme.colors.secondaryYellow,
  },
  saveText: {
    color: Theme.colors.white,
  },
});
