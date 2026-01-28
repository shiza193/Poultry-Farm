import React, { useState, useEffect } from 'react';
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
import Theme from '../theme/Theme';
import DataCard from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import {
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
} from '../services/PartyService';
import { useBusinessUnit } from '../context/BusinessContext';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import ProfileModal from '../components/customPopups/ProfileModal';

type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  isActive: boolean;
  businessUnitId: string;
};

const SupplierScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const insets = useSafeAreaInsets();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // All suppliers fetched from API
  const [users, setUsers] = useState<User[]>([]);
  // Filtered suppliers for UI
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Local state for dropdown
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

  // ================= FETCH SUPPLIERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const payload: any = {
        searchKey: null,
        isActive: null,
        pageNumber: 1,
        pageSize: 100, 
        partyTypeId: 1,
      };

      const data = await getPartyBySearchAndFilter(payload);

      if (data?.list && Array.isArray(data.list)) {
        const mappedUsers: User[] = data.list.map((item: any) => ({
          id: item.partyId,
          name: item.name || 'No Name',
          email: item.email || '---',
          phone: item.phone || '---',
          address: item.address || '---',
          isActive: item.isActive ?? true,
          businessUnitId: item.businessUnitId || '',
        }));

        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      showErrorToast('Error', 'Failed to fetch suppliers');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let updated = [...users];

    if (selectedBU) {
      updated = updated.filter(u => u.businessUnitId === selectedBU);
    }

    if (status !== 'all') {
      updated = updated.filter(u =>
        status === 'active' ? u.isActive : !u.isActive,
      );
    }

    if (search) {
      const q = search.toLowerCase();
      updated = updated.filter(u => u.name.toLowerCase().includes(q));
    }

    setFilteredUsers(updated);
  }, [selectedBU, status, search, users]);

  // ================= ADD SUPPLIER =================
  const handleAddSupplier = async (formData: {
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
        partyTypeId: 1,
        businessUnitId: businessUnitId,
      };

      const response = await addParty(payload);

      if (response) {
        showSuccessToast('Success', 'Supplier added successfully');
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (error: any) {
      console.error('ADD SUPPLIER ERROR:', error);
      const errMsg = error?.response?.data?.message || 'Failed to add supplier';
      showErrorToast('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await updatePartyIsActive(userId, !currentStatus);

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isActive: !currentStatus } : u,
        ),
      );

      // Show success toast
      showSuccessToast(
        'Success',
        `Supplier has been ${
          !currentStatus ? 'activated' : 'deactivated'
        } successfully`,
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      showErrorToast('Error', 'Failed to update supplier status');
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET FILTERS =================
  const resetFilters = () => {
    setSelectedBU(null);
    setStatus('all');
    setSearch('');
  };

  // ================= DELETE SUPPLIER =================
  const handleDeletePress = (partyId: string) => {
    setSelectedPartyId(partyId);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPartyId) return;

    try {
      const res = await deleteParty(selectedPartyId);

      if (res.error || res.success === false) {
        return showErrorToast(
          'Error',
          res.error || res.message || 'Failed to delete supplier',
        );
      }

      setUsers(prev => prev.filter(u => u.id !== selectedPartyId));
      showSuccessToast(
        'Success',
        res.message || 'Supplier deleted successfully',
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete supplier';
      showErrorToast('Error', msg);
      console.error('Delete supplier failed', error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedPartyId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBarCard
        onAddPress={() => setShowAddModal(true)}
        searchValue={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => <DataCard isHeader />}
            contentContainerStyle={{ paddingBottom: 20 }}
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
                onEdit={() => {
                  console.log('EDIT CLICKED');
                  setOpen(true);
                }}
              />
            )}
          />

          {!loading && filteredUsers.length === 0 && (
            <View
              style={{
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: 50,
              }}
            >
              <Image
                source={Theme.icons.nodata}
                style={{ width: 300, height: 360, marginBottom: 30 }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>

      <AddModal
        visible={showAddModal}
        type="customer"
        title="Add Supplier"
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSupplier}
      />

      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this supplier?"
      />
      <ProfileModal visible={open} onClose={() => setOpen(false)} />

      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default SupplierScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
});
