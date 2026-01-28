// services/employeeService.js
import api from '../api/Api';


type GetEmployeesParams = {
  searchKey?: string | null;
  isActive?: boolean | null;
  pageNumber?: number;
  pageSize?: number;
  businessUnitId?: string | null;
};

export const getEmployees = async ({
  searchKey = null,
  isActive = null,
  pageNumber = 1,
  pageSize = 10,
  businessUnitId = null, // 👈 ADD THIS
}: GetEmployeesParams = {}) => {
  try {
    const response = await api.post(
      'api/Employee/get-employee-by-search-and-filter-with-pagination',
      {
        searchKey,
        isActive,
        pageNumber,
        pageSize,
        businessUnitId, // 👈 SEND TO BACKEND
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};


export const updateEmployeeIsActive = async (employeeId: any, isActive: any) => {
  try {
    const response = await api.put(
      `api/Employee/update-employee-isActive/${employeeId}/${isActive}`
    );
    return response.data;
  } catch (error) {
    console.error('Error updating employee status:', error);
    throw error;
  }
};

export const getEmployeeTypes = async () => {
  try {
    const response = await api.get(
      `api/Master/get-employee-types`
    );

    // API response structure:
    // { status, message, data }
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to fetch employee types:', error);
    throw error;
  }
};




interface AddEmployeePayload {
  name: string;
  employeeTypeId: number;
  joiningDate: string; // ISO string
  salary: number;
  endDate?: string | null;
}

export const addEmployee = async (payload: AddEmployeePayload & { businessUnitId: string }) => {
  try {
    const response = await api.post('api/Employee/add-employee', {
      name: payload.name,
      employeeTypeId: payload.employeeTypeId,
      joiningDate: payload.joiningDate,
      salary: payload.salary,
      endDate: payload.endDate ?? null,
      businessUnitId: payload.businessUnitId, 
    });

    return response.data;
  } catch (error) {
    console.error('Add employee error:', error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: string) => {
  try {
    const response = await api.delete(`api/Employee/delete-employee/${employeeId}`);
    console.log('Delete Employee Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete Employee Error:', error.response || error.message);
    throw error;
  }
};