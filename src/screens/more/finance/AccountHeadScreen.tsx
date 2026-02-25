import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import Theme from '../../../theme/Theme';
import BackArrow from '../../../components/common/ScreenHeaderWithBack';
import SearchBar from '../../../components/common/SearchBar';
import DataCard, {
  TableColumn,
} from '../../../components/customCards/DataCard';
import LoadingOverlay from '../../../components/loading/LoadingOverlay';
import { showErrorToast, showSuccessToast } from '../../../utils/AppToast';

import {
  getAccountHeads,
  getParentAccountHeads,
  addAccountHead,
} from '../../../services/AccountHeadService';
import { useBusinessUnit } from '../../../context/BusinessContext';
import BusinessUnitModal from '../../../components/customPopups/BusinessUnitModal';

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

/* ================= SCREEN ================= */
const AccountHeadScreen = () => {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [showAccountHeadModal, setShowAccountHeadModal] = useState(false);
  const [accountTypeItems, setAccountTypeItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
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

      const list = res?.list || [];
      setAccountHeads(
        list.map((item: any) => ({
          id: item.accountHeadId,
          code: item.code,
          name: item.name,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          type: item.type ?? item.parentName ?? '—',
          businessUnit: item.businessUnit,
        })),
      );

      setTotalRecords(res?.totalCount || list.length);
    } catch {
      showErrorToast('Failed to fetch account heads');
      setAccountHeads([]);
      setTotalRecords(0);
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

      const mapped = res.map((item: any) => ({
        label: item.name,
        value: item.parentAccountHeadId,
      }));

      setAccountTypeItems(mapped);
    } catch {
      showErrorToast('Failed to load account types');
    }
  };

  /* ================= HANDLE SAVE ACCOUNT HEAD ================= */
  const handleSaveAccountHead = async (data: {
    name: string;
    accountType: string;
    isActive: boolean;
  }) => {
    if (!businessUnitId) return;

    try {
      // payload for API
      const payload = {
        name: data.name,
        accountType: data.accountType,
        parentId: data.accountType,
        isActive: data.isActive,
        businessUnitId,
      };

      const res = await addAccountHead(payload);

      showSuccessToast('Account added successfully!');
      console.log('API Response:', res.data);

      fetchAccountHeads(); // refresh list
    } catch (err: any) {
      console.error('Add Account Head Error:', err.response || err);
      showErrorToast('Failed to add account');
    }
  };

  /* ================= DATACARD DATA ================= */
  const tableData = useMemo(
    () =>
      accountHeads.map(item => ({
        code: item.code,
        name: item.name,
        createdBy: item.createdBy,
        createdAt: item.createdAt.split('T')[0],
        type: item.type,
        raw: item,
      })),
    [accountHeads],
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            itemsPerPage={pageSize}
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={page => {
              setCurrentPage(page);
              fetchAccountHeads(page);
            }}
          />
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} />

      {/* ===== BUSINESS UNIT MODAL ===== */}
      <BusinessUnitModal
        visible={showAccountHeadModal}
        onClose={() => setShowAccountHeadModal(false)}
        mode="accountHead"
        accountTypeItems={accountTypeItems}
        onSaveAccountHead={handleSaveAccountHead}
      />
    </View>
  );
};

export default AccountHeadScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
});
