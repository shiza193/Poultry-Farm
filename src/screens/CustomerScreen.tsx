import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteParty } from '../services/PartyService';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';

import TopBarCard from '../components/customCards/TopBarCard';
import DataCard from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import PaginationControls from '../components/pagination/PaginationControls';
import Theme from '../theme/Theme';
import {
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
} from '../services/PartyService';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { useBusinessUnit } from '../context/BusinessContext';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';

/* ===== TYPES ===== */
type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  isActive: boolean;
  businessUnitId: string | null;
};

const CustomerScreen = () => {
  const insets = useSafeAreaInsets();
  const { businessUnitId: contextBU } = useBusinessUnit();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Local Business Unit filter state
  // Initially null so all customers are shown
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const payload = {
        searchKey: search || null,
        isActive: status === 'all' ? null : status === 'active',
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        partyTypeId: 0,
        businessUnitId: selectedBU || null, // Only filter if user selects BU
      };

      const response = await getPartyBySearchAndFilter(payload);

      if (!response || !Array.isArray(response.list)) {
        setUsers([]);
        setTotalCount(0);
        return;
      }

      const formatted: User[] = response.list.map((item: any) => ({
        id: item.partyId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        isActive: item.isActive,
        businessUnitId: item.businessUnitId || null,
      }));

      setUsers(formatted);
      setTotalCount(response.totalCount ?? 0);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers whenever search/status/BU/page changes
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search, status, selectedBU]);

  // ================= HANDLERS =================
  const handleAddCustomer = async (formData: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string;
  }) => {
    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || '',
        partyTypeId: 0,
        businessUnitId: selectedBU || contextBU, // Use selected BU or fallback
      };

      const response = await addParty(payload);

      if (response) {
        showSuccessToast('Success', 'Customer added successfully');
        setShowAddModal(false);
        setCurrentPage(1);
        fetchCustomers();
      }
    } catch (error: any) {
      console.error('Add customer error:', error);
      const errMsg = error?.response?.data?.message || 'Failed to add customer';
      showErrorToast('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);

      await updatePartyIsActive(userId, !currentStatus);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user,
        ),
      );

    showSuccessToast(
        'Success',
        `Customer status updated to ${!currentStatus ? 'Active' : 'Inactive'}`,
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      showErrorToast('Error', 'Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePress = (partyId: string) => {
    setSelectedPartyId(partyId);
    setDeleteModalVisible(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedPartyId) return;

    try {
      const res = await deleteParty(selectedPartyId);

      // Show backend message if returned
      if (res.error || res.success === false) {
        return showErrorToast(
          'Error',
          res.error || res.message || 'Failed to delete customer',
        );
      }

      // Remove from state
      setUsers(prev => prev.filter(u => u.id !== selectedPartyId));
      showSuccessToast('Success', res.message || 'Customer deleted successfully');
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete customer';
    showErrorToast('Error', msg);
      console.error('Delete customer failed', error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedPartyId(null);
    }
  };

  // ================= PAGINATION =================
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleNext = () =>
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);

  // ================= RESET FILTERS =================
  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedBU(null); // reset BU to null
    setCurrentPage(1);
  };

  // ================= UI =================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ===== TOP BAR ===== */}
      <TopBarCard
        onAddPress={() => setShowAddModal(true)}
        searchValue={search}
        onSearchChange={text => {
          setCurrentPage(1);
          setSearch(text);
        }}
        status={status}
        onStatusChange={s => {
          setCurrentPage(1);
          setStatus(s);
        }}
        value={selectedBU}
        onBusinessUnitChange={buId => {
          setCurrentPage(1);
          setSelectedBU(buId);
        }}
        onReset={resetFilters}
      />

      {/* ===== TABLE ===== */}
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View>
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => <DataCard isHeader />}
            renderItem={({ item }) => (
              <DataCard
                name={item.name}
                email={item.email ?? '-----'}
                phone={item.phone ?? '-----'}
                address={item.address || '-----'}
                status={item.isActive ? 'Active' : 'Inactive'}
                onToggleStatus={() =>
                  handleToggleStatus(item.id, item.isActive)
                }
                onDelete={() => handleDeletePress(item.id)}
              />
            )}
            scrollEnabled={false}
          />

          {!loading && users.length === 0 && (
            <View style={{ alignItems: 'flex-start', marginBottom: 200 }}>
              <Image
                source={Theme.icons.nodata}
                style={{ width: 300, height: 360 }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ===== PAGINATION ===== */}
      {totalCount > itemsPerPage && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onNext={handleNext}
          onPrev={handlePrev}
          onFirst={handleFirst}
          onLast={handleLast}
        />
      )}

      {/* ===== ADD MODAL ===== */}
      <AddModal
        visible={showAddModal}
        type="customer"
        title="Add Customer"
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCustomer}
      />
      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this customer?"
      />

    
      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
});
