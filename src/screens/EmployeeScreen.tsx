import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import Header from '../components/common/Header';
import DataCard, { TableColumn } from '../components/customCards/DataCard';
import AddModal from '../components/customPopups/AddModal';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../components/loading/LoadingOverlay';

import Theme from '../theme/Theme';
import {
  getEmployees,
  updateEmployeeIsActive,
  addEmployee,
  deleteEmployee,
} from '../services/EmployeeService';
import { showSuccessToast, showErrorToast } from '../utils/AppToast';
import StatusToggle from '../components/common/StatusToggle';
import TopBarCard from '../components/customCards/TopBarCard';

type EmployeeStatus = 'Active' | 'Inactive';

interface Employee {
  employeeId?: string;
  name: string;
  type: string;
  salary: number;
  poultryFarm: string;
  businessUnitId: string;    
  joiningDate: string;
  endDate: string;
  status: EmployeeStatus;
}

const EmployeeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const routeBU = route.params?.businessUnitId ?? null;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedBU, setSelectedBU] = useState<string | null>(routeBU);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [rowModalVisible, setRowModalVisible] = useState(false);
  const [openRowDotsId, setOpenRowDotsId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const pageSize = 50;

  // ================= FETCH EMPLOYEES =================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params: any = { pageNumber: 1, pageSize };
      if (selectedBU) params.businessUnitId = selectedBU;

      const data = await getEmployees(params);

      const mapped: Employee[] = data.list.map((emp: any) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        type: emp.employeeType,
        salary: emp.salary,
        businessUnitId: emp.businessUnitId,
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

  useEffect(() => {
    fetchEmployees();
  }, [search, status, selectedBU]);

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
if (selectedBU && emp.businessUnitId !== selectedBU) return false;
    return true;
  });

  // ================= TABLE COLUMNS =================
  const columns: TableColumn[] = [
    {
      key: 'name', title: 'Name', width: 120, isTitle: true, showDots: true,
      onDotsPress: (row) => {
        setOpenRowDotsId(row.employeeId);
        setRowModalVisible(true);
      },
    },
    { key: 'type', title: 'Type', width: 120 },
    { key: 'salary', title: 'Salary', width: 120 },
    { key: 'poultryFarm', title: 'Farm', width: 140 },
    { key: 'joiningDate', title: 'Joining Date', width: 120 },
    { key: 'endDate', title: 'End Date', width: 120 },
    {
      key: 'status',
      title: 'Status',
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
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const handleAddEmployee = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        employeeTypeId: data.type,
        joiningDate: formatDate(data.joiningDate),
        salary: Number(data.salary),
        endDate: data.endDate ? formatDate(data.endDate) : null,
        businessUnitId: data.poultryFarm,
      };
      console.log('Add payload:', payload);
      const res = await addEmployee(payload);
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
      setEmployees(prev => prev.filter(e => e.employeeId !== selectedEmployeeId));
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

  const tableData = filteredEmployees.map(emp => ({ ...emp, raw: emp }));

  // ================= UI =================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Employees"
        onPressDots={() => setShowDotsMenu(prev => !prev)}
      />

      {/* ===== DOT MENU ===== */}
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

      {openRowDotsId && (
        <View
          style={{
            position: 'absolute',
            top: 267,
            marginLeft: 16,
            backgroundColor: Theme.colors.white,
            borderRadius: 6,
            elevation: 5,
            padding: 8,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedEmployeeId(openRowDotsId);
              setDeleteModalVisible(true);
              setOpenRowDotsId(null); 
            }}
          >
            <Text style={{ color: 'red', fontWeight: '600' }}>Delete Emp</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== TOP BAR ===== */}
      <TopBarCard
        searchValue={search}
        onSearchChange={setSearch}
        status={status === 'all' ? null : status}
        onStatusChange={s => setStatus(s ?? 'all')}
        value={selectedBU}
        onBusinessUnitChange={setSelectedBU}
        onReset={resetFilters}
      />
      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <DataCard columns={columns} data={tableData} itemsPerPage={5} />
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
      />

      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this employee?"
      />

      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 300,
    height: 360,
  },
  dotsMenu: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: Theme.colors.white,
    padding: 12,
    borderRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.success,
  },
});
