import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

import DataCard from '../../components/customCards/DataCard';
import Theme from '../../theme/Theme';
import { getParties, GetSaleFilters } from '../../services/FlockService';
import { CustomConstants, ScreenType } from '../../constants/CustomConstants';
import {
  getSalesByFilter,
  SaleRecord,
  addSale,
  AddSalePayload,
} from '../../services/FlockService';
import SidebarWrapper from '../../components/customButtons/SidebarWrapper';
import ScreenTipCard from '../../components/customCards/ScreenTipCard';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import { useBusinessUnit } from '../../context/BusinessContext';

const FlockSaleScreen = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    CustomConstants.FLOCK_SALE_SCREEN,
  );

  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [isFlockSaleModalVisible, setIsFlockSaleModalVisible] = useState(false);

  const [search, setSearch] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // FILTER STATES
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [customer, setCustomer] = useState<string>('');

  const [customerItems, setCustomerItems] = useState<
    { label: string; value: string }[]
  >([]);

  const { businessUnitId } = useBusinessUnit();

  const fetchSalesData = async (filters?: GetSaleFilters) => {
    // Check if businessUnitId exists
    if (!businessUnitId) {
      console.warn('Business Unit ID is not set');
      return;
    }

    try {
      setLoading(true);
      const data = await getSalesByFilter({
        businessUnitId,
        pageNumber: 1,
        pageSize: 50,
        ...filters,
      });
      setSalesData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!businessUnitId) return;
    fetchSalesData();
  }, [businessUnitId]);

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!businessUnitId) return; // don't call API if null

      try {
        const parties = await getParties(businessUnitId, 0);
        const customerDropdown = parties.map(p => ({
          label: p.name,
          value: p.partyId,
        }));
        setCustomerItems([...customerDropdown]);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };

    fetchCustomers();
  }, [businessUnitId]); // dependency array ensures effect runs when ID changes

  const applyFilter = () => {
    const filters: GetSaleFilters = {};

    if (fromDate) filters.startDate = fromDate.toISOString().split('T')[0];
    if (toDate) filters.endDate = toDate.toISOString().split('T')[0];
    if (customer) filters.partyId = customer;
    if (search) filters.searchKey = search;

    console.log('Applying filters:', filters);

    fetchSalesData(filters);
    setIsFilterModalVisible(false);
  };

  const resetFilter = () => {
    setFromDate(null);
    setToDate(null);
    setCustomer('');
    setSearch('');
    fetchSalesData();
    setIsFilterModalVisible(false);
  };

  return (
    <SidebarWrapper
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
    >
      <View style={styles.tipCardContainer}>
        <ScreenTipCard screen={CustomConstants.FLOCK_SALE_SCREEN} />
      </View>

      <View style={styles.screen}>
        {/* SEARCH ROW */}
        <View style={styles.searchRow}>
          <View style={styles.searchBoxSmall}>
            <Image source={Theme.icons.search} style={styles.icon} />
            <TextInput
              placeholder="Search Flock..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Image source={Theme.icons.filter} style={styles.filterIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setIsFlockSaleModalVisible(true)}
          >
            <Text style={styles.newText}>+ New Sale</Text>
          </TouchableOpacity>
        </View>

        {/* DATA */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.buttonPrimary} />
        ) : salesData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        ) : (
          <ScrollView horizontal>
            <ScrollView contentContainerStyle={styles.tableContent}>
              <DataCard
                isHeader
                showFlockSale
                labels={{
                  date: 'DATE',
                  customerName: 'Customer Name',
                  flock: 'Flock',
                  price: 'Price',
                  quantity: 'Quantity',
                }}
              />

              {salesData.map(item => (
                <DataCard
                  key={item.saleId}
                  showFlockSale
                  dateValue={formatDate(item.date)}
                  customerNameValue={item.customer}
                  flockValue={item.flock}
                  priceValue={item.price}
                  quantityValue={item.quantity}
                />
              ))}
            </ScrollView>
          </ScrollView>
        )}
      </View>

      {/* ================= FILTER MODAL ================= */}
      <Modal visible={isFilterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* HEADER */}
            <Text style={styles.modalHeader}>Flock Sale</Text>

            {/* FROM DATE */}
            <Text style={styles.inputLabel}>From Date</Text>
            <Pressable
              style={styles.dateField}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.dateText}>
                {fromDate ? formatDate(fromDate) : 'dd/mm/yyyy'}
              </Text>
              <Image source={Theme.icons.date} style={styles.dateIcon} />
            </Pressable>

            {/* TO DATE */}
            <Text style={styles.inputLabel}>To Date</Text>
            <Pressable
              style={styles.dateField}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.dateText}>
                {toDate ? formatDate(toDate) : 'dd/mm/yyyy'}
              </Text>
              <Image source={Theme.icons.date} style={styles.dateIcon} />
            </Pressable>

            {/* CUSTOMER */}
            <Text style={styles.inputLabel}>Customer</Text>
            <View style={{ zIndex: 1000, marginBottom: 16 }}>
              <DropDownPicker
                open={customerOpen}
                value={customer}
                items={customerItems}
                setOpen={setCustomerOpen}
                setValue={setCustomer} // partyId
                setItems={setCustomerItems}
                placeholder="Select customer"
                style={{
                  borderColor: '#ccc',
                  borderRadius: 8,
                  minHeight: 45,
                }}
                dropDownContainerStyle={{
                  borderColor: '#ccc',
                }}
              />
            </View>

            {/* BUTTONS */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
                <Text style={styles.btnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
                <Text style={styles.btnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowFromPicker(false);
              if (date) setFromDate(date);
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowToPicker(false);
              if (date) setToDate(date);
            }}
          />
        )}
      </Modal>
      <ItemEntryModal
        visible={isFlockSaleModalVisible}
        type="flockSale"
        onClose={() => setIsFlockSaleModalVisible(false)}
        onSave={async data => {
          try {
            // Construct payload
            const payload: AddSalePayload = {
              customerId: data.customerName,
              flockId: data.flockName,
              quantity: Number(data.quantity),
              price: Number(data.price),
              date: data.saleDate
                ? data.saleDate.toISOString()
                : new Date().toISOString(),
              note: data.remarks || '',
              businessUnitId: businessUnitId!,
            };

            console.log('Sending Flock Sale Payload:', payload);

            const result = await addSale(payload);

            if (result.status === 'Success') {
              console.log('Sale added successfully:', result.data);
              // Close modal
              setIsFlockSaleModalVisible(false);
              // Refresh sales list
              fetchSalesData();
            } else {
              console.warn('Failed to add sale:', result.message);
            }
          } catch (error) {
            console.error('Error adding sale:', error);
          }
        }}
      />
    </SidebarWrapper>
  );
};

export default FlockSaleScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  tipCardContainer: {
    marginTop: 36,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    paddingLeft: 20,
    marginTop: -20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  newBtn: {
    backgroundColor: Theme.colors.primaryYellow,
    height: 40,
    paddingHorizontal: 16,

    borderRadius: 8,
    justifyContent: 'center',
  },
  newText: { fontWeight: '600' },
  searchBoxSmall: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,

    height: 40,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.black,
    marginBottom: 6,
    marginTop: 7,
  },
  dateText: {
    color: Theme.colors.black,
  },

  searchInput: { flex: 1, marginLeft: 6 },
  icon: { width: 18, height: 18 },
  filterBtn: {
    marginLeft: 10,
    marginRight: 7,
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
  },
  filterIcon: { width: 22, height: 22 },
  tableContent: {
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 16,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dateIcon: {
    width: 20,
    height: 20,
    tintColor: Theme.colors.borderYellow,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetBtn: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.borderYellow,
    borderWidth: 2,
    padding: 12,
    borderRadius: 8,
    width: '45%',
  },
  applyBtn: {
    backgroundColor: Theme.colors.buttonPrimary,
    padding: 12,
    borderRadius: 8,
    width: '45%',
  },
  btnText: {
    color: Theme.colors.black,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
