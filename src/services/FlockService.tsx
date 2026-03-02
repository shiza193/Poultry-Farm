import api from '../api/Api';

export const getFlockByFilter = async (filters: any) => {
  try {
    const payload = {
      searchKey: filters.searchKey || null,
      businessUnitId: filters.businessUnitId || null,
      flockId: filters.flockId || null,
      supplierId: filters.supplierId || null,
      isEnded: filters.isEnded || null,
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
    };

    const response = await api.post(
      `api/Flock/get-flock-by-search-and-filter-with-pagination`,
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch flock data');
    }
  } catch (error) {
    console.error('Error fetching flock data:', error);
    throw error;
  }
};

export const getFlocks = async (businessUnitId: string) => {
  try {
    // Construct query string
    const query = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';

    const response = await api.get(`api/Master/get-flocks${query}`);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch flocks');
    }
  } catch (error) {
    console.error('Error fetching flocks:', error);
    throw error;
  }
};

interface Party {
  partyId: string;
  name: string;
  partyTypeId: number;
  partyType: string;
}

export const getParties = async (
  businessUnitId: string,
  partyTypeId: number,
): Promise<Party[]> => {
  try {
    const query = `?businessUnitId=${businessUnitId}&partyTypeId=${partyTypeId}`;
    const response = await api.get(`api/Master/get-parties${query}`);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch parties');
    }
  } catch (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }
};

export interface FlockType {
  flockTypeId: number;
  name: string;
}

export const getFlockTypes = async (): Promise<FlockType[]> => {
  try {
    const response = await api.get(`api/Master/get-flock-types`);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch flock types');
    }
  } catch (error) {
    console.error('Error fetching flock types:', error);
    throw error;
  }
};

export interface AddFlockPayload {
  businessUnitId: string;
  flockTypeId: number;
  breed: string;
  quantity: number;
  price: number;
  supplierId: string;
  isHen: boolean;
  isPaid: boolean;
  dateOfBirth: string;
  arrivalDate: string;
  weight?: number | null;
}

export interface AddFlockResponse {
  status: string;
  message: string;
  data: any;
}

export const addFlock = async (
  payload: AddFlockPayload,
): Promise<AddFlockResponse> => {
  try {
    const response = await api.post(`api/Flock/add-flock`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Add Flock API Error:', error.response || error.message);
    throw error;
  }
};

export const deleteFlock = async (
  flockId: string,
): Promise<{ status: string; message: string }> => {
  try {
    if (!flockId) throw new Error('Flock ID is required');

    const response = await api.delete(`api/Flock/delete-flock/${flockId}`);

    if (response.data.status === 'Success') {
      return { status: 'Success', message: 'Flock deleted successfully' };
    } else {
      throw new Error(response.data.message || 'Failed to delete flock');
    }
  } catch (error: any) {
    console.error('Delete Flock API Error:', error.response || error.message);
    throw error;
  }
};

export interface FlockHealthRecord {
  flockHealthId: string;
  quantity: number;
  date: string;
  flockId: string;
  flock: string;
  createdBy: string;
  createdAt: string;
  ownerId: string;
  remainingQuantity: number;
  flockRemainingQuantity: number;
  flockHealthStatusId: number;
  flockHealthStatus: string;
}

export interface FlockHealthResponse {
  status: string;
  message: string;
  data: {
    flockId: string | null;
    totalQuantity: number;
    expireQuantity: number;
    remainingQuantity: number;
    data: FlockHealthRecord[];
  };
}

export const getFlockHealthRecords = async (
  businessUnitId: string,
  flockHealthStatusId?: number,
): Promise<FlockHealthResponse> => {
  try {
    const payload: any = { businessUnitId };

    if (flockHealthStatusId !== undefined) {
      payload.flockHealthStatusId = flockHealthStatusId;
    }

    const response = await api.post(
      'api/Flock/get-flock-health-records',
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch flock health records',
      );
    }
  } catch (error: any) {
    console.error(
      'Error fetching flock health records:',
      error.response || error.message,
    );
    throw error;
  }
};

// ================= Delete Flock Health Record =================
// export const deleteFlockHealthRecord = async (flockHealthId: string): Promise<void> => {
//   try {
//     // Send DELETE request with FlockHealthId as query param
//     const response = await api.delete(`api/Flock/delete-flock-health-record?FlockHealthId=${flockHealthId}`);

//     if (response.data.status === 'Success') {
//       console.log('Flock health record deleted successfully.');
//     } else {
//       throw new Error(response.data.message || 'Failed to delete flock health record.');
//     }
//   } catch (error: any) {
//     console.error('Error deleting flock health record:', error.response || error.message);
//     throw error;
//   }
// };

// Flock card api

export interface Feed {
  feedId: number;
  name: string;
}

export const getFeeds = async (): Promise<Feed[]> => {
  try {
    const response = await api.get(`api/Master/get-feeds`);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch feeds');
    }
  } catch (error: any) {
    console.error('Error fetching feeds:', error.response || error.message);
    throw error;
  }
};

export interface AutoFeedRecordPayload {
  flockId: string;
  feedId: number;
  quantity: number;
  businessUnitId: string;
  date?: string;
}

export interface AutoFeedRecordData {
  feedRecordConsumptionId: string;
  ref: string;
  flockId: string;
  flockRef: string;
  breed: string;
  date: string;
  quantity: number;
  totalQuantity: number;
  businessUnitId: string;
  businessUnit: string;
  feedId: number;
  feed: string;
}

export interface AutoFeedRecordResponse {
  status: string;
  message: string;
  data: AutoFeedRecordData;
}

export const addAutomaticFeedRecord = async (
  payload: AutoFeedRecordPayload,
): Promise<AutoFeedRecordResponse> => {
  try {
    const response = await api.post(
      'api/FeedRecordConsumption/add-automatically-feed-record-consumption',
      payload,
    );

    // Navigate the nested data structure returned by your API
    const responseData = response.data?.data?.value;

    if (responseData?.status === 'Success') {
      return {
        status: responseData.status,
        message: responseData.message,
        data: responseData.data,
      };
    } else {
      throw new Error(
        responseData?.message || 'Failed to add feed record consumption',
      );
    }
  } catch (error: any) {
    console.error(
      'Add Automatic Feed Record API Error:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface CalculateFCRPayload {
  flockId: string;
  currentWeight: number;
}

export interface CalculateFCRResponse {
  fcr: number;
  message: string;
}

export const calculateFCR = async (
  payload: CalculateFCRPayload,
): Promise<CalculateFCRResponse> => {
  try {
    const response = await api.post('api/Flock/calculate-FCR', payload);

    if (response.data.status === 'Success') {
      return {
        fcr: response.data.data.fcr,
        message: response.data.data.message,
      };
    } else {
      throw new Error(response.data.message || 'Failed to calculate FCR');
    }
  } catch (error: any) {
    console.error('Calculate FCR API Error:', error.response || error.message);
    throw error;
  }
};

export interface AddFlockHealthRecordPayload {
  flockId: string;
  quantity: number;
  date: string; // format: YYYY-MM-DD
  flockHealthStatusId: number;
}

export interface AddFlockHealthRecordResponse {
  status: string;
  message: string;
  data: {
    flockHealthId: string;
    quantity: number;
    date: string;
    flockId: string;
    flock: string;
    createdBy: string;
    createdAt: string;
    ownerId: string;
    remainingQuantity: number;
    flockRemainingQuantity: number;
    flockHealthStatusId: number;
    flockHealthStatus: string;
  };
}

export const addFlockHealthRecord = async (
  payload: AddFlockHealthRecordPayload,
): Promise<AddFlockHealthRecordResponse> => {
  try {
    const response = await api.post<AddFlockHealthRecordResponse>(
      'api/Flock/add-flock-health-record',
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to add flock health record',
      );
    }
  } catch (error: any) {
    console.error(
      'Add Flock Health Record API Error:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface AddHospitalityPayload {
  flockId: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  averageWeight: number;
  symptoms: string;
  diagnosis: string;
  medication: string;
  dosage: string;
  treatmentDays: number;
  vetName: string;
  remarks?: string | null;
  businessUnitId: string;
}

export interface AddHospitalityResponse {
  status: string;
  message: string;
  data: {
    hospitalityId: string;
    flockId: string;
    flock: string;
    date: string;
    quantity: number;
    averageWeight: number;
    symptoms: string;
    diagnosis: string;
    medication: string;
    dosage: string;
    treatmentDays: number;
    vetName: string;
    remarks?: string | null;
    businessUnitId: string;
    businessUnit: string;
    ownerId: string;
    createdAt: string;
    createdBy: string;
  };
}

export const addHospitality = async (
  payload: AddHospitalityPayload,
): Promise<AddHospitalityResponse> => {
  try {
    const response = await api.post('api/Hospitality/add-hospitality', payload);

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to add hospitality record',
      );
    }
  } catch (error: any) {
    console.error(
      'Add Hospitality API Error:',
      error.response || error.message,
    );
    throw error;
  }
};

/**
 * Update the "isEnded" status of a flock.
 * @param flockId - The UUID of the flock to update
 * @param isEnded - true if the flock is ended, false otherwise
 * @returns Promise<boolean> - true if successfully updated
 */

export const updateFlockIsEnded = async (
  flockId: string,
  isEnded: boolean,
): Promise<boolean> => {
  try {
    if (!flockId) throw new Error('Flock ID is required');

    console.log('Calling API to update isEnded:', flockId, isEnded);

    const response = await api.put(
      `api/Flock/update-flock-isEnded/${flockId}`,
      null,
      { params: { isEnded } },
    );

    console.log('API response:', response.data);

    if (response.data.status === 'Success') {
      return response.data.data; // true
    } else {
      throw new Error(response.data.message || 'Failed to update flock status');
    }
  } catch (error: any) {
    console.error(
      'Update Flock isEnded API Error:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface FlockStock {
  flockId: string;
  flock: string;
  totalPurchased: number;
  totalMortality: number;
  totalHospitality: number;
  totalSale: number;
  isEnded: boolean;
  availableStock: number;
}

export interface FlockStockResponse {
  status: string;
  message: string;
  data: FlockStock[];
}

export const getFlockStock = async (
  businessUnitId: string,
): Promise<FlockStock[]> => {
  try {
    if (!businessUnitId) throw new Error('Business Unit ID is required');

    const response = await api.get<FlockStockResponse>(
      `api/Flock/get-flock-stock/${businessUnitId}`,
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch flock stock');
    }
  } catch (error: any) {
    console.error(
      'Error fetching flock stock:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface SaleRecord {
  saleId: string;
  businessUnitId: string;
  flockId: string;
  flock: string;
  customerId: string;
  customer: string;
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface GetSaleResponse {
  status: string;
  message: string;
  data: {
    totalCount: number;
    list: SaleRecord[];
  };
}

export interface GetSaleFilters {
  searchKey?: string | null;
  businessUnitId?: string | null;
  flockId?: string | null;

  partyId?: string | null;
  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  pageNumber?: number;
  pageSize?: number;
}

export const getSalesByFilter = async (
  filters: GetSaleFilters,
): Promise<{ list: SaleRecord[]; totalCount: number }> => {
  try {
    const payload: any = {
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 50,
    };

    if (filters.businessUnitId) payload.businessUnitId = filters.businessUnitId;
    if (filters.flockId) payload.flockId = filters.flockId;
    if (filters.partyId) payload.partyId = filters.partyId;
    if (filters.startDate) payload.startDate = filters.startDate;
    if (filters.endDate) payload.endDate = filters.endDate;
    if (filters.searchKey) payload.searchKey = filters.searchKey;

    console.log('Payload sent to API:', payload);

    const response = await api.post<GetSaleResponse>(
      'api/Sale/get-sale-by-search-and-filter-with-pagination',
      payload,
    );

    console.log('FULL API RESPONSE:', response.data);

    if (response.data.status === 'Success') {
      return {
        list: response.data.data?.list || [],
        totalCount: response.data.data?.totalCount || 0,
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch sales data');
    }
  } catch (error: any) {
    console.error(
      'Error fetching sales data:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface HospitalityRecord {
  hospitalityId: string;
  flockId: string;
  flock: string;
  date: string;
  quantity: number;
  averageWeight: number;
  symptoms: string;
  diagnosis: string;
  medication: string;
  dosage: string;
  treatmentDays: number;
  vetName: string;
  remarks?: string | null;
  businessUnitId: string;
  businessUnit: string;
  ownerId: string;
  createdAt: string;
  createdBy: string;
}

export interface GetHospitalityResponse {
  status: string;
  message: string;
  data: {
    totalCount: number;
    list: HospitalityRecord[];
  };
}

export interface GetHospitalityFilters {
  businessUnitId?: string | null;
  flockId?: string | null;
  startDate?: string | null; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD
  pageNumber?: number;
  pageSize?: number;
}

// ================== Function ==================
export const getHospitalityByFilter = async (
  filters: GetHospitalityFilters,
): Promise<{ list: HospitalityRecord[]; totalCount: number }> => {
  try {
    const payload = {
      businessUnitId: filters.businessUnitId || null,
      flockId: filters.flockId || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      pageNumber: filters.pageNumber || 1,
      pageSize: filters.pageSize || 10,
    };

    const response = await api.post<GetHospitalityResponse>(
      'api/Hospitality/get-hospitality-by-search-and-filter-with-pagination',
      payload,
    );

    if (response.data.status === 'Success') {
      return {
        list: response.data.data?.list || [],
        totalCount: response.data.data?.totalCount || 0,
      };
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch hospitality data',
      );
    }
  } catch (error: any) {
    console.error(
      'Error fetching hospitality data:',
      error.response || error.message,
    );
    throw error;
  }
};

export interface AddSalePayload {
  customerId: string;
  flockId: string;
  quantity: number;
  saleTypeId: number;
  price: number;
  date: string; // ISO string
  note?: string;
  businessUnitId?: string;
}

export interface AddSaleResponse {
  status: string;
  message: string;
  data: any;
}

export const addSale = async (
  payload: AddSalePayload,
): Promise<AddSaleResponse> => {
  try {
    const response = await api.post<AddSaleResponse>(
      'api/Sale/add-sale',
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add sale');
    }
  } catch (error: any) {
    console.error('Add Sale API Error:', error.response || error.message);
    throw error;
  }
};

// flock detail
export const getFlockDetail = async (flockId: string) => {
  try {
    if (!flockId) {
      throw new Error('flockId is required');
    }

    // Construct query string
    const query = `?flockId=${flockId}`;

    const response = await api.get(`api/Flock/get-flock-detail${query}`);

    if (response.data.status === 'Success') {
      return response.data.data; // The flock details object
    } else {
      throw new Error(response.data.message || 'Failed to fetch flock detail');
    }
  } catch (error) {
    console.error('Error fetching flock detail:', error);
    throw error;
  }
};

export const getFlockSummary = async (
  businessUnitId: string,
  from: string | null = null,
  to: string | null = null,
  flockId: string | null = null,
) => {
  try {
    console.log(
      'Fetching Poultry Farm Summary for BusinessUnit ID:',
      businessUnitId,
      'Flock ID:',
      flockId,
    );

    const payload: any = {
      businessUnitId,
      from,
      to,
    };

    if (flockId) {
      payload.flockId = flockId; // send flockId to API
    }

    // Correct URL now
    const response = await api.post('api/Flock/get-summary', payload);

    console.log('Poultry Farm Summary:', response.data);

    if (response.data && response.data.status === 'Success') {
      return response.data.data;
    }

    console.warn('Unexpected response format:', response.data);
    return null;
  } catch (error: any) {
    console.error('Error fetching Poultry Farm Summary');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }

    throw error;
  }
};

export const getEggProductions = async (flockId: string) => {
  try {
    if (!flockId) throw new Error('Flock ID is required');

    const response = await api.get(
      `api/EggProduction/get-eggProductions/${flockId}`,
    );

    if (response.data.status === 'Success') {
      // Return the array of egg productions directly
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch egg production data',
      );
    }
  } catch (error: any) {
    console.error('Error fetching egg production data:', error);
    throw error;
  }
};

export const getFeedConsumptions = async (flockId: string) => {
  try {
    const response = await api.get(
      `api/FeedRecordConsumption/get-feed-consumptions/${flockId}`,
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching feed consumptions:', error);
    throw error;
  }
};

export const getVaccinationSchedules = async (flockId: string) => {
  try {
    const response = await api.get(
      `api/VaccinationSchedule/get-vaccination-schedules/${flockId}`,
    );

    // API response: { status, message, data }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vaccination schedules:', error);
    throw error;
  }
};

export const getFlockHealthRecord = async (flockId: string) => {
  try {
    const response = await api.post(`api/Flock/get-flock-health-records`, {
      flockId: flockId,
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching flock health records:', error);
    throw error;
  }
};

export const getHospitalities = async (flockId: string) => {
  try {
    const response = await api.get(
      `api/Hospitality/get-hospitalities/${flockId}`,
    );

    // API: { status, message, data: [] }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hospitalities:', error);
    throw error;
  }
};

export const updateFlockDetail = async (flockId: string, payload: any) => {
  try {
    const response = await api.put(
      `api/Flock/update-flock-detail?flockId=${flockId}`,
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Update failed');
    }
  } catch (error) {
    console.error('Error updating flock detail:', error);
    throw error;
  }
};

export const deleteEggProduction = async (eggProductionId: string) => {
  try {
    const response = await api.delete(
      `api/EggProduction/delete-eggProduction/${eggProductionId}`,
    );

    if (response.data.status === 'Success') {
      return response.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to delete egg production',
      );
    }
  } catch (error) {
    console.error('Error deleting egg production:', error);
    throw error;
  }
};

// services/FlockHealthService.ts

export const deleteFlockHealthRecord = async (flockHealthId: string) => {
  try {
    const response = await api.delete(`/api/Flock/delete-flock-health-record`, {
      params: { FlockHealthId: flockHealthId },
    });

    if (response.data?.status === 'Success') {
      return {
        status: 'Success',
        message: response.data.message || 'Health record deleted successfully',
      };
    } else {
      return {
        status: 'Error',
        message: response.data?.message || 'Failed to delete health record',
      };
    }
  } catch (error: any) {
    console.error(
      'Delete Flock Health Record Error:',
      error.response?.data || error.message,
    );
    return {
      status: 'Error',
      message:
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong',
    };
  }
};

export interface UpdateFlockHealthPayload {
  flockHealthId: string;
  quantity: number;
  date: string; // ISO date string
  flockId: string;
  flockHealthStatusId: number;
  remainingQuantity?: number; // optional
  flockRemainingQuantity?: number; // optional
}

export const updateFlockHealth = async (payload: UpdateFlockHealthPayload) => {
  try {
    const response = await api.put(
      'api/Flock/update-flock-health-record',
      payload,
    );

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update flock health');
    }
  } catch (error) {
    console.error('Error updating flock health:', error);
    throw error;
  }
};


 
export const deleteHospitality = async (hospitalityId: string): Promise<{ status: string; message: string }> => {
  try {
    const response = await api.delete(`/api/Hospitality/delete-hospitality/${hospitalityId}`);
    return response.data; // assuming API returns { status: 'Success', message: '...' }
  } catch (error: any) {
    console.error('Delete Hospitality API Error:', error.response || error.message);
    throw error;
  }
};



export interface UpdateHospitalityPayload {
  flockId: string;
  date: string; // ISO string
  quantity: number;
  averageWeight?: number;
  symptoms?: string;
  diagnosis?: string;
  medication?: string;
  dosage?: string;
  treatmentDays?: number;
  vetName?: string;
  remarks?: string | null;
  businessUnitId: string;
}

export interface UpdateHospitalityResponse {
  status: string;
  message: string;
  data: any; 
}

// Update Hospitality function
export const updateHospitality = async (
  hospitalityId: string,
  payload: UpdateHospitalityPayload
): Promise<UpdateHospitalityResponse> => {
  try {
    const response = await api.put(
      `api/Hospitality/update-hospitality`,
      {
        hospitalityId,
        ...payload,
      }
    );
    return response.data;
  } catch (err) {
    console.error('Update Hospitality API Error:', err);
    throw err;
  }
};