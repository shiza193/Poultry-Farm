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
import BackArrow from '../../components/common/BackArrow';
import {
  getUnitsWithFlag,
  getFeedsWithFlag,
  Feed,
  getEmployeeTypesWithFlag, EmployeeTypeApi,
  getVaccinesWithFlag
} from '../../services/SettingService';

const tabs = ['Egg Units', 'Feed Types', 'Employee Types', 'Vaccines'];

// -------- Employee Types Dummy Data --------
interface EmployeeType {
  id: string;
  empNo: number;
  empName: string;
  status: 'Active' | 'Inactive';
}
const dummyEmployees: EmployeeType[] = [
  { id: '1', empNo: 24, empName: 'Worker', status: 'Active' },
  { id: '2', empNo: 25, empName: 'Accountant', status: 'Inactive' },
];

// -------- Vaccines Dummy Data --------
interface VaccineType {
  id: string;
  vaccineNo: number;
  vaccineName: string;
  status: 'Active' | 'Inactive';
}
const dummyVaccines: VaccineType[] = [
  { id: '1', vaccineNo: 101, vaccineName: 'Vaccine A', status: 'Active' },
  { id: '2', vaccineNo: 102, vaccineName: 'Vaccine B', status: 'Inactive' },
];

// -------- Egg Unit Type (API Data) --------
interface EggUnit {
  unitId: number;
  value: string;
  isActive: boolean;
  orderNumber: number;
}


// -------- Employee Type UI Model --------
interface EmployeeType {
  id: string;           
  empNo: number;            
  empName: string;        
  status: 'Active' | 'Inactive'; 
}

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('Egg Units');
  const [eggUnits, setEggUnits] = useState<EggUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedTypes, setFeedTypes] = useState<Feed[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);
const [employees, setEmployees] = useState<EmployeeType[]>([]);
const [loadingEmployees, setLoadingEmployees] = useState(false);
const [vaccines, setVaccines] = useState<VaccineType[]>([]);
const [loadingVaccines, setLoadingVaccines] = useState(false);


  // ================ FETCH EGG UNITS ================
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

  useEffect(() => {
    fetchEggUnits();
  }, []);

  // -------- Feed  Data --------
  const fetchFeeds = async () => {
    try {
      setLoadingFeeds(true);
      const data = await getFeedsWithFlag();

      // Convert feedId to string to match your handlers
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

  useEffect(() => {
    fetchFeeds();
  }, []);


  // -------- Employee  Data --------

 const fetchEmployees = async () => {
  try {
    setLoadingEmployees(true);
    const data = await getEmployeeTypesWithFlag();

    // Map API data to UI-friendly EmployeeType
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


useEffect(() => {
  fetchEmployees();
}, []);

  // -------- Vaccine  Data --------

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
  fetchVaccines();
}, []);
  // -------- Egg Units Handlers --------
  const toggleEggStatus = (id: number) => {
    setEggUnits(prev =>
      prev.map(unit =>
        unit.unitId === id ? { ...unit, isActive: !unit.isActive } : unit,
      ),
    );
  };

  const deleteEggUnit = (id: number) =>
    setEggUnits(prev => prev.filter(u => u.unitId !== id));

  const eggColumns: TableColumn[] = [
    { key: 'orderNumber', title: 'Unit No', width: 80 },
    { key: 'value', title: 'unit in GRAM', width: 130 },
    {
      key: 'status',
      title: 'Status',
      width: 120,
      render: (_, row: EggUnit) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleEggStatus(row.unitId)}
        />
      ),
    },
    {
      key: 'delete',
      title: '',
      width: 60,
      render: (_, row: EggUnit) => (
        <TouchableOpacity onPress={() => deleteEggUnit(row.unitId)}>
          <Image
            source={Theme.icons.delete}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ),
    },
  ];

  // -------- Feed Types Columns --------
  const toggleFeedStatus = (id: number) => {
    setFeedTypes(prev =>
      prev.map(feed =>
        feed.feedId === id ? { ...feed, isActive: !feed.isActive } : feed,
      ),
    );
  };

  const feedColumns: TableColumn[] = [
    { key: 'feedId', title: 'Feed ID', width: 80 },
    { key: 'name', title: 'Feed Name', width: 140 },
    {
      key: 'status',
      title: 'Status',
      width: 120,
      render: (_value, row) => (
        <StatusToggle
          isActive={row.isActive}
          onToggle={() => toggleFeedStatus(row.feedId)}
        />
      ),
    },
  ];

  // -------- Employee Columns --------
  const toggleEmpStatus = (id: string) => {
  setEmployees(prev =>
    prev.map(emp =>
      emp.id === id
        ? { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' }
        : emp
    )
  );
};

  const employeeColumns: TableColumn[] = [
  { key: 'empNo', title: 'Emp No', width: 100 },
  { key: 'empName', title: 'Emp Name', width: 130 },
  {
    key: 'status',
    title: 'Status',
    width: 120,
    render: (_, row: EmployeeType) => (
      <StatusToggle
        isActive={row.status === 'Active'}
        onToggle={() => toggleEmpStatus(row.id)}
      />
    ),
  },
];

  // -------- Vaccine Columns --------
 const toggleVaccineStatus = (id: string) => {
  setVaccines(prev =>
    prev.map(v =>
      v.id === id
        ? { ...v, status: v.status === 'Active' ? 'Inactive' : 'Active' }
        : v
    )
  );
};

  const vaccineColumns: TableColumn[] = [
    { key: 'vaccineNo', title: 'Vaccine No', width: 100 },
    { key: 'vaccineName', title: 'Vaccine Name', width: 140 },
    {
      key: 'status',
      title: 'Status',
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
      <BackArrow title="Settings" showBack />

      <View style={styles.body}>
        {/* TABS */}
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

        {/* CONTENT */}
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
});
