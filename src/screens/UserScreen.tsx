import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TopBarCard from '../components/customCards/TopBarCard';
import {
  addUser,
  getUserRoles,
  getUsers,
  changeUserStatus,
} from '../services/UserScreen';

import UserCard from '../components/customCards/UserCard';
import AddModal from '../components/customPopups/AddModal';
import Theme from '../theme/Theme';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';

type User = {
  id: string;
  image: string;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
};

const UserScreen = () => {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roleItems, setRoleItems] = useState<{ label: string; value: string }[]>([]);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 5;

  // Fetch user roles on mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getUserRoles();
        setRoleItems(
          roles.map((r: any) => ({
            label: r.value,
            value: r.key.toString(),
          })),
        );
      } catch (error) {
        showErrorToast('Failed to fetch roles'); // show toast for backend error
        console.log('Failed to fetch roles', error);
      }
    };

    fetchRoles();
  }, []);

  // Fetch users when search or pageNumber changes
  React.useEffect(() => {
    fetchUsers();
  }, [search, pageNumber]);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const payload = {
        searchKey: search || null,
        businessTypeId: null,
        isActive: null,
        pageNumber,
        pageSize,
      };

      const response = await getUsers(payload);
      const dataList = response.list || [];
      console.log('Fetched Users:', dataList);

      const mappedUsers: User[] = dataList.map((u: any) => ({
        id: u.userId,
        name: u.fullName,
        email: u.email,
        isActive: u.isActive,
        role: u.userRole || '',
        image: u.imageLink || '',
      }));

      setUsers(mappedUsers);
    } catch (error) {
      showErrorToast('Failed to fetch users');
      console.error('Fetch users failed', error);
    } finally {
      setLoading(false);
    }
  };

  // Open add user modal
  const handleAddUser = () => {
    setShowAddModal(true);
  };

  // Save new user
  const handleSaveUser = async (data: { name: string; role: string; email: string; password: string }) => {
    try {
      const roleObj = roleItems.find(r => r.value === data.role);
      if (!roleObj) {
        showErrorToast('Invalid role selected');
        return;
      }

      const payload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.value),
      };

      const res = await addUser(payload);

      if (res.error) {
        showErrorToast(res.error); 
        return;
      }

      const newUser: User = {
        id: res.data?.id || (users.length + 1).toString(),
        name: data.name,
        email: data.email,
        isActive: true,
        role: roleObj.label,
        image: res.data?.imageLink || '',
      };

      setUsers(prev => [...prev, newUser]);
      showSuccessToast(res.message || 'User added successfully'); 
    } catch (error) {
      showErrorToast('Failed to add user');
      console.error('Add user failed', error);
    } finally {
      setShowAddModal(false); // close modal
    }
  };

  // Toggle user active/inactive status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const payload = { userId: id, isActive: !currentStatus };
      const res = await changeUserStatus(payload);

      if (res.error) {
        showErrorToast(res.error); 
        return;
      }

      setUsers(prev =>
        prev.map(user => (user.id === id ? { ...user, isActive: !user.isActive } : user)),
      );

      showSuccessToast(res.message || `User status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      showErrorToast('Failed to update user status'); 
    }
  };

  // Delete user
  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showSuccessToast('User deleted successfully'); 
  };

  // Reset password (for simplicity, just show toast)
  const handleResetPassword = (name: string) => {
    showSuccessToast(`Reset password for ${name}`); 
  };

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (status === 'active') return user.isActive === true;
    if (status === 'inactive') return user.isActive === false;
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar with search, add, and status filter */}
      <TopBarCard
        onAddPress={handleAddUser}
        searchValue={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onReset={() => setStatus('all')}
      />

      {/* User list */}
      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPressName={() => showSuccessToast(item.name)} // toast instead of alert
              onToggleStatus={() => handleToggleStatus(item.id, item.isActive)}
              onPressDelete={() => handleDeleteUser(item.id)}
              onResetPassword={() => handleResetPassword(item.name)}
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

      {/* Add user modal */}
      <AddModal
        visible={showAddModal}
        type="user"
        title="Add User"
        roleItems={roleItems}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveUser}
      />

      {/* Loading overlay */}
      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  listContent: {
    paddingBottom: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 300,
    height: 360,
    marginBottom: 90,
  },
});
