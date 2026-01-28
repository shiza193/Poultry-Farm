import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import TopBarCard from '../components/customCards/TopBarCard';
import {
  addUser,
  getUserRoles,
  getUsers,
  changeUserStatus,
  deleteUser,
} from '../services/UserScreen';

import UserCard from '../components/customCards/UserCard';
import AddModal from '../components/customPopups/AddModal';
import Theme from '../theme/Theme';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';
import { useBusinessUnit } from '../context/BusinessContext';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';

type User = {
  id: string;
  image: string;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
  businessUnitId: string;
};

const UserScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { businessUnitId: contextBU } = useBusinessUnit();

  const routeBusinessUnitId = route.params?.businessUnitId ?? null;

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roleItems, setRoleItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  // Kis business unit ke users dikhane hain  for filter 
  const [selectedBU, setSelectedBU] = useState<string | null>(
    routeBusinessUnitId || null,
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  // ================= FETCH ROLES =================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getUserRoles();
        setRoleItems(
          roles.map((r: any) => ({ label: r.value, value: r.key.toString() })),
        );
      } catch (error) {
        showErrorToast('Failed to fetch roles');
        console.log('Failed to fetch roles', error);
      }
    };
    fetchRoles();
  }, []);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const payload: any = {
        searchKey: search || null,
        businessTypeId: null,
        isActive: null,
        pageNumber: 1,
        pageSize,
      };
      if (selectedBU) payload.businessUnitId = selectedBU;

      const response = await getUsers(payload);
      const dataList = response.list || [];

      const mappedUsers: User[] = dataList.map((u: any) => ({
        id: u.userId,
        name: u.fullName,
        email: u.email,
        isActive: u.isActive,
        role: u.userRole || '',
        image: u.imageLink || '',
        businessUnitId: u.businessUnitId || '',
      }));

      setUsers(mappedUsers);
    } catch (error) {
      showErrorToast('Failed to fetch users');
      console.error('Fetch users failed', error);
    } finally {
      setLoading(false);
    }
  };
// users dobara fetch ho jate hain (like jb serach ya status.. vagra change ho to ....)
  useEffect(() => {
    fetchUsers();
  }, [search, status, selectedBU]);

  // ================= FILTER USERS =================
  const filteredUsers = users.filter(user => {
    if (status === 'active' && !user.isActive) return false;
    if (status === 'inactive' && user.isActive) return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !user.name.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q)
      )
        return false;
    }

    if (selectedBU && user.businessUnitId !== selectedBU) return false;

    return true;
  });

  // ================= HANDLERS =================
  const handleAddUser = () => setShowAddModal(true);

  const handleSaveUser = async (data: {
    name: string;
    role: string;
    email: string;
    password: string;
  }) => {
    try {
      const roleObj = roleItems.find(r => r.value === data.role);
      if (!roleObj) return showErrorToast('Invalid role selected');

      const payload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.value),
        businessUnitId: contextBU,
      };

      const res = await addUser(payload);
      if (res.error) return showErrorToast(res.error);

      //   ider ya is vaja sa add kia ha like jb user add ho to
      //  full screen refresh ho jy or card per image set ho jy api vali

      await fetchUsers();

      showSuccessToast(res.message || 'User added successfully');
    } catch (error) {
      showErrorToast('Failed to add user');
      console.error('Add user failed', error);
    } finally {
      setShowAddModal(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await changeUserStatus({
        userId: id,
        isActive: !currentStatus,
      });
      if (res.error) return showErrorToast(res.error);

      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, isActive: !currentStatus } : u)),
      );
      showSuccessToast(
        res.message ||
          `User status updated to ${!currentStatus ? 'Active' : 'Inactive'}`,
      );
    } catch (error) {
      showErrorToast('Failed to update user status');
    }
  };

  const handleDeletePress = (id: string) => {
    setSelectedUserId(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      const res = await deleteUser(selectedUserId);
      if (res.error || res.success === false) {
        const msg = res.error || res.message || 'Failed to delete user';
        return showErrorToast(msg);
      }

      setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      showSuccessToast(res.message || 'User deleted successfully');
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete user';
      showErrorToast(msg);
      console.error('Delete user failed', error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedUserId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedBU(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBarCard
        onAddPress={handleAddUser}
        searchValue={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />

      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPressName={() => showSuccessToast(item.name)}
              onToggleStatus={() => handleToggleStatus(item.id, item.isActive)}
              onPressDelete={() => handleDeletePress(item.id)}
              onResetPassword={() =>
                showSuccessToast(`Reset password for ${item.name}`)
              }
            />
          )}
        />
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image
              source={Theme.icons.nodata}
              style={styles.noDataImage}
              resizeMode="contain"
            />
          </View>
        )
      )}

      <AddModal
        visible={showAddModal}
        type="user"
        title="Add User"
        roleItems={roleItems}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveUser}
      />
      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this user?"
      />

      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  listContent: { paddingBottom: 20 },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataImage: { width: 300, height: 360, marginBottom: 90 },
});
