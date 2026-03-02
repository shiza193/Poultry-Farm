import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
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
import { normalizeDataFormat } from '../utils/NormalizeDataFormat';

type Customer = {
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

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    businessUnit: farmBU || null,
  });

  const [modals, setModals] = React.useState({
    showAdd: false,
    profileCustomer: null as ProfileData | null,
    deleteCustomerId: null as string | null,
    deleteVisible: false,
  });

  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async (page: number = 1) => {
    try {
      setLoading(true);

      const payload = {
        searchKey: filters.search || null,
        isActive: filters.status === 'all' ? null : filters.status === 'active',
        pageNumber: page,
        pageSize,
        partyTypeId: 0,
        businessUnitId: filters.businessUnit || null,
      };

      const response = await getPartyBySearchAndFilter(payload);

      // Normalize the list to an array
      const customerList = normalizeDataFormat(
        response?.list,
        'array',
        'Customers',
      );

      const formatted: Customer[] = customerList.map((item: any) => {
        const existing = customers.find(c => c.id === item.partyId);
        return {
          ...formatCustomer(item),
          isActive: existing?.isActive ?? item.isActive,
        };
      });

      setCustomers(formatted);
      setTotalRecords(response?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchCustomers(1);
    }, [filters.businessUnit]),
  );

  const formatCustomer = (item: any): Customer => ({
    id: item.partyId,
    name: item.name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    isActive: item.isActive,
    businessUnitId: item.businessUnitId || null,
    businessUnit: item.businessUnit?.trim() || '—',
  });

  // ================= OPEN PROFILE =================
  const OpenProfile = (customer: Customer) => {
    setModals(prev => ({
      ...prev,
      profileCustomer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
        businessUnitId: customer.businessUnitId ?? null,
        isActive: customer.isActive,
      },
    }));
  };

  // ================= ADD CUSTOMER =================
  const AddCustomer = async (formData: {
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
      console.log('Sending BU ID:', filters.businessUnit, contextBU);
      const response = await addParty(payload);
      const customerData = normalizeDataFormat(response, 'object', 'Customer');

      if (!response) return;

      setCurrentPage(1);
      fetchCustomers(1);
      showSuccessToast('Success', 'Customer added successfully');
      setModals(prev => ({ ...prev, showAdd: false }));
    } catch (error) {
      console.log('Add customer failed', error);
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE STATUS =================
  const ToggleStatus = async (customer: Customer) => {
    const newStatus = !customer.isActive;

    // Optimistic UI update
    setCustomers(prev =>
      prev.map(c => (c.id === customer.id ? { ...c, isActive: newStatus } : c)),
    );

    try {
      const response = await updatePartyIsActive(customer.id, newStatus);

      if (response?.status !== 'Success') {
        setCustomers(prev =>
          prev.map(c =>
            c.id === customer.id ? { ...c, isActive: customer.isActive } : c,
          ),
        );
        showErrorToast('Error', response?.message || 'Failed to update status');
      } else {
        showSuccessToast(
          'Success',
          `Customer status updated to ${newStatus ? 'Active' : 'Inactive'}`,
        );
      }
    } catch (error) {
      // revert on error
      setCustomers(prev =>
        prev.map(c =>
          c.id === customer.id ? { ...c, isActive: customer.isActive } : c,
        ),
      );
      console.error('ToggleStatus error:', error);
      showErrorToast('Error', 'Failed to update status');
    }
  };
  // ================= DELETE CUSTOMER =================
  const DeletePress = (customerId: string) => {
    setModals(prev => ({
      ...prev,
      deleteCustomerId: customerId,
      deleteVisible: true,
    }));
  };

  const ConfirmDelete = async () => {
    if (!modals.deleteCustomerId) return;

    try {
      const res = await deleteParty(modals.deleteCustomerId);

      setTotalRecords(prev => prev - 1);

      setCurrentPage(prev =>
        Math.min(prev, Math.ceil((totalRecords - 1) / pageSize)),
      );

      fetchCustomers(currentPage);

      showSuccessToast(
        'Success',
        res.message || 'Customer deleted successfully',
      );
    } finally {
      setModals(prev => ({
        ...prev,
        deleteVisible: false,
        deleteCustomerId: null,
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

  // ================= FILTERED CUSTOMERS =================
  const filteredCustomers = customers.filter(customer => {
    const { search, status, businessUnit } = filters;

    if (status === 'active' && !customer.isActive) return false;
    if (status === 'inactive' && customer.isActive) return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !customer.name.toLowerCase().includes(q) &&
        !customer.email?.toLowerCase().includes(q)
      )
        return false;
    }

    if (businessUnit && customer.businessUnitId !== businessUnit) return false;

    return true;
  });

  const tableData = filteredCustomers.map(c => ({
    name: c.name,
    email: c.email ?? '—',
    phone: c.phone ?? '—',
    address: c.address ?? '—',
    status: !!c.isActive,
    raw: c,
  }));

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'NAME',
      width: 110,
      isTitle: true,
      showDots: true,
      render: (value, row) => (
        <TouchableOpacity onPress={() => OpenProfile(row.raw)}>
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
        <StatusToggle isActive={value} onToggle={() => ToggleStatus(row.raw)} />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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

      {/* Profile Modal */}
      {modals.profileCustomer && (
        <ProfileModal
          visible={true}
          onClose={() =>
            setModals(prev => ({ ...prev, profileCustomer: null }))
          }
          data={modals.profileCustomer}
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
                setModals(prev => ({
                  ...prev,
                  profileCustomer: null,
                }));
                fetchCustomers();
              }
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
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <DataCard
              columns={columns}
              data={tableData}
              itemsPerPage={pageSize}
                loading={loading}

              currentPage={currentPage}
              totalRecords={totalRecords}
              onPageChange={page => {
                setCurrentPage(page);
                fetchCustomers(page);
              }}
              renderRowMenu={(row, closeMenu) => (
                <TouchableOpacity
                  onPress={() => {
                    DeletePress(row.raw.id);
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
          </ScrollView>
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
        onSave={AddCustomer}
        hideBusinessUnit={fromMenu}
      />

      <ConfirmationModal
        type="delete"
        visible={modals.deleteVisible}
        onClose={() =>
          setModals(prev => ({
            ...prev,
            deleteVisible: false,
            deleteCustomerId: null,
          }))
        }
        onConfirm={ConfirmDelete}
        title="Are you sure you want to delete this customer?"
      />

    </SafeAreaView>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
