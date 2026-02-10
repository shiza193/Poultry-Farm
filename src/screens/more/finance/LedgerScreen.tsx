import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../../theme/Theme';
import BackArrow from '../../../components/common/ScreenHeaderWithBack';
import SearchBar from '../../../components/common/SearchBar';
import DataCard, { TableColumn } from '../../../components/customCards/DataCard';
import LoadingOverlay from '../../../components/loading/LoadingOverlay';
import { showErrorToast } from '../../../utils/AppToast';

import {
  getLedgersWithBalance,
  LedgerItem as LedgerApiItem,
  getParties,
  PartyItem,
} from '../../../services/LedgerService';
import { useBusinessUnit } from '../../../context/BusinessContext';

type LedgerItem = {
  voucherNumber: string;
  voucherType: string;
  voucherDate: string;
  debit: string;
  credit: string;
  balance: string;
};

const LedgerScreen = () => {
  const { businessUnitId } = useBusinessUnit();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [parties, setParties] = useState<PartyItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<
    { label: string; value: string }[]
  >([]);


  const fetchLedgerData = async () => {
    try {
      setLoading(true);

      const selectedPartyName = selectedParty
        ? parties.find(p => p.partyId === selectedParty)?.name
        : null;
      const payload = {
        businessUnitId,
        searchKey: search || null,
        fromDate: filterDate ? filterDate.toISOString() : null,
        toDate: filterDate ? filterDate.toISOString() : null,
        pageNumber: 1,
        pageSize:50,
        accountHeadId: selectedParty || null,
        accountHeadName: selectedPartyName || null,
      };

      console.log(
        'Fetching Ledger with payload:',
        JSON.stringify(payload, null, 2),
      );

      const res = await getLedgersWithBalance(payload);

      // CASE-INSENSITIVE frontend filter
      const filteredList = res.list.filter(item =>
        selectedParty
          ? item.accountHead
              .toLowerCase()
              .includes(selectedPartyName?.toLowerCase() || '')
          : true,
      );
      const mappedData = filteredList.map((item: LedgerApiItem) => ({
        voucherNumber: item.voucherNumber,
        voucherType: item.voucherType,
        voucherDate: formatDate(item.voucherDate),
        debit: item.debit.toFixed(2),
        credit: item.credit.toFixed(2),
        balance: item.balance.toFixed(2),
      }));

      console.log('Mapped Ledger Data:', mappedData);

      setLedgerData(mappedData);
    } catch (err: any) {
      console.error('Ledger Fetch Error:', err);
      showErrorToast('Failed to fetch ledger data');
    } finally {
      setLoading(false);
    }
  };
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch data on focus
  useFocusEffect(
    useCallback(() => {
      fetchLedgerData();
    }, [filterDate, selectedParty]),
  );

  // Fetch parties on focus
  useFocusEffect(
    useCallback(() => {
      if (!businessUnitId) return;

      const fetchPartyData = async () => {
        try {
          console.log(' Fetching parties for BU:', businessUnitId);

          const data = await getParties({
            businessUnitId,
          });

          console.log(' Parties Count:', data.length);
          setParties(data);
        } catch (err) {
          console.error('Failed to fetch parties', err);
        }
      };

      fetchPartyData();
    }, [businessUnitId]),
  );

  // Update dropdown items when parties change
  useEffect(() => {
    setDropdownItems(
      parties.map(party => ({
        label: party.name,
        value: party.partyId,
      })),
    );
  }, [parties]);

  const filteredData = useMemo(() => {
    if (!search) return ledgerData;

    const lower = search.toLowerCase();
    return ledgerData.filter(
      item =>
        item.voucherNumber.toLowerCase().includes(lower) ||
        item.voucherType.toLowerCase().includes(lower),
    );
  }, [search, ledgerData]);

  const tableData = useMemo(
    () =>
      filteredData.map(item => ({
        code: item.voucherNumber,
        type: item.voucherType,
        date: item.voucherDate,
        debit: item.debit,
        credit: item.credit,
        balance: item.balance,
        raw: item,
      })),
    [filteredData],
  );

  const columns: TableColumn[] = [
    { key: 'code', title: 'Voucher Number', width: 140, isTitle: true },
    { key: 'type', title: 'Voucher Type', width: 120 },
    { key: 'date', title: 'Voucher Date', width: 120 },
    { key: 'debit', title: 'Debit (RS)', width: 100 },
    { key: 'credit', title: 'Credit (RS)', width: 100 },
    { key: 'balance', title: 'Balance (RS)', width: 100 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow title="Ledger" showBack />

      {/* Search + Dropdown Row */}
      {/* Search Row (FULL WIDTH) */}
      <View style={styles.searchOnlyRow}>
        <SearchBar
          placeholder="Search Voucher..."
          initialValue={search}
          onSearch={setSearch}
        />
      </View>

      {/* Filter Row */}
      {/* Date + Party Row (same as old style) */}
      <View style={styles.dateFilterRow}>
        <View style={styles.dateFilterInner}>
          <View style={[styles.dropdownWrapper]}>
            <DropDownPicker
              open={openDropdown}
              value={selectedParty}
              items={dropdownItems}
              setOpen={setOpenDropdown}
              listMode="SCROLLVIEW"
              setValue={setSelectedParty}
              placeholder="Select Party"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              arrowIconStyle={styles.dropdownArrow}
            />
          </View>

          <Text style={[styles.dateLabel, { marginLeft: 7 }]}>Date:</Text>

          <TouchableOpacity
            style={styles.dateFilterBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateFilterText}>
              {filterDate
                ? filterDate.toLocaleDateString('en-GB')
                : 'dd/mm/yyyy'}
            </Text>
          </TouchableOpacity>
        </View>

        {(selectedParty || filterDate) && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSelectedParty(null);
              setFilterDate(null);
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (event.type === 'set' && selectedDate)
              setFilterDate(selectedDate);
          }}
        />
      )}

      <ScrollView>
        <View style={styles.listContainer}>
          <DataCard columns={columns} data={tableData} itemsPerPage={10} />
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

export default LedgerScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  searchWrapper: {
    flex: 0.7,
    marginRight: 8,
    height: 42,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },

  partyWrapper: {
    width: 160,
    height: 42,
    zIndex: 10,
  },

  dropdown: {
    height: 42,
    minHeight: 42,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.success,
    borderRadius: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },

  dropdownList: {
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.success,
    borderRadius: 12,
  },

  dropdownText: {
    fontSize: 14,
    lineHeight: 18,
  },

  dateLabelBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
  },

  dateLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.success,
  },

  resetBtn: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },

  resetText: {
    color: Theme.colors.error,
    fontWeight: '700',
  },
  dropdownWrapper: {
    width: 170,
    height: 42,
  },

  searchOnlyRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateFilterBtn: {
    paddingHorizontal: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },

  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 3,
    marginBottom: 6,
  },
  dropdownContainer: {
    height: 42,
  },
  dropdownArrow: {
    width: 18,
    height: 18,
  },

  dateFilterInner: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dateFilterText: { color: Theme.colors.success, fontWeight: '600' },
});
