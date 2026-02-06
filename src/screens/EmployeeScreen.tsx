import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';

import Header from '../components/common/LogoHeader';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import Theme from '../theme/Theme';
import StatusToggle from '../components/common/StatusToggle';
import TopBarCard from '../components/customCards/TopBarCard';
import ProfileModal, {
  ProfileData,
} from '../components/customPopups/ProfileModal';
import {
  getEmployees,
  updateEmployeeIsActive,
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from '../services/EmployeeService';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';
import BackArrow from '../components/common/ScreenHeaderWithBack';

type EmployeeStatus = 'Active' | 'Inactive';

interface Employee {
  employeeId?: string;
  name: string;
  type: string;
  employeeTypeId: number;
  salary: number;
  poultryFarmId: string; // Add ID
  poultryFarm: string; // Name
  joiningDate: string;
  endDate: string;
  status: EmployeeStatus;
}

const EmployeeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  console.log('EmployeeScreen route params:', route.params);
  const fromMenu = route.params?.fromMenu === true;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ProfileData | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const pageSize = 50;

  const routeBU = route.params?.businessUnitId ?? null;
  const [selectedBU, setSelectedBU] = useState<string | null>(routeBU);

  useFocusEffect(
    useCallback(() => {
      const bu = route.params?.businessUnitId ?? null;
      setSelectedBU(bu);
      fetchEmployees(bu);
      setSearch('');
      setStatus('all');
    }, [route.params?.businessUnitId]),
  );

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async (bu: string | null = null) => {
    try {
      setLoading(true);
      const params: any = { pageNumber: 1, pageSize };

      //  Only pass businessUnitId if a BU is specified
      if (bu) params.businessUnitId = bu;

      const data = await getEmployees(params);

      const mapped: Employee[] = data.list.map((emp: any) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        type: emp.employeeType,
        employeeTypeId: emp.employeeTypeId,
        salary: emp.salary,
        poultryFarmId: emp.businessUnitId,
        poultryFarm: emp.businessUnit,
        joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
        endDate: emp.endDate ? new Date(emp.endDate).toLocaleDateString() : '',
        status: emp.isActive ? 'Active' : 'Inactive',
      }));

      setEmployees(mapped);
    } catch (error) {
      showErrorToast('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [selectedBU]),
  );
  // ================= FILTER =================
  const filteredEmployees = employees.filter(emp => {
    if (status === 'active' && emp.status !== 'Active') return false;
    if (status === 'inactive' && emp.status !== 'Inactive') return false;

    if (search) {
      const q = search.toLowerCase();
      if (
        !emp.name.toLowerCase().includes(q) &&
        !emp.type.toLowerCase().includes(q) &&
        !emp.poultryFarm.toLowerCase().includes(q)
      )
        return false;
    }

    //  Only filter by BU if a BU is selected
    if (selectedBU) {
      if (emp.poultryFarmId !== selectedBU) return false;
    }

    return true;
  });

  console.log('Filtered employees for table:', filteredEmployees);

  console.log('Filtered employees for table:', filteredEmployees);

  // ================= TABLE COLUMNS =================
  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'NAME',
      width: 120,
      isTitle: true,
      showDots: true,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() => {
            // Open ProfileModal for this employee
            setSelectedEmployee({
              id: row.employeeId!,
              name: row.name,
              employeeTypeId: row.employeeTypeId,
              isActive: row.status === 'Active',
              businessUnitId: row.poultryFarmId,
              employeeType: row.type,
              salary: row.salary,
              joiningDate: row.joiningDate,
              endDate: row.endDate,
            });
            setProfileModalVisible(true);
          }}
        >
          <Text style={{ color: Theme.colors.black, fontWeight: '600' }}>
            {value || 'N/A'}
          </Text>
        </TouchableOpacity>
      ),
    },
    { key: 'type', title: 'TYPE', width: 120 },
    { key: 'salary', title: 'SALARY', width: 120 },
    { key: 'poultryFarm', title: 'FARM', width: 140 },
    { key: 'joiningDate', title: 'JOINING DATE', width: 120 },
    { key: 'endDate', title: 'END DATE', width: 120 },
    {
      key: 'status',
      title: 'STATUS',
      width: 120,
      render: (value, row) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => handleToggleStatus(row)}
        />
      ),
    },
  ];

  // ================= HANDLERS =================
  const handleToggleStatus = async (emp: Employee) => {
    try {
      const newStatus = emp.status === 'Active' ? false : true;
      await updateEmployeeIsActive(emp.employeeId!, newStatus);
      setEmployees(prev =>
        prev.map(e =>
          e.employeeId === emp.employeeId
            ? { ...e, status: newStatus ? 'Active' : 'Inactive' }
            : e,
        ),
      );
      showSuccessToast(
        'Success',
        `Employee ${newStatus ? 'Activated' : 'Deactivated'} successfully`,
      );
    } catch {
      showErrorToast('Failed to update status');
    }
  };

  const handleAddEmployee = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        employeeTypeId: data.type,
        joiningDate: new Date(data.joiningDate).toISOString(),
        salary: Number(data.salary),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        businessUnitId: selectedBU ?? data.poultryFarm,
      };
      console.log('Add payload:', payload);

      await addEmployee(payload);
      fetchEmployees();
      showSuccessToast('Employee added successfully');
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Add employee error:', error);
      showErrorToast('Failed to add employee');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployeeId) return;
    try {
      await deleteEmployee(selectedEmployeeId);
      setEmployees(prev =>
        prev.filter(e => e.employeeId !== selectedEmployeeId),
      );
      showSuccessToast('Employee deleted successfully');
    } catch {
      showErrorToast('Failed to delete employee');
    } finally {
      setDeleteModalVisible(false);
      setSelectedEmployeeId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedBU(null);
  };

  const tableData = filteredEmployees.map(emp => ({ ...emp }));

  return (
    <SafeAreaView style={styles.safeArea}>
      {fromMenu ? (
        <BackArrow
          title="Employees"
          showBack={true}
          onAddNewPress={() => setIsAddModalVisible(true)}
        />
      ) : (
        <Header
          title="Employees"
          onPressDots={() => setShowDotsMenu(prev => !prev)}
        />
      )}

      {showDotsMenu && (
        <View style={styles.dotsMenu}>
          <TouchableOpacity
            onPress={() => {
              setIsAddModalVisible(true);
              setShowDotsMenu(false);
            }}
          >
            <Text style={styles.menuText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
      )}

      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status === 'all' ? null : status}
        onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
        hideBUDropdown={fromMenu}
      />

      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={5}
            renderRowMenu={(row, closeMenu) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedEmployeeId(row.employeeId);
                  setSelectedEmployeeId(row.employeeId);
                  setDeleteModalVisible(true);
                  closeMenu();
                }}
              >
                <Text style={{ color: 'red', fontWeight: '600' }}>
                  Delete Employee
                </Text>
              </TouchableOpacity>
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

      <AddModal
        visible={isAddModalVisible}
        type="employee"
        title="Add Employee"
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddEmployee}
        hidePoultryFarm={!!fromMenu}
        defaultBusinessUnitId={selectedBU}
      />

      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this employee?"
      />
      {selectedEmployee && (
        <ProfileModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          type="employee"
          data={selectedEmployee}
         onSave={async updatedData => {
  try {
    // Prepare payload for backend
    const payload = {
      name: updatedData.name,
      businessUnitId: updatedData.businessUnitId,
      employeeTypeId: updatedData.employeeTypeId,
    };

    await updateEmployee(updatedData.id!, payload);

    // Update local state
   setEmployees(prev =>
  prev.map(emp =>
    emp.employeeId === updatedData.id
      ? {
          ...emp,
          name: updatedData.name!,
          poultryFarmId: updatedData.businessUnitId ?? emp.poultryFarmId,
          employeeTypeId: updatedData.employeeTypeId ?? emp.employeeTypeId,
          type: updatedData.employeeType || emp.type,
          salary: updatedData.salary ?? emp.salary,
          joiningDate: updatedData.joiningDate ?? emp.joiningDate,
          endDate: updatedData.endDate ?? emp.endDate,
        }
      : emp,
  ),
);


    showSuccessToast('Employee updated successfully');
    setProfileModalVisible(false);
  } catch (error) {
    console.error('Error updating employee:', error);
    showErrorToast('Failed to update employee');
  }
}}

        />
      )}

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
  dotsMenu: {
    position: 'absolute',
    top: 45,
    right: 35,
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  menuText: { fontSize: 15, fontWeight: '600', color: Theme.colors.success },
});
