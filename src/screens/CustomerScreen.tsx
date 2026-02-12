import React, { useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useBusinessUnit } from '../context/BusinessContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Header from '../components/common/LogoHeader';
import BackArrow from '../components/common/ScreenHeaderWithBack';
import TopBarCard from '../components/customCards/TopBarCard';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import StatusToggle from '../components/common/StatusToggle';
import ProfileModal, {
  ProfileData,
} from '../components/customPopups/ProfileModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../theme/Theme';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import {
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
  deleteParty,
  updateParty,
} from '../services/PartyService';

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
  const route = useRoute<any>();
  const fromMenu = route.params?.fromMenu === true;
  const farmBU = route.params?.businessUnitId ?? null;
  const { businessUnitId: contextBU } = useBusinessUnit();

  const [users, setUsers] = React.useState<User[]>([]);
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    businessUnit: farmBU || null,
  });
  const [modals, setModals] = React.useState({
    showAdd: false,
    profileUser: null as ProfileData | null, // for ProfileModal
    deleteUserId: null as string | null, // only id for delete
    deleteVisible: false,
  });
  const [loading, setLoading] = React.useState(false);
  const pageSize = 100;

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const payload = {
        searchKey: filters.search || null,
        isActive: filters.status === 'all' ? null : filters.status === 'active',
        pageNumber: 1,
        pageSize,
        partyTypeId: 0,
        businessUnitId: filters.businessUnit || null,
      };
      const response = await getPartyBySearchAndFilter(payload);

      if (!response?.list || !Array.isArray(response.list)) {
        setUsers([]);
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
        businessUnit: item.businessUnit?.trim() || '—',
      }));

      setUsers(formatted);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [filters]),
  );

  // ================= OPEN PROFILE =================
  const handleOpenProfile = (user: User) => {
    setModals(prev => ({
      ...prev,
      profileUser: {
        id: user.id,
        name: user.name,
        phone: user.phone ?? '',
        email: user.email ?? '',
        address: user.address ?? '',
        businessUnitId: user.businessUnitId ?? null,
        isActive: user.isActive,
      },
    }));
  };

  // ================= ADD CUSTOMER =================
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
        businessUnitId: filters.businessUnit || contextBU,
      };

      const response = await addParty(payload);
      if (response) {
        showSuccessToast('Success', 'Customer added successfully');
        setModals(prev => ({ ...prev, showAdd: false }));
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

  // ================= TOGGLE STATUS =================
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

  // ================= DELETE CUSTOMER =================
  const handleDeletePress = (userId: string) => {
    setModals(prev => ({
      ...prev,
      deleteUserId: userId,
      deleteVisible: true,
    }));
  };

  const handleConfirmDelete = async () => {
    if (!modals.deleteUserId) return;

    try {
      const res = await deleteParty(modals.deleteUserId);
      if (res.error || res.success === false) {
        return showErrorToast(
          'Error',
          res.error || res.message || 'Failed to delete customer',
        );
      }
      setUsers(prev => prev.filter(u => u.id !== modals.deleteUserId));
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
    } finally {
      setModals(prev => ({
        ...prev,
        deleteVisible: false,
        deleteUserId: null,
      }));
    }
  };

  const resetFilters = () => {
    setFilters(prev => ({
      search: '',
      status: 'all',
      businessUnit: fromMenu ? prev.businessUnit : null,
    }));
  };

  // ================= FILTERED USERS =================
  const filteredUsers = users.filter(user => {
    const { search, status, businessUnit } = filters;

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

    if (businessUnit && user.businessUnitId !== businessUnit) return false;

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
      title: 'NAME',
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
    },
    { key: 'email', title: 'EMAIL', width: 130 },
    { key: 'phone', title: 'PHONE', width: 120 },
    { key: 'address', title: 'ADDRESS', width: 100 },
    {
      key: 'status',
      title: 'STATUS',
      width: 130,
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
    <SafeAreaView style={styles.safeArea}>
      {fromMenu ? (
        <BackArrow
          title="Customers"
          showBack
          onAddNewPress={() => setModals(prev => ({ ...prev, showAdd: true }))}
        />
      ) : (
        <Header
          title="Customers"
          onAddNewPress={() => setModals(prev => ({ ...prev, showAdd: true }))}
          showLogout
        />
      )}

      {modals.profileUser && (
        <ProfileModal
          visible={true}
          onClose={() => setModals(prev => ({ ...prev, profileUser: null }))}
          data={modals.profileUser}
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
                setModals(prev => ({ ...prev, profileUser: null }));
                fetchCustomers();
              }
            } catch (error) {
              console.error('Update customer error:', error);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
      <TopBarCard
        searchValue={filters.search}
        onSearchChange={text => setFilters(prev => ({ ...prev, search: text }))}
        status={filters.status === 'all' ? null : filters.status}
        onStatusChange={s =>
          setFilters(prev => ({ ...prev, status: s ?? 'all' }))
        }
        value={filters.businessUnit}
        onBusinessUnitChange={bu =>
          setFilters(prev => ({ ...prev, businessUnit: bu }))
        }
        onReset={resetFilters}
        hideBUDropdown={fromMenu}
      />

      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={10}
            renderRowMenu={(row, closeMenu) => (
              <TouchableOpacity
                onPress={() => {
                  handleDeletePress(row.raw.id);
                  closeMenu();
                }}
              >
                <Text
                  style={{
                    color: 'red',
                    fontWeight: '600',
                    fontSize: 12,
                    marginLeft: 12,
                  }}
                >
                  Delete Customer
                </Text>
              </TouchableOpacity>
            )}
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
        visible={modals.showAdd}
        type="customer"
        title="Add Customer"
        onClose={() => setModals(prev => ({ ...prev, showAdd: false }))}
        onSave={handleAddCustomer}
        hideBusinessUnit={fromMenu}
      />

      <ConfirmationModal
        type="delete"
        visible={modals.deleteVisible}
        onClose={() =>
          setModals(prev => ({
            ...prev,
            deleteVisible: false,
            deleteUserId: null,
          }))
        }
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this customer?"
      />

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
