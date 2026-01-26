import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DataCard from '../components/customCards/DataCard';
import TopBarCard from '../components/customCards/TopBarCard';
import AddModal from '../components/customPopups/AddModal';

import {
  getEmployees,
  updateEmployeeIsActive,
  addEmployee,
} from '../services/EmployeeService';

import Theme from '../theme/Theme';

type EmployeeStatus = 'Active' | 'Inactive';

interface Employee {
  employeeId?: string;
  name: string;
  type: string;
  salary: number;
  poultryFarm: string;
  joiningDate: string;
  endDate: string;
  status: EmployeeStatus;
}

const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'active' | 'inactive'>('all');

  const [isModalVisible, setIsModalVisible] = useState(false);

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees({ pageNumber: 1, pageSize: 50 });

      const mapped: Employee[] = data.list.map((emp: any) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        type: emp.employeeType,
        salary: emp.salary,
        poultryFarm: emp.businessUnit,
        joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
        endDate: emp.endDate
          ? new Date(emp.endDate).toLocaleDateString()
          : '',
        status: emp.isActive ? 'Active' : 'Inactive',
      }));

      setEmployees(mapped);
      setFilteredEmployees(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let updated = [...employees];

    if (searchText) {
      const q = searchText.toLowerCase();
      updated = updated.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.poultryFarm.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      updated = updated.filter(
        e => e.status.toLowerCase() === statusFilter,
      );
    }

    setFilteredEmployees(updated);
  }, [searchText, statusFilter, employees]);

  // ================= TOGGLE STATUS =================
  const toggleStatus = async (index: number) => {
    const emp = filteredEmployees[index];
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';

    try {
      await updateEmployeeIsActive(emp.employeeId!, newStatus === 'Active');

      setEmployees(prev =>
        prev.map(e =>
          e.employeeId === emp.employeeId
            ? { ...e, status: newStatus }
            : e,
        ),
      );
    } catch {
      Alert.alert('Error', 'Status update failed');
    }
  };

  // ================= ADD EMPLOYEE (API) =================
  const handleAddEmployee = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        employeeTypeId: Number(data.employeeType),
        joiningDate: data.joiningDate.toISOString(),
        salary: Number(data.salary),
        endDate: data.endDate ? data.endDate.toISOString() : null,
        businessUnitId: data.poultryFarm,
      };

      const res = await addEmployee(payload);

      const emp = res.data;

      const newEmployee: Employee = {
        employeeId: emp.employeeId,
        name: emp.name,
        type: emp.employeeType,
        salary: emp.salary,
        poultryFarm: emp.businessUnit,
        joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
        endDate: emp.endDate
          ? new Date(emp.endDate).toLocaleDateString()
          : '',
        status: emp.isActive ? 'Active' : 'Inactive',
      };

      setEmployees(prev => [newEmployee, ...prev]);
      setFilteredEmployees(prev => [newEmployee, ...prev]);

      Alert.alert('Success', 'Employee added successfully');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add employee');
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
  };

  const employeeLabels = {
    name: 'Name',
    type: 'Type',
    salary: 'Salary',
    poultryFarm: 'Poultry Farm',
    joiningDate: 'Joining Date',
    endDate: 'End Date',
    status: 'Status',
    actions: 'Actions',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <TopBarCard
          searchValue={searchText}
          onSearchChange={setSearchText}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          onReset={resetFilters}
          onAddPress={() => setIsModalVisible(true)}
        />

        {filteredEmployees.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        ) : (
          <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
            <View>
              <DataCard isHeader labels={employeeLabels} />
              {filteredEmployees.map((emp, index) => (
                <DataCard
                  key={emp.employeeId}
                  {...emp}
                  onToggleStatus={() => toggleStatus(index)}
                  labels={employeeLabels}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>

      <AddModal
        visible={isModalVisible}
        type="employee"
        title="Add Employee"
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddEmployee}
      />
    </SafeAreaView>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noDataImage: {
    width: 300,
    height: 300,
  },
});
