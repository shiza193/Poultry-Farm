import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Theme from '../../theme/Theme';
import { getFeeds, Feed, getParties } from '../../services/FlockService';
import { useBusinessUnit } from '../../context/BusinessContext';
import { Dropdown } from 'react-native-element-dropdown';

interface ItemEntryModalProps {
  visible?: boolean;
  type?: 'feed' | 'fcr' | 'mortality' | 'hospitality' | 'flockSale';
  onClose: () => void;
  onSave: (data: any) => Promise<{ fcr: number; message: string } | void>;
  businessUnitId?: string;
  initialData?: {
    quantity?: number;
    expireDate?: Date;
    id?: string | number;
  };
}

const ItemEntryModal: React.FC<ItemEntryModalProps> = ({
  visible,
  type = 'feed',
  onClose,
  initialData,
  onSave,
}) => {
  const { businessUnitId } = useBusinessUnit();
  // ---------- Common States ----------
  const [feed, setFeed] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fcrResult, setFcrResult] = useState<{
    fcr: number;
    message: string;
  } | null>(null);

  // ---------- Flock Sale States ----------
  const [customer, setCustomer] = useState<string>(''); // partyId
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerItems, setCustomerItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [customerName, setCustomerName] = useState('');
  const [flockName, setFlockName] = useState('');
  const [price, setPrice] = useState('');
  const [saleDate, setSaleDate] = useState<Date | null>(null);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);

  // ---------- Other Fields ----------
  const [quantity, setQuantity] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [hospitalityDate, setHospitalityDate] = useState<Date | null>(null);
  const [showExpirePicker, setShowExpirePicker] = useState(false);
  const [showHospitalityPicker, setShowHospitalityPicker] = useState(false);
  const [averageWeight, setAverageWeight] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [treatmentDays, setTreatmentDays] = useState('');
  const [vetName, setVetName] = useState('');
  const [remarks, setRemarks] = useState('');

  // ---------- Reset all fields ----------
  const resetFields = () => {
    setFeed(null);
    setOpen(false);
    setItems([]);
    setFcrResult(null);

    setCustomer('');
    setCustomerOpen(false);
    setCustomerItems([]);
    setCustomerName('');
    setFlockName('');
    setPrice('');
    setSaleDate(null);

    setQuantity('');
    setCurrentWeight('');
    setExpireDate(null);
    setHospitalityDate(null);
    setAverageWeight('');
    setSymptoms('');
    setDiagnosis('');
    setMedication('');
    setDosage('');
    setTreatmentDays('');
    setVetName('');
    setRemarks('');
  };

  // ---------- Fetch Feeds ----------
  useEffect(() => {
    if (visible && type === 'feed') {
      setLoading(true);
      getFeeds()
        .then((data: Feed[]) => {
          setItems(
            data.map(f => ({ label: f.name, value: f.feedId.toString() })),
          );
        })
        .catch(err => console.error('Failed to load feeds:', err))
        .finally(() => setLoading(false));
    }
  }, [visible, type]);

  useEffect(() => {
    if (visible && !initialData) {
      resetFields();
    }
  }, [visible]);

useEffect(() => {
  if (visible && initialData && type === 'mortality') {
    console.log('Initial Data:', initialData);

    setQuantity(
      initialData.quantity !== undefined
        ? String(initialData.quantity)
        : ''
    );

    // Handle both expireDate and date keys
    const dateValue =
      initialData.expireDate ||
      (initialData as any).date;

    setExpireDate(
      dateValue ? new Date(dateValue) : null
    );
  }
}, [visible, initialData, type]);
  // ---------- Fetch Customers ----------
  useEffect(() => {
    if (visible && type === 'flockSale' && businessUnitId) {
      const fetchCustomers = async () => {
        try {
          const parties = await getParties(businessUnitId, 0);
          setCustomerItems(
            parties.map(p => ({ label: p.name, value: p.partyId })),
          );
        } catch (err) {
          console.error('Failed to fetch customers:', err);
        }
      };
      fetchCustomers();
    }
  }, [visible, type, businessUnitId]);

  // ---------- Enable/Disable Save ----------
  const isButtonEnabled =
    (type === 'feed' && feed && quantity) ||
    (type === 'fcr' && currentWeight) ||
    (type === 'mortality' && quantity && expireDate) ||
    (type === 'hospitality' &&
      hospitalityDate &&
      quantity &&
      averageWeight &&
      symptoms &&
      diagnosis &&
      medication &&
      dosage &&
      treatmentDays &&
      vetName) ||
    (type === 'flockSale' &&
      customer &&
      flockName &&
      quantity &&
      price &&
      saleDate);

  // ---------- Handle Save ----------
  const handleSave = async () => {
    if (type === 'fcr') {
      if (!currentWeight) return;
      try {
        const data = { currentWeight };
        const response = await onSave(data);
        if (response)
          setFcrResult({ fcr: response.fcr, message: response.message });
      } catch (err) {
        console.error(err);
        setFcrResult({ fcr: 0, message: 'Failed to calculate FCR.' });
      }
    } else if (type === 'flockSale') {
      onSave({ customer, flockName, quantity, price, saleDate });
      onClose();
    } else {
      onSave({
        feed,
        quantity,
        currentWeight,
        expireDate,
        hospitalityDate,
        averageWeight,
        symptoms,
        diagnosis,
        medication,
        dosage,
        treatmentDays,
        vetName,
        remarks,
      });
      onClose();
    }
  };

  // ---------- Close Modal ----------
  const handleClose = () => {
    resetFields(); // Clear all fields on close
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Feed */}
                {type === 'feed' && (
                  <>
                    <Text style={styles.title}>Add Feed</Text>

                    <Text style={styles.label}>Feed Name</Text>
                    <Dropdown
                      style={styles.dropdownElement}
                      containerStyle={styles.dropdownContainerElement}
                      data={items}
                      labelField="label"
                      valueField="value"
                      placeholder={loading ? 'Loading...' : 'Select Feed...'}
                      value={feed}
                      onChange={item => setFeed(item.value)}
                      selectedTextStyle={styles.selectedText}
                      placeholderStyle={styles.placeholderText}
                    />
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      placeholder="Enter quantity..."
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </>
                )}

                {/* FCR */}
                {type === 'fcr' && (
                  <>
                    <Text style={styles.title}>Calculate FCR</Text>
                    <Text style={styles.label}>Current Weight (KG)</Text>
                    <TextInput
                      placeholder="Enter weight..."
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    {fcrResult && (
                      <View
                        style={{
                          marginTop: 12,
                          padding: 12,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: Theme.colors.borderLight,
                        }}
                      >
                        <Text style={{ fontWeight: 'bold' }}>FCR Result:</Text>
                        <Text>FCR: {fcrResult.fcr}</Text>
                        <Text>Message: {fcrResult.message}</Text>
                      </View>
                    )}
                  </>
                )}

                {/* Mortality */}
                {type === 'mortality' && (
                  <>
                    <Text style={styles.title}>
                      {initialData ? 'Edit Mortality' : 'Add Mortality'}
                    </Text>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      placeholder="Enter quantity..."
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Text style={styles.label}>Expire Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowExpirePicker(true)}
                    >
                      <Text>
                        {expireDate
                          ? expireDate.toLocaleDateString()
                          : 'dd/mm/yyyy'}
                      </Text>
                      <Image
                        source={Theme.icons.date}
                        style={styles.dateIcon}
                      />
                    </TouchableOpacity>
                    {showExpirePicker && (
                      <DateTimePicker
                        value={expireDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowExpirePicker(false);
                          if (event.type === 'set' && selectedDate)
                            setExpireDate(selectedDate);
                        }}
                      />
                    )}
                  </>
                )}

                {/* Hospitality */}
                {type === 'hospitality' && (
                  <>
                    <Text style={styles.title}>Add Hospitality</Text>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowHospitalityPicker(true)}
                    >
                      <Text>
                        {hospitalityDate
                          ? hospitalityDate.toLocaleDateString()
                          : 'dd/mm/yyyy'}
                      </Text>
                      <Image
                        source={Theme.icons.date}
                        style={{
                          width: 20,
                          height: 20,
                          marginLeft: 210,
                          tintColor: Theme.colors.iconPrimary,
                        }}
                      />
                    </TouchableOpacity>
                    {showHospitalityPicker && (
                      <DateTimePicker
                        value={hospitalityDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowHospitalityPicker(false);
                          if (event.type === 'set' && selectedDate)
                            setHospitalityDate(selectedDate);
                        }}
                      />
                    )}
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      placeholder="Enter quantity..."
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Text style={styles.label}>Average Weight (G)</Text>
                    <TextInput
                      placeholder="Enter weight..."
                      value={averageWeight}
                      onChangeText={setAverageWeight}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Text style={styles.label}>Symptoms</Text>
                    <TextInput
                      placeholder="Enter symptoms..."
                      value={symptoms}
                      onChangeText={setSymptoms}
                      style={styles.input}
                    />
                    <Text style={styles.label}>Diagnosis</Text>
                    <TextInput
                      placeholder="Enter diagnosis..."
                      value={diagnosis}
                      onChangeText={setDiagnosis}
                      style={styles.input}
                    />
                    <Text style={styles.label}>Medication</Text>
                    <TextInput
                      placeholder="Enter medication..."
                      value={medication}
                      onChangeText={setMedication}
                      style={styles.input}
                    />
                    <Text style={styles.label}>Dosage</Text>
                    <TextInput
                      placeholder="Enter dosage..."
                      value={dosage}
                      onChangeText={setDosage}
                      style={styles.input}
                    />
                    <Text style={styles.label}>Treatment Days</Text>
                    <TextInput
                      placeholder="Enter treatment days..."
                      value={treatmentDays}
                      onChangeText={setTreatmentDays}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    {/* <TextInput
                      placeholder="Enter treatment days..."
                      value={treatmentDays}
                      onChangeText={text => {
                        // Remove any non-digit characters
                        const numericText = text.replace(/[^0-9]/g, '');
                        setTreatmentDays(numericText);
                      }}
                      keyboardType="numeric"
                      style={styles.input}
                    /> */}
                    <Text style={styles.label}>Vet Name</Text>
                    <TextInput
                      placeholder="Enter vet name..."
                      value={vetName}
                      onChangeText={setVetName}
                      style={styles.input}
                    />
                    <Text style={styles.label}>Remarks</Text>
                    <TextInput
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChangeText={setRemarks}
                      style={styles.input}
                    />
                  </>
                )}

                {/* Flock Sale */}
                {type === 'flockSale' && (
                  <>
                    <Text style={styles.title}>Add Flock Sale</Text>

                    <Text style={styles.label}>Customer Name</Text>
                    <View style={{ zIndex: 1000, marginBottom: 10 }}>
                      <Dropdown
                        style={styles.dropdownElement}
                        containerStyle={styles.dropdownContainerElement}
                        data={customerItems}
                        labelField="label"
                        valueField="value"
                        placeholder="Select customer"
                        value={customer}
                        onChange={item => setCustomer(item.value)}
                        selectedTextStyle={styles.selectedText}
                        placeholderStyle={styles.placeholderText}
                      />
                    </View>

                    <Text style={styles.label}>Flock</Text>
                    <TextInput
                      placeholder="Enter flock..."
                      value={flockName}
                      onChangeText={setFlockName}
                      style={styles.input}
                    />

                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      placeholder="Enter quantity..."
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <Text style={styles.label}>Price</Text>
                    <TextInput
                      placeholder="Enter price..."
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowSaleDatePicker(true)}
                    >
                      <Text>
                        {saleDate
                          ? saleDate.toLocaleDateString()
                          : 'dd/mm/yyyy'}
                      </Text>
                      <Image
                        source={Theme.icons.date}
                        style={{
                          width: 20,
                          height: 20,
                          marginLeft: 210,
                          tintColor: Theme.colors.iconPrimary,
                        }}
                      />
                    </TouchableOpacity>
                    {showSaleDatePicker && (
                      <DateTimePicker
                        value={saleDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowSaleDatePicker(false);
                          if (event.type === 'set' && selectedDate)
                            setSaleDate(selectedDate);
                        }}
                      />
                    )}
                  </>
                )}
              </ScrollView>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.discardText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    isButtonEnabled
                      ? styles.saveButton
                      : styles.saveButtonDisabled,
                  ]}
                  disabled={!isButtonEnabled}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>
                    {type === 'fcr' ? 'Calculate' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: { marginTop: 10, marginBottom: 5, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // icon always right
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 10,
  },
  dateIcon: {
    width: 20,
    height: 20,
    tintColor: Theme.colors.iconPrimary,
  },
  dropdownElement: {
    height: 50,
    borderColor: Theme.colors.borderLight,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.lightGrey,
    marginBottom: 10,
  },
  dropdownContainerElement: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.borderLight,
    borderRadius: 8,
  },
  selectedText: {
    color: Theme.colors.black,
  },
  placeholderText: {
    color: Theme.colors.black,
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
    marginTop: 10,
  },
  button: { flex: 0.45, padding: 12, borderRadius: 8, alignItems: 'center' },
  discardButton: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5,
    borderColor: Theme.colors.primaryYellow,
  },
  discardText: { color: Theme.colors.primaryYellow, fontWeight: 'bold' },
  saveButton: { backgroundColor: Theme.colors.primaryYellow },
  saveButtonDisabled: { backgroundColor: Theme.colors.buttonDisabled },
  saveText: { color: Theme.colors.white, fontWeight: 'bold' },
});

export default ItemEntryModal;
