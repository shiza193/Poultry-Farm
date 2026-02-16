import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  deleteParty,
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
  updateParty,
} from '../services/PartyService';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import ProfileModal, {
  ProfileData,
} from '../components/customPopups/ProfileModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import StatusToggle from '../components/common/StatusToggle';
import { TableColumn } from '../components/customCards/DataCard';
import TopBarCard from '../components/customCards/TopBarCard';
import Theme from '../theme/Theme';
import DataCard from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { useBusinessUnit } from '../context/BusinessContext';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import Header from '../components/common/LogoHeader';
import BackArrow from '../components/common/ScreenHeaderWithBack';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const route = useRoute<any>();
  const fromMenu = route.params?.fromMenu === true;
  const farmBU = route.params?.businessUnitId ?? null;
  const { businessUnitId } = useBusinessUnit();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<User | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  // All suppliers fetched from API
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBU, setSelectedBU] = useState<string | null>(
    fromMenu ? farmBU : null,
  );

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
        businessUnitId: fromMenu ? farmBU : null,
      };

      const data = await getPartyBySearchAndFilter(payload);

      if (data?.list && Array.isArray(data.list)) {
        const mappedUsers: User[] = data.list.map((item: any) => ({
          id: item.partyId,
          name: item.name || 'No Name',
          email: item.email ?? null,
          phone: item.phone ?? null,
          address: item.address ?? '',
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

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fromMenu, farmBU]),
  );

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let updated = [...users];

    if (selectedBU)
      updated = updated.filter(u => u.businessUnitId === selectedBU);
    if (status !== 'all')
      updated = updated.filter(u =>
        status === 'active' ? u.isActive : !u.isActive,
      );
    if (search)
      updated = updated.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()),
      );

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
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || '',
        partyTypeId: 1,
        businessUnitId: selectedBU || businessUnitId,
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

      showSuccessToast(
        'Success',
        `Supplier has been ${!currentStatus ? 'activated' : 'deactivated'
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
    setSelectedBU(fromMenu ? farmBU : null); // keep farm BU if fromMenu
    setStatus('all');
    setSearch('');
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

  const handleUpdateSupplier = (updatedData: ProfileData) => {
    if (!selectedSupplier) return;

    (async () => {
      try {
        setLoading(true);

        const payload = {
          name: updatedData.name.trim(),
          email: updatedData.email?.trim() || null,
          phone: updatedData.phone?.trim() || null,
          address: updatedData.address?.trim() || '',
          partyTypeId: 1,
          businessUnitId: selectedSupplier.businessUnitId,
        };

        console.log('UPDATE PAYLOAD ', payload);

        await updateParty(selectedSupplier.id, payload);

        showSuccessToast('Success', 'Supplier updated successfully');
        setOpenProfile(false);
        setSelectedSupplier(null);
        fetchUsers();
      } catch (error: any) {
        console.log('UPDATE ERROR RESPONSE ', error?.response?.data);
        showErrorToast(
          'Error',
          error?.response?.data?.message || 'Failed to update supplier',
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const tableData = filteredUsers.map(u => ({
    ...u,
    status: u.isActive ? 'Active' : 'Inactive',
    raw: u,
  }));

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'NAME',
      width: 150,
      isTitle: true,
      showDots: true,

      render: (value, row) => (
        <TouchableOpacity
          onPress={() => {
            setSelectedSupplier({
              id: row.id,
              name: row.name,
              phone: row.phone ?? '',
              email: row.email ?? '',
              address: row.address ?? '',
              businessUnitId: row.businessUnitId,
              isActive: row.isActive,
            });
            setOpenProfile(true);
          }}
        >
          <Text style={{ fontWeight: '600', color: Theme.colors.black }}>
            {value || 'N/A'}
          </Text>
        </TouchableOpacity>
      ),
    },

    { key: 'email', title: 'EMAIL', width: 200 },
    { key: 'phone', title: 'PHONE', width: 140 },
    { key: 'address', title: 'ADDRESS', width: 149 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_value, row) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => handleToggleStatus(row.id, row.isActive)}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {fromMenu ? (
        <BackArrow
          title="Suppliers"
          showBack={true}
          onAddNewPress={() => setShowAddModal(true)}
        />
      ) : (
        <Header
          title="Suppliers"
          onAddNewPress={() => setShowAddModal(prev => !prev)}
          showLogout={true}
        />
      )}
      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status === 'all' ? null : status}
        onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={fromMenu ? undefined : setSelectedBU}
        onReset={resetFilters}
        hideBUDropdown={fromMenu}
      />

      <View style={{ flex: 1 }}>
        {tableData.length > 0 ? (
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <DataCard columns={columns} data={tableData} itemsPerPage={10}
              renderRowMenu={(row, closeMenu) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPartyId(row.id);
                    setDeleteModalVisible(true);
                    setDeleteModalVisible(true);
                    closeMenu();
                  }}
                >
                  <Text style={{ color: 'red', fontWeight: '600', fontSize: 13, marginLeft: 12 }}>
                    Delete Supplier
                  </Text>
                </TouchableOpacity>
              )} />
          </ScrollView>
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
          title="Add Supplier"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSupplier}
          hideBusinessUnit={fromMenu}
        />

        <ConfirmationModal
          type="delete"
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleConfirmDelete}
          title="Are you sure you want to delete this supplier?"
        />
        {selectedSupplier && (
          <ProfileModal
            visible={openProfile}
            onClose={() => {
              setOpenProfile(false);
              setSelectedSupplier(null);
            }}
            type="supplier"
            data={selectedSupplier}
            onSave={handleUpdateSupplier}
          />
        )}
      </View>
      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

export default SupplierScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  dotsMenu: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  menuText: { fontSize: 15, fontWeight: '600', color: Theme.colors.success },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
});
