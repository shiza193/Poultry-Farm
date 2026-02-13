import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/common/LogoHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  deleteBusinessUnit,
  addBusinessUnit,
  getAllBusinessUnits,
  updateBusinessUnit,
} from '../services/BusinessUnit';
import { Logout } from '../navigation/NavigationService';
import { addEmployee } from '../services/EmployeeService';
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
import { formatDate } from '../utils/validation';
import { normalizeDataFormat } from '../utils/NormalizeDataFormat';

interface FarmData {
  businessUnitId?: string;
  title: string;
  location: string;
  users: number;
  employees: number;
}

type ModalType =
  | 'logout'
  | 'business'
  | 'delete'
  | 'addUser'
  | 'addEmployee'
  | null;

const DashboardScreen = () => {
  const { setBusinessUnitId, setFarmName, setFarmLocation } = useBusinessUnit(); //Context Values
  const navigation = useNavigation<any>();
  const [farmState, setFarmState] = useState<{
    businessUnitId: string | null;
    editingFarm: FarmData | null;
    selectedFarm: FarmData | null;
  }>({
    businessUnitId: null,
    editingFarm: null,
    selectedFarm: null,
  });
  //for Add User / Add Employee
  const [loading, setLoading] = useState(true); //for LoadingOverlay.
  const [activeModal, setActiveModal] = useState<ModalType>(null); //Drives all modals now (logout, delete, add/edit farm, add user/employee).
  const [roleItems, setRoleItems] = useState<{ label: string; id: string }[]>(
    [],
  ); //for Add User modal dropdown.

  const [farms, setFarms] = useState<FarmData[]>([]); // Main data source for FarmCard list.

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await getAllBusinessUnits();
      const normalizedData = normalizeDataFormat(response, 'array', 'Farms');

      const mappedFarms = normalizedData.map((item: any) => ({
        businessUnitId: item.businessUnitId,
        title: item.name,
        location: item.location,
        users: item.totalUser ?? 0,
        employees: item.totalEmployee ?? 0,
      }));

      setFarms(mappedFarms);
    } catch (error) {
      console.log('Failed to fetch farms', error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, []),
  );

  useEffect(() => {
    fetchUserRoles();
  }, []);
  //[] dependency array: sirf component mount hone par ye execute hoga.

  const fetchUserRoles = async () => {
    try {
      const rolesResponse = await getUserRoles();

      const roles = normalizeDataFormat(rolesResponse, 'array', 'Roles');

      setRoleItems(
        roles.map((r: any) => ({
          label: r.value,
          id: r.key?.toString() ?? '',
        })),
      );
    } catch (error) {
      console.log('Failed to load user roles', error);
      setRoleItems([]);
    }
  };

  const AddEmployeeFromDashboard = async (data: any) => {
    if (!farmState.businessUnitId) {
      showErrorToast('No business unit selected!');
      return;
    }

    try {
      const payload = {
        name: data.name,
        employeeTypeId: data.type,
        joiningDate: formatDate(data.joiningDate),
        salary: Number(data.salary),
        endDate: data.endDate ? formatDate(data.endDate) : null,
        businessUnitId: farmState.businessUnitId,
      };

      const res = await addEmployee(payload);

      normalizeDataFormat(res, 'object', 'Employee');

      setFarms(prev =>
        prev.map(farm =>
          farm.businessUnitId === farmState.businessUnitId
            ? { ...farm, employees: farm.employees + 1 }
            : farm,
        ),
      );

      showSuccessToast('Employee added successfully');
    } catch (error) {
      console.log('Failed to add employee', error);
    } finally {
      setActiveModal(null);
      setFarmState(prev => ({
        ...prev,
        businessUnitId: null,
      }));
    }
  };

  // ===== ADD / EDIT FARM =====
  const AddFarm = () => {
    setFarmState(prev => ({
      ...prev,
      editingFarm: null,
    }));
    setActiveModal('business');
  };

  const handleEditFarm = (farm: FarmData) => {
    setFarmState(prev => ({
      ...prev,
      editingFarm: farm,
    }));
    setActiveModal('business');
  };

  // ===== DELETE FARM =====
  const ConfirmDelete = async () => {
    if (!farmState.selectedFarm?.businessUnitId) return;

    try {
      const res = await deleteBusinessUnit(
        farmState.selectedFarm.businessUnitId,
      );

      normalizeDataFormat(res, 'object', 'Delete Farm');

      setFarms(prev =>
        prev.filter(
          f => f.businessUnitId !== farmState.selectedFarm?.businessUnitId,
        ),
      );

      showSuccessToast('Farm deleted successfully');
    } catch (error) {
      console.log('Delete failed', error);
    } finally {
      setFarmState(prev => ({
        ...prev,
        selectedFarm: null,
      }));
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

      let res;

      if (farmState.editingFarm?.businessUnitId) {
        res = await updateBusinessUnit(
          farmState.editingFarm.businessUnitId,
          payload,
        );
        showSuccessToast('Success', 'Farm updated successfully');
      } else {
        res = await addBusinessUnit(payload);
        showSuccessToast('Success', 'Farm added successfully');
      }

      const farmData = normalizeDataFormat(res?.data, 'object', 'Farm');

      setFarms(prev =>
        farmState.editingFarm
          ? prev.map(f =>
              f.businessUnitId === farmState.editingFarm?.businessUnitId
                ? {
                    businessUnitId: farmData.businessUnitId,
                    title: farmData.name,
                    location: farmData.location,
                    users: f.users,
                    employees: f.employees,
                  }
                : f,
            )
          : [
              ...prev,
              {
                businessUnitId: farmData.businessUnitId,
                title: farmData.name,
                location: farmData.location,
                users: 0,
                employees: 0,
              },
            ],
      );
    } catch (error) {
      console.log('Failed to save farm', error);
    } finally {
      setActiveModal(null);
      setFarmState({
        businessUnitId: null,
        editingFarm: null,
        selectedFarm: null,
      });
    }
  };

  const AddUser = async (data: {
    name: string;
    role: string;
    email: string;
    password: string;
  }) => {
    try {
      const roleObj = roleItems.find(r => r.id === data.role);
      if (!roleObj || !farmState.businessUnitId) return;

      const payload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        userRoleId: Number(roleObj.id),
        businessUnitId: farmState.businessUnitId,
      };

      const res = await addUser(payload);

      normalizeDataFormat(res, 'object', 'User');

      setFarms(prev =>
        prev.map(farm =>
          farm.businessUnitId === farmState.businessUnitId
            ? { ...farm, users: farm.users + 1 }
            : farm,
        ),
      );

      showSuccessToast('User added successfully');
    } catch (error) {
      console.log('Add user failed', error);
    } finally {
      setActiveModal(null);
      setFarmState(prev => ({
        ...prev,
        businessUnitId: null,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <Header title="Poultry Farms" showLogout={true} />
          {/* ADD FARM */}
          <TouchableOpacity style={styles.addNewFarmButton} onPress={AddFarm}>
            <View style={styles.addNewFarmContent}>
              <Image source={Theme.icons.add} style={styles.addNewFarmIcon} />
              <Text style={styles.addNewFarmTitle}>Add New Farm</Text>
            </View>
          </TouchableOpacity>

          {farms.length === 0 && !loading ? (
            <View style={styles.noDataContainer}>
              <Image source={Theme.icons.nodata} style={styles.noDataImage} />
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
                  navigation.navigate(CustomConstants.USER_SCREEN, {
                    businessUnitId: farm.businessUnitId,
                  })
                }
                onEmployeeCountPress={() =>
                  navigation.navigate(CustomConstants.EMPLOYEE_SCREEN, {
                    businessUnitId: farm.businessUnitId,
                  })
                }
                onAddUser={() => {
                  setFarmState(prev => ({
                    ...prev,
                    businessUnitId: farm.businessUnitId!,
                  }));
                  setActiveModal('addUser');
                }}
                onAddEmployee={() => {
                  setFarmState(prev => ({
                    ...prev,
                    businessUnitId: farm.businessUnitId!,
                  }));
                  setActiveModal('addEmployee');
                }}
                onDelete={() => {
                  setFarmState(prev => ({
                    ...prev,
                    selectedFarm: farm,
                  }));
                  setActiveModal('delete');
                }}
                onEdit={() => handleEditFarm(farm)}
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

        <ConfirmationModal
          visible={activeModal === 'logout' || activeModal === 'delete'}
          title={
            activeModal === 'logout'
              ? 'Are you sure you want to logout?'
              : 'Are you sure you want to delete this farm?'
          }
          onClose={() => setActiveModal(null)}
          onConfirm={activeModal === 'logout' ? Logout : ConfirmDelete}
        />

        <BusinessUnitModal
          visible={activeModal === 'business'}
          onClose={() => setActiveModal(null)}
          onSave={EditSaveBusinessUnit}
          mode={farmState.editingFarm ? 'edit' : 'add'}
          initialData={
            farmState.editingFarm
              ? {
                  name: farmState.editingFarm.title,
                  location: farmState.editingFarm.location,
                }
              : undefined
          }
        />
        <AddModal
          type={activeModal === 'addEmployee' ? 'employee' : 'user'}
          title={activeModal === 'addEmployee' ? 'Add Employee' : 'Add User'}
          roleItems={activeModal === 'addUser' ? roleItems : undefined}
          defaultBusinessUnitId={farmState.businessUnitId}
          visible={activeModal === 'addUser' || activeModal === 'addEmployee'}
          hidePoultryFarm={activeModal === 'addEmployee'}
          onClose={() => setActiveModal(null)}
          onSave={
            activeModal === 'addEmployee' ? AddEmployeeFromDashboard : AddUser
          }
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
    width: '70%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 10,
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
