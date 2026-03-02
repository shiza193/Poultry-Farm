import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Theme from '../../../theme/Theme';
import BackArrow from '../../../components/common/ScreenHeaderWithBack';
import SearchBar from '../../../components/common/SearchBar';
import DataCard, {
  TableColumn,
} from '../../../components/customCards/DataCard';
import { showErrorToast, showSuccessToast } from '../../../utils/AppToast';

import {
  getAccountHeads,
  getParentAccountHeads,
  addAccountHead,
} from '../../../services/AccountHeadService';
import { useBusinessUnit } from '../../../context/BusinessContext';
import BusinessUnitModal from '../../../components/customPopups/BusinessUnitModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalizeDataFormat } from '../../../utils/NormalizeDataFormat';
import { formatDisplayDate } from '../../../utils/validation';
/* ================= TYPES ================= */
type AccountHead = {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  type: string | null;
  businessUnit: string;
};
const AccountHeadScreen = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState<{
    list: AccountHead[];
    total: number;
  }>({
    list: [],
    total: 0,
  });
  const [showAccountHeadModal, setShowAccountHeadModal] = useState(false);
  const [accountTypeItems, setAccountTypeItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { businessUnitId } = useBusinessUnit();

  /* ================= FETCH ACCOUNT HEADS ================= */
  const fetchAccountHeads = async (page: number = 1) => {
    if (!businessUnitId) return;

    try {
      setLoading(true);

      const payload = {
        searchKey: search || null,
        businessUnitId,
        pageNumber: page,
        pageSize,
      };

      const res = await getAccountHeads(payload);

      const safeList = normalizeDataFormat(
        res?.list,
        'array',
        'Account Heads List',
      );

      const mappedList = safeList.map((item: any) => ({
        id: item.accountHeadId,
        code: item.code,
        name: item.name,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        type: item.type ?? '—',
        businessUnit: item.businessUnit,
      }));
      setAccountData({
        list: mappedList,
        total: res?.totalCount ?? mappedList.length,
      });
    } catch {
      showErrorToast('Failed to fetch account heads');
      setAccountData({
        list: [],
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchAccountHeads(1);
    }, [search, businessUnitId]),
  );

  /* ================= FETCH PARENT ACCOUNT HEADS ================= */
  const fetchParentAccountHeads = async () => {
    if (!businessUnitId) return;

    try {
      const res = await getParentAccountHeads(businessUnitId);

      // ===== Normalize data =====
      const safeList = normalizeDataFormat(
        res,
        'array',
        'Parent Account Heads',
      );

      const mapped = safeList.map((item: any) => ({
        label: item.name,
        value: item.parentAccountHeadId,
      }));

      setAccountTypeItems(mapped);
    } catch {
      showErrorToast('Failed to load account types');
      setAccountTypeItems([]);
    }
  };

  const handleSaveAccountHead = async (data: {
    name: string;
    accountType: string;
    isActive: boolean;
  }) => {
    if (!businessUnitId) return;

    try {
      const payload = {
        name: data.name,
        accountType: data.accountType,
        parentId: data.accountType,
        isActive: data.isActive,
        businessUnitId,
      };

      const response = await addAccountHead(payload);

      const normalized = normalizeDataFormat(
        response?.data,
        'object',
        'Add Account Head',
      );

      const newItem = {
        id: normalized.accountHeadId,
        code: normalized.code,
        name: normalized.name,
        createdBy: normalized.createdBy,
        createdAt: normalized.createdAt,
        type: normalized.type ?? '—',
        businessUnit: normalized.businessUnit,
      };

      setAccountData(prev => ({
        list: [...prev.list, newItem],
        total: prev.total + 1,
      }));

      showSuccessToast('Account added successfully!');
      setShowAccountHeadModal(false);
    } catch (err: any) {
      console.error('Add Account Head Error:', err.response || err);
      showErrorToast('Failed to add account');
    }
  };
  /* ================= DATACARD DATA ================= */
  const tableData = useMemo(
    () =>
      accountData.list.map(item => ({
        code: item.code,
        name: item.name,
        createdBy: item.createdBy,
        createdAt: formatDisplayDate(item.createdAt),
        type: item.type,
        raw: item,
      })),
    [accountData],
  );

  /* ================= COLUMNS ================= */
  const columns: TableColumn[] = [
    { key: 'code', title: 'CODE', width: 120, isTitle: true },
    { key: 'name', title: 'NAME', width: 160 },
    { key: 'createdBy', title: 'CREATED BY', width: 160 },
    { key: 'createdAt', title: 'CREATED AT', width: 160 },
    { key: 'type', title: 'TYPE', width: 120 },
  ];

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow
        title="Account Heads"
        showBack
        onAddNewPress={() => {
          fetchParentAccountHeads();
          setShowAccountHeadModal(true);
        }}
      />

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search Name..."
          initialValue={search}
          onSearch={setSearch}
        />
      </View>

      <ScrollView>
        <View style={styles.listContainer}>
          <DataCard
            columns={columns}
            data={tableData}
            loading={loading}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            totalRecords={accountData.total}
            onPageChange={page => {
              setCurrentPage(page);
              fetchAccountHeads(page);
            }}
          />
        </View>
      </ScrollView>
      {/* ===== BUSINESS UNIT MODAL ===== */}
      <BusinessUnitModal
        visible={showAccountHeadModal}
        onClose={() => setShowAccountHeadModal(false)}
        mode="accountHead"
        accountTypeItems={accountTypeItems}
        onSaveAccountHead={handleSaveAccountHead}
      />
    </SafeAreaView>
  );
};

export default AccountHeadScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
});
