import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';
import { getBusinessUnits } from '../../services/BusinessUnit';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { isValidEmail, isValidPassword } from '../../utils/validation';
import { getEmployeeTypes } from '../../services/EmployeeService';
import {
  getEggProducedUnits,
  getFlockTotalEggs,
} from '../../services/EggsService';
import { Dropdown } from 'react-native-element-dropdown';

type ModalType =
  | 'user'
  | 'customer'
  | 'employee'
  | 'vaccination'
  | 'vaccination Schedule'
  | 'Egg production'
  | 'Egg sale'
  | 'Feed Record'
  | 'Feed Consumption';
interface AddModalProps {
  visible: boolean;
  type: ModalType;
  title?: string;
  onClose: () => void;
  onSave: (data: any) => void;
  roleItems?: { label: string; id: string }[];
  vaccineItems?: { label: string; value: number }[];
  supplierItems?: { label: string; value: string }[];
  flockItems?: { label: string; value: string }[];
  customerItems?: { label: string; value: string }[];
  unitItems?: { label: string; value: number }[];
  feedItems?: { label: string; value: number }[];
  feedTypeItems?: { label: string; value: number }[];

  setUnitItems?: React.Dispatch<
    React.SetStateAction<{ label: string; value: number }[]>
  >;
  hideBusinessUnit?: boolean;
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
  unitItems,
  feedItems,
  feedTypeItems,
  customerItems,
  supplierItems,
  isEdit = false,
  initialData = null,
  hidePoultryFarm = false,
  hideBusinessUnit = false,
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
  const [date, setDate] = useState<Date | null>(null);

  const [typeOpen, setTypeOpen] = useState(false);
  const [selectedEmployeeTypeId, setSelectedEmployeeTypeId] = useState<
    number | null
  >(null);

  const [typeItems, setTypeItems] = useState<{ label: string; id: string }[]>(
    [],
  );
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
  /* =====  EDIT MODE PREFILL USEEFFECT (YAHAN) ===== */
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
  useEffect(() => {
    if (type === 'vaccination Schedule' && initialData && visible) {
      setVaccine(initialData.vaccineId ?? null);
      setSelectedFlock(initialData.flockId ?? null);
      setQuantity(initialData.quantity ? String(initialData.quantity) : '');
      setVaccinationDate(
        initialData.scheduledDate ? new Date(initialData.scheduledDate) : null,
      );
    }

    if (type === 'vaccination Schedule' && !initialData && visible) {
      reset();
    }
  }, [type, initialData, visible]);
  const [passwordError, setPasswordError] = useState('');
  /* ===== Eggs States ===== */
  const [intactEggs, setIntactEggs] = useState<number>(0);
  const [brokenEggs, setBrokenEggs] = useState<number>(0);
  const totalEggs = (Number(intactEggs) || 0) + (Number(brokenEggs) || 0);
  const [unitOpen, setUnitOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Fill fields when initialData changes
  useEffect(() => {
    if (initialData && visible) {
      setSelectedFlock(initialData.flockId);
      setSelectedUnit(
        initialData.unitId !== null ? Number(initialData.unitId) : null,
      );
      setEndDate(initialData.date ? new Date(initialData.date) : null);
      setIntactEggs(initialData.fertileEggs ?? 0);
      setBrokenEggs(initialData.brokenEggs ?? 0);
    }
  }, [initialData, visible]);
  useEffect(() => {
    if (!initialData && visible) {
      setSelectedFlock(null);
      setSelectedUnit(null);
      setEndDate(null);
      setIntactEggs(0);
      setBrokenEggs(0);
    }
  }, [initialData, visible]);
  /* ===== FEED RECORD ===== */
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedFeedTypeId, setSelectedFeedTypeId] = useState<number | null>(
    null,
  );
  const [feedDate, setFeedDate] = useState<Date | null>(null);
  const [showFeedDatePicker, setShowFeedDatePicker] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedtypeOpen, setFeedTypeOpen] = useState(false);
  const [bag, setbag] = useState('1');

  /* ===== Egg Sale ===== */
  const [trayCount, setTrayCount] = useState('');
  const [eggCount, setEggCount] = useState('');
  const [trayError, setTrayError] = useState('');
  const [eggError, setEggError] = useState('');
  const [flockEggs, setFlockEggs] = useState<{
    tray: number;
    eggs: number;
    patti: number;
  } | null>(null);
  const [loadingFlockEggs, setLoadingFlockEggs] = useState(false);
  const [patti, setPatti] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const calculateTotalPrice = () => {
    const pattiPrice = Number(price) || 0;
    const eggs = Number(eggCount) || 0;
    const pattis = Number(patti) || 0;
    const trays = Number(trayCount) || 0;
    const pricePerEgg = pattiPrice / 360;
    const pricePerTray = pricePerEgg * 30;
    const pricePerPatti = pricePerEgg * 360;
    const total =
      eggs * pricePerEgg + pattis * pricePerPatti + trays * pricePerTray;
    setTotalPrice(total);
  };
  useEffect(() => {
    calculateTotalPrice();
  }, [price, eggCount, patti, trayCount]);
  useEffect(() => {
    const fetchFlockEggs = async () => {
      if (selectedFlock) {
        setLoadingFlockEggs(true);
        const data = await getFlockTotalEggs(selectedFlock);
        setFlockEggs(data);
        setLoadingFlockEggs(false);
      } else {
        setFlockEggs(null);
      }
    };
    fetchFlockEggs();
  }, [selectedFlock]);
  const [unitItemsLocal, setUnitItemsLocal] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedFlock) {
        setUnitItemsLocal([]);
        return;
      }

      try {
        const data = await getEggProducedUnits(selectedFlock);
        const items = data.map((u: any) => ({
          label: u.name,
          value: u.unitId,
        }));
        setUnitItemsLocal(items);
      } catch (err) {
        console.log('Unit fetch error', err);
      }
    };

    if (type === 'Egg sale') {
      fetchUnits();
    }
  }, [selectedFlock, type]);

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
      const isValid =
        name.trim().length > 0 &&
        (hideBusinessUnit ? true : businessUnit !== null);
      setIsSaveEnabled(isValid);
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
    if (type === 'Egg production') {
      const isValid =
        selectedFlock !== null && selectedUnit !== null && endDate !== null;

      setIsSaveEnabled(isValid);
      return;
    }
    if (type === 'Egg sale') {
      const tray = Number(trayCount);
      const eggs = Number(eggCount);

      let valid = true;

      if (trayCount !== '' && (tray < 0 || tray > 11)) {
        setTrayError('Tray should be in given range 0 to 11');
        valid = false;
      } else {
        setTrayError('');
      }

      if (eggCount !== '' && (eggs < 1 || eggs > 29)) {
        setEggError('Egg should be in given range 1 to 29');
        valid = false;
      } else {
        setEggError('');
      }
      console.log('unitItems in modal:', unitItems);

      setIsSaveEnabled(
        selectedCustomer !== null &&
        selectedFlock !== null &&
        endDate !== null &&
        price.trim().length > 0 &&
        selectedUnit !== null &&
        valid,
      );
      console.log('AddModal Save Data:', {
        price,
        eggs,
      });
    }
    if (type === 'Feed Record') {
      const isValid =
        selectedFeedId !== null &&
        selectedFeedTypeId !== null &&
        quantity.trim().length > 0 &&
        feedDate !== null &&
        supplier !== null;

      setIsSaveEnabled(isValid);
    }
    if (type === 'Feed Consumption') {
      const isValid =
        selectedFlock !== null &&
        feedDate !== null &&
        selectedFeedId !== null &&
        bag.trim().length > 0;

      setIsSaveEnabled(isValid);
      return;
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
    selectedFlock,
    selectedUnit,
    endDate,
    price,
    selectedCustomer,
    selectedFeedId,
    feedDate,
    bag,
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
  useEffect(() => {
    if (type === 'employee') {
      if (hidePoultryFarm && defaultBusinessUnitId) {
        setBusinessUnit(defaultBusinessUnitId);
      } else if (!hidePoultryFarm) {
        setBusinessUnit(null); // Allow selection
      }
    }
  }, [type, hidePoultryFarm, defaultBusinessUnitId, visible]);

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
    } else if (type === 'Egg production') {
      onSave({
        flockId: selectedFlock,
        unitId: selectedUnit,
        intactEggs: Number(intactEggs),
        brokenEggs: Number(brokenEggs),
        totalEggs,
        date: endDate,
      });
    } else if (type === 'Egg sale') {
      onSave({
        customerId: selectedCustomer,
        flockId: selectedFlock,
        unitId: selectedUnit,
        trays: Number(trayCount),
        eggs: Number(eggCount),
        price: Number(price),
        date: endDate,
        note,
      });
    } else if (type === 'Feed Record') {
      onSave({
        feedId: selectedFeedId,
        feedTypeId: selectedFeedTypeId,
        quantity,
        date: feedDate,
        supplierId: supplier,
        price,
        note,
        paymentStatus,
      });
    } else if (type === 'Feed Consumption') {
      onSave({
        flockId: selectedFlock,
        feedId: selectedFeedId,
        bag: Number(bag),
        date: feedDate,
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* NAME */}
            {type !== 'vaccination' &&
              type !== 'vaccination Schedule' &&
              type !== 'Egg production' &&
              type !== 'Egg sale' &&
              type !== 'Feed Record' &&
              type !== 'Feed Consumption' && (
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
                  listMode="SCROLLVIEW"
                  open={roleOpen}
                  value={role}
                  items={
                    roleItems?.map(r => ({ label: r.label, value: r.id })) || []
                  }
                  setOpen={setRoleOpen}
                  setValue={setRole}
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
                  <Text style={{ color: 'red', fontSize: 12 }}>
                    {emailError}
                  </Text>
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
                {!hideBusinessUnit && (
                  <>
                    <Text style={styles.label}>
                      Business Units<Text style={styles.required}>*</Text>
                    </Text>
                    <DropDownPicker
                      listMode="SCROLLVIEW"
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
                  </>
                )}

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
                  <Text style={{ color: 'red', fontSize: 12 }}>
                    {emailError}
                  </Text>
                ) : null}

                {/* ADDRESS */}
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: 'top' },
                  ]}
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
                  listMode="SCROLLVIEW"
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
                      listMode="SCROLLVIEW"
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
                  listMode="SCROLLVIEW"
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
                  listMode="SCROLLVIEW"
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
                  style={[
                    styles.input,
                    { height: 80, textAlignVertical: 'top' },
                  ]}
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
                  listMode="SCROLLVIEW"
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
                  listMode="SCROLLVIEW"
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
            {type === 'Egg production' && (
              <>
                {/* FLOCK */}
                <Text style={styles.label}>
                  Flock<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={flockOpen}
                  value={selectedFlock}
                  items={flockItems || []}
                  setOpen={setFlockOpen}
                  setValue={setSelectedFlock}
                  placeholder="Select flock..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />

                {/* DATE */}
                <Text style={styles.label}>Date</Text>
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
                {/* Units */}
                <Text style={styles.label}>
                  Unit<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={unitOpen}
                  value={selectedUnit}
                  items={unitItems || []}
                  setOpen={setUnitOpen}
                  setValue={setSelectedUnit}
                  placeholder="Select unit..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* INTACT EGGS */}
                <Text style={styles.label}>Intact Eggs</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={intactEggs.toString()} // convert number to string
                  onChangeText={text => setIntactEggs(Number(text) || 0)} // convert string to number
                  placeholder="Enter intact eggs..."
                />

                {/* BROKEN EGGS */}
                <Text style={styles.label}>Broken Eggs</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={brokenEggs.toString()}
                  onChangeText={text => setBrokenEggs(Number(text) || 0)}
                  placeholder="Enter broken eggs..."
                />

                {/* TOTAL EGGS (NON-EDITABLE) */}
                <Text style={styles.label}>Total Eggs</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f2f2f2' }]}
                  value={String(totalEggs)}
                  editable={false}
                />
              </>
            )}
            {type === 'Egg sale' && (
              <>
                {/* CUSTOMER */}
                <Text style={styles.label}>
                  Customer<Text style={styles.required}>*</Text>
                </Text>

                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={customerOpen}
                  value={selectedCustomer}
                  items={customerItems || []}
                  setOpen={setCustomerOpen}
                  setValue={setSelectedCustomer}
                  placeholder="Select customer..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* DATE */}
                <Text style={styles.label}>Date</Text>
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
                {/* FLOCK */}
                <Text style={styles.label}>
                  Flock<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={flockOpen}
                  value={selectedFlock}
                  items={flockItems || []}
                  setOpen={setFlockOpen}
                  setValue={setSelectedFlock}
                  placeholder="Select flock..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* PRICE */}
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price..."
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
                {/* Units */}
                <Text style={styles.label}>
                  Unit in Gram<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={unitOpen}
                  value={selectedUnit}
                  items={unitItemsLocal}
                  setOpen={setUnitOpen}
                  setValue={setSelectedUnit}
                  placeholder="Select unit"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* PRICE PER TRAY */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  <Text style={styles.label}>Patti</Text>
                  {selectedFlock && (
                    <View style={styles.stockPill}>
                      <Text style={styles.stockPillText}>
                        STOCK: {flockEggs?.patti || 0}
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter patti..."
                  value={patti}
                  onChangeText={setPatti}
                  keyboardType="numeric"
                />

                {/* TRAYS */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  <Text style={styles.label}>Trays</Text>
                  {selectedFlock && (
                    <View style={styles.stockPill}>
                      <Text style={styles.stockPillText}>
                        STOCK: {flockEggs?.tray || 0}
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={trayCount}
                  onChangeText={text => {
                    setTrayCount(text);
                  }}
                  placeholder="Enter trays..."
                />
                {trayError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginBottom: 6 }}>
                    {trayError}
                  </Text>
                ) : null}

                {/* EGGS */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  <Text style={styles.label}>Eggs</Text>
                  {selectedFlock && (
                    <View style={styles.stockPill}>
                      <Text style={styles.stockPillText}>
                        STOCK: {flockEggs?.eggs || 0}
                      </Text>
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={eggCount}
                  onChangeText={text => {
                    setEggCount(text);

                    const eggs = Number(text);

                    if (text !== '' && (eggs < 1 || eggs > 29)) {
                      setEggError('Egg should be in given range 1 to 29');
                    } else {
                      setEggError('');
                    }
                  }}
                  placeholder="Enter eggs..."
                />
                {eggError ? (
                  <Text style={{ color: 'red', fontSize: 12, marginBottom: 6 }}>
                    {eggError}
                  </Text>
                ) : null}

                {/* NOTE (OPTIONAL) */}
                <Text style={styles.label}>Note</Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: 60, textAlignVertical: 'top' },
                  ]}
                  placeholder="Enter note..."
                  multiline
                  value={note}
                  onChangeText={setNote}
                />
                {/* Total Price */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    Total Price :
                  </Text>
                  <Text style={{ fontSize: 16, marginRight: 130 }}>
                    Rs. {totalPrice.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            {type === 'Feed Record' && (
              <>
                {/* FEED */}
                <Text style={styles.label}>
                  Feed<Text style={styles.required}>*</Text>
                </Text>
                <Dropdown
                  value={selectedFeedId}
                  data={feedItems || []}
                  placeholder="Select feed..."
                  style={[
                    styles.dropdown,
                    {
                      height: 45,
                      borderColor: Theme.colors.borderLight,
                      borderWidth: 1,
                    },
                  ]}
                  containerStyle={styles.dropdownContainer}
                  onChange={item => setSelectedFeedId(item.value)}
                  labelField="label"
                  valueField="value"
                />
                {/* QUANTITY */}
                <Text style={styles.label}>
                  Quantity<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity..."
                  value={quantity}
                  keyboardType="numeric"
                  onChangeText={setQuantity}
                />

                {/* TYPE */}
                <Text style={styles.label}>
                  Type<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={feedtypeOpen}
                  value={selectedFeedTypeId}
                  items={feedTypeItems || []}
                  setOpen={setFeedTypeOpen}
                  setValue={setSelectedFeedTypeId}
                  placeholder="Select type..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* DATE */}
                <Text style={styles.label}>
                  Date<Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputWithIcon}
                  onPress={() => setShowFeedDatePicker(true)}
                >
                  <Text style={{ flex: 1 }}>
                    {feedDate
                      ? feedDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YYYY'}
                  </Text>
                  <Image source={Theme.icons.date} style={styles.dateIcon} />
                </TouchableOpacity>

                {showFeedDatePicker && (
                  <DateTimePicker
                    value={feedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowFeedDatePicker(false);
                      if (event.type === 'set' && date) setFeedDate(date);
                    }}
                  />
                )}

                {/* SUPPLIER */}
                <Text style={styles.label}>
                  Supplier<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
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
                  keyboardType="numeric"
                  onChangeText={setPrice}
                />

                {/* NOTE */}
                <Text style={styles.label}>Note</Text>
                <TextInput
                  style={[
                    styles.input,
                    { height: 70, textAlignVertical: 'top' },
                  ]}
                  placeholder="Enter note..."
                  multiline
                  value={note}
                  onChangeText={setNote}
                />
                {/* PAYMENT STATUS */}
                <View style={styles.radioRow}>
                  {['Paid', 'Unpaid'].map(status => (
                    <TouchableOpacity
                      key={status}
                      style={styles.radioContainer}
                      onPress={() =>
                        setPaymentStatus(status as 'Paid' | 'Unpaid')
                      }
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          paymentStatus === status && styles.radioSelectedOuter,
                        ]}
                      >
                        {paymentStatus === status && (
                          <Text style={styles.radioCheck}>✔</Text>
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {type === 'Feed Consumption' && (
              <>
                {/* FLOCK */}
                <Text style={styles.label}>
                  Flock<Text style={styles.required}>*</Text>
                </Text>
                <DropDownPicker
                  listMode="SCROLLVIEW"
                  open={flockOpen}
                  value={selectedFlock}
                  items={flockItems || []}
                  setOpen={setFlockOpen}
                  setValue={setSelectedFlock}
                  placeholder="Select flock..."
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
                {/* DATE */}
                <Text style={styles.label}>
                  Date<Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.inputWithIcon}
                  onPress={() => setShowFeedDatePicker(true)}
                >
                  <Text style={{ flex: 1 }}>
                    {feedDate
                      ? feedDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YYYY'}
                  </Text>
                  <Image source={Theme.icons.date} style={styles.dateIcon} />
                </TouchableOpacity>

                {showFeedDatePicker && (
                  <DateTimePicker
                    value={feedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowFeedDatePicker(false);
                      if (event.type === 'set' && date) setFeedDate(date);
                    }}
                  />
                )}
                {/* FEED */}
                <Text style={styles.label}>
                  Feed<Text style={styles.required}>*</Text>
                </Text>
                <Dropdown
                  value={selectedFeedId}
                  data={feedItems || []}
                  placeholder="Select feed..."
                  style={[
                    styles.dropdown,
                    {
                      height: 45,
                      borderColor: Theme.colors.borderLight,
                      borderWidth: 1,
                    },
                  ]}
                  containerStyle={styles.dropdownContainer}
                  onChange={item => setSelectedFeedId(item.value)}
                  labelField="label"
                  valueField="value"
                />
                {/* PRICE */}
                <Text style={styles.label}>
                  Bag<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter bag..."
                  value={bag}
                  keyboardType="numeric"
                  onChangeText={setbag}
                />
              </>
            )}
          </ScrollView>
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
    maxHeight: '85%',
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
  stockPill: {
    borderColor: Theme.colors.success,
    borderWidth: 1,
    backgroundColor: Theme.colors.lightgreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  stockPillText: {
    color: Theme.colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 20,
  },

  pillradioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'transparent',
  },

  radioSelectedOuter: {
    backgroundColor: Theme.colors.primaryYellow,
    borderColor: Theme.colors.borderColor,
  },
  radioCheck: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.black,
  },
});
