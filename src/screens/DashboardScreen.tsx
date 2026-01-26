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

interface FarmData {
  id: string;
  businessUnitId?: string;
  title: string;
  location: string;
  users: number;
  employees: number;
}

const DashboardScreen = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [editingFarm, setEditingFarm] = useState<FarmData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [farms, setFarms] = useState<FarmData[]>([]);

  // ===== LOAD ALL FARMS ON SCREEN OPEN =====
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true); // Show loading overlay
        const data = await getAllBusinessUnits();

        const mappedFarms = data.map((item: any) => ({
          id: item.businessUnitId,
          businessUnitId: item.businessUnitId,
          title: item.name,
          location: item.location,
           users: item.totalUser,      
  employees: item.totalEmployee
        }));

        setFarms(mappedFarms);
        console.log(' Loaded farms:', mappedFarms);
      } catch (error) {
        console.log(' Failed to fetch farms', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  // ===== LOGOUT =====
  const handleLogoutPress = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    console.log('User logged out');
  };

  // ===== ADD NEW FARM =====
  const handleAddFarm = () => {
    setEditingFarm(null);
    setShowBusinessModal(true);
  };

  // ===== EDIT FARM =====
  const handleEditFarm = (farm: FarmData) => {
    setEditingFarm(farm);
    setShowBusinessModal(true);
  };

  // ===== DELETE FARM =====
  const handleConfirmDelete = async () => {
    if (!selectedFarm?.businessUnitId) return;

    try {
      console.log(' Deleting BusinessUnit ID:', selectedFarm.businessUnitId);
      await deleteBusinessUnit(selectedFarm.businessUnitId);

      setFarms(prev =>
        prev.filter(f => f.businessUnitId !== selectedFarm.businessUnitId),
      );

      console.log(' Deleted:', selectedFarm.title);
    } catch (error) {
      console.log(' Delete failed on screen level', error);
    } finally {
      setSelectedFarm(null);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setSelectedFarm(null);
    setShowDeleteModal(false);
  };

  const handleAddUser = (data: {
    name: string;
    role: string;
    email: string;
    password: string;
  }) => {
    console.log('New User:', data);
  };

  const handleCloseBusinessModal = () => setShowBusinessModal(false);

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

    if (editingFarm && editingFarm.businessUnitId) {
      // EDIT MODE
      const res = await updateBusinessUnit(editingFarm.businessUnitId, payload);

      // Update farm in state
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

      // ✅ Always show toast: use backend message if exists, else fallback
      showSuccessToast(
        "Success",
        res.data?.message || `${payload.name} updated successfully!`
      );
    } else {
      // ADD MODE
      const res = await addBusinessUnit(payload);
      const businessUnitId = res.data?.businessUnitId;

      // Add new farm to state
      setFarms(prev => [
        ...prev,
        {
          id: businessUnitId,
          businessUnitId: businessUnitId,
          title: res.data?.name ?? payload.name,
          location: res.data?.location ?? payload.location,
          users: 0,
          employees: 0,
        },
      ]);

      // ✅ Always show toast
      showSuccessToast(
        "Success",
        res.data?.message || `${payload.name} added successfully!`
      );
    }
  } catch (error: any) {
    console.log('Business Unit Save failed', error);

    // ✅ Always show error toast: use backend message if exists
    const backendMessage =
      error.response?.data?.message || "Failed to save. Please try again!";
    showErrorToast("Error", backendMessage);
  } finally {
    setShowBusinessModal(false);
    setEditingFarm(null);
  }
};



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Theme.colors.screenBackground}
        barStyle="dark-content"
      />

      <View style={styles.container}>
        {/* ===== SCREEN CONTENT ===== */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* ===== TOP HEADER ===== */}
          <View style={styles.topHeader}>
            <Image source={Theme.icons.logo2} style={styles.logo} />
            <Text style={styles.topHeaderText}>Poultry Farms</Text>
            <TouchableOpacity onPress={handleLogoutPress}>
              <Image source={Theme.icons.logout} style={styles.logoutIcon} />
            </TouchableOpacity>
          </View>

          {/* ===== ADD NEW FARM BUTTON ===== */}
          <TouchableOpacity
            style={styles.addNewFarmButton}
            onPress={handleAddFarm}
            activeOpacity={0.8}
          >
            <Text style={styles.addNewFarmTitle}>+ Add New Farm</Text>
          </TouchableOpacity>

          {/* ===== FARM CARDS OR NO DATA IMAGE ===== */}
          {/* ===== FARM CARDS OR NO DATA IMAGE ===== */}
          {farms.length > 0
            ? // Show farm cards if we have data
              farms.map((farm, index) => (
                <FarmCard
                  key={index}
                  image={Theme.icons.farm}
                  title={farm.title}
                  location={farm.location}
                  users={farm.users}
                  employees={farm.employees}
                  onPressTitle={() =>
                    navigation.navigate(CustomConstants.DASHBOARD_DETAIL_SCREEN)
                  }
                  onAddUser={() => setShowAddUserModal(true)}
                  onAddEmployee={() =>
                    console.log('Add employee clicked for', farm.title)
                  }
                  onEdit={() => handleEditFarm(farm)}
                  onDelete={() => {
                    setSelectedFarm(farm);
                    setShowDeleteModal(true);
                  }}
                />
              ))
            : !loading && (
                <View style={styles.noDataContainer}>
                  <Image
                    source={Theme.icons.nodata}
                    style={styles.noDataImage}
                  />
                </View>
              )}
        </ScrollView>

        {/* ===== MODALS ===== */}
        <ConfirmationModal
          type="logout"
          visible={showLogoutModal}
          onClose={handleCloseLogoutModal}
          onConfirm={handleConfirmLogout}
        />
        <ConfirmationModal
          type="delete"
          visible={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
        <BusinessUnitModal
          visible={showBusinessModal}
          onClose={handleCloseBusinessModal}
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
          onClose={() => setShowAddUserModal(false)}
          onSave={handleAddUser}
        />

        {/* ===== LOADING OVERLAY ===== */}
        <LoadingOverlay visible={loading} />
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.screenBackground },
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
