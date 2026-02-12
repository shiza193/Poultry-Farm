import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Header from '../components/common/LogoHeader';
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
  const route = useRoute<any>();
  const routeBusinessUnitId = route.params?.businessUnitId ?? null;
  const [users, setUsers] = useState<User[]>([]);
  const [roleItems, setRoleItems] = useState<
    { label: string; id: string }[]
  >([]);
  const [groupState, setGroupState] = useState({
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    selectedBU: routeBusinessUnitId as string | null,
    showAddModal: false,
    deleteModalVisible: false,
    selectedUserId: null as string | null,
    profileVisible: false,
    selectedProfile: null as ProfileData | null,
    selectedUserForReset: null as User | null,
    showAssignFarmModal: false,
    selectedRowUser: null as User | null,
  });
  const [farms, setFarms] = useState<{ id: number; name: string }[]>([]);
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
            id: r.key,
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
        searchKey: groupState.search || null,
        isActive:
          groupState.status === 'all'
            ? null
            : groupState.status === 'active',
        pageNumber: 1,
        pageSize,
      };

      if (groupState.selectedBU) payload.businessUnitId = groupState.selectedBU;
      const response = await getUsers(payload);
      // 🔹 Check if response exists
      if (!response) {
        showErrorToast("Failed to fetch users: No response from server");
        setUsers([]);
        return;
      }
      // 🔹 Check if response.list is an array
      if (!Array.isArray(response.list)) {
        showErrorToast(
          `Failed to fetch users: Unexpected API response structure. Please check backend.`
        );
        setUsers([]);
        return;
      }
      const list = response?.list || [];
      setUsers(list.map((u: any) =>
      ({
        id: u.userId,
        name: u.fullName,
        email: u.email, isActive: u.isActive,
        role: u.userRole || '', image: u.imageLink || '',
        businessUnitId: u.businessUnitId || '',
        businessUnit: u.businessUnit ?? '—',
        createdAt: u.createdAt,
      })),);
    } catch (error) {
      console.error("Fetch Users Error:", error);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [groupState.search, groupState.status, groupState.selectedBU])
  );

  // ================= FILTER =================
  const filteredUsers = users.filter(user => {
    // Destructure for cleaner code
    const { search, status, selectedBU } = groupState;
    // Status filter
    if (status === 'active' && !user.isActive) return false;
    if (status === 'inactive' && user.isActive) return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (
        !user.name.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q)
      )
        return false;
    }
    // Business Unit filter
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
  const AddUser = async (data: any) => {
    try {
      const roleObj = roleItems.find(r => r.id === data.role);
      if (!roleObj) return;

      const newUser = await addUser({
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.id),
      });
      showSuccessToast('User added successfully');
      setUsers(prev => [
        ...prev,
        {
          id: newUser.userId,
          name: data.name,
          email: data.email,
          isActive: true,
          role: roleObj.label,
          image: '',
          businessUnitId: '',
          businessUnit: '—',
        },
      ]);
    } catch (error) {

    } finally {
      setGroupState(prev => ({
        ...prev,
        showAddModal: false,
      }));
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
      // showErrorToast('Failed to update user status');
    }
  };

  const UserConfirmDelete = async () => {
    if (!groupState.selectedUserId) return;
    try {
      await deleteUser(groupState.selectedUserId);
      setUsers(prev =>
        prev.filter(u => u.id !== groupState.selectedUserId),
      );
      showSuccessToast('User deleted successfully');
    } catch (error) {
    } finally {
      setGroupState(prev => ({
        ...prev,
        deleteModalVisible: false,
        selectedUserId: null,
      }));
    }
  };
  // AssignPoultryToUser
  const AssignPoultryToUser = async (user: User) => {
    try {
      setGroupState(prev => ({ ...prev, selectedRowUser: user }));
      // fetch user farms from backend
      const farmList = await getUserFarms(user.id);
      const existingFarms = user.businessUnit
        ? user.businessUnit.split(', ').filter(Boolean)
        : [];

      setFarms(
        farmList.map((f: any) => ({
          id: f.id,
          name: f.name,
          isAdded: existingFarms.includes(f.name) ? true : f.isAdded,
          userRoleId: f.userRoleId,
        }))
      );
      setGroupState(prev => ({ ...prev, showAssignFarmModal: true }));
    } catch (error) {
      console.error(error);
      showErrorToast('Failed to fetch farms');
    }
  };
  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'NAME',
      width: 110,
      isTitle: true,

      showDots: true,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() => {
            setGroupState(prev => ({
              ...prev,
              selectedProfile: {
                id: row.raw.id,
                name: row.raw.name,
                email: row.raw.email,
                isActive: row.raw.isActive,
                createdAt: row.raw.createdAt ?? '2026-01-20',
              },
              profileVisible: true,
            }));
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
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <Header
        title="Users"
        onAddNewPress={() => {
          setGroupState(prev => ({
            ...prev,
            showAddModal: true,
          }));
        }}
        showLogout={true}
      />
      {/* ===== TOP BAR ===== */}
      <TopBarCard
        searchValue={groupState.search}
        onSearchChange={text =>
          setGroupState(prev => ({ ...prev, search: text }))
        }
        status={groupState.status === 'all' ? null : groupState.status}
        onStatusChange={s =>
          setGroupState(prev => ({ ...prev, status: s ?? 'all' }))
        }
        value={groupState.selectedBU}
        onBusinessUnitChange={bu =>
          setGroupState(prev => ({ ...prev, selectedBU: bu }))
        }
        onReset={() =>
          setGroupState(prev => ({
            ...prev,
            search: '',
            status: 'all',
            selectedBU: null,
          }))
        }
      />
      {tableData.length > 0 ? (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={10}
            renderRowMenu={(row, closeMenu) => (
              <View>
                {/* DELETE */}
                <TouchableOpacity
                  onPress={() => {
                    setGroupState(prev => ({
                      ...prev,
                      selectedUserId: row.raw.id,
                      deleteModalVisible: true,
                    }));
                    closeMenu();
                  }}
                  style={{ paddingVertical: 5, width: 100 }}
                >
                  <Text style={{ color: 'red', fontWeight: '600', marginLeft: 10 }}>
                    Delete
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuSeparator} />

                {/* RESET PASSWORD */}
                <TouchableOpacity
                  onPress={() => {
                    setGroupState(prev => ({
                      ...prev,
                      selectedUserForReset: row.raw,
                      showResetModal: true,
                    }));
                    closeMenu();
                  }}
                  style={{ paddingVertical: 10, width: 110 }}
                >
                  <Text style={{ fontWeight: '500', fontSize: 13, marginLeft: 8 }}>
                    Reset Password
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuSeparator} />

                {/* ASSIGN TO POULTRY */}
                <TouchableOpacity
                  onPress={() => {
                    AssignPoultryToUser(row.raw);
                    closeMenu();
                  }}
                  style={{ paddingVertical: 10, width: 110 }}
                >
                  <Text style={{ fontWeight: '500', fontSize: 13, marginLeft: 8 }}>
                    Assign to Poultry
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        )
      )}

      {/* ===== MODALS ===== */}
      <AddModal
        visible={groupState.showAddModal}
        type="user"
        title="Add User"
        roleItems={roleItems}
        onClose={() =>
          setGroupState(prev => ({ ...prev, showAddModal: false }))
        }
        onSave={AddUser}
      />
      <ConfirmationModal
        type="delete"
        visible={groupState.deleteModalVisible}
        onClose={() =>
          setGroupState(prev => ({
            ...prev,
            deleteModalVisible: false,
            selectedUserId: null,
          }))
        }
        onConfirm={UserConfirmDelete}
        title="Are you sure you want to delete this user?"
      />
      <BusinessUnitModal
        visible={!!groupState.selectedUserForReset}
        mode="reset"
        onClose={() =>
          setGroupState(prev => ({ ...prev, selectedUserForReset: null }))
        }
        onResetPassword={async ({ newPassword, confirmPassword }) => {
          if (!groupState.selectedUserForReset) return;

          if (newPassword !== confirmPassword) {
            showErrorToast('Passwords do not match');
            return;
          }
          try {
            await resetPassword({
              userId: groupState.selectedUserForReset.id,
              newPassword,
              conformPassword: confirmPassword,
            });

            showSuccessToast('Password reset successfully');
            setGroupState(prev => ({ ...prev, selectedUserForReset: null }));
          } catch (error) {
            console.error(error);
            showErrorToast('Failed to reset password');
          }
        }}
      />
      <AssignFarmRoleModal
        visible={groupState.showAssignFarmModal}
        farms={farms}
        roleItems={roleItems}
        getUserRoles={getUserRoles}
        onClose={() =>
          setGroupState(prev => ({ ...prev, showAssignFarmModal: false }))
        }
        // onSave in AssignFarmRoleModal
        onSave={async data => {
          if (!groupState.selectedRowUser) return;

          try {
            const payload = Object.keys(data).map(farmId => ({
              businessUnitId: farmId,
              userRoleId: data[farmId]?.roleId ?? null,
              isChecked: data[farmId]?.checked ?? false,
            }));

            await updateUserBusinessUnits(groupState.selectedRowUser.id, payload);
            showSuccessToast('Farms & roles updated successfully');

            // 🔹 Update local state
            setUsers(prev =>
              prev.map(u =>
                u.id === groupState.selectedRowUser!.id
                  ? {
                    ...u,
                    businessUnit: farms
                      .filter(f => data[f.id]?.checked)
                      .map(f => f.name)
                      .join(', ') || '—',
                  }
                  : u
              )
            );
            setGroupState(prev => ({
              ...prev,
              showAssignFarmModal: false,
            }));
          } catch (error) {
            console.error(error);
          }
        }}
      />
      {groupState.profileVisible && groupState.selectedProfile && (
        <ProfileModal
          visible={groupState.profileVisible}
          type="user"
          data={groupState.selectedProfile}
          onClose={() =>
            setGroupState(prev => ({
              ...prev,
              profileVisible: false,
              selectedProfile: null,
            }))
          }
          onSave={async updated => {
            try {
              await updateUser({
                userId: updated.id,
                fullName: updated.name,
                email: updated.email ?? '',
              });

              setUsers(prev =>
                prev.map(u => (u.id === updated.id ? { ...u, name: updated.name } : u)),
              );
              showSuccessToast('User Updated successfully');
            } catch {
            } finally {
              setGroupState(prev => ({
                ...prev,
                profileVisible: false,
                selectedProfile: null,
              }));
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
  menuSeparator: {
    height: 2,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
});
