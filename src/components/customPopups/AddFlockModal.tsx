import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Theme from '../../theme/Theme';
import { getParties, getFlockTypes } from '../../services/FlockService';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddFlockModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  businessUnitId: string;
}

const AddFlockModal: React.FC<AddFlockModalProps> = ({
  visible,
  onClose,
  onSave,
  businessUnitId,
}) => {
  const [flockType, setFlockType] = useState<string | null>(null);
  const [breed, setBreed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgWeight, setAvgWeight] = useState('');
  const [price, setPrice] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [isHen, setIsHen] = useState(true);
  const [isPaid, setIsPaid] = useState(true);

  const [flockTypeOpen, setFlockTypeOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);

  const [flockTypeItems, setFlockTypeItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [supplierItems, setSupplierItems] = useState<
    { label: string; value: string; disabled?: boolean }[]
  >([]);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);

  // Enable save button only when required fields are filled
useEffect(() => {
  setIsSaveEnabled(
    flockType !== null &&
      breed.trim() !== '' &&
      quantity.trim() !== '' &&
      price.trim() !== '' &&
      supplier !== null &&
      dob !== null &&         
      arrivalDate !== null     
  );
}, [flockType, breed, quantity, price, supplier, dob, arrivalDate]);


  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getParties(businessUnitId, 1);
        const items = data.length
          ? data.map(s => ({ label: s.name, value: s.partyId }))
          : [{ label: 'No data found', value: 'no_data', disabled: true }];
        setSupplierItems(items);
      } catch (err) {
        console.error(err);
        setSupplierItems([
          { label: 'No data found', value: 'no_data', disabled: true },
        ]);
      }
    };

    fetchSuppliers();
  }, [businessUnitId]);

  // Fetch flock types from API
  useEffect(() => {
    const fetchFlockTypes = async () => {
      try {
        const data = await getFlockTypes();
        const items = data.length
          ? data.map(t => ({ label: t.name, value: String(t.flockTypeId) }))
          : [{ label: 'No data found', value: 'no_data', disabled: true }];
        setFlockTypeItems(items);
      } catch (err) {
        console.error(err);
        setFlockTypeItems([{ label: 'No data found', value: 'no_data' }]);
      }
    };

    fetchFlockTypes();
  }, []);

  const reset = () => {
    setFlockType(null);
    setBreed('');
    setQuantity('');
    setAvgWeight('');
    setPrice('');
    setDob(null);
    setArrivalDate(null);
    setSupplier(null);
    setIsHen(true);
    setIsPaid(true);
  };

  const handleSave = () => {
    onSave({
      flockType,
      breed,
      quantity,
      avgWeight,
      price,
      dob,
      arrivalDate,
      supplier,
      isHen,
      isPaid,
    });
    reset();
    onClose();
  };

  return (
    <SafeAreaView>
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Add Flock</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Flock Type */}
            <Text style={styles.label}>Flock Type</Text>
                <DropDownPicker
                listMode="SCROLLVIEW"
                open={flockTypeOpen}
                value={flockType}
                items={flockTypeItems}
                setOpen={setFlockTypeOpen}
                setValue={setFlockType}
                setItems={setFlockTypeItems}
                placeholder="Select flock type..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />


            {/* Breed */}
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter breed..."
              value={breed}
              onChangeText={setBreed}
            />

            {/* Price */}
            <Text style={styles.label}>Price of Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price..."
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            {/* Supplier */}
            <Text style={styles.label}>Supplier</Text>
                      <DropDownPicker
            listMode="SCROLLVIEW"
            open={supplierOpen}
            value={supplier}
            items={supplierItems}
            setOpen={setSupplierOpen}
            setValue={setSupplier}
            setItems={setSupplierItems}
            placeholder="Select supplier..."
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />


            {/* Quantity & Avg Weight */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity..."
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Average Weight (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter weight..."
                  keyboardType="numeric"
                  value={avgWeight}
                  onChangeText={setAvgWeight}
                />
              </View>
            </View>

            {/* DOB & Arrival Date */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => setShowDobPicker(true)}
                  style={styles.dateInput}
                >
                  <Text>{dob ? dob.toLocaleDateString() : 'DD/MM/YYYY'}</Text>
                  <Image source={Theme.icons.date} style={styles.dateIcon} />
                </TouchableOpacity>
                {showDobPicker && (
                  <DateTimePicker
                    value={dob || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDobPicker(false);
                      if (event.type === 'set' && selectedDate)
                        setDob(selectedDate);
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Arrival Date</Text>
                <TouchableOpacity
                  onPress={() => setShowArrivalPicker(true)}
                  style={styles.dateInput}
                >
                  <Text>
                    {arrivalDate
                      ? arrivalDate.toLocaleDateString()
                      : 'DD/MM/YYYY'}
                  </Text>
                  <Image source={Theme.icons.date} style={styles.dateIcon} />
                </TouchableOpacity>
                {showArrivalPicker && (
                  <DateTimePicker
                    value={arrivalDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowArrivalPicker(false);
                      if (event.type === 'set' && selectedDate)
                        setArrivalDate(selectedDate);
                    }}
                  />
                )}
              </View>
            </View>

            {/* Hen / Rooster */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setIsHen(true)}
              >
                <View
                  style={[styles.radioCircle, isHen && styles.radioSelected]}
                />
                <Text style={styles.radioLabel}>Hen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setIsHen(false)}
              >
                <View
                  style={[styles.radioCircle, !isHen && styles.radioSelected]}
                />
                <Text style={styles.radioLabel}>Rooster</Text>
              </TouchableOpacity>
            </View>

            {/* Paid / Unpaid */}
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setIsPaid(true)}
              >
                <View
                  style={[styles.radioCircle, isPaid && styles.radioSelected]}
                />
                <Text style={styles.radioLabel}>Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setIsPaid(false)}
              >
                <View
                  style={[styles.radioCircle, !isPaid && styles.radioSelected]}
                />
                <Text style={styles.radioLabel}>Unpaid</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Buttons */}
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
    </SafeAreaView>
  );
};

export default AddFlockModal;

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
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    justifyContent: 'space-between',
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
  radioContainer: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
    gap: 20,
  },
  radioButton: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.borderLight,
    marginRight: 8,
    backgroundColor: Theme.colors.white,
  },
  radioSelected: {
    backgroundColor: Theme.colors.primaryYellow,
    borderColor: Theme.colors.primaryYellow,
  },
  radioLabel: { fontWeight: '500', color: Theme.colors.textPrimary },
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
