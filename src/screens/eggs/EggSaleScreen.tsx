import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput, Platform, ScrollView } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { getEggSales, EggSale, getCustomers, addEggSale, } from '../../services/EggsService';
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
  // use context Api
  const { businessUnitId } = useBusinessUnit();
  // States
  const [eggSales, setEggSales] = useState<EggSale[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [masterData, setMasterData] = useState<{
    selectedCustomer: string | null;
    customerItems: { label: string; value: string }[];
    selectedFlock: string | null;
    flockItems: { label: string; value: string }[];
    fromDate: Date | null;
    toDate: Date | null;
  }>({
    selectedCustomer: null,
    customerItems: [],
    selectedFlock: null,
    flockItems: [],
    fromDate: null,
    toDate: null,
  });

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
      key: 'unit',
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
  const fetchEggSales = async (overrideSearchKey?: string | null) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    const payload = {
      businessUnitId,
      customerId: masterData.selectedCustomer,
      flockId: masterData.selectedFlock,
      from: masterData.fromDate?.toISOString() || null,
      to: masterData.toDate?.toISOString() || null,
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
      setMasterData(prev => ({
        ...prev,
        selectedCustomer: null,
        fromDate: null,
        toDate: null,
      }));
    }, [businessUnitId])
  );
  const fetchCustomers = async () => {
    const suppliers = await getCustomers(businessUnitId);
    const dropdownData = suppliers.map((s: any) => ({ label: s.name, value: s.partyId }));
    setMasterData(prev => ({
      ...prev,
      customerItems: dropdownData,
    }));
  };
  useEffect(() => {
    if (businessUnitId) {
      fetchEggSales();
    }
  }, [businessUnitId, masterData.selectedCustomer, masterData.fromDate, masterData.toDate]);

  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const dropdownData = flocks.map((f: Flock) => ({
        label: f.flockRef,
        value: f.flockId,
      }));
      setMasterData(prev => ({
        ...prev,
        flockItems: dropdownData,
      }));
    } catch (error) {
      console.error("Failed to fetch flocks:", error);
    }
  };
  useEffect(() => {
    fetchFlocks();
    fetchCustomers();
  }, [businessUnitId]);
  const handleAddEggSale = async (data: any) => {
    try {
      setGlobalLoading(true);
      const payload = {
        businessUnitId,
        customerId: data.customerId,
        flockId: data.flockId,
        unitId: data.unitId,
        saleTypeId: 1,
        price: Number(data.price),
        quantity: null,
        patti: null,
        tray: data.trays ? Number(data.trays) : null,
        eggs: data.eggs ? Number(data.eggs) : null,
        date: data.date.toISOString().split("T")[0],
        note: data.note || "",
      };

      console.log("Egg Sale Payload:", payload);
      await addEggSale(payload);
      showSuccessToast("Egg sale added successfully");
      fetchEggSales();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Failed to add Egg sale";
      showErrorToast(backendMessage);
    } finally {
      setGlobalLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
      <View style={styles.filterRow}>
        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Customer..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
          {/* CLEAR ICON */}
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                fetchEggSales(null);
              }}
            >
              <Image
                source={Theme.icons.cross}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}

          {/* SEARCH ICON */}
          <TouchableOpacity onPress={() => fetchEggSales(searchText)}>
            <Image
              source={Theme.icons.search}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={customerOpen}
            value={masterData.selectedCustomer}
            items={masterData.customerItems}
            setOpen={setCustomerOpen}
            setValue={(valOrFunc) =>
              setMasterData(prev => ({
                ...prev,
                selectedCustomer:
                  typeof valOrFunc === 'function' ? valOrFunc(prev.selectedCustomer) : valOrFunc,
              }))
            }
            setItems={(itemsOrFunc) =>
              setMasterData(prev => ({
                ...prev,
                customerItems:
                  typeof itemsOrFunc === 'function' ? itemsOrFunc(prev.customerItems) : itemsOrFunc,
              }))
            }
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
            onPress={() => setActivePicker('from')} >
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>
              {masterData.fromDate ? masterData.fromDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateDash}>—</Text>
          {/* TO */}
          <TouchableOpacity style={styles.dateItem}
            onPress={() => setActivePicker('to')} >
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>
              {masterData.toDate ? masterData.toDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESET FILTERS */}
        {(masterData.fromDate || masterData.toDate || masterData.selectedCustomer) && (
          <TouchableOpacity
            style={styles.resetInlineBtn}
            onPress={() => {
              setMasterData(prev => ({
                ...prev,
                selectedCustomer: null,
                fromDate: null,
                toDate: null,
              }));
            }}
          >
            <Text style={styles.resetInlineText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      {activePicker && (
        <DateTimePicker
          value={
            activePicker === 'from'
              ? masterData.fromDate || new Date()
              : masterData.toDate || new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (activePicker === 'from') {
              setMasterData(prev => ({ ...prev, fromDate: selectedDate || prev.fromDate }));
            } else {
              setMasterData(prev => ({ ...prev, toDate: selectedDate || prev.toDate }));
            }

            if (Platform.OS === 'android') setActivePicker(null);
          }}
        />
      )}

      <ScrollView style={{ paddingHorizontal: 16, }}>
        <DataCard
          columns={columns}
          data={eggSales}
          itemsPerPage={10}
        />
      </ScrollView>
      <AddModal
        visible={openAddModal}
        title="Add Egg Sale"
        type="Egg sale"
        customerItems={masterData.customerItems}
        flockItems={masterData.flockItems}
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
