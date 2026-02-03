import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
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
  updateUser,
} from '../services/UserScreen';

import AddModal from '../components/customPopups/AddModal';
import Theme from '../theme/Theme';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import StatusToggle from '../components/common/StatusToggle';
import BusinessUnitModal from '../components/customPopups/BusinessUnitModal';
import AssignFarmRoleModal from '../components/customPopups/AssignRolePopup';
import ProfileModal, {
  ProfileData,
} from '../components/customPopups/ProfileModal';
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
  const [farms, setFarms] = useState<{ id: number; name: string }[]>([]);
  const [rowModalVisible, setRowModalVisible] = useState(false);
  const [selectedRowUser, setSelectedRowUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(
    null,
  );

  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(
    null,
  );
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
          createdAt: u.createdAt,
        })),
      );
    } catch {
      showErrorToast('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [search, status, selectedBU])
  );

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
        prev.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
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
    } catch (error: any) { 
      const backendMessage = error?.response?.data?.message || error.message || 'Failed to delete user';
      showErrorToast(backendMessage);
    } finally {
      setDeleteModalVisible(false);
      setSelectedUserId(null);
    }
  }
  const handleAssignPoultry = async (user: User) => {
    try {
      setSelectedRowUser(user);

      const farmList = await getUserFarms(user.id);
      setFarms(
        farmList.map((f: any) => ({
          id: f.id,
          name: f.name,
          isAdded: f.isAdded,
          userRoleId: f.userRoleId,
          userRole: f.userRole,
        })),
      );

      setShowAssignFarmModal(true);
    } catch (error) {
      console.error(error);
      showErrorToast('Failed to fetch farms');
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
      key: 'name',
      title: 'NAME',
      width: 110,
      isTitle: true,

      showDots: true,
      onDotsPress: row => {
        setSelectedRowUser(row.raw);
        setRowModalVisible(true);
      },

      render: (value, row) => (
        <TouchableOpacity
          onPress={() => {
            setSelectedProfile({
              id: row.raw.id,
              name: row.raw.name,
              email: row.raw.email,
              isActive: row.raw.isActive,
              createdAt: row.raw.createdAt ?? '2026-01-20',
            });
            setProfileVisible(true);
          }}
        >
          <Text style={{ fontWeight: '700', color: Theme.colors.textPrimary }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      key: 'email',
      title: 'EMAIL',
      width: 220,
    },
    {
      key: 'businessUnit',
      title: 'FARM',
      width: 160,
    },
    {
      key: 'status',
      title: 'STATUS',
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
            renderRowMenu={(row, closeMenu) => (
              <View>
                {/* DELETE */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUserId(row.raw.id);
                    setDeleteModalVisible(true);
                    closeMenu();
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ color: 'red', fontWeight: '600' }}>
                    Delete
                  </Text>
                </TouchableOpacity>

                {/* RESET PASSWORD */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUserForReset(row.raw);
                    setShowResetModal(true);
                    closeMenu();
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ fontWeight: '500' }}>
                    Reset Password
                  </Text>
                </TouchableOpacity>

                {/* ASSIGN TO POULTRY */}
                <TouchableOpacity
                  onPress={() => {
                    handleAssignPoultry(row.raw);
                    closeMenu();
                  }}
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ fontWeight: '500' }}>
                    Assign to Poultry
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
            showErrorToast('Passwords do not match');
            return;
          }
          try {
            await resetPassword({
              userId: selectedUserForReset.id,
              newPassword: newPassword,
              conformPassword: confirmPassword,
            });

            showSuccessToast('Password reset successfully');
            setShowResetModal(false);
            setSelectedUserForReset(null);
          } catch (error) {
            console.error(error);
            showErrorToast('Failed to reset password');
          }
        }}
      />
      <AssignFarmRoleModal
        visible={showAssignFarmModal}
        farms={farms}
        getUserRoles={getUserRoles}
        onClose={() => setShowAssignFarmModal(false)}
        onSave={async data => {
          if (!selectedRowUser) return;

          try {
            const payload = Object.keys(data).map(farmId => ({
              businessUnitId: farmId,
              userRoleId: data[farmId]?.roleId ?? null,
              isChecked: data[farmId]?.checked ?? false,
            }));

            await updateUserBusinessUnits(selectedRowUser.id, payload);

            showSuccessToast('Farms & roles updated successfully');
            setShowAssignFarmModal(false);
            fetchUsers();
          } catch (error) {
            console.error(error);
            showErrorToast('Failed to assign farms');
          }
        }}
      />
      {profileVisible && selectedProfile && (
        <ProfileModal
          visible={profileVisible}
          type="user"
          data={selectedProfile}
          onClose={() => {
            setProfileVisible(false);
            setSelectedProfile(null);
          }}
          onSave={async updated => {
            try {
              const res = await updateUser({
                userId: updated.id,
                fullName: updated.name,
                email: updated.email, // backend required hai is liye bhej rahe
              });

              // UI update
              setUsers(prev =>
                prev.map(u =>
                  u.id === updated.id ? { ...u, name: updated.name } : u,
                ),
              );

              showSuccessToast(res?.message || 'Updated successfully');
            } catch {
              showErrorToast('Failed to update user');
            } finally {
              setProfileVisible(false);
              setSelectedProfile(null);
            }
          }}
        />
      )}

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

  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
});
