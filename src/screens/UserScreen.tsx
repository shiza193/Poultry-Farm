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
  resetPassword,
  getUserFarms,
  updateUserBusinessUnits,
} from '../services/UserScreen';

import AddModal from '../components/customPopups/AddModal';
import Theme from '../theme/Theme';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';
import { useBusinessUnit } from '../context/BusinessContext';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import StatusToggle from '../components/common/StatusToggle';
import BusinessUnitModal from '../components/customPopups/BusinessUnitModal';
import AssignFarmRoleModal from '../components/customPopups/AssignRolePopup';
type User = {
  id: string;
  image: string;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
  businessUnit?: string;
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
  const [showAssignFarmModal, setShowAssignFarmModal] = useState(false);
  const [farms, setFarms] = useState<{ id: number, name: string }[]>([]);
  const [rowModalVisible, setRowModalVisible] = useState(false);
  const [selectedRowUser, setSelectedRowUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
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
          businessUnit: u.businessUnit ?? '—',

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
  const tableData = filteredUsers.map(u => ({
    name: u.name,
    email: u.email,
    businessUnit: u.businessUnit,
    status: u.isActive,
    raw: u,
  }));
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
  const handleAssignPoultry = async (user: User) => {
    try {
      setSelectedRowUser(user);

      const farmList = await getUserFarms(user.id);
      setFarms(farmList.map((f: any) => ({
        id: f.id,
        name: f.name,
        isAdded: f.isAdded,
        userRoleId: f.userRoleId,
        userRole: f.userRole,
      })));

      setShowAssignFarmModal(true);
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to fetch farms");
    } finally {
    }
  };
  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedBU(null);
  };
  const columns: TableColumn[] = [
    {
      key: "name",
      title: "Name",
      width: 110,
      isTitle: true,
      showDots: true,
      onDotsPress: (row) => {
        setSelectedRowUser(row.raw);
        setRowModalVisible(true);
      },
    },
    {
      key: "email",
      title: "Email",
      width: 220,
    },
    {
      key: "businessUnit",
      title: "Farm",
      width: 160,
    },
    {
      key: "status",
      title: "Status",
      width: 120,
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
      {/* ===== ROW ACTION MODAL ===== */}
      {rowModalVisible && selectedRowUser && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 230,
            left: 40,
            right: 0,
            bottom: 0,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            zIndex: 1000,
          }}
          activeOpacity={1}
          onPress={() => setRowModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: Theme.colors.white,
              borderRadius: 8,
              padding: 5,
              minWidth: 140,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 10 }}
              onPress={() => {
                setDeleteModalVisible(true);
                setRowModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 16, color: "red", fontWeight: '500' }}>
                Delete
              </Text>
            </TouchableOpacity>
            {/* Separator */}
            <View style={{ height: 1, backgroundColor: Theme.colors.buttonPrimary, marginVertical: 2 }} />

            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 10 }}
              onPress={() => {
                setSelectedUserForReset(selectedRowUser);
                setShowResetModal(true);
                setRowModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 16, color: Theme.colors.textPrimary, fontWeight: '500' }}>
                Reset Password
              </Text>
            </TouchableOpacity>

            {/* Separator */}
            <View style={{ height: 1, backgroundColor: Theme.colors.buttonPrimary, marginVertical: 2 }} />

            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 10 }}
              onPress={() => {
                handleAssignPoultry(selectedRowUser!);
                setRowModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 16, color: Theme.colors.textPrimary, fontWeight: '500' }}>
                Assign to Poultry
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* ===== TOP BAR ===== */}
      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status === 'all' ? null : status}
        onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />

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
      <BusinessUnitModal
        visible={showResetModal}
        mode="reset"
        onClose={() => {
          setShowResetModal(false);
          setSelectedUserForReset(null);
        }}
        onResetPassword={async ({ newPassword, confirmPassword }) => {
          if (!selectedUserForReset) return;

          // Validate passwords match
          if (newPassword !== confirmPassword) {
            showErrorToast("Passwords do not match");
            return;
          }
          try {
            await resetPassword({
              userId: selectedUserForReset.id,
              newPassword: newPassword,
              conformPassword: confirmPassword,
            });

            showSuccessToast("Password reset successfully");
            setShowResetModal(false);
            setSelectedUserForReset(null);
          } catch (error) {
            console.error(error);
            showErrorToast("Failed to reset password");
          }
        }}
      />
      <AssignFarmRoleModal
        visible={showAssignFarmModal}
        farms={farms}
        getUserRoles={getUserRoles}
        onClose={() => setShowAssignFarmModal(false)}
        onSave={async (data) => {
          if (!selectedRowUser) return;

          try {
            const payload = Object.keys(data).map((farmId) => ({
              businessUnitId: farmId,
              userRoleId: data[farmId]?.roleId ?? null,
              isChecked: data[farmId]?.checked ?? false,
            }));

            await updateUserBusinessUnits(selectedRowUser.id, payload);

            showSuccessToast("Farms & roles updated successfully");
            setShowAssignFarmModal(false);
            fetchUsers();
          } catch (error) {
            console.error(error);
            showErrorToast("Failed to assign farms");
          }
        }}
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
    top: 50,
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
    color: Theme.colors.success,
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
