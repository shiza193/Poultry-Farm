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
import Header from '../components/common/LogoHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteBusinessUnit,
  addBusinessUnit,
  getAllBusinessUnits,
  updateBusinessUnit,
} from '../services/BusinessUnit';
import { addEmployee } from '../services/EmployeeService';
import Theme from '../theme/Theme';
import FarmCard from '../components/customCards/FarmCard';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import BusinessUnitModal from '../components/customPopups/BusinessUnitModal';
import AddModal from '../components/customPopups/AddModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { CustomConstants } from '../constants/CustomConstants';
import { showSuccessToast } from '../utils/AppToast';
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

type ModalType =
  | 'logout'
  | 'business'
  | 'delete'
  | 'addUser'
  | 'addEmployee'
  | null;

const DashboardScreen = () => {
  const { setBusinessUnitId, setFarmName, setFarmLocation } = useBusinessUnit();

  const navigation = useNavigation<any>();
  const [activeBusinessUnitId, setActiveBusinessUnitId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
  const [roleItems, setRoleItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [editingFarm, setEditingFarm] = useState<FarmData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [farms, setFarms] = useState<FarmData[]>([]);

  // ===== LOAD FARMS =====
  const fetchFarms = async () => {
    try {
      setLoading(true);
      const data = await getAllBusinessUnits();

      const mappedFarms = data.map((item: any) => mapBusinessUnitToFarm(item));

      setFarms(mappedFarms);
    } catch (error) {
      console.log('Failed to fetch farms', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, []),
  );
  // ===== LOAD ROLES =====
  useEffect(() => {
    fetchUserRoles();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();

      navigation.reset({
        index: 0,
        routes: [{ name: CustomConstants.LOGIN_SCREEN }],
      });
    } catch (error) {
      console.log('Logout failed', error);
    }
  };

  const mapBusinessUnitToFarm = (
    item: any,
    defaults?: { users?: number; employees?: number },
  ): FarmData => ({
    id: item.businessUnitId,
    businessUnitId: item.businessUnitId,
    title: item.name,
    location: item.location,
    users: defaults?.users ?? item.totalUser ?? 0,
    employees: defaults?.employees ?? item.totalEmployee ?? 0,
  });

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

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleAddEmployeeFromDashboard = async (data: any) => {
    if (!activeBusinessUnitId) {
      console.log('No business unit selected!');
      return; // stop if null
    }

    try {
      const payload = {
        name: data.name,
        employeeTypeId: data.type,
        joiningDate: formatDate(data.joiningDate),
        salary: Number(data.salary),
        endDate: data.endDate ? formatDate(data.endDate) : null,
        businessUnitId: activeBusinessUnitId,
      };

      await addEmployee(payload);
      showSuccessToast('Employee added successfully');
      await fetchFarms();
    } catch (error: any) {
      console.log('Failed to add employee', error);
    } finally {
      setActiveModal(null);
      setActiveBusinessUnitId(null);
    }
  };

  // ===== ADD / EDIT FARM =====
  const handleAddFarm = () => {
    setEditingFarm(null);
    setActiveModal('business');
  };

  const handleEditFarm = (farm: FarmData) => {
    setEditingFarm(farm);
    setActiveModal('business');
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
      setActiveModal(null);
    }
  };

  const EditSaveBusinessUnit = async (data: {
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
          mapBusinessUnitToFarm(res.data, { users: 0, employees: 0 }),
        ]);

        showSuccessToast('Success', 'Farm added successfully');
      }
    } catch (error: any) {
      // showErrorToast(
      //   'Error',
      //   error.response?.data?.message || 'Something went wrong',
      // );
    } finally {
      setActiveModal(null);
      setEditingFarm(null); // for business modal
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
      if (!roleObj) return;

      const payload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.value),
        businessUnitId: activeBusinessUnitId,
      };

      await addUser(payload);
      await fetchFarms();
      showSuccessToast('User added successfully');
    } finally {
      setActiveModal(null);
      setActiveBusinessUnitId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <Header
            title="Poultry Farms"
            onPressDots={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
          />

          {isDotsMenuVisible && (
            <View style={styles.dotsOverlayContainer}>
              <TouchableOpacity
                style={styles.dotsOverlay}
                activeOpacity={1}
                onPress={() => setIsDotsMenuVisible(false)}
              />

              {/* Actual menu */}
              <View style={styles.dotsMenu}>
                {/* ===== LOGOUT ITEM ===== */}
                <TouchableOpacity
                  style={styles.dotsMenuItem}
                  onPress={() => {
                    setIsDotsMenuVisible(false);
                    setActiveModal('logout');
                  }}
                >
                  <View style={styles.menuItemRow}>
                    <Image
                      source={Theme.icons.logout}
                      style={styles.menuItemIcon}
                    />
                    <Text style={styles.dotsMenuText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ADD FARM */}
          <TouchableOpacity
            style={styles.addNewFarmButton}
            onPress={handleAddFarm}
          >
            <View style={styles.addNewFarmContent}>
              <Image source={Theme.icons.add} style={styles.addNewFarmIcon} />
              <Text style={styles.addNewFarmTitle}>Add New Farm</Text>
            </View>
          </TouchableOpacity>

          {farms.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Image source={Theme.icons.nofarm} style={styles.noDataImage} />
            </View>
          ) : (
            farms.map((farm, index) => (
              <FarmCard
                key={index}
                image={Theme.icons.icon}
                title={farm.title}
                location={farm.location}
                users={farm.users}
                employees={farm.employees}
                onUserCountPress={() =>
                  navigation.navigate('User', {
                    businessUnitId: farm.businessUnitId,
                  })
                }
                onEmployeeCountPress={() =>
                  navigation.navigate('Employee', {
                    businessUnitId: farm.businessUnitId,
                  })
                }
                onAddUser={() => {
                  setActiveBusinessUnitId(farm.businessUnitId!);
                  setActiveModal('addUser');
                }}
                onAddEmployee={() => {
                  setActiveBusinessUnitId(farm.businessUnitId!);
                  setActiveModal('addEmployee');
                }}
                onEdit={() => handleEditFarm(farm)}
                onDelete={() => {
                  setSelectedFarm(farm);
                  setActiveModal('delete');
                }}
                onPressTitle={() => {
                  if (farm.businessUnitId) {
                    setBusinessUnitId(farm.businessUnitId);
                    setFarmName(farm.title);
                    setFarmLocation(farm.location || '');
                    navigation.navigate(
                      CustomConstants.DASHBOARD_DETAIL_SCREEN,
                    );
                  }
                }}
              />
            ))
          )}
        </ScrollView>
        <LoadingOverlay visible={loading} />

        <ConfirmationModal
          type="logout"
          visible={activeModal === 'logout'}
          title="Are you sure you want to logout?"
          onClose={() => setActiveModal(null)}
          onConfirm={handleLogout}
        />

        <ConfirmationModal
          type="delete"
          visible={activeModal === 'delete'}
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmDelete}
        />

        <BusinessUnitModal
          visible={activeModal === 'business'}
          onClose={() => setActiveModal(null)}
          onSave={EditSaveBusinessUnit}
          mode={editingFarm ? 'edit' : 'add'}
          initialData={
            editingFarm
              ? { name: editingFarm.title, location: editingFarm.location }
              : undefined
          }
        />

        <AddModal
          type="employee"
          title="Add Employee"
          visible={activeModal === 'addEmployee'}
          hidePoultryFarm={true}
          defaultBusinessUnitId={activeBusinessUnitId}
          onClose={() => setActiveModal(null)}
          onSave={handleAddEmployeeFromDashboard}
        />

        <AddModal
          type="user"
          title="Add User"
          visible={activeModal === 'addUser'}
          roleItems={roleItems}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveUser}
        />
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
    width: '120%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  dotsOverlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },

  dotsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },

  dotsMenu: {
    position: 'absolute',
    top: 60, // adjust according to your header height
    right: 13,
    width: 130,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },

  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },

  dotsMenuItem: {
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  dotsMenuText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },

  dotsIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  logoutIcon: { width: 28, height: 28 },
  addNewFarmButton: {
    backgroundColor: Theme.colors.dashboard,
    borderWidth: 2,
    borderColor: Theme.colors.secondaryYellow,
    borderStyle: 'dashed',
    alignSelf: 'center', // centers the button horizontally
    marginTop: 7,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 70, // less wide than full width
    elevation: 2,
  },

  addNewFarmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addNewFarmIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 6,
  },

  addNewFarmTitle: {
    fontSize: 20, // slightly bigger
    fontWeight: '800', // thicker text
    color: Theme.colors.secondaryYellow,
  },
});
