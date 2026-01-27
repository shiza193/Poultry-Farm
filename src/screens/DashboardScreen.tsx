import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteBusinessUnit,
  addBusinessUnit,
  getAllBusinessUnits,
  updateBusinessUnit,
} from '../services/BusinessUnit';

import Theme from '../theme/Theme';
import FarmCard from '../components/customCards/FarmCard';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import BusinessUnitModal from '../components/customPopups/BusinessUnitModal';
import AddModal from '../components/customPopups/AddModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { CustomConstants } from '../constants/CustomConstants';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import { addUser, getUserRoles } from '../services/UserScreen';
import { useBusinessUnit } from '../context/BusinessContext';

interface FarmData {
  id: string;
  businessUnitId?: string;
  title: string;
  location: string;
  users: number;
  employees: number;
}

type User = {
  id: string;
  image: string;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
};

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { setBusinessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roleItems, setRoleItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [editingFarm, setEditingFarm] = useState<FarmData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [farms, setFarms] = useState<FarmData[]>([]);

  // ===== LOAD FARMS =====
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        const data = await getAllBusinessUnits();

        const mappedFarms = data.map((item: any) => ({
          id: item.businessUnitId,
          businessUnitId: item.businessUnitId,
          title: item.name,
          location: item.location,
          users: item.totalUser,
          employees: item.totalEmployee,
        }));

        setFarms(mappedFarms);
      } catch (error) {
        console.log('Failed to fetch farms', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  // ===== LOAD ROLES =====
  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const roles = await getUserRoles();
      setRoleItems(
        roles.map((r: any) => ({
          label: r.value,
          value: r.key.toString(),
        })),
      );
    } catch (error) {
      console.log('Failed to load user roles', error);
    }
  };

  // ===== ADD / EDIT FARM =====
  const handleAddFarm = () => {
    setEditingFarm(null);
    setShowBusinessModal(true);
  };

  const handleEditFarm = (farm: FarmData) => {
    setEditingFarm(farm);
    setShowBusinessModal(true);
  };

  // ===== DELETE FARM =====
  const handleConfirmDelete = async () => {
    if (!selectedFarm?.businessUnitId) return;

    try {
      await deleteBusinessUnit(selectedFarm.businessUnitId);
      setFarms(prev =>
        prev.filter(f => f.businessUnitId !== selectedFarm.businessUnitId),
      );
    } catch (error) {
      console.log('Delete failed', error);
    } finally {
      setSelectedFarm(null);
      setShowDeleteModal(false);
    }
  };

  const handleSaveBusinessUnit = async (data: {
    name: string;
    location: string;
    businessTypeId?: number;
  }) => {
    try {
      const payload = {
        name: data.name,
        location: data.location,
        businessTypeId: data.businessTypeId ?? 1,
      };

      if (editingFarm?.businessUnitId) {
        const res = await updateBusinessUnit(
          editingFarm.businessUnitId,
          payload,
        );

        setFarms(prev =>
          prev.map(f =>
            f.businessUnitId === editingFarm.businessUnitId
              ? {
                  ...f,
                  title: res.data?.name ?? f.title,
                  location: res.data?.location ?? f.location,
                }
              : f,
          ),
        );

        showSuccessToast('Success', 'Farm updated successfully');
      } else {
        const res = await addBusinessUnit(payload);

        setFarms(prev => [
          ...prev,
          {
            id: res.data?.businessUnitId,
            businessUnitId: res.data?.businessUnitId,
            title: res.data?.name,
            location: res.data?.location,
            users: 0,
            employees: 0,
          },
        ]);

        showSuccessToast('Success', 'Farm added successfully');
      }
    } catch (error: any) {
      showErrorToast(
        'Error',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setShowBusinessModal(false);
      setEditingFarm(null);
    }
  };

  const handleSaveUser = async (data: {
    name: string;
    role: string;
    email: string;
    password: string;
  }) => {
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
      setShowAddModal(false); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Theme.colors.screenBackground}
        barStyle="dark-content"
      />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.topHeader}>
            <Image source={Theme.icons.logo2} style={styles.logo} />
            <Text style={styles.topHeaderText}>Poultry Farms</Text>
            <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
              <Image source={Theme.icons.logout} style={styles.logoutIcon} />
            </TouchableOpacity>
          </View>

          {/* ADD FARM */}
          <TouchableOpacity
            style={styles.addNewFarmButton}
            onPress={handleAddFarm}
          >
            <Text style={styles.addNewFarmTitle}>+ Add New Farm</Text>
          </TouchableOpacity>

          {/* FARM CARDS */}
          {farms.map((farm, index) => (
            <FarmCard
              key={index}
              image={Theme.icons.farm}
              title={farm.title}
              location={farm.location}
              users={farm.users}
              employees={farm.employees}
              onUserCountPress={() =>
                navigation.navigate(CustomConstants.USER_SCREEN, {
                  businessUnitId: farm.businessUnitId,
                })
              }
              onEmployeeCountPress={() =>
                navigation.navigate(CustomConstants.EMPLOYEE_SCREEN, {
                  businessUnitId: farm.businessUnitId,
                })
              }
              onAddUser={() => setShowAddUserModal(true)}
              onAddEmployee={() => console.log('Add employee for', farm.title)}
              onEdit={() => handleEditFarm(farm)}
              onDelete={() => {
                setSelectedFarm(farm);
                setShowDeleteModal(true);
              }}
              onPressTitle={() => {
                if (farm.businessUnitId) {
                  setBusinessUnitId(farm.businessUnitId); 
                  navigation.navigate(CustomConstants.DASHBOARD_DETAIL_SCREEN);
                }
              }}
            />
          ))}
        </ScrollView>

        <ConfirmationModal
          type="delete"
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />

        <BusinessUnitModal
          visible={showBusinessModal}
          onClose={() => setShowBusinessModal(false)}
          onSave={handleSaveBusinessUnit}
          mode={editingFarm ? 'edit' : 'add'}
          initialData={
            editingFarm
              ? { name: editingFarm.title, location: editingFarm.location }
              : undefined
          }
        />

        <AddModal
          type="user"
          title="Add User"
          visible={showAddUserModal}
          roleItems={roleItems}
          onClose={() => setShowAddUserModal(false)}
          onSave={handleSaveUser}
        />

        <LoadingOverlay visible={loading} />
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  container: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  topHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  noDataImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  logoutIcon: { width: 28, height: 28 },
  addNewFarmButton: {
    backgroundColor: Theme.colors.lightGrey,
    borderWidth: 2,
    borderColor: Theme.colors.secondaryYellow,
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  addNewFarmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
});
