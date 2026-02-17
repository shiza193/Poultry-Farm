import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';

import {
  getSalesByFilter,
  SaleRecord,
  addSale,
  AddSalePayload,
  getParties,
  GetSaleFilters,
} from '../../services/FlockService';

import { useBusinessUnit } from '../../context/BusinessContext';
import SearchBar from '../../components/common/SearchBar';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';

interface FlockSaleScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
  setGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlockSaleScreen: React.FC<FlockSaleScreenProps> = ({
  openAddModal,
  onCloseAddModal,
  setGlobalLoading,
}) => {
  const { businessUnitId } = useBusinessUnit();

  const [salesData, setSalesData] = useState<SaleRecord[]>([]);

  const [search, setSearch] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSaleModalVisible, setIsSaleModalVisible] = useState(false);

  const [customerItems, setCustomerItems] = useState<
    { label: string; value: string }[]
  >([]);

  // ================= FETCH =================
  const fetchSales = async (filters?: GetSaleFilters) => {
    if (!businessUnitId) return;

    try {
      setGlobalLoading?.(true);
      const res = await getSalesByFilter({
        businessUnitId,
        pageNumber: 1,
        pageSize: 100,
        ...filters,
      });
      setSalesData(res ?? []);
    } catch (err) {
      console.error('Fetch sale error:', err);
      setSalesData([]);
    } finally {
      setGlobalLoading?.(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [businessUnitId]);

  // ================= CUSTOMERS =================
  useEffect(() => {
    const loadCustomers = async () => {
      if (!businessUnitId) return;
      const list = await getParties(businessUnitId, 0);
      setCustomerItems(list.map(p => ({ label: p.name, value: p.partyId })));
    };
    loadCustomers();
  }, [businessUnitId]);

  const formatDate = (date?: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ================= TABLE =================
  const tableData = salesData.map(item => ({
    date: formatDate(item.date),
    customer: item.customer,
    flock: item.flock,
    quantity: item.quantity,
    price: item.price,
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'date', title: 'DATE', width: 110 },
    { key: 'customer', title: 'CUSTOMER', width: 140 },
    { key: 'flock', title: 'FLOCK', width: 120 },
    { key: 'quantity', title: 'QTY', width: 90 },
    { key: 'price', title: 'PRICE', width: 90 },
  ];

  // ================= UI =================
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ROW 1 : SEARCH + FILTER */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search sales..."
            initialValue={search}
            onSearch={value => setSearch(value)}
          />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Image source={Theme.icons.filter} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* ROW 2 : NEW BUTTON
      <View style={styles.newRow}>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setIsSaleModalVisible(true)}
        >
          <Text style={styles.newText}>+ New</Text>
        </TouchableOpacity>
      </View> */}

      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard columns={columns} data={tableData} />
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Image source={Theme.icons.nodata} style={styles.noDataImage} />
        </View>
      )}

      {/* ================= FILTER MODAL ================= */}
      <BusinessUnitModal
        visible={isFilterModalVisible}
        mode="saleFilter"
        customerItems={customerItems}
        onClose={() => setIsFilterModalVisible(false)}
        onApplySaleFilter={filters => {
          const apiFilters: GetSaleFilters = {};

          if (filters.fromDate)
            apiFilters.startDate = filters.fromDate.toISOString().split('T')[0];

          if (filters.toDate)
            apiFilters.endDate = filters.toDate.toISOString().split('T')[0];

          if (filters.customerId) apiFilters.partyId = filters.customerId;

          if (search) apiFilters.searchKey = search;

          fetchSales(apiFilters);
        }}
      />
      {/* ================= ADD SALE ================= */}
      <ItemEntryModal
        visible={openAddModal || isSaleModalVisible}
        type="flockSale"
        onClose={onCloseAddModal ?? (() => setIsSaleModalVisible(false))}
        onSave={async data => {
          setGlobalLoading?.(true);
          try {
            const payload: AddSalePayload = {
              customerId: data.customerName,
              flockId: data.flockName,
              quantity: Number(data.quantity),
              price: Number(data.price),
              date: data.saleDate?.toISOString() ?? new Date().toISOString(),
              note: data.remarks || '',
              businessUnitId: businessUnitId!,
            };
            await addSale(payload);
            fetchSales();
          } catch (err) {
            console.error('Add sale error:', err);
          } finally {
            setGlobalLoading?.(false);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default FlockSaleScreen;

const styles = StyleSheet.create({
  safeArea: {
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
  searchBox: { paddingHorizontal: 16, paddingVertical: 10 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },

  newRow: {
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: 'flex-end',
    marginBottom: 6,
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
    borderColor: Theme.colors.success,
  },
  filterIcon: { width: 22, height: 22, tintColor: Theme.colors.success },
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
    width: 290,
    height: 290,
    resizeMode: 'contain',
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
