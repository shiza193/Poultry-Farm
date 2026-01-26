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

/* ===== TYPES ===== */
type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  isActive: boolean;
};

const CustomerScreen = () => {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchCustomers = async () => {
    console.log(' fetchCustomers CALLED');

    try {
      setLoading(true);

      const payload = {
        searchKey: search || null,
        isActive: null,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        partyTypeId: 0,
        businessUnitId: null,
      };

      console.log(' REQUEST PAYLOAD:', payload);

      const response = await getPartyBySearchAndFilter(payload);

      console.log(' RAW API RESPONSE:', response);
      console.log(' RESPONSE TYPE:', typeof response);

      if (!response) {
        console.log(' RESPONSE IS NULL OR UNDEFINED');
        setUsers([]);
        setTotalCount(0);
        return;
      }

      console.log(' RESPONSE KEYS:', Object.keys(response));

      if (Array.isArray(response.list)) {
        console.log(' LIST FOUND, LENGTH:', response.list.length);

        const formatted: User[] = response.list.map(
          (item: any, index: number) => {
            console.log(` ITEM ${index}:`, item);

            return {
              id: item.partyId,
              name: item.name,
              email: item.email,
              phone: item.phone,
              address: item.address,
              isActive: item.isActive,
            };
          },
        );

        setUsers(formatted);
        setTotalCount(response.totalCount ?? 0);
      } else {
        console.log(' response.list IS NOT ARRAY:', response.list);
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.log(' API ERROR FULL OBJECT:', error);

      if (error?.response) {
        console.log(' ERROR STATUS:', error.response.status);
        console.log('ERROR DATA:', error.response.data);
        console.log(' ERROR HEADERS:', error.response.headers);
      } else if (error?.request) {
        console.log(' NO RESPONSE RECEIVED:', error.request);
      } else {
        console.log(' GENERAL ERROR MESSAGE:', error.message);
      }

      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
      console.log('🏁 fetchCustomers FINISHED');
    }
  };

  /* ===== EFFECT ===== */
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

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
        businessUnitId: '157cc479-dc81-4845-826c-5fb991bd3d47',
      };

      console.log(' ADD PARTY PAYLOAD:', payload);

      const response = await addParty(payload);

      console.log(' ADD PARTY RESPONSE:', response);

      if (response) {
        Alert.alert('Success', 'Customer added successfully');

        setShowAddModal(false);
        setCurrentPage(1);
        fetchCustomers();
      }
    } catch (error: any) {
      console.error(' ADD CUSTOMER ERROR:', error);

      const errMsg = error?.response?.data?.message || 'Failed to add customer';

      Alert.alert('Error', errMsg);
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

      Alert.alert(
        'Success',
        `Customer status updated to ${!currentStatus ? 'Active' : 'Inactive'}`,
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };

  /* ===== PAGINATION ===== */
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleNext = () =>
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);

  const filteredUsers = users.filter(user => {
    if (status === 'active') return user.isActive === true;
    if (status === 'inactive') return user.isActive === false;
    return true;
  });

  /* ===== UI ===== */
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
        onStatusChange={setStatus}
        onReset={() => setStatus('all')}
      />

      {/* ===== TABLE ===== */}
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View>
          <FlatList
           data={filteredUsers}
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
                onDelete={() => {}}
              />
            )}
            scrollEnabled={false}
          />
          {/* ===== NO DATA IMAGE ===== */}
          {!loading && users.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
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
          onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          onFirst={() => setCurrentPage(1)}
          onLast={() => setCurrentPage(totalPages)}
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

      {/* ===== LOADING OVERLAY ===== */}
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
