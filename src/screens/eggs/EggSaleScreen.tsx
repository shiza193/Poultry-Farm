import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput, Platform, ScrollView } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { getEggSales, EggSale, getCustomers, addEggSale, } from '../../services/EggsService';
import { useBusinessUnit } from "../../context/BusinessContext"
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AddModal from '../../components/customPopups/AddModal';
import { showErrorToast, showSuccessToast } from '../../utils/AppToast';
import { getFlocks } from '../../services/FlockService';
import { Dropdown } from 'react-native-element-dropdown';
import SearchBar from '../../components/common/SearchBar';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';
import { formatDisplayDate } from '../../utils/validation';
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
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [filterData, setFilterData] = useState<{
    searchKey: string;
    selectedCustomer: string | null;
    customerItems: { label: string; value: string }[];
    selectedFlock: string | null;
    flockItems: { label: string; value: string }[];
    fromDate: Date | null;
    toDate: Date | null;
  }>({
    searchKey: "",
    selectedCustomer: null,
    customerItems: [],
    selectedFlock: null,
    flockItems: [],
    fromDate: null,
    toDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  //TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'date',
      title: 'DATE',
      width: 120,
      isTitle: true,
      render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
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
  const fetchEggSales = async (page = currentPage) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    const payload = {
      businessUnitId,
      customerId: filterData.selectedCustomer,
      flockId: filterData.selectedFlock,
      from: filterData.fromDate?.toISOString() || null,
      to: filterData.toDate?.toISOString() || null,
      searchKey: filterData.searchKey || null,
      pageNumber: page,
      pageSize: pageSize,
    };
    try {
      const response = await getEggSales(payload);
      const normalizedEggSales = normalizeDataFormat(response.list, 'array', 'EggSale');
      setEggSales(normalizedEggSales);
      setTotalRecords(response.totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchEggSales();
      setFilterData(prev => ({
        ...prev,
        selectedCustomer: null,
        fromDate: null,
        toDate: null,
      }));
    }, [businessUnitId])
  );
  const fetchCustomers = async () => {
    const customers = await getCustomers(businessUnitId);
    const normalizedCustomers = normalizeDataFormat(customers, 'array', 'Customer');
    const dropdownData = normalizedCustomers.map((s: any) => ({
      label: s.name, value: s.partyId
    }));
    setFilterData(prev => ({
      ...prev,
      customerItems: dropdownData,
    }));
  };
  useEffect(() => {
    if (businessUnitId) {
      fetchEggSales();
    }
  }, [businessUnitId, filterData.selectedCustomer, filterData.fromDate, filterData.toDate, filterData.searchKey]);
  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const normalizedFlocks = normalizeDataFormat(flocks, 'array', 'Flock');
      const dropdownData = normalizedFlocks.map((f: any) => ({
        label: f.flockRef,
        value: f.flockId,
      }));
      setFilterData(prev => ({
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
      const res = await addEggSale(payload);
      if (res.status === "Success") {
        setEggSales(prev => [...prev, res.data]);
        setTotalRecords(prev => prev + 1);
        setCurrentPage(1);
        showSuccessToast("Egg sale added successfully");
      }
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
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search Customer..."
            onSearch={(val) =>
              setFilterData(prev => ({
                ...prev,
                searchKey: val,
              }))
            }
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <Dropdown
            data={
              filterData.customerItems.length > 0
                ? filterData.customerItems
                : [{ label: "No result found", value: null, disabled: true }]
            }
            labelField="label"
            valueField="value"
            placeholder="Customer"
            value={filterData.selectedCustomer}
            onChange={item => {
              setFilterData(prev => ({
                ...prev,
                selectedCustomer: item.value,
              }));
            }}
            style={styles.inlineDropdown}
            selectedTextStyle={styles.dropdownText}
            containerStyle={styles.inlineDropdownContainer}
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
              {filterData.fromDate ? filterData.fromDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateDash}>—</Text>
          {/* TO */}
          <TouchableOpacity style={styles.dateItem}
            onPress={() => setActivePicker('to')} >
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>
              {filterData.toDate ? filterData.toDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESET FILTERS */}
        {(filterData.fromDate || filterData.toDate || filterData.selectedCustomer) && (
          <TouchableOpacity
            style={styles.resetInlineBtn}
            onPress={() => {
              setFilterData(prev => ({
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
              ? filterData.fromDate || new Date()
              : filterData.toDate || new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (event.type !== 'set') {
              if (Platform.OS === 'android') setActivePicker(null);
              return;
            }
            if (activePicker === 'from') {
              setFilterData(prev => ({
                ...prev,
                fromDate: selectedDate!,
              }));
            } else {
              setFilterData(prev => ({
                ...prev,
                toDate: selectedDate!,
              }));
            }
            if (Platform.OS === 'android') setActivePicker(null);
          }}
        />
      )}

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <DataCard
          columns={columns}
          data={eggSales}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          totalRecords={totalRecords}
          onPageChange={page => {
            setCurrentPage(page);
            fetchEggSales(page);
          }}
        />
      </ScrollView>
      <AddModal
        visible={openAddModal}
        title="Add Egg Sale"
        type="Egg sale"
        customerItems={filterData.customerItems}
        flockItems={filterData.flockItems}
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
    gap: 8
  },
  dropdownWrapper: {
    width: 120,
    zIndex: 1
  },
  inlineDropdown: {
    width: 120,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 42,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  inlineDropdownContainer: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
  },
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
