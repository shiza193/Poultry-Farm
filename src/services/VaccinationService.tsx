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
