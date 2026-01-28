
import api from '../api/Api';

export const getUserRoles = async () => {
  try {
    const response = await api.get('api/Master/get-user-roles');
    console.log(' Fetched User Roles:', response.data);
    return response.data.data; 
  } catch (error: any) {
    console.log(' Fetch User Roles Error:', error);
    throw error;
  }
};




interface AddUserPayload {
  fullName: string;
  email: string;
  password: string;
  userRoleId: number;
}

export const addUser = async (payload: AddUserPayload) => {
  try {
    const response = await api.post('api/User/add-user', payload);
    console.log(' Add User Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(' Add User Error', error.response || error.message);
    throw error;
  }
};




interface GetUsersPayload {
  searchKey: string | null;
  businessTypeId: number | null;
  isActive: boolean | null;
  pageNumber: number;
  pageSize: number;
}

export const getUsers = async (payload: GetUsersPayload) => {
  try {
    const response = await api.post(
      'api/User/get-users-by-search-and-filter-with-pagination',
      payload
    );
    console.log('Fetched Users:', response.data);
    return response.data.data; 
  } catch (error: any) {
    console.error('Fetch Users Error:', error.response || error.message);
    throw error;
  }
};




interface ChangeUserStatusPayload {
  userId: string;
  isActive: boolean;
}

export const changeUserStatus = async (payload: ChangeUserStatusPayload) => {
  try {
    const response = await api.post(
      'api/User/change-status',
      payload
    );
    console.log(' Change User Status Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      ' Change User Status Error',
      error.response || error.message
    );
    throw error;
  }
};



export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`api/User/delete-user/${userId}`);
    console.log('Delete User Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete User Error:', error.response || error.message);
    throw error;
  }
};

interface ResetPasswordPayload {
  userId: string;
  newPassword: string;
  conformPassword: string;
}

export const resetPassword = async (payload: ResetPasswordPayload) => {
  try {
    const response = await api.post('api/User/reset-password', payload);
    console.log('Reset Password Response:', response.data);
    return response.data; // { status, message, data }
  } catch (error: any) {
    console.error('Reset Password Error:', error.response || error.message);
    throw error;
  }
};


export const getUserFarms = async (userId: string) => {
  try {
    const res = await api.get(
      `/api/BusinessUnit/get-all-business-unit-by-user-with-added-flag/${userId}`
    );

    if (res.data.status === "Success") {
      return res.data.data.map((item: any) => ({
        id: item.businessUnitId,
        name: item.name,      
        isAdded: item.isAdded,   
        userRoleId: item.userRoleId,
        userRole: item.userRole,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch farms", error);
    return [];
  }
};


export const updateUserBusinessUnits = async (
  userId: string,
  payload: {
    businessUnitId: string;
    userRoleId: number | null;
    isChecked: boolean;
  }[]
) => {
  const response = await api.put(
    `api/UserBusinessUnit/update-user-business-unit/${userId}`,
    payload
  );

  return response.data;
};