import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import Header from '../components/common/Header';
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
  const [selectedBU, setSelectedBU] = useState<string | null>(
    routeBusinessUnitId,
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  // ================= FETCH ROLES =================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getUserRoles();
        setRoleItems(
          roles.map((r: any) => ({
            label: r.value,
            value: r.key.toString(),
          })),
        );
      } catch {
        showErrorToast('Failed to fetch roles');
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
        isActive: status === 'all' ? null : status === 'active',
        pageNumber: 1,
        pageSize,
      };

      if (selectedBU) payload.businessUnitId = selectedBU;

      const response = await getUsers(payload);
      const list = response?.list || [];

      setUsers(
        list.map((u: any) => ({
          id: u.userId,
          name: u.fullName,
          email: u.email,
          isActive: u.isActive,
          role: u.userRole || '',
          image: u.imageLink || '',
          businessUnitId: u.businessUnitId || '',
        })),
      );
    } catch {
      showErrorToast('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, status, selectedBU]);

  // ================= FILTER =================
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
  const handleSaveUser = async (data: any) => {
    try {
      const roleObj = roleItems.find(r => r.value === data.role);
      if (!roleObj) return;

      await addUser({
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.value),
      });

      await fetchUsers();
      showSuccessToast('User added successfully');
    } catch {
      showErrorToast('Failed to add user');
    } finally {
      setShowAddModal(false);
      setShowDotsMenu(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await changeUserStatus({
        userId: user.id,
        isActive: !user.isActive,
      });

      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u,
        ),
      );

      showSuccessToast(
        `User ${!user.isActive ? 'Activated' : 'Deactivated'} successfully`,
      );
    } catch {
      showErrorToast('Failed to update user status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      await deleteUser(selectedUserId);
      setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      showSuccessToast('User deleted successfully');
    } catch {
      showErrorToast('Failed to delete user');
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

  // ================= UI =================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ===== HEADER ===== */}
      <Header
        title="Users"
        onPressDots={() => setShowDotsMenu(prev => !prev)}
      />

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

      {/* ===== TOP BAR ===== */}
      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />

      {/* ===== LIST ===== */}
      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onToggleStatus={() => handleToggleStatus(item)}
              onPressDelete={() => {
                setSelectedUserId(item.id);
                setDeleteModalVisible(true);
              }}
            />
          )}
        />
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        )
      )}

      {/* ===== MODALS ===== */}
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
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },

  dotsMenu: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 6,
    zIndex: 999,
  },

  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },

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
