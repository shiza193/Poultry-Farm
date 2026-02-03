import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import StatusToggle from '../../components/common/StatusToggle';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import BackArrow from '../../components/common/BackArrow';
import {
  getUnitsWithFlag,
  getFeedsWithFlag,
  updateEmployeeTypeIsActive,
  Feed,
  getEmployeeTypesWithFlag,
  getVaccinesWithFlag,
  updateUnitIsActive,
  deleteEggUnit,
  addEggUnit,
  addFeed,
  deleteFeed,
  addEmployeeType,
  deleteEmployeeType,
  updateFeedIsActive,
  addVaccine,
  deleteVaccine,
  updateVaccineIsActive,
  editUnit,
  editFeed,
  editEmployeeType,
  editVaccine,
} from '../../services/SettingService';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';
import LoadingOverlay from '../../components/loading/LoadingOverlay';

const tabs = ['Egg Units', 'Feed Types', 'Employee Types', 'Vaccines'];

// -------- Employee Types --------
interface EmployeeType {
  id: string;
  empNo: number;
  empName: string;
  status: 'Active' | 'Inactive';
}

// -------- Vaccines --------
interface VaccineType {
  id: string;
  vaccineNo: number;
  vaccineName: string;
  status: 'Active' | 'Inactive';
}

// -------- Egg Unit --------
interface EggUnit {
  unitId: number;
  value: string;
  isActive: boolean;
  orderNumber: number;
}

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('Egg Units');
  const [eggUnits, setEggUnits] = useState<EggUnit[]>([]);
  const [feedTypes, setFeedTypes] = useState<Feed[]>([]);
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [vaccines, setVaccines] = useState<VaccineType[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingVaccines, setLoadingVaccines] = useState(false);

  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    row: any;
  } | null>(null);

  const isTabLoading = () => {
    switch (activeTab) {
      case 'Egg Units':
        return loading;
      case 'Feed Types':
        return loadingFeeds;
      case 'Employee Types':
        return loadingEmployees;
      case 'Vaccines':
        return loadingVaccines;
      default:
        return false;
    }
  };

  const [showBusinessUnitModal, setShowBusinessUnitModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    defaultValue: number;
  }>({
    title: '',
    defaultValue: 6,
  });

  // ===== FETCH FUNCTIONS =====
  const fetchEggUnits = async () => {
    try {
      setLoading(true);
      const data = await getUnitsWithFlag(1); // productTypeId = 1
      setEggUnits(data);
    } catch (error) {
      console.error('Failed to fetch Egg Units:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeds = async () => {
    try {
      setLoadingFeeds(true);
      const data = await getFeedsWithFlag();
      const mappedFeeds = data.map(feed => ({
        ...feed,
        id: feed.feedId.toString(),
        status: feed.isActive ? 'Active' : 'Inactive',
      }));
      setFeedTypes(mappedFeeds);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await getEmployeeTypesWithFlag();
      const mapped: EmployeeType[] = data.map(emp => ({
        id: emp.employeeTypeId.toString(),
        empNo: emp.employeeTypeId,
        empName: emp.name,
        status: emp.isActive ? 'Active' : 'Inactive',
      }));
      setEmployees(mapped);
    } catch (error) {
      console.error('Failed to fetch employee types:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      setLoadingVaccines(true);
      const data = await getVaccinesWithFlag();
      const mapped: VaccineType[] = data.map(v => ({
        id: v.vaccineId.toString(),
        vaccineNo: v.vaccineId,
        vaccineName: v.name,
        status: v.isActive ? 'Active' : 'Inactive',
      }));
      setVaccines(mapped);
    } catch (error) {
      console.error('Failed to fetch vaccines:', error);
    } finally {
      setLoadingVaccines(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Egg Units') fetchEggUnits();
    else if (activeTab === 'Feed Types') fetchFeeds();
    else if (activeTab === 'Employee Types') fetchEmployees();
    else if (activeTab === 'Vaccines') fetchVaccines();
  }, [activeTab]);

  // ===== TOGGLE STATUS =====
  const toggleEggStatus = async (unitId: number) => {
    const currentUnit = eggUnits.find(u => u.unitId === unitId);
    if (!currentUnit) return;

    const newStatus = !currentUnit.isActive;
    setEggUnits(prev =>
      prev.map(unit =>
        unit.unitId === unitId ? { ...unit, isActive: newStatus } : unit,
      ),
    );

    try {
      await updateUnitIsActive(unitId, newStatus);
    } catch (error) {
      console.error('Failed to update egg unit status:', error);
      setEggUnits(prev =>
        prev.map(unit =>
          unit.unitId === unitId
            ? { ...unit, isActive: currentUnit.isActive }
            : unit,
        ),
      );
    }
  };

  // ===== TOGGLE EMPLOYEE STATUS =====
  const toggleEmpStatus = async (id: string) => {
    const currentEmp = employees.find(emp => emp.id === id);
    if (!currentEmp) return;

    const newStatus = currentEmp.status === 'Active' ? 'Inactive' : 'Active';

    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, status: newStatus } : emp)),
    );

    try {
      await updateEmployeeTypeIsActive(
        currentEmp.empNo,
        newStatus === 'Active',
      );
    } catch (error) {
      console.error('Failed to update employee type status:', error);

      // Revert UI on failure
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id ? { ...emp, status: currentEmp.status } : emp,
        ),
      );
    }
  };

  // ===== TOGGLE FEED STATUS =====
  const toggleFeedStatus = async (id: number) => {
    const currentFeed = feedTypes.find(f => f.feedId === id);
    if (!currentFeed) return;

    const newStatus = !currentFeed.isActive;

    setFeedTypes(prev =>
      prev.map(feed =>
        feed.feedId === id ? { ...feed, isActive: newStatus } : feed,
      ),
    );

    try {
      await updateFeedIsActive(id, newStatus);
    } catch (error) {
      console.error('Failed to update feed status:', error);

      setFeedTypes(prev =>
        prev.map(feed =>
          feed.feedId === id
            ? { ...feed, isActive: currentFeed.isActive }
            : feed,
        ),
      );
    }
  };

  const toggleVaccineStatus = async (id: string) => {
    const currentVaccine = vaccines.find(v => v.id === id);
    if (!currentVaccine) return;

    const newStatus =
      currentVaccine.status === 'Active' ? 'Inactive' : 'Active';

    setVaccines(prev =>
      prev.map(v => (v.id === id ? { ...v, status: newStatus } : v)),
    );

    try {
      await updateVaccineIsActive(
        Number(currentVaccine.vaccineNo),
        newStatus === 'Active',
      );
    } catch (error) {
      console.error('Failed to update vaccine status:', error);

      setVaccines(prev =>
        prev.map(v =>
          v.id === id ? { ...v, status: currentVaccine.status } : v,
        ),
      );
    }
  };

  // ===== DELETE HANDLER =====
  const [deleteType, setDeleteType] = useState<
    'EggUnit' | 'Feed' | 'EmployeeType' | 'Vaccine' | null
  >(null);

  const onDeletePress = (
    id: number | string,
    type: 'EggUnit' | 'Feed' | 'EmployeeType' | 'Vaccine',
  ) => {
    setSelectedUnitId(Number(id));
    setDeleteType(type);
    setShowDeleteModal(true);
    setMenuPosition(null);
  };

  const confirmDeleteItem = async () => {
    if (!selectedUnitId || !deleteType) return;
    setLoading(true);

    if (deleteType === 'EggUnit') {
      const previousUnits = eggUnits;
      setEggUnits(prev => prev.filter(u => u.unitId !== selectedUnitId));
      setShowDeleteModal(false);

      try {
        await deleteEggUnit(selectedUnitId);
      } catch (error) {
        console.error('Delete Egg Unit failed:', error);
        setEggUnits(previousUnits);
      } finally {
        setLoading(false);
        setSelectedUnitId(null);
        setDeleteType(null);
      }
    }

    if (deleteType === 'Feed') {
      setLoading(true);

      const previousFeeds = feedTypes;
      setFeedTypes(prev => prev.filter(f => f.feedId !== selectedUnitId));
      setShowDeleteModal(false);

      try {
        await deleteFeed(selectedUnitId);
      } catch (error) {
        console.error('Delete Feed failed:', error);
        setFeedTypes(previousFeeds);
      } finally {
        setLoading(true);
        setSelectedUnitId(null);
        setDeleteType(null);
      }
    }

    if (deleteType === 'Vaccine') {
      const previousVaccines = vaccines;
      setVaccines(prev => prev.filter(v => v.id !== selectedUnitId.toString()));
      setShowDeleteModal(false);

      try {
        await deleteVaccine(selectedUnitId);
      } catch (error) {
        console.error('Delete Vaccine failed:', error);
        setVaccines(previousVaccines);
      } finally {
        setLoading(false);
        setSelectedUnitId(null);
        setDeleteType(null);
      }
    }
    if (deleteType === 'EmployeeType') {
      setLoading(true);

      const previousEmployees = employees;
      setEmployees(prev =>
        prev.filter(e => e.id !== selectedUnitId.toString()),
      );
      setShowDeleteModal(false);

      try {
        await deleteEmployeeType(selectedUnitId);
      } catch (error) {
        console.error('Delete Employee Type failed:', error);
        setEmployees(previousEmployees);
      } finally {
        setLoading(true);

        setSelectedUnitId(null);
        setDeleteType(null);
      }
    }
  };

  const onEditPress = (row: any) => {
    setIsEditMode(true);
    setEditItem(row);

    setModalData({
      title:
        activeTab === 'Egg Units'
          ? 'Edit Egg Unit'
          : activeTab === 'Feed Types'
          ? 'Edit Feed Type'
          : activeTab === 'Employee Types'
          ? 'Edit Employee Type'
          : 'Edit Vaccine',
      defaultValue: 0,
    });

    setShowBusinessUnitModal(true);
  };

  // ===== COLUMNS WITH DOTS MENU =====
  const dotsColumn = (
    getId: (row: any) => string | number,
    onDelete: (row: any) => void,
  ): TableColumn => ({
    key: 'dots',
    title: '',
    width: 50,
    render: (_, row) => (
      <TouchableOpacity
        onPress={event => {
          event.target.measureInWindow((x, y, width, height) => {
            setMenuPosition({
              x,
              y: y + height,
              row,
            });
          });
        }}
      >
        <Image source={Theme.icons.dots} style={{ width: 22, height: 22 }} />
      </TouchableOpacity>
    ),
  });

  const eggColumns: TableColumn[] = [
    dotsColumn(
      row => row.unitId,
      row => onDeletePress(row.unitId, 'EggUnit'),
    ),
    { key: 'orderNumber', title: 'UNIT NO', width: 90 },
    { key: 'value', title: 'UNIT IN GRAM', width: 130 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: EggUnit) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleEggStatus(row.unitId)}
        />
      ),
    },
  ];

  const feedColumns: TableColumn[] = [
    dotsColumn(
      row => row.feedId,
      row => onDeletePress(row.feedId, 'Feed'),
    ),

    { key: 'feedId', title: 'FEED ID', width: 80 },
    { key: 'name', title: 'FEED NAME', width: 140 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleFeedStatus(row.feedId)}
        />
      ),
    },
  ];

  const deleteEmployeeHandler = (id: string) =>
    setEmployees(prev => prev.filter(e => e.id !== id));

  const employeeColumns: TableColumn[] = [
    dotsColumn(
      row => row.id,
      row => deleteEmployeeHandler(row.id),
    ),
    { key: 'empNo', title: 'EMP NO', width: 100 },
    { key: 'empName', title: 'EMP NAME', width: 130 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: EmployeeType) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => toggleEmpStatus(row.id)}
        />
      ),
    },
  ];

  const deleteVaccineHandler = (id: string) =>
    setVaccines(prev => prev.filter(v => v.id !== id));

  const vaccineColumns: TableColumn[] = [
    dotsColumn(
      row => row.id,
      row => deleteVaccineHandler(row.id),
    ),
    { key: 'vaccineNo', title: 'VACCINE NO', width: 100 },
    { key: 'vaccineName', title: 'VACCINE NAME', width: 140 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: VaccineType) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => toggleVaccineStatus(row.id)}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <BackArrow
        title="Settings"
        showBack
        onAddNewPress={() => {
          if (activeTab === 'Egg Units') {
            setModalData({ title: 'Add Egg Unit', defaultValue: 0 });
            setShowBusinessUnitModal(true);
          } else if (activeTab === 'Feed Types') {
            setModalData({ title: 'Add Feed Type', defaultValue: 0 });
            setShowBusinessUnitModal(true);
          } else if (activeTab === 'Employee Types') {
            setModalData({ title: 'Add Employee Type', defaultValue: 0 });
            setShowBusinessUnitModal(true);
          } else if (activeTab === 'Vaccines') {
            setModalData({ title: 'Add Vaccine', defaultValue: 0 });
            setShowBusinessUnitModal(true);
          }
        }}
      />

      <View>
        {showBusinessUnitModal && (
          <BusinessUnitModal
            visible={showBusinessUnitModal}
            mode="singleField"
            modalTitle={modalData.title}
            singleFieldLabel={
              activeTab === 'Egg Units' ? 'Unit In Gram' : 'Name'
            }
            singleFieldValue={
              isEditMode
                ? activeTab === 'Egg Units'
                  ? editItem?.value
                  : activeTab === 'Feed Types'
                  ? editItem?.name
                  : activeTab === 'Employee Types'
                  ? editItem?.empName
                  : editItem?.vaccineName
                : ''
            }
            onClose={() => {
              setShowBusinessUnitModal(false);
              setIsEditMode(false);
              setEditItem(null);
            }}
            onSaveSingleField={async data => {
              try {
                if (activeTab === 'Egg Units') {
                  if (isEditMode) {
                    const previousUnits = eggUnits;

                    setEggUnits(prev =>
                      prev.map(unit =>
                        unit.unitId === editItem.unitId
                          ? { ...unit, value: data.value }
                          : unit,
                      ),
                    );

                    try {
                      await editUnit({
                        unitId: editItem.unitId,
                        value: data.value,
                        productTypeId: 1,
                      });
                    } catch (error) {
                      console.error('Edit Egg Unit failed:', error);
                      setEggUnits(previousUnits);
                    }
                  } else {
                    const response = await addEggUnit({
                      value: data.value,
                      productTypeId: 1,
                      description: null,
                    });

                    setEggUnits(prev => [
                      ...prev,
                      {
                        unitId: response.data.unitId,
                        value: response.data.value,
                        isActive: response.data.isActive,
                        orderNumber: prev.length + 1,
                      },
                    ]);
                  }
                }

                if (activeTab === 'Feed Types') {
                  if (isEditMode) {
                    const previousFeeds = feedTypes;

                    setFeedTypes(prev =>
                      prev.map(feed =>
                        feed.feedId === editItem.feedId
                          ? { ...feed, name: data.value }
                          : feed,
                      ),
                    );

                    try {
                      const res = await editFeed({
                        feedId: editItem.feedId,
                        name: data.value,
                      });

                      setFeedTypes(prev =>
                        prev.map(feed =>
                          feed.feedId === res.data.feedId
                            ? {
                                ...feed,
                                name: res.data.name,
                                isActive: res.data.isActive,
                              }
                            : feed,
                        ),
                      );
                    } catch (error) {
                      console.error('Edit Feed failed:', error);
                      setFeedTypes(previousFeeds);
                    }
                  } else {
                    const response = await addFeed({ name: data.value });

                    setFeedTypes(prev => [
                      ...prev,
                      {
                        feedId: response.data.feedId,
                        name: response.data.name,
                        isActive: response.data.isActive,
                        createdAt: response.data.createdAt,
                      },
                    ]);
                  }
                }

                if (activeTab === 'Employee Types') {
                  if (isEditMode) {
                    const previousEmployees = employees;

                    setEmployees(prev =>
                      prev.map(emp =>
                        emp.id === editItem.id
                          ? { ...emp, empName: data.value }
                          : emp,
                      ),
                    );

                    try {
                      const res = await editEmployeeType({
                        employeeTypeId: editItem.empNo,
                        name: data.value,
                      });

                      setEmployees(prev =>
                        prev.map(emp =>
                          emp.id === res.data.employeeTypeId.toString()
                            ? {
                                ...emp,
                                empName: res.data.name,
                                status: res.data.isActive
                                  ? 'Active'
                                  : 'Inactive',
                              }
                            : emp,
                        ),
                      );
                    } catch (error) {
                      console.error('Edit Employee Type failed:', error);
                      setEmployees(previousEmployees);
                    }
                  } else {
                    const response = await addEmployeeType({
                      name: data.value,
                    });

                    setEmployees(prev => [
                      ...prev,
                      {
                        id: response.data.employeeTypeId.toString(),
                        empNo: response.data.employeeTypeId,
                        empName: response.data.name,
                        status: response.data.isActive ? 'Active' : 'Inactive',
                      },
                    ]);
                  }
                }
                if (activeTab === 'Vaccines') {
                  if (isEditMode) {
                    const previousVaccines = vaccines;

                    setVaccines(prev =>
                      prev.map(v =>
                        v.id === editItem.id
                          ? { ...v, vaccineName: data.value }
                          : v,
                      ),
                    );

                    try {
                      const res = await editVaccine({
                        vaccineId: editItem.vaccineNo,
                        name: data.value,
                      });

                      setVaccines(prev =>
                        prev.map(v =>
                          v.id === res.data.vaccineId.toString()
                            ? {
                                ...v,
                                vaccineName: res.data.name,
                                status: res.data.isActive
                                  ? 'Active'
                                  : 'Inactive',
                              }
                            : v,
                        ),
                      );
                    } catch (error) {
                      console.error('Edit Vaccine failed:', error);
                      setVaccines(previousVaccines); // revert on fail
                    }
                  } else {
                    // ➕ ADD vaccine (same as before)
                    const response = await addVaccine({ name: data.value });

                    setVaccines(prev => [
                      ...prev,
                      {
                        id: response.data.vaccineId.toString(),
                        vaccineNo: response.data.vaccineId,
                        vaccineName: response.data.name,
                        status: response.data.isActive ? 'Active' : 'Inactive',
                      },
                    ]);
                  }
                }

                setShowBusinessUnitModal(false);
                setIsEditMode(false);
                setEditItem(null);
              } catch (error) {
                console.error('Failed to add item:', error);
              }
            }}
          />
        )}
      </View>
      {menuPosition &&
        (() => {
          const { x, y, row } = menuPosition;

          return (
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setMenuPosition(null)}
            >
              <View
                style={[
                  styles.floatingMenu,
                  {
                    top: y + 3,
                    left: x - 1,
                  },
                ]}
              >
                {/* EDIT */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onEditPress(row);
                    setMenuPosition(null);
                  }}
                >
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                {/* DELETE */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    if ('unitId' in row) {
                      onDeletePress(row.unitId, 'EggUnit');
                    } else if ('feedId' in row) {
                      onDeletePress(row.feedId, 'Feed');
                    } else if ('empNo' in row) {
                      onDeletePress(row.id, 'EmployeeType');
                    } else if ('vaccineNo' in row) {
                      onDeletePress(row.id, 'Vaccine');
                    }

                    setMenuPosition(null);
                  }}
                >
                  <Text style={[styles.menuText, styles.deleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })()}

      <View style={styles.body}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.contentContainer}>
          {activeTab === 'Egg Units' && (
            <DataCard columns={eggColumns} data={eggUnits} itemsPerPage={5} />
          )}
          {activeTab === 'Feed Types' && (
            <DataCard columns={feedColumns} data={feedTypes} itemsPerPage={5} />
          )}
          {activeTab === 'Employee Types' && (
            <DataCard
              columns={employeeColumns}
              data={employees}
              itemsPerPage={5}
            />
          )}
          {activeTab === 'Vaccines' && (
            <DataCard
              columns={vaccineColumns}
              data={vaccines}
              itemsPerPage={5}
            />
          )}
        </View>
      </View>

      <ConfirmationModal
        type="delete"
        visible={showDeleteModal}
        title={
          activeTab === 'Egg Units'
            ? 'Are you sure you want to delete this Egg Unit?'
            : activeTab === 'Feed Types'
            ? 'Are you sure you want to delete this Feed Type?'
            : activeTab === 'Employee Types'
            ? 'Are you sure you want to delete this Employee Type?'
            : 'Are you sure you want to delete this Vaccine?'
        }
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUnitId(null);
          setDeleteType(null);
        }}
        onConfirm={confirmDeleteItem}
      />

      <LoadingOverlay visible={isTabLoading()} />
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },
  body: { paddingTop: 4 },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  contentContainer: { paddingHorizontal: 12, paddingTop: 20 },
  tabButton: {
    paddingVertical: 9,
    paddingHorizontal: 9,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Theme.colors.feedGreen,
    marginRight: 12,
    backgroundColor: Theme.colors.white,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: Theme.colors.feedGreen },
  tabText: { fontSize: 16, color: Theme.colors.feedGreen, fontWeight: '600' },
  activeTabText: { color: Theme.colors.white, fontWeight: '700' },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },

  // -------- Floating menu like FarmCard --------
  floatingMenu: {
    position: 'absolute',
    top: 0, // will be overridden dynamically
    left: 0, // will be overridden dynamically
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    elevation: 6,
    width: 80,
    zIndex: 100,
    overflow: 'hidden', // ensures rounded corners for inner items
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
});
