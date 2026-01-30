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
