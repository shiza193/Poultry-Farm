import api from '../api/Api';

interface Unit {
  unitId: number;
  value: string;
  isActive: boolean;
  orderNumber: number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Unit[];
}
export const getUnitsWithFlag = async (
  productTypeId: number,
): Promise<Unit[]> => {
  try {
    const response = await api.get<ApiResponse>(
      'api/Master/get-units-with-flag',
      {
        params: { productTypeId },
      },
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch units');
    }
  } catch (err: unknown) {
    // Type assertion to access message safely
    if (err instanceof Error) {
      console.error('Error fetching units with flag:', err.message);
      throw err;
    } else {
      console.error('Unknown error fetching units with flag');
      throw new Error('Unknown error');
    }
  }
};

// -------- Feed type --------
export interface Feed {
  feedId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// -------- Feed API Response type --------
interface FeedApiResponse {
  status: string;
  message: string;
  data: Feed[];
}

// -------- API Function --------
export const getFeedsWithFlag = async (): Promise<Feed[]> => {
  try {
    const response = await api.get<FeedApiResponse>(
      'api/Master/get-feeds-with-flag',
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch feeds');
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching feeds with flag:', err.message);
      throw err;
    } else {
      console.error('Unknown error fetching feeds with flag');
      throw new Error('Unknown error');
    }
  }
};

// -------- Employee Type --------
export interface EmployeeTypeApi {
  employeeTypeId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// -------- Employee API Response --------
interface EmployeeApiResponse {
  status: string;
  message: string;
  data: EmployeeTypeApi[];
}

// -------- API Function --------
export const getEmployeeTypesWithFlag = async (): Promise<
  EmployeeTypeApi[]
> => {
  try {
    const response = await api.get<EmployeeApiResponse>(
      'api/Master/get-employee-types-with-flag',
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch employee types',
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error fetching employee types with flag:', err.message);
      throw err;
    } else {
      console.error('Unknown error fetching employee types with flag');
      throw new Error('Unknown error');
    }
  }
};

// Raw API response type
export interface VaccineApi {
  vaccineId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// UI-friendly type for toggling status in DataCard
export interface VaccineType {
  id: string; // string for UI
  vaccineNo: number;
  vaccineName: string;
  status: 'Active' | 'Inactive';
}


export const getVaccinesWithFlag = async (): Promise<VaccineApi[]> => {
  try {
    const response = await api.get('api/Master/get-vaccine-with-flag');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vaccines with flag:', error);
    throw error;
  }
};






// ================= UPDATE EGG UNIT STATUS =================
export const updateUnitIsActive = async (
  unitId: number,
  isActive: boolean
): Promise<void> => {
  try {
    await api.put(
      `api/Master/update-unit-isActive/${unitId}`,
      null,
      {
        params: { isActive },
      }
    );
  } catch (error) {
    console.error('Error updating unit status:', error);
    throw error;
  }
};



export const deleteEggUnit = async (unitId: number): Promise<void> => {
  try {
    const response = await api.delete(
      `api/Master/delete-unit${unitId}`
    );
    console.log(' Delete success:', response.status);
  } catch (error: any) {
    console.error(' Delete API error');
    console.error(' status:', error?.response?.status);
    console.error(' data:', error?.response?.data);
    console.error(' message:', error.message);
    throw error;
  }
};




// ================= ADD EGG UNIT =================
export interface AddUnitPayload {
  value: string;
  productTypeId: number; // For Egg, pass 1
  description?: string | null;
}

export interface AddUnitResponse {
  status: string;
  message: string;
  data: {
    unitId: number;
    value: string;
    productTypeId: number;
    productType: string;
    isActive: boolean;
  };
}

export const addEggUnit = async (
  payload: AddUnitPayload
): Promise<AddUnitResponse> => {
  try {
    const response = await api.post<AddUnitResponse>(
      'api/Master/add-unit',
      payload
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add unit');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding Egg unit:', error.message);
      throw error;
    } else {
      console.error('Unknown error adding Egg unit');
      throw new Error('Unknown error');
    }
  }
};




// Add Feed API
interface AddFeedPayload {
  name: string;
}

interface AddFeedResponse {
  status: string;
  message: string;
  data: {
    feedId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
}

export const addFeed = async (payload: AddFeedPayload): Promise<AddFeedResponse> => {
  try {
    const response = await api.post<AddFeedResponse>('api/Master/add-feed', payload);
    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add feed');
    }
  } catch (error: any) {
    console.error('Error adding feed:', error);
    throw error;
  }
};



// Delete Feed API
export const deleteFeed = async (feedId: number): Promise<void> => {
  try {
    // Make DELETE request
    await api.delete(`api/Master/delete-feed${feedId}`);
    console.log(`Feed with ID ${feedId} deleted successfully`);
  } catch (error: any) {
    console.error('Error deleting feed:', error?.response?.data || error.message);
    throw error;
  }
};



export interface EmployeeTypePayload {
  name: string;
}

export interface EmployeeTypeResponse {
  employeeTypeId: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// ===== ADD EMPLOYEE TYPE =====
export const addEmployeeType = async (
  payload: EmployeeTypePayload
): Promise<{ status: string; message: string; data: EmployeeTypeResponse }> => {
  try {
    const response = await api.post(`api/Master/add-employee-type`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Failed to add employee type:', error.response || error.message);
    throw error;
  }
};



// ===== DELETE EMPLOYEE TYPE =====
export const deleteEmployeeType = async (employeeTypeId: number) => {
  try {
    const response = await api.delete(`api/Master/delete-employee-type${employeeTypeId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to delete employee type:', error.response || error.message);
    throw error;
  }
};




// ================= UPDATE EMPLOYEE TYPE STATUS =================
export const updateEmployeeTypeIsActive = async (
  employeeTypeId: number,
  isActive: boolean
): Promise<void> => {
  try {
    await api.put(
      `api/Master/update-employee-type-isActive/${employeeTypeId}`,
      null,
      {
        params: { isActive },
      }
    );
    console.log(`EmployeeType ID ${employeeTypeId} updated to ${isActive ? 'Active' : 'Inactive'}`);
  } catch (error: any) {
    console.error('Error updating employee type status:', error?.response?.data || error.message);
    throw error;
  }
};


// ================= UPDATE FEED STATUS =================
export const updateFeedIsActive = async (
  feedId: number,
  isActive: boolean
): Promise<void> => {
  try {
    await api.put(
      `api/Master/update-feed-isActive/${feedId}`,
      null,
      {
        params: { isActive },
      }
    );
    console.log(`Feed ID ${feedId} updated to ${isActive ? 'Active' : 'Inactive'}`);
  } catch (error: any) {
    console.error('Error updating feed status:', error?.response?.data || error.message);
    throw error;
  }
};




// ================= ADD VACCINE =================
export interface AddVaccinePayload {
  name: string;
}

export interface AddVaccineResponse {
  status: string;
  message: string;
  data: {
    vaccineId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
}

export const addVaccine = async (
  payload: AddVaccinePayload
): Promise<AddVaccineResponse> => {
  try {
    const response = await api.post<AddVaccineResponse>(
      'api/Master/add-vaccine',
      payload
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add vaccine');
    }
  } catch (error: any) {
    console.error('Error adding vaccine:', error?.response?.data || error.message);
    throw error;
  }
};




// ================= DELETE VACCINE =================
export const deleteVaccine = async (vaccineId: number): Promise<void> => {
  try {
    await api.delete(`api/Master/delete-vaccine${vaccineId}`);
    console.log(`Vaccine ID ${vaccineId} deleted successfully`);
  } catch (error: any) {
    console.error(
      'Error deleting vaccine:',
      error?.response?.data || error.message
    );
    throw error;
  }
};




export const updateVaccineIsActive = async (vaccineId: number, isActive: boolean) => {
  try {
    const response = await api.put(
      `api/Master/update-vaccine-isActive/${vaccineId}?isActive=${isActive}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update vaccine status:', error);
    throw error;
  }
};



// edit


interface EditUnitPayload {
  unitId: number;
  value: string;
  productTypeId: number;
}


interface EditUnitApiResponse {
  status: string;
  message: string;
  data: {
    unitId: number;
    value: string;
    productTypeId: number;
    isActive: boolean;
  };
}

export const editUnit = async (
  payload: EditUnitPayload,
): Promise<EditUnitApiResponse> => {
  try {
    const response = await api.put<EditUnitApiResponse>(
      'api/Master/edit-unit',
      payload,
    );

    return response.data; 
  } catch (err: any) {
    console.error(
      'Error editing unit:',
      err?.response?.data || err.message,
    );
    throw err;
  }
};



// Interface for payload
interface EditFeedPayload {
  feedId: number;
  name: string;
}

// Interface for API response
interface EditFeedApiResponse {
  status: string;
  message: string;
  data: {
    feedId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
}

// API function
export const editFeed = async (
  payload: EditFeedPayload,
): Promise<EditFeedApiResponse> => {
  try {
    const response = await api.put<EditFeedApiResponse>(
      'api/Master/update-feed',
      payload,
    );

    return response.data; 
  } catch (err: any) {
    console.error(
      'Error editing feed:',
      err?.response?.data || err.message,
    );
    throw err;
  }
};


// Payload interface
interface EditEmployeePayload {
  employeeTypeId: number;
  name: string;
}

// API response interface
interface EditEmployeeApiResponse {
  status: string;
  message: string;
  data: {
    employeeTypeId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
}

// API function
export const editEmployeeType = async (
  payload: EditEmployeePayload,
): Promise<EditEmployeeApiResponse> => {
  try {
    const response = await api.put<EditEmployeeApiResponse>(
      'api/Master/edit-employee-type',
      payload,
    );

    return response.data; 
  } catch (err: any) {
    console.error(
      'Error editing employee type:',
      err?.response?.data || err.message,
    );
    throw err;
  }
};



// Payload interface
interface EditVaccinePayload {
  vaccineId: number;
  name: string;
}

// API response interface
interface EditVaccineApiResponse {
  status: string;
  message: string;
  data: {
    vaccineId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
}

// API function
export const editVaccine = async (
  payload: EditVaccinePayload,
): Promise<EditVaccineApiResponse> => {
  try {
    const response = await api.put<EditVaccineApiResponse>(
      'api/Master/update-vaccine',
      payload,
    );

    return response.data; 
  } catch (err: any) {
    console.error(
      'Error editing vaccine:',
      err?.response?.data || err.message,
    );
    throw err;
  }
};
