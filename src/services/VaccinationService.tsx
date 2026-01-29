import api from '../api/Api';

export interface Vaccination {
  vaccinationId: string;
  vaccineId: number;
  vaccine: string;
  date: string;
  quantity: number;
  price: number;
  supplierId: string;
  supplier: string;
  businessUnitId: string;
  businessUnit: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  ownerId: string;
  remainingQuantity: number | null;
  note: string;
}

export interface VaccinationResponse {
  status: string;
  message: string;
  data: {
    totalCount: number;
    list: Vaccination[];
  };
}

// Fetch vaccinations with search, filter, pagination
export const getVaccinations = async (
  businessUnitId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  searchKey: string | null = null,
  supplierId: string | null = null
): Promise<Vaccination[]> => {
  try {
    const response = await api.post<VaccinationResponse>(
      `api/Vaccination/get-vaccination-by-search-and-filter-with-pagination`,
      {
        businessUnitId,
        pageNumber,
        pageSize,
        searchKey,
        supplierId,
      }
    );

    console.log("🔹 Vaccination API Response:", response.data);

    if (response.data.status === "Success") {
      return response.data.data.list;
    } else {
      console.warn("Vaccination API returned:", response.data.message);
      return [];
    }
  } catch (error: any) {
    console.error("❌ Error fetching vaccinations:", error.response?.data || error.message);
    return [];
  }
};


export const getSuppliers = async (businessUnitId: string) => {
  try {
    const response = await api.get(
      "api/Master/get-parties",
      {
        params: {
          businessUnitId,
          partyTypeId: 1,
        },
      }
    );

    console.log("Supplier API RAW Response:", response.data);

    return response.data.data;
  } catch (error) {
    console.log("Supplier API Error:", error);
    return [];
  }
};


export const getVaccines = async () => {
  try {
    const response = await api.get('api/Master/get-vaccines');
    if (response.data && response.data.status === 'Success') {
      return response.data.data.map((v: any) => ({
        label: v.name,
        value: Number(v.vaccineId), // ✅ number
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    return [];
  }
};

export const addVaccination = async (payload: {
  vaccineId: number;
  date: string;
  quantity: number;
  price: number;
  note: string;
  supplierId: string;
  businessUnitId: string;
  isPaid: boolean;
}) => {
  try {
    const response = await api.post(`api/Vaccination/add-vaccination`, payload);
    return response.data;
  } catch (error: any) {
    console.log("Add Vaccination API error:", error.response || error.message);
    throw error;
  }
};


export const updateVaccination = async (payload: {
  vaccinationId: string;
  vaccineId: number;
  date: string;
  quantity: number;
  price: number;
  note?: string;
  supplierId: string;
  businessUnitId: string;
}) => {
  try {
    const response = await api.put(
      `api/Vaccination/update-vaccination`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error('Update vaccination error:', error);
    throw error?.response?.data || error;
  }
};

// VaccinationService.ts


export const deleteVaccination = async (vaccinationId: string) => {
  try {
    // ✅ Using your axios instance `api`
    const response = await api.delete(`api/Vaccination/delete-vaccination`, {
      params: { vaccinationId },
    });

    return response.data;
  } catch (error: any) {
    console.error("Delete vaccination error:", error.response?.data || error.message);
    throw error;
  }
};

export interface VaccinationSchedule {
  id: string;           
  vaccinationScheduleId: string;
  refCount: number;
  ref: string;
  vaccineId: number;
  vaccine: string;
  businessUnitId: string;
  businessUnitName: string;
  flockId: string;
  flockRef: string;
  scheduledDate: string;
  quantity: number;
  breed: string;
  isVaccinated: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface VaccinationScheduleResponse {
  status: string;
  message: string;
  data: {
    totalCount: number;
    list: VaccinationSchedule[];
  };
}

export interface VaccinationSchedulePayload {
  searchKey?: string | null;
  businessUnitId: string;
  flockId?: string | null;
  pageNumber: number;
  pageSize: number;
}
export const getVaccinationSchedule = async (
  payload: VaccinationSchedulePayload
): Promise<VaccinationScheduleResponse> => {
  const response = await api.post<VaccinationScheduleResponse>(
    `api/VaccinationSchedule/get-vaccination-schedule-by-search-and-filter-with-pagination`,
    payload
  );
  return response.data;
};

export interface VaccinationStock {
  vaccineId: number;
  vaccine: string;
  totalPurchased: number;
  totalSchedule: number;
  availableStock: number;
}

export interface VaccinationStockResponse {
  status: string;
  message: string;
  data: VaccinationStock[];
}

export const getVaccinationStock = async (
  businessUnitId: string
): Promise<VaccinationStock[]> => {
  try {
    const response = await api.get<VaccinationStockResponse>(
      'api/Vaccination/get-vaccination-stock',
      {
        params: { businessUnitId },
      }
    );
    console.log('🔹 Vaccination Stock API Response:', response.data);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      console.warn('Vaccination Stock API returned:', response.data.message);
      return [];
    }
  } catch (error: any) {
    console.error(
      '❌ Error fetching vaccination stock:',
      error.response?.data || error.message
    );
    return [];
  }
};

export const updateVaccinationStatus = async (
  vaccinationScheduleId: string,
  isVaccinated: boolean
): Promise<boolean> => {
  try {
    console.log("➡️ Sending to API:", vaccinationScheduleId, isVaccinated);

    const response = await api.put(
      `api/VaccinationSchedule/update-scheduled-vaccination-status/${vaccinationScheduleId}/${isVaccinated}`
    );

    console.log("✅ API Response:", response.data);
    return response.status === 200;
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.data);
    return false;
  }
};

export const addVaccinationSchedule = async (payload: {
  businessUnitId: string;
  vaccineId: number;
  flockId: string;
  scheduledDate: string;
  quantity: number;
}) => {
  try {
    console.log(" Add Schedule Payload:", payload);

    const response = await api.post(
      "api/VaccinationSchedule/add-vaccination-schedule",
      payload
    );

    console.log(" Add Schedule Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error adding vaccination schedule:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteVaccinationSchedule = async (scheduleId: string) => {
  try {
    const response = await api.delete(
      `api/VaccinationSchedule/delete-vaccination-schedule/${scheduleId}`
    );
    if (response.data?.status === "Success") {
      return {
        status: "Success",
        message: response.data.message || "Schedule deleted successfully",
      };
    } else {
      return {
        status: "Error",
        message: response.data?.message || "Failed to delete schedule",
      };
    }
  } catch (error: any) {
    console.error("❌ Delete Vaccination Schedule Error:", error.response?.data || error.message);
    return {
      status: "Error",
      message: error?.response?.data?.message || error.message || "Something went wrong",
    };
  }
};