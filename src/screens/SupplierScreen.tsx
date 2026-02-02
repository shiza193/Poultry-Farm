import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity, Text
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  deleteParty,
  getPartyBySearchAndFilter,
  addParty,
  updatePartyIsActive,
} from '../services/PartyService';
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
import Header from '../components/common/Header';
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
  const [dotsMenuVisible, setDotsMenuVisible] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const [open, setOpen] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  // All suppliers fetched from API
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    setSelectedBU(null);
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
      onDotsPress: (row) => {
        setSelectedPartyId(row.id);
        setDeleteModalVisible(true);
      },
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ===== HEADER ===== */}
      <Header
        title="Suppliers"
        onPressDots={() => setDotsMenuVisible(prev => !prev)}
      />

      {/* ===== DOTS MENU ===== */}
      {dotsMenuVisible && (
        <View style={styles.dotsMenu}>
          <TouchableOpacity
            onPress={() => {
              setShowAddModal(true);
              setDotsMenuVisible(false);
            }}
          >
            <Text style={styles.menuText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* ===== DOT MENU ===== */}
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
      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status === 'all' ? null : status}
        onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />
        <View style={{ flex: 1 }}>
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
      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={5}
          />
        </View>
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        )
      )}

      {/* ===== ADD MODAL ===== */}
      <AddModal
        visible={showAddModal}
        type="customer"
        title="Add Supplier"
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSupplier}
      />

      {/* ===== DELETE CONFIRMATION ===== */}
      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this supplier?"
      />

      {/* ===== PROFILE MODAL ===== */}
      {/* <ProfileModal visible={openProfile} onClose={() => setOpenProfile(false)} /> */}

      {/* ===== LOADING ===== */}
      <LoadingOverlay visible={loading} />
    </View>
    </View>
  );
};

export default SupplierScreen;

const styles = StyleSheet.create({
  container: { flex: 1,
    backgroundColor: Theme.colors.white,
    },

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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noDataImage: {
    width: 300,
    height: 360,
  },
});
