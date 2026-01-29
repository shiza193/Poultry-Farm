import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBusinessUnit } from '../context/BusinessContext';

import Header from '../components/common/Header';
import TopBarCard from '../components/customCards/TopBarCard';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import Theme from '../theme/Theme';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';

import {
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
  deleteParty,
  updateParty,
} from '../services/PartyService';

import StatusToggle from '../components/common/StatusToggle';
import ProfileModal, {
  ProfileData,
} from '../components/customPopups/ProfileModal';

type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  isActive: boolean;
  businessUnitId: string | null;
  businessUnit?: string;
};

const CustomerScreen = () => {
  const insets = useSafeAreaInsets();
  const { businessUnitId: contextBU } = useBusinessUnit();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
  const [openRowDotsId, setOpenRowDotsId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
        businessUnitId: selectedBU || null,
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
        businessUnit: item.businessUnitName || '—',
      }));

      setUsers(formatted);
      setTotalCount(response.totalCount ?? 0);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      showErrorToast('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = (user: User) => {
    // map User to ProfileData
    const profileData: ProfileData = {
      id: user.id,
      name: user.name,
      phone: user.phone ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      businessUnitId: user.businessUnitId ?? null,
      isActive: user.isActive,
    };

    setSelectedUser(profileData);
    setShowProfileModal(true);
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search, status, selectedBU]);

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
        businessUnitId: selectedBU || contextBU,
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

  const handleToggleStatus = async (user: User) => {
    try {
      setLoading(true);
      await updatePartyIsActive(user.id, !user.isActive);
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      );
      showSuccessToast(
        'Success',
        `Customer status updated to ${!user.isActive ? 'Active' : 'Inactive'}`,
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      showErrorToast('Error', 'Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      const res = await deleteParty(selectedUserId);
      if (res.error || res.success === false) {
        return showErrorToast(
          'Error',
          res.error || res.message || 'Failed to delete customer',
        );
      }
      setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      showSuccessToast(
        'Success',
        res.message || 'Customer deleted successfully',
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete customer';
      showErrorToast('Error', msg);
      console.error('Delete customer failed', error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedUserId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedBU(null);
    setCurrentPage(1);
  };

  // ================= TABLE SETUP =================
  const filteredUsers = users.filter(user => {
    if (status === 'active' && !user.isActive) return false;
    if (status === 'inactive' && user.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !user.name.toLowerCase().includes(q) &&
        !user.email?.toLowerCase().includes(q)
      )
        return false;
    }
    if (selectedBU && user.businessUnitId !== selectedBU) return false;
    return true;
  });

  const tableData = filteredUsers.map(u => ({
    name: u.name,
    email: u.email ?? '—',
    phone: u.phone ?? '—',
    address: u.address ?? '—',
    status: u.isActive,
    raw: u,
  }));

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      width: 110,
      isTitle: true,
      showDots: true,
      render: (value, row) => (
        <TouchableOpacity onPress={() => handleOpenProfile(row.raw)}>
          <Text style={{ color: Theme.colors.black, fontWeight: 'bold' }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
      onDotsPress: row => {
        // toggle row menu open/close
        setOpenRowDotsId(prev => (prev === row.raw.id ? null : row.raw.id));
      },
    },

    { key: 'email', title: 'Email', width: 130 },
    { key: 'phone', title: 'Phone', width: 120 },
    { key: 'address', title: 'Address', width: 100 },
    {
      key: 'status',
      title: 'Status',
      width: 120,
      render: (value, row) => (
        <StatusToggle
          isActive={value}
          onToggle={() => handleToggleStatus(row.raw)}
        />
      ),
    },
  ];

  // ================= UI =================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Customers"
        onPressDots={() => setShowDotsMenu(prev => !prev)}
      />

      {showDotsMenu && (
        <View style={styles.dotsMenu}>
          <TouchableOpacity
            onPress={() => {
              setShowAddModal(true);
              setShowDotsMenu(false);
            }}
          >
            <Text style={styles.menuText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
      )}

      {openRowDotsId && (
        <View
          style={{
            position: 'absolute',
            top: 225,
            marginLeft: 23,
            backgroundColor: Theme.colors.white,
            borderRadius: 6,
            elevation: 5,
            padding: 8,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedUserId(openRowDotsId);
              setDeleteModalVisible(true);
              setOpenRowDotsId(null);
            }}
          >
            <Text style={{ color: 'red', fontWeight: '600' }}>
              Delete Customer{' '}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {selectedUser && (
        <ProfileModal
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          data={selectedUser}
          type="customer"
          onSave={async updatedData => {
            try {
              setLoading(true);

              const payload = {
                name: updatedData.name.trim(),
                email: updatedData.email?.trim() || null,
                phone: updatedData.phone?.trim() || null,
                address: updatedData.address?.trim() || '',
                partyTypeId: 0, 
                businessUnitId: updatedData.businessUnitId || contextBU || '',
              };

              const response = await updateParty(updatedData.id, payload);

              if (response) {
                showSuccessToast('Success', 'Customer updated successfully');
                setShowProfileModal(false);
                fetchCustomers(); 
              }
            } catch (error: any) {
              console.error('Update customer error:', error);
              const errMsg =
                error?.response?.data?.message || 'Failed to update customer';
              showErrorToast('Error', errMsg);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      <TopBarCard
        searchValue={search}
        onSearchChange={text => setSearch(text)}
  status={status === 'all' ? null : status}
  onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />

      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={itemsPerPage}
          />
        </View>
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        )
      )}

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
  container: { flex: 1, backgroundColor: Theme.colors.white },
  dotsMenu: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.success,
  },
  noDataContainer: {  justifyContent: 'center', alignItems: 'center' },
noDataImage: {
  width: 290,
  height: 290,
  resizeMode: 'contain',
},});
