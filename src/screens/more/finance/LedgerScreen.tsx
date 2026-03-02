import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../../theme/Theme';
import BackArrow from '../../../components/common/ScreenHeaderWithBack';
import SearchBar from '../../../components/common/SearchBar';
import DataCard, {
  TableColumn,
} from '../../../components/customCards/DataCard';
import { showErrorToast } from '../../../utils/AppToast';
import {
  getLedgersWithBalance,
  getParties,
  PartyItem,
} from '../../../services/LedgerService';
import { useBusinessUnit } from '../../../context/BusinessContext';
import { formatDisplayDate } from '../../../utils/validation';
import { Dropdown } from 'react-native-element-dropdown';

type LedgerRow = {
  voucherNumber: string;
  voucherType: string;
  voucherDate: string;
  debit: string;
  credit: string;
  balance: string;
};

const LedgerScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    date: null as Date | null,
    party: null as string | null,
  });
  const [showPicker, setShowPicker] = useState(false);
  const [parties, setParties] = useState<PartyItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // --- Fetch Ledger Data ---
 const fetchLedgerData = async (page: number = 1) => {
  if (!businessUnitId) return;

  try {
    setLoading(true);

    const payload = {
      businessUnitId,
      searchKey: filters.search || null,
      dateTime: filters.date ? filters.date.toISOString() : null, // correct
      pageNumber: page,
      pageSize,
      partyId: filters.party || null,
    };

    const res = await getLedgersWithBalance(payload);

    const mappedData = (res.list || []).map(item => ({
      voucherNumber: item.voucherNumber,
      voucherType: item.voucherType,
      voucherDate: formatDisplayDate(item.voucherDate),
      debit: item.debit.toFixed(2),
      credit: item.credit.toFixed(2),
      balance: item.balance.toFixed(2),
    }));

    setLedgerData(mappedData);
    setTotalRecords(res.totalCount || mappedData.length);
  } catch (err: any) {
    console.error('Ledger Fetch Error:', err);
    showErrorToast('Failed to fetch ledger data');
    setLedgerData([]);
    setTotalRecords(0);
  } finally {
    setLoading(false);
  }
};

  // --- Fetch Parties ---
  const fetchParties = async () => {
    if (!businessUnitId) return;
    try {
      const data = await getParties({ businessUnitId });
      setParties(data);
    } catch (err) {
      console.error('Failed to fetch parties', err);
    }
  };

  // --- Initial Load + Party Fetch ---
  useFocusEffect(
    React.useCallback(() => {
      fetchLedgerData(1);
      fetchParties();
    }, [businessUnitId]),
  );

  // --- Refetch when filters change ---
  useEffect(() => {
    setCurrentPage(1);
    fetchLedgerData(1);
  }, [filters]);

  // --- Dropdown options ---
  const dropdownData = parties.map(p => ({ label: p.name, value: p.partyId }));

  // --- Table data for DataCard ---
  const tableData = ledgerData.map(item => ({
    code: item.voucherNumber,
    type: item.voucherType,
    date: item.voucherDate,
    debit: item.debit,
    credit: item.credit,
    balance: item.balance,
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'code', title: 'Voucher Number', width: 140 },
    { key: 'type', title: 'Voucher Type', width: 120 },
    { key: 'date', title: 'Voucher Date', width: 120 },
    { key: 'debit', title: 'Debit (RS)', width: 100 },
    { key: 'credit', title: 'Credit (RS)', width: 100 },
    { key: 'balance', title: 'Balance (RS)', width: 100 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow
        title="Ledger"
        showBack
        onReportPress={() => console.log('Generate Report')}
      />

      <View style={styles.searchOnlyRow}>
        <SearchBar
          placeholder="Search Voucher Number..."
          initialValue={filters.search}
          onSearch={value => setFilters(prev => ({ ...prev, search: value }))}
        />
      </View>

      <View style={styles.dateFilterRow}>
        <View style={styles.dateFilterInner}>
          <View style={styles.dropdownWrapper}>
            <Dropdown
              style={styles.dropdownElement}
              containerStyle={styles.dropdownContainerElement}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholderText}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Select Party"
              value={filters.party}
              onChange={item =>
                setFilters(prev => ({ ...prev, party: item.value }))
              }
            />
          </View>

          <Text style={[styles.dateLabel, { marginLeft: 7 }]}>Date:</Text>

          <TouchableOpacity
            style={styles.dateFilterBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateFilterText}>
              {filters.date
                ? filters.date.toLocaleDateString('en-GB')
                : 'dd/mm/yyyy'}
            </Text>
          </TouchableOpacity>
        </View>

        {(filters.party || filters.date) && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setFilters({ search: '', party: null, date: null })}
          >
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={filters.date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (event.type === 'set' && selectedDate)
              setFilters(prev => ({ ...prev, date: selectedDate }));
          }}
        />
      )}

      <ScrollView>
        <View style={styles.listContainer}>
          <DataCard
            columns={columns}
            data={tableData}
            loading={loading}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={page => {
              setCurrentPage(page);
              fetchLedgerData(page);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LedgerScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  searchOnlyRow: { paddingHorizontal: 16, paddingVertical: 10 },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 3,
    marginBottom: 6,
  },
  dateFilterInner: { flexDirection: 'row', alignItems: 'center' },
  dropdownWrapper: { width: 170, height: 42 },
  dropdownElement: {
    height: 40,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.white,
    marginBottom: 18,
  },
  dropdownContainerElement: {
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  selectedText: { fontSize: 14, color: Theme.colors.textPrimary },
  placeholderText: { fontSize: 14, color: '#9E9E9E' },
  dateLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  dateFilterBtn: {
    paddingHorizontal: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
  },
  dateFilterText: { color: Theme.colors.success, fontWeight: '600' },
  resetBtn: { borderRadius: 12, justifyContent: 'center' },
  resetText: { color: Theme.colors.error, fontWeight: '700' },
});
