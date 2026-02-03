import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { getEggSales, EggSale, getCustomers, getEggProducedUnits } from '../../services/EggsService';
import { useBusinessUnit } from "../../context/BusinessContext"
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AddModal from '../../components/customPopups/AddModal';
import { showErrorToast, showSuccessToast } from '../../utils/AppToast';
import { getFlocks } from '../../services/FlockService';
interface Flock {
  flockId: string;
  flockRef: string;
  breed: string;
  remainingQuantity: number;
}
type Props = {
  openAddModal: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal?: () => void;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const EggSaleScreen: React.FC<Props> = ({
  setGlobalLoading,
  openAddModal,
  onCloseAddModal,
}) => {
  const [eggSales, setEggSales] = useState<EggSale[]>([]);
  const { businessUnitId } = useBusinessUnit();
  const [searchText, setSearchText] = useState<string>("");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [CustomerValue, setCustomerValue] = useState<string | null>(null); const [customerOpen, setCustomerOpen] = useState(false);
  const [customerItems, setCustomerItems] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [unitItems, setUnitItems] = useState<
    { label: string; value: number }[]
  >([]);
  const [flockItems, setFlockItems] = useState<{ label: string; value: string }[]>([]);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  //TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'date',
      title: 'DATE',
      width: 120,
      isTitle: true,
      render: (value) => {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return <Text>{`${day}/${month}/${year}`}</Text>;
      },
    },
    {
      key: 'customer',
      title: 'CUSTOMER',
      width: 140,
    },
    {
      key: 'gram',
      title: 'GRAM',
      width: 100,
      render: (value) => <Text>{value || '-'}</Text>,
    },
    {
      key: 'price',
      title: 'PRICE',
      width: 100,
      render: (value) => <Text> {Number(value).toFixed(2)}</Text>,
    },
    {
      key: 'quantity',
      title: 'QUANTITY',
      width: 80,
    },
  ];
  const fetchEggSales = async () => {
    if (!businessUnitId) return;

    setGlobalLoading(true);

    const payload = {
      businessUnitId,
      customerId: CustomerValue,
      from: fromDate ? fromDate.toISOString() : null,
      to: toDate ? toDate.toISOString() : null,
      searchKey: searchText || null,
      pageNumber: 1,
      pageSize: 10,
    };

    const data = await getEggSales(payload);
    setEggSales(data);
    setGlobalLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEggSales();
      setCustomerValue(null);
      setFromDate(null);
      setToDate(null);
    }, [businessUnitId])
  );
  useEffect(() => {
    if (!businessUnitId) return;
    const fetchCustomers = async () => {
      const suppliers = await getCustomers(businessUnitId);
      const dropdownData = suppliers.map((s: any) => ({ label: s.name, value: s.partyId }));
      setCustomerItems(dropdownData);
    };
    fetchCustomers();
  }, [businessUnitId]);
  useEffect(() => {
    if (businessUnitId) {
      fetchEggSales();
    }
  }, [CustomerValue, searchText, fromDate, toDate]);
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedFlock) {
        setUnitItems([]); 
        return;
      }

      try {
        const data = await getEggProducedUnits(selectedFlock);
        const items = data.map((unit: any) => ({
          label: unit.name,
          value: unit.unitId,
        }));
        setUnitItems(items);
      } catch (error) {
        console.log("Error fetching units", error);
      }
    };

    fetchUnits();
  }, [selectedFlock]);
  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const dropdownData = flocks.map((f: Flock) => ({
        label: f.flockRef,
        value: f.flockId,
      }));
      setFlockItems(dropdownData);
    } catch (error) {
      console.error("Failed to fetch flocks:", error);
    }
  };
  useEffect(() => {
    fetchFlocks();
  }, [businessUnitId]);
  const handleAddEggSale = async (data: any) => {
    try {
      setGlobalLoading(true);
      const payload = {
        businessUnitId,
        customerId: data.customerId,
        flockId: data.flockId,
        unitId: data.unitId,
        trays: Number(data.trays || 0),
        eggs: Number(data.eggs || 0),
        pricePerTray: Number(data.price || 0),
        date: data.date.toISOString().split('T')[0],
        note: data.note || null,
      };

      console.log("Egg Sale Payload:", payload);

      // 👉 yahan tumhari API call aayegi
      // await addEggSale(payload);

      showSuccessToast("Egg sale added successfully");
      fetchEggSales();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to add Egg sale");
    } finally {
      setGlobalLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
      <View style={styles.filterRow}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Customer..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={tempSearch}
            onChangeText={setTempSearch}
            style={styles.searchInput}
          />
          {/*  CLEAR ICON */}
          {tempSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setTempSearch("");
                setSearchText("");
              }}
            >
              <Image
                source={Theme.icons.close1}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}

          {/* SEARCH ICON */}
          <TouchableOpacity
            onPress={() => setSearchText(tempSearch)}
          >
            <Image
              source={Theme.icons.search}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={customerOpen}
            value={CustomerValue}
            items={customerItems}
            setOpen={setCustomerOpen}
            setValue={setCustomerValue}
            setItems={setCustomerItems}
            placeholder="Customer"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
          />
        </View>
      </View>
      {/* ===== DATE RANGE FILTERS ===== */}
      <View style={styles.dateRow}>
        <View style={styles.dateRangeContainer}>
          {/* FROM */}
          <TouchableOpacity
            style={styles.dateItem}
            onPress={() => setActivePicker('from')}
          >
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>
              {fromDate ? fromDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateDash}>—</Text>

          {/* TO */}
          <TouchableOpacity
            style={styles.dateItem}
            onPress={() => setActivePicker('to')}
          >
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>
              {toDate ? toDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESET FILTERS */}
        {(fromDate || toDate || CustomerValue) && (
          <TouchableOpacity
            style={styles.resetInlineBtn}
            onPress={() => {
              setCustomerValue(null);
              setFromDate(null);
              setToDate(null);
            }}
          >
            <Text style={styles.resetInlineText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      {activePicker && (
        <DateTimePicker
          value={activePicker === 'from' ? (fromDate || new Date()) : (toDate || new Date())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setActivePicker(null);
              if (event.type === 'set' && selectedDate) {
                if (activePicker === 'from') setFromDate(selectedDate);
                else setToDate(selectedDate);
              }
            } else { // iOS me
              if (selectedDate) {
                if (activePicker === 'from') setFromDate(selectedDate);
                else setToDate(selectedDate);
              }
            }
          }}
        />
      )}
      <View style={{ paddingHorizontal: 16, }}>
        <DataCard
          columns={columns}
          data={eggSales}
          itemsPerPage={10}
        />
      </View>
      <AddModal
        visible={openAddModal}
        title="Add Egg Sale"
        type="Egg sale"
        customerItems={customerItems}
        flockItems={flockItems}
        unitItems={unitItems}
        onClose={onCloseAddModal}
        onSave={(data) => {
          handleAddEggSale(data);
          onCloseAddModal();
        }}
      />
    </View>
  );
};

export default EggSaleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  // ===== SEARCH + DROPDOWN ROW =====
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
    backgroundColor: Theme.colors.white,
  },
  searchIcon: { width: 18, height: 18, tintColor: Theme.colors.success, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: Theme.colors.black },
  clearIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: Theme.colors.success,
  },
  dropdownWrapper: { width: 120, zIndex: 2000 },
  dropdown: {
    borderColor: Theme.colors.success, height: 40,
    minHeight: 40,
  },
  dropdownContainer: { borderColor: Theme.colors.success },
  dropdownText: { color: Theme.colors.black },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { fontSize: 13, color: '#9CA3AF', marginRight: 6, fontWeight: '500' },
  dateValue: { fontSize: 14, color: Theme.colors.success, fontWeight: '700' },
  dateDash: { fontSize: 18, color: '#9CA3AF', marginHorizontal: 10, fontWeight: '600' },
  resetInlineBtn: { paddingHorizontal: 10, paddingVertical: 2 },
  resetInlineText: { fontSize: 14, fontWeight: '600', color: Theme.colors.error },

});
