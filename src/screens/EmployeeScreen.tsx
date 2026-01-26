import React, { useState } from 'react';
import { ScrollView, Alert, View } from 'react-native';
import DataCard from '../components/customCards/DataCard';

type EmployeeStatus = 'Active' | 'Inactive';

interface Employee {
  name: string;
  type: string;
  salary: number;
  poultryFarm: string;
  joiningDate: string;
  endDate: string;
  status: EmployeeStatus;
}

const initialEmployees: Employee[] = [
  {
    name: 'Shiza',
    type: 'Accountant',
    salary: 9000,
    poultryFarm: 'Gujjar Farm',
    joiningDate: '25/01/2026',
    endDate: '',
    status: 'Active',
  },
  {
    name: 'Fatima',
    type: 'Manager',
    salary: 12000,
    poultryFarm: 'Happy Farm',
    joiningDate: '01/02/2026',
    endDate: '',
    status: 'Inactive',
  },
];

const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const toggleStatus = (index: number) => {
    const updated = [...employees];
    updated[index].status = updated[index].status === 'Active' ? 'Inactive' : 'Active';
    setEmployees(updated);
  };

  const editEmployee = (index: number) =>
    Alert.alert('Edit Employee', `Edit ${employees[index].name}`);

  const deleteEmployee = (index: number) =>
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employees[index].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = [...employees];
            updated.splice(index, 1);
            setEmployees(updated);
          },
        },
      ]
    );

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

  // Log before return
console.log('Employee Table Header Labels:', employeeLabels);
employees.forEach((emp, index) => {
  console.log(`Employee ${index} Data:`, emp);
});

return (
  <ScrollView style={{ flex: 1, marginTop: 50 }}>
    <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
      <View>
        <DataCard isHeader labels={employeeLabels} />
        {employees.map((emp, index) => (
          <DataCard
            key={index}
            name={emp.name}
            type={emp.type}
            salary={emp.salary}
            poultryFarm={emp.poultryFarm}
            joiningDate={emp.joiningDate}
            endDate={emp.endDate}
            status={emp.status}
            onToggleStatus={() => toggleStatus(index)}
            onEdit={() => editEmployee(index)}
            onDelete={() => deleteEmployee(index)}
            labels={employeeLabels}
          />
        ))}
      </View>
    </ScrollView>
  </ScrollView>
);

};

export default EmployeeScreen;
