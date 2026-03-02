import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import BusinessUnitModal, {
  SaleFilterModel,
} from '../../components/customPopups/BusinessUnitModal';

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
import { formatDisplayDate } from '../../utils/validation';

interface FlockSaleScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
}

const FlockSaleScreen: React.FC<FlockSaleScreenProps> = ({
  openAddModal,
  onCloseAddModal,
  
}) => {
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = React.useState(false);

  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<GetSaleFilters>({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSaleModalVisible, setIsSaleModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerItems, setCustomerItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // ================= FETCH SALES =================
  const fetchSales = async (
    page: number = 1,
    filters: GetSaleFilters = activeFilters,
  ) => {
    if (!businessUnitId) return;

    try {
      setLoading(true);
      const res = await getSalesByFilter({
        businessUnitId,
        pageNumber: page,
        pageSize,
        ...filters,
      });
      setSalesData(res.list ?? []);
      setTotalRecords(res.totalCount ?? 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Fetch sale error:', err);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (!businessUnitId) return;
    setCurrentPage(1);
    setActiveFilters({});
    fetchSales(1, {});
  }, [businessUnitId]);

  // ================= LOAD CUSTOMERS =================
  useEffect(() => {
    const loadCustomers = async () => {
      if (!businessUnitId) return;
      const list = await getParties(businessUnitId, 0);
      setCustomerItems(list.map(p => ({ label: p.name, value: p.partyId })));
    };
    loadCustomers();
  }, [businessUnitId]);

  // ================= TABLE DATA =================
  const tableData = salesData.map(item => ({
    date: formatDisplayDate(item.date),
    customer: item.customer,
    flock: item.flock,
    quantity: item.quantity,
    price: Number(item.price).toFixed(2),
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'date', title: 'DATE', width: 110 },
    { key: 'customer', title: 'CUSTOMER', width: 140 },
    { key: 'flock', title: 'FLOCK', width: 120 },
    { key: 'quantity', title: 'QTY', width: 90 },
    { key: 'price', title: 'PRICE', width: 90 },
  ];

  // ================= SEARCH =================
  const handleSearch = (value: string) => {
    setSearch(value);
    const updatedFilters = { ...activeFilters, searchKey: value || undefined };
    setActiveFilters(updatedFilters);
    fetchSales(1, updatedFilters);
  };

  // ================= APPLY SALE FILTER =================
  const handleApplyFilter = (filters: SaleFilterModel) => {
    const apiFilters: GetSaleFilters = {};

    if (filters.fromDate) {
      const start = new Date(filters.fromDate);
      start.setHours(0, 0, 0, 0);
      apiFilters.startDate = start.toISOString();
    }

    if (filters.toDate) {
      const end = new Date(filters.toDate);
      end.setHours(23, 59, 59, 999);
      apiFilters.endDate = end.toISOString();
    }

    if (filters.customerId) {
      apiFilters.partyId = filters.customerId;
    }

    if (filters.searchKey) {
      apiFilters.searchKey = filters.searchKey;
    }

    setActiveFilters(apiFilters);
    fetchSales(1, apiFilters);
    setIsFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* SEARCH + FILTER */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search sales..."
            initialValue={search}
            onSearch={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Image source={Theme.icons.filter} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* TABLE */}
   
        <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 8 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={pageSize}
             loading={loading} 
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={page => fetchSales(page)}
          />
        </View>
     

      {/* FILTER MODAL */}
      <BusinessUnitModal
        visible={isFilterModalVisible}
        mode="saleFilter"
        customerItems={customerItems}
        onClose={() => setIsFilterModalVisible(false)}
        onApplySaleFilter={handleApplyFilter}
        initialSaleFilters={{
          fromDate: activeFilters.startDate
            ? new Date(activeFilters.startDate)
            : null,
          toDate: activeFilters.endDate
            ? new Date(activeFilters.endDate)
            : null,
          customerId: activeFilters.partyId || null,
        }}
      />

      {/* ADD SALE MODAL */}
      <ItemEntryModal
        visible={openAddModal || isSaleModalVisible}
        type="flockSale"
        onClose={onCloseAddModal ?? (() => setIsSaleModalVisible(false))}
        onSave={async data => {
          setLoading(true);
          try {
            const payload: AddSalePayload = {
              saleTypeId: 2,
              customerId: data.customer,
              flockId: data.flockName,
              quantity: Number(data.quantity),
              price: Number(data.price),
              date: data.saleDate
                ? data.saleDate.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              note: data.remarks || '',
              businessUnitId: businessUnitId!,
            };
            await addSale(payload);
            fetchSales(1, activeFilters);
          } catch (err) {
            console.error('Add sale error:', err);
          } finally {
            setLoading(false);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default FlockSaleScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  filterBtn: {
    marginLeft: 10,
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Theme.colors.success,
  },
  filterIcon: { width: 22, height: 22, tintColor: Theme.colors.success },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
