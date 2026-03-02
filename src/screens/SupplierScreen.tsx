import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    businessUnit: fromMenu ? farmBU : null as string | null,
  });
  const [modalState, setModalState] = useState({
    addModal: false,
    deleteModal: false,
    profileModal: false,
    selectedPartyId: null as string | null,
    selectedSupplier: null as User | null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  // All suppliers fetched from API
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH SUPPLIERS =================
  const fetchSuppliers = async (page: number = 1) => {
    try {
      setLoading(true);
      const payload: any = {
        searchKey: filters.search || null,
        isActive: filters.status === 'all' ? null : filters.status === 'active',
        pageNumber: page,
        pageSize,
        partyTypeId: 1,
        businessUnitId: filters.businessUnit || null,
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
        setSuppliers(mappedUsers);
        setFilteredUsers(mappedUsers);
        setTotalRecords(data.totalCount || 0);
      } else {
        setSuppliers([]);
        setFilteredUsers([]);
        setTotalRecords(0);
      }
    } catch (error) {
      showErrorToast('Error', 'Failed to fetch suppliers');
      setSuppliers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchSuppliers(1);
    }, [filters.businessUnit]),
  );

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let updated = [...suppliers];

    if (filters.businessUnit)
      updated = updated.filter(u => u.businessUnitId === filters.businessUnit);

    if (filters.status !== 'all')
      updated = updated.filter(u =>
        filters.status === 'active' ? u.isActive : !u.isActive,
      );
    if (filters.search)
      updated = updated.filter(u =>
        u.name.toLowerCase().includes(filters.search.toLowerCase()),
      );

    setFilteredUsers(updated);
  }, [filters, suppliers]);
  // ================= ADD SUPPLIER =================
  const handleAddSupplier = async (formData: any) => {
    try {
      const finalBU =
        filters.businessUnit && filters.businessUnit !== ''
          ? filters.businessUnit
          : businessUnitId && businessUnitId !== ''
            ? businessUnitId
            : null;

      if (!finalBU) {
        showErrorToast("Error", "Please select Business Unit");
        return;
      }
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        partyTypeId: 1,
        businessUnitId: finalBU,
      };

      // Call API to add supplier
      const newSupplier = await addParty(payload);
      // Map API response to User type
      if (newSupplier && newSupplier.partyId) {
        const addedSupplier: User = {
          id: newSupplier.partyId,
          name: newSupplier.name || payload.name,
          email: newSupplier.email ?? payload.email,
          phone: newSupplier.phone ?? payload.phone,
          address: newSupplier.address ?? payload.address ?? '',
          isActive: newSupplier.isActive ?? true,
          businessUnitId: newSupplier.businessUnitId ?? finalBU,
        };
        setSuppliers(prev => [addedSupplier, ...prev]);
        setTotalRecords(prev => prev + 1);
        setCurrentPage(1);
        showSuccessToast("Success", "Supplier added successfully");
        setModalState(prev => ({ ...prev, addModal: false }));
      }
    } catch (error: any) {
      console.error('Add supplier error:', error);
      showErrorToast("Error", "Failed to add supplier");
    }
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await updatePartyIsActive(userId, !currentStatus);

      setSuppliers(prev =>
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
    setFilters({
      search: '',
      status: 'all',
      businessUnit: fromMenu ? farmBU : null,
    });
  };
  const handleConfirmDelete = async () => {
    if (!modalState.selectedPartyId) return;
    try {
      await deleteParty(modalState.selectedPartyId);
      setSuppliers(prev => {
        const updatedSuppliers = prev.filter(
          e => e.id !== modalState.selectedPartyId
        );
        setFilteredUsers(
          updatedSuppliers.filter(u =>
            (!filters.businessUnit || u.businessUnitId === filters.businessUnit) &&
            (filters.status === 'all' || (filters.status === 'active' ? u.isActive : !u.isActive)) &&
            (!filters.search || u.name.toLowerCase().includes(filters.search.toLowerCase()))
          )
        );
        return updatedSuppliers;
      });
      const newTotal = totalRecords - 1;
      setTotalRecords(newTotal);
      const maxPage = Math.ceil(newTotal / pageSize) || 1;
      setCurrentPage(prev => Math.min(prev, maxPage));
      showSuccessToast('Supplier deleted successfully');
    } catch {
      showErrorToast('Failed to delete supplier');
    } finally {
      setModalState(prev => ({
        ...prev,
        deleteModal: false,
        selectedPartyId: null,
      }));
    }
  };

  const handleUpdateSupplier = (updatedData: ProfileData) => {
    if (!modalState.selectedSupplier) return;
    (async () => {
      try {
        setLoading(true);
        if (!modalState.selectedSupplier) return;
        const payload = {
          name: updatedData.name.trim(),
          email: updatedData.email?.trim() || null,
          phone: updatedData.phone?.trim() || null,
          address: updatedData.address?.trim() || '',
          partyTypeId: 1,
          businessUnitId: modalState.selectedSupplier.businessUnitId,
        };
        console.log('UPDATE PAYLOAD ', payload);
        const response = await updateParty(modalState.selectedSupplier.id, payload);

        if (response && response.partyId) {
          setSuppliers(prev =>
            prev.map(s =>
              s.id === modalState.selectedSupplier!.id
                ? {
                  ...s,
                  name: payload.name,
                  email: payload.email,
                  phone: payload.phone,
                  address: payload.address,
                }
                : s,
            ),
          );
          showSuccessToast('Success', 'Supplier updated successfully');
          setModalState(prev => ({
            ...prev,
            profileModal: false,
            selectedSupplier: null,
          }));
        }
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
            setModalState(prev => ({
              ...prev,
              selectedSupplier: {
                id: row.id,
                name: row.name,
                phone: row.phone ?? '',
                email: row.email ?? '',
                address: row.address ?? '',
                businessUnitId: row.businessUnitId,
                isActive: row.isActive,
              },
              profileModal: true,
            }));
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
          onAddNewPress={() =>
            setModalState(prev => ({ ...prev, addModal: true }))
          }
        />
      ) : (
        <Header
          title="Suppliers"
          onAddNewPress={() =>
            setModalState(prev => ({ ...prev, addModal: true }))
          } showLogout={true}
        />
      )}
      <TopBarCard
        searchValue={filters.search}
        onSearchChange={value =>
          setFilters(prev => ({ ...prev, search: value }))
        }
        status={filters.status === 'all' ? null : filters.status}
        onStatusChange={s =>
          setFilters(prev => ({ ...prev, status: s ?? 'all' }))
        }
        value={filters.businessUnit}
        onBusinessUnitChange={
          fromMenu
            ? undefined
            : bu => setFilters(prev => ({ ...prev, businessUnit: bu }))
        }
        onReset={resetFilters}
        hideBUDropdown={fromMenu}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={pageSize}
            currentPage={currentPage}
              loading={loading}
            totalRecords={totalRecords}
            onPageChange={page => {
              setCurrentPage(page);
              fetchSuppliers(page);
            }} renderRowMenu={(row, closeMenu) => (
              <TouchableOpacity
                onPress={() => {
                  setModalState(prev => ({
                    ...prev,
                    deleteModal: true,
                    selectedPartyId: row.id,
                  }));
                  closeMenu();
                }}
              >
                <Text style={{ color: 'red', fontWeight: '600', fontSize: 13, marginLeft: 12 }}>
                  Delete Supplier
                </Text>
              </TouchableOpacity>
            )} />
        </ScrollView>

        <AddModal
          visible={modalState.addModal}
          type="customer"
          title="Add Supplier"
          onClose={() =>
            setModalState(prev => ({
              ...prev,
              addModal: false,
            }))
          }
          onSave={handleAddSupplier}
          hideBusinessUnit={fromMenu}
        />

        <ConfirmationModal
          type="delete"
          visible={modalState.deleteModal}
          onClose={() =>
            setModalState(prev => ({
              ...prev,
              deleteModal: false,
            }))
          }
          onConfirm={handleConfirmDelete}
          title="Are you sure you want to delete this supplier?"
        />
        {modalState.selectedSupplier && (
          <ProfileModal
            visible={modalState.profileModal}
            onClose={() =>
              setModalState(prev => ({
                ...prev,
                profileModal: false,
                selectedSupplier: null,
              }))
            }
            type="supplier"
            data={modalState.selectedSupplier}
            onSave={handleUpdateSupplier}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SupplierScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
});
