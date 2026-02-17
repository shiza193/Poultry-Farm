import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Header from '../components/common/LogoHeader';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import Theme from '../theme/Theme';
import StatusToggle from '../components/common/StatusToggle';
import TopBarCard from '../components/customCards/TopBarCard';
import ProfileModal, { ProfileData } from '../components/customPopups/ProfileModal';
import {
  getEmployees,
  updateEmployeeIsActive,
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from '../services/EmployeeService';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';

type EmployeeStatus = 'Active' | 'Inactive';

interface Employee {
  employeeId?: string;
  name: string;
  type: string;
  employeeTypeId: number;
  salary: number;
  poultryFarmId: string;
  poultryFarm: string;
  joiningDate: string;
  endDate: string;
  status: EmployeeStatus;
}
const EmployeeScreen = () => {
  const route = useRoute<any>();
  const fromMenu = route.params?.fromMenu ?? false;
  const initialBU = route.params?.businessUnitId ?? null;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
    businessUnit: initialBU as string | null,
  });
  const [modalState, setModalState] = useState({
    AddModal: false,
    deleteModal: false,
    profileModal: false,
    selectedEmployeeId: null as string | null,
    selectedEmployee: null as ProfileData | null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { pageNumber: page, pageSize };
      if (filters.businessUnit) params.businessUnitId = filters.businessUnit;
      const data = await getEmployees(params);
      const mapped: Employee[] = data.list.map((emp: any) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        type: emp.employeeType,
        employeeTypeId: emp.employeeTypeId,
        salary: Number(emp.salary) || 0,
        poultryFarmId: emp.businessUnitId,
        poultryFarm: emp.businessUnit,
        joiningDate: new Date(emp.joiningDate).toLocaleDateString(),
        endDate: emp.endDate ? new Date(emp.endDate).toLocaleDateString() : '',
        status: emp.isActive ? 'Active' : 'Inactive',
      }));
      setEmployees(mapped);
      setTotalRecords(data.totalCount);
    } catch (error) {
      showErrorToast('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchEmployees(1);
    }, [filters.businessUnit]),
  );
  // ================= FILTER =================
  const filteredEmployees = employees.filter(emp => {
    if (filters.status === 'active' && emp.status !== 'Active') return false;
    if (filters.status === 'inactive' && emp.status !== 'Inactive') return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !emp.name.toLowerCase().includes(q) &&
        !emp.type.toLowerCase().includes(q) &&
        !emp.poultryFarm.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.businessUnit && emp.poultryFarmId !== filters.businessUnit) return false;
    return true;
  });
  // ================= TABLE COLUMNS =================
  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'NAME',
      width: 120,
      isTitle: true,
      showDots: true,
      render: (_, row) => (
        <TouchableOpacity
          onPress={() =>
            setModalState(prev => ({
              ...prev,
              selectedEmployee: {
                id: row.employeeId!,
                name: row.name,
                employeeTypeId: row.employeeTypeId,
                isActive: row.status === 'Active',
                businessUnitId: row.poultryFarmId,
                employeeType: row.type,
                salary: row.salary,
                joiningDate: row.joiningDate,
                endDate: row.endDate,
              },
              profileModal: true,
            }))
          }
        >
          <Text style={{ color: Theme.colors.black, fontWeight: '600' }}>
            {row.name || 'N/A'}
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
      render: (_, row) => (
        <StatusToggle
          isActive={row.status === 'Active'}
          onToggle={() => toggleStatus(row)}
        />
      ),
    },
  ];

  // ================= HANDLERS =================
  const toggleStatus = async (emp: Employee) => {
    try {
      const newStatus = emp.status !== 'Active';
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
        businessUnitId: filters.businessUnit ?? data.poultryFarm,
      };
      const res = await addEmployee(payload);
      const emp = res.data;
      const newEmp: Employee = {
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
      };
      setEmployees(prev => [newEmp, ...prev]);
      setTotalRecords(prev => prev + 1);
      setCurrentPage(1);
      showSuccessToast('Employee added successfully');
      setModalState(prev => ({ ...prev, AddModal: false }));
    } catch {
      showErrorToast('Failed to add employee');
    }
  };
  const handleDelete = async () => {
    if (!modalState.selectedEmployeeId) return;
    try {
      await deleteEmployee(modalState.selectedEmployeeId);
      setEmployees(prev =>
        prev.filter(e => e.employeeId !== modalState.selectedEmployeeId),
      );
      setTotalRecords(prev => prev - 1);
      setCurrentPage(prev => Math.min(prev, Math.ceil((totalRecords - 1) / pageSize)));
      showSuccessToast('Employee deleted successfully');
    } catch {
      showErrorToast('Failed to delete employee');
    } finally {
      setModalState(prev => ({
        ...prev,
        deleteModal: false,
        selectedEmployeeId: null,
      }));
    }
  };
  const resetFilters = () => {
    setFilters({ search: '', status: 'all', businessUnit: null });
  };
  return (
    <View style={styles.container}>
      {fromMenu ? (
        <Header title="Employees" onAddNewPress={() => setModalState(prev => ({ ...prev, AddModal: true }))} />
      ) : (
        <Header title="Employees" showLogout onAddNewPress={() => setModalState(prev => ({ ...prev, AddModal: true }))} />
      )}
      <TopBarCard
        searchValue={filters.search}
        onSearchChange={value => setFilters(prev => ({ ...prev, search: value }))}
        status={filters.status === 'all' ? null : filters.status}
        onStatusChange={s => setFilters(prev => ({ ...prev, status: s ?? 'all' }))}
        value={filters.businessUnit}
        onBusinessUnitChange={bu => setFilters(prev => ({ ...prev, businessUnit: bu }))}
        onReset={resetFilters}
        hideBUDropdown={fromMenu}
      />
      {filteredEmployees.length > 0 ? (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard
            columns={columns}
            data={filteredEmployees}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={page => {
              setCurrentPage(page);
              fetchEmployees(page);
            }}
            renderRowMenu={(row, closeMenu) => (
              <TouchableOpacity
                onPress={() => {
                  setModalState(prev => ({
                    ...prev,
                    deleteModal: true,
                    selectedEmployeeId: row.employeeId,
                  }));
                  closeMenu();
                }}
              >
                <Text style={{ color: 'red', fontWeight: '600', fontSize: 13, marginLeft: 7 }}>
                  Delete Employee
                </Text>
              </TouchableOpacity>
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

      {/* Modals */}
      <AddModal
        visible={modalState.AddModal}
        type="employee"
        title="Add Employee"
        onClose={() => setModalState(prev => ({ ...prev, AddModal: false }))}
        onSave={handleAddEmployee}
        hidePoultryFarm={!!fromMenu}
        defaultBusinessUnitId={filters.businessUnit}
      />
      <ConfirmationModal
        type="delete"
        visible={modalState.deleteModal}
        onClose={() => setModalState(prev => ({ ...prev, deleteModal: false }))}
        onConfirm={handleDelete}
        title="Are you sure you want to delete this employee?"
      />
      {modalState.selectedEmployee && (
        <ProfileModal
          visible={modalState.profileModal}
          onClose={() => setModalState(prev => ({ ...prev, profile: false, selectedEmployee: null }))}
          type="employee"
          data={modalState.selectedEmployee}
          onSave={async updatedData => {
            try {
              const payload = {
                name: updatedData.name,
                businessUnitId: updatedData.businessUnitId,
                employeeTypeId: updatedData.employeeTypeId,
                salary: updatedData.salary,
              };
              await updateEmployee(updatedData.id!, payload);
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
              setModalState(prev => ({ ...prev, profileModal: false, selectedEmployee: null }));
            } catch {
              showErrorToast('Failed to update employee');
            }
          }}
        />
      )}
      <LoadingOverlay visible={loading} />
    </View>
  );
};
export default EmployeeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  noDataContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
