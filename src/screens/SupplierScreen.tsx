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

import TopBarCard from '../components/customCards/TopBarCard';
import Theme from '../theme/Theme';
import DataCard from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { getPartyBySearchAndFilter, addParty ,updatePartyIsActive,} from '../services/PartyService';

type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

const SupplierScreen = () => {
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = async (searchKey: string = '') => {
    try {
      setLoading(true);

      const payload = {
        searchKey: searchKey || null,
        isActive: null,
        pageNumber: 1,
        pageSize: 10,
        partyTypeId: 1,
      };

      const data = await getPartyBySearchAndFilter(payload);

      if (data?.list && Array.isArray(data.list)) {
        const mappedUsers = data.list.map((item: any) => ({
          id: item.partyId,
          name: item.name || 'No Name',
          email: item.email || '---',
          isActive: item.isActive ?? true,
        }));
        setUsers(mappedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      Alert.alert('Error', 'Failed to fetch suppliers');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        businessUnitId: '157cc479-dc81-4845-826c-5fb991bd3d47',
      };

      const response = await addParty(payload);

      if (response) {
        Alert.alert('Success', 'Supplier added successfully');
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (error: any) {
      console.error('ADD SUPPLIER ERROR:', error);
      const errMsg = error?.response?.data?.message || 'Failed to add supplier';
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
  

  const handleDeleteUser = (id: string) => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setUsers(prev => prev.filter(u => u.id !== id)),
        },
      ],
    );
  };

  const filteredUsers = users.filter(user => {
    if (status === 'active') return user.isActive === true;
    if (status === 'inactive') return user.isActive === false;
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ===== Top Bar ===== */}
      <TopBarCard
        onAddPress={() => setShowAddModal(true)}
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          fetchUsers(value); 
        }}
        status={status}
        onStatusChange={setStatus}
        onReset={() => setStatus('all')}
      />

      {/* ===== Scrollable Table ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => <DataCard isHeader />}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <DataCard
                name={item.name}
                email={item.email}
                phone="-----"
                address="713 GB"
                status={item.isActive ? 'Active' : 'Inactive'}
                onToggleStatus={() =>   handleToggleStatus(item.id, item.isActive)}
                onDelete={() => handleDeleteUser(item.id)}
              />
            )}
          />

          {/* ===== No Data Image ===== */}
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
                style={{ width: 300, height: 360, marginBottom:30, }}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ===== Add Supplier Modal ===== */}
      <AddModal
        visible={showAddModal}
        type="customer"
        title="Add Supplier"
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSupplier}
      />

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
