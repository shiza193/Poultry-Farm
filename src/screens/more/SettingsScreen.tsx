import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import StatusToggle from '../../components/common/StatusToggle';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import BackArrow from '../../components/common/ScreenHeaderWithBack';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';
import LoadingOverlay from '../../components/loading/LoadingOverlay';
import {
  getUnitsWithFlag,
  getFeedsWithFlag,
  getEmployeeTypesWithFlag,
  getVaccinesWithFlag,
  updateUnitIsActive,
  updateFeedIsActive,
  updateEmployeeTypeIsActive,
  updateVaccineIsActive,
  addEggUnit,
  editUnit,
  addFeed,
  editFeed,
  addEmployeeType,
  editEmployeeType,
  addVaccine,
  editVaccine,
  deleteEggUnit,
  deleteFeed,
  deleteEmployeeType,
  deleteVaccine,
  Feed,
} from '../../services/SettingService';
import { showSuccessToast } from '../../utils/AppToast';

const tabs = ['Egg Units', 'Feed Types', 'Employee Types', 'Vaccines'];

// -------- TYPES --------
interface EmployeeType {
  id: string;
  empNo: number;
  empName: string;
  status: 'Active' | 'Inactive';
}

interface VaccineType {
  id: string;
  vaccineNo: number;
  vaccineName: string;
  status: 'Active' | 'Inactive';
}

interface EggUnit {
  unitId: number;
  value: string;
  isActive: boolean;
  orderNumber: number;
}

type ItemType = EggUnit | Feed | EmployeeType | VaccineType;

type AllItemsState = {
  [key: string]: ItemType[];
};

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('Egg Units');
  const [items, setItems] = useState<AllItemsState>({
    'Egg Units': [],
    'Feed Types': [],
    'Employee Types': [],
    Vaccines: [],
  });
  const [loading, setLoading] = useState(true);

  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    row: any;
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    id: number | string;
    type: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showBusinessUnitModal, setShowBusinessUnitModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    defaultValue: number;
  }>({ title: '', defaultValue: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // ===== FETCH ITEMS =====
  const fetchItems = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'Egg Units') {
        const data = await getUnitsWithFlag(1);
        setItems(prev => ({ ...prev, [tab]: data }));
      } else if (tab === 'Feed Types') {
        const data = await getFeedsWithFlag();
        setItems(prev => ({
          ...prev,
          [tab]: data.map(f => ({
            ...f,
            id: f.feedId.toString(),
            status: f.isActive ? 'Active' : 'Inactive',
          })),
        }));
      } else if (tab === 'Employee Types') {
        const data = await getEmployeeTypesWithFlag();
        setItems(prev => ({
          ...prev,
          [tab]: data.map(e => ({
            id: e.employeeTypeId.toString(),
            empNo: e.employeeTypeId,
            empName: e.name,
            status: e.isActive ? 'Active' : 'Inactive',
          })),
        }));
      } else if (tab === 'Vaccines') {
        const data = await getVaccinesWithFlag();
        setItems(prev => ({
          ...prev,
          [tab]: data.map(v => ({
            id: v.vaccineId.toString(),
            vaccineNo: v.vaccineId,
            vaccineName: v.name,
            status: v.isActive ? 'Active' : 'Inactive',
          })),
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${tab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  // ===== TOGGLE STATUS =====
  const toggleStatus = async (id: number | string) => {
    // 1 Current tab ka saara data array me store karte hain
    // Example: agar activeTab 'Egg Units' hai → tabItems = items['Egg Units']
    const tabItems = items[activeTab];

    // 2 Current item find karte hain jisko toggle karna hai
    // Har type me alag ID field hoti hai
    const current = tabItems.find(i => {
      if ('unitId' in i) return i.unitId === id;
      if ('feedId' in i) return i.feedId === id;
      if ('empNo' in i) return i.id === id;
      if ('vaccineNo' in i) return i.id === id;
      return false;
    });

    // 3 Agar current item nahi mila → function exit ho jaye
    if (!current) return;

    // 4 Previous items ka copy bna lete hain (API fail hone par restore ke liye)
    const prevItems = [...tabItems];

    const newItems = tabItems.map(i => {
      if (i === current) {
        // Sirf current item ko toggle karna
        if ('isActive' in i) return { ...i, isActive: !i.isActive };
        if ('status' in i)
          return {
            ...i,
            status: i.status === 'Active' ? 'Inactive' : 'Active',
          };
      }
      return i;
    });

    setItems(prev => ({
      ...prev,
      [activeTab as keyof AllItemsState]: newItems as ItemType[],
    }));

    try {
      if (activeTab === 'Egg Units')
        await updateUnitIsActive(
          (current as EggUnit).unitId,
          !(current as EggUnit).isActive,
        );
      else if (activeTab === 'Feed Types')
        await updateFeedIsActive(
          (current as Feed).feedId,
          !(current as Feed).isActive,
        );
      else if (activeTab === 'Employee Types')
        await updateEmployeeTypeIsActive(
          (current as EmployeeType).empNo,
          (current as EmployeeType).status === 'Inactive',
        );
      else if (activeTab === 'Vaccines')
        await updateVaccineIsActive(
          Number((current as VaccineType).vaccineNo),
          (current as VaccineType).status === 'Inactive',
        );

      showSuccessToast('Status updated successfully');
    } catch {
      // 8 Agar API fail ho jaye → local state ko previous items se restore
      setItems(prev => ({ ...prev, [activeTab]: prevItems }));
    }
  };

  // ===== DELETE =====
  const onDeletePress = (id: number | string) => {
    setDeleteItem({ id, type: activeTab });
    setShowDeleteModal(true);
    setMenuPosition(null);
  };

  const confirmDeleteItem = async () => {
    if (!deleteItem) return;
    const tabItems = items[deleteItem.type];
    const prevItems = [...tabItems];

    const newItems = tabItems.filter(i => {
      if ('unitId' in i) return i.unitId !== deleteItem.id;
      if ('feedId' in i) return i.feedId !== deleteItem.id;
      if ('empNo' in i) return i.id !== deleteItem.id;
      if ('vaccineNo' in i) return i.id !== deleteItem.id;
      return true;
    });

    setItems(prev => ({ ...prev, [deleteItem.type]: newItems }));
    setShowDeleteModal(false);

    try {
      if (deleteItem.type === 'Egg Units')
        await deleteEggUnit(deleteItem.id as number);
      else if (deleteItem.type === 'Feed Types')
        await deleteFeed(deleteItem.id as number);
      else if (deleteItem.type === 'Employee Types')
        await deleteEmployeeType(deleteItem.id as number);
      else if (deleteItem.type === 'Vaccines')
        await deleteVaccine(deleteItem.id as number);

      showSuccessToast('Deleted successfully');
    } catch {
      setItems(prev => ({ ...prev, [deleteItem.type]: prevItems }));
    }
    setDeleteItem(null);
  };

  // ===== COLUMNS CONFIG =====
  const dotsColumn = (row: any): TableColumn => ({
    key: 'dots',
    title: '',
    width: 50,
    render: (_, row) => (
      <TouchableOpacity
        onPress={event => {
          event.target.measureInWindow((x, y, width, height) =>
            setMenuPosition({ x, y: y + height, row }),
          );
        }}
      >
        <Image source={Theme.icons.dots} style={{ width: 22, height: 22 }} />
      </TouchableOpacity>
    ),
  });

  const eggColumns: TableColumn[] = [
    dotsColumn(null),
    { key: 'orderNumber', title: 'UNIT NO', width: 90 },
    { key: 'value', title: 'UNIT IN GRAM', width: 130 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: EggUnit) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleStatus(row.unitId)}
        />
      ),
    },
  ];

  const feedColumns: TableColumn[] = [
    dotsColumn(null),
    { key: 'feedId', title: 'FEED ID', width: 80 },
    { key: 'name', title: 'FEED NAME', width: 140 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: Feed) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleStatus(row.feedId)}
        />
      ),
    },
  ];

  const employeeColumns: TableColumn[] = [
    dotsColumn(null),
    { key: 'empNo', title: 'EMP NO', width: 100 },
    { key: 'empName', title: 'EMP NAME', width: 130 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: EmployeeType) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => toggleStatus(row.id)}
        />
      ),
    },
  ];

  const vaccineColumns: TableColumn[] = [
    dotsColumn(null),
    { key: 'vaccineNo', title: 'VACCINE NO', width: 100 },
    { key: 'vaccineName', title: 'VACCINE NAME', width: 140 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (_, row: VaccineType) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => toggleStatus(row.id)}
        />
      ),
    },
  ];

  const getColumns = () => {
    if (activeTab === 'Egg Units') return eggColumns;
    if (activeTab === 'Feed Types') return feedColumns;
    if (activeTab === 'Employee Types') return employeeColumns;
    if (activeTab === 'Vaccines') return vaccineColumns;
    return [];
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BackArrow
        title="Settings"
        showBack
        onAddNewPress={() => {
          setIsEditMode(false);
          setEditItem(null);
          setModalData({
            title:
              activeTab === 'Egg Units'
                ? 'Add Egg Unit'
                : activeTab === 'Feed Types'
                  ? 'Add Feed Type'
                  : activeTab === 'Employee Types'
                    ? 'Add Employee Type'
                    : 'Add Vaccine',
            defaultValue: 0,
          });
          setShowBusinessUnitModal(true);
        }}
      />

      {/* MODAL */}
      {showBusinessUnitModal && (
        <BusinessUnitModal
          visible={showBusinessUnitModal}
          mode="singleField"
          modalTitle={modalData.title}
          singleFieldLabel={activeTab === 'Egg Units' ? 'Unit In Gram' : 'Name'}
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
              const tabItems = [...items[activeTab]];

              if (isEditMode) {
                // EDIT MODE
                const updatedItems = tabItems.map(item => {
                  if (
                    (activeTab === 'Egg Units' &&
                      'unitId' in item &&
                      item.unitId === editItem.unitId) ||
                    (activeTab === 'Feed Types' &&
                      'feedId' in item &&
                      item.feedId === editItem.feedId) ||
                    (activeTab === 'Employee Types' &&
                      'id' in item &&
                      item.id === editItem.id) ||
                    (activeTab === 'Vaccines' &&
                      'id' in item &&
                      item.id === editItem.id)
                  ) {
                    if (activeTab === 'Egg Units')
                      return { ...item, value: data.value };
                    if (activeTab === 'Feed Types')
                      return { ...item, name: data.value };
                    if (activeTab === 'Employee Types')
                      return { ...item, empName: data.value };
                    if (activeTab === 'Vaccines')
                      return { ...item, vaccineName: data.value };
                  }
                  return item;
                });

                setItems(prev => ({ ...prev, [activeTab]: updatedItems }));

                // CALL API
                if (activeTab === 'Egg Units')
                  await editUnit({
                    unitId: editItem.unitId,
                    value: data.value,
                    productTypeId: 1,
                  });
                if (activeTab === 'Feed Types')
                  await editFeed({ feedId: editItem.feedId, name: data.value });
                if (activeTab === 'Employee Types')
                  await editEmployeeType({
                    employeeTypeId: editItem.empNo,
                    name: data.value,
                  });
                if (activeTab === 'Vaccines')
                  await editVaccine({
                    vaccineId: editItem.vaccineNo,
                    name: data.value,
                  });
              } else {
                // ADD MODE
                let newItem: ItemType;
                if (activeTab === 'Egg Units') {
                  const res = await addEggUnit({
                    value: data.value,
                    productTypeId: 1,
                    description: null,
                  });
                  newItem = {
                    unitId: res.data.unitId,
                    value: res.data.value,
                    isActive: res.data.isActive,
                    orderNumber: tabItems.length + 1,
                  };
                }
                if (activeTab === 'Feed Types') {
                  const res = await addFeed({ name: data.value });
                  newItem = {
                    feedId: res.data.feedId,
                    name: res.data.name,
                    isActive: res.data.isActive,
                    createdAt: res.data.createdAt,
                    id: res.data.feedId.toString(),
                  };
                }
                if (activeTab === 'Employee Types') {
                  const res = await addEmployeeType({ name: data.value });
                  newItem = {
                    id: res.data.employeeTypeId.toString(),
                    empNo: res.data.employeeTypeId,
                    empName: res.data.name,
                    status: res.data.isActive ? 'Active' : 'Inactive',
                  };
                }
                if (activeTab === 'Vaccines') {
                  const res = await addVaccine({ name: data.value });
                  newItem = {
                    id: res.data.vaccineId.toString(),
                    vaccineNo: res.data.vaccineId,
                    vaccineName: res.data.name,
                    status: res.data.isActive ? 'Active' : 'Inactive',
                  };
                }

                setItems(prev => ({
                  ...prev,
                  [activeTab]: [...tabItems, newItem],
                }));
              }

              setShowBusinessUnitModal(false);
              setIsEditMode(false);
              setEditItem(null);
            } catch (error) {
              console.error('Failed to add/edit item:', error);
            }
          }}
        />
      )}

      {/* MENU */}
      {menuPosition &&
        (() => {
          const { x, y, row } = menuPosition;
          return (
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setMenuPosition(null)}
            >
              <View style={[styles.floatingMenu, { top: y + 3, left: x - 1 }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsEditMode(true);
                    setEditItem(row);
                    setShowBusinessUnitModal(true);
                    setMenuPosition(null);
                  }}
                >
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onDeletePress(row.unitId || row.feedId || row.id);
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

      {/* TABS */}
      <View style={styles.body}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.contentContainer}>
          <DataCard
            columns={getColumns()}
            loading={loading}
            data={items[activeTab]}
            showPagination={false}
            />
        </View>
      </View>

      <ConfirmationModal
        type="delete"
        visible={showDeleteModal}
        title={`Are you sure you want to delete this ${activeTab.slice(
          0,
          -1,
        )}?`}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        onConfirm={confirmDeleteItem}
      />
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
    top: 1,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  floatingMenu: {
    position: 'absolute',
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    elevation: 6,
    width: 80,
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 8, paddingHorizontal: 9 },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  deleteText: { color: Theme.colors.error },
  menuDivider: { height: 1, backgroundColor: '#eee' },
});
