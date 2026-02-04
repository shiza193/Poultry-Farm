import api from '../api/Api';
export interface EggSale {
  saleId: string;
  date: string;
  customer: string;
  price: number;
  quantity: number;
  unit:number;
}
export interface GetEggSalesPayload {
  businessUnitId: string;
  customerId?: string | null;
  from?: string | null;
  to?: string | null;
  searchKey?: string | null;
  pageNumber: number;
  pageSize: number;
}
export const getEggSales = async (payload: GetEggSalesPayload): Promise<EggSale[]> => {
  try {
    const response = await api.post('api/Sale/get-sale-by-search-and-filter-with-pagination', payload);
    if (response.data.status === 'Success') {
      return response.data.data.list.map((item: any) => ({
        saleId: item.saleId,
        date: item.date,
        customer: item.customer,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Get Egg Sales Error:', error);
    return [];
  }
};

export interface EggStock {
  unitId: number;
  unit: string;
  totalProduced: number;
  totalSold: number;
  availableStock: number;
}

export const getEggStock = async (businessUnitId: string): Promise<EggStock[]> => {
  try {
    const response = await api.get(`api/EggProduction/get-egg-stock?businessUnitId=${businessUnitId}`);
    if (response.data.status === 'Success') {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Get Egg Stock Error:', error);
    return [];
  }
};

export interface EggProduction {
  eggProductionId: string;
  ref: string;
  refCount: number;
  flockId: string;
  flockRef: string;
  businessUnitId: string;
  businessUnitName: string;
  totalEggs: number;
  fertileEggs: number;
  brokenEggs: number;
  date: string;
  unitId: number;
  unit: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  ownerId: string;
}

export interface GetEggProductionPayload {
  businessUnitId: string;
  flockId?: string | null;
  searchKey?: string | null;
  pageNumber: number;
  pageSize: number;
}

export const getEggProduction = async (
  payload: GetEggProductionPayload
): Promise<EggProduction[]> => {
  try {
    const response = await api.post(
      'api/EggProduction/get-eggProduction-by-search-and-filter-with-pagination',
      payload
    );
    if (response.data.status === 'Success') {
      return response.data.data.list;
    }
    return [];
  } catch (error) {
    console.error('Get Egg Production Error:', error);
    return [];
  }
};

export const getCustomers = async (businessUnitId: string) => {
  try {
    const response = await api.get(
      "api/Master/get-parties",
      {
        params: {
          businessUnitId,
          partyTypeId: 0,
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


export const getUnitsByProductType = async (productTypeId: number) => {
  const response = await api.get(
    `api/Master/get-units?productTypeId=${productTypeId}`
  );
  return response.data.data;
};

export interface AddEggProductionPayload {
  flockId: string;
  businessUnitId: string;
  date: string;
  fertileEggs: number;
  brokenEggs: number;
  totalEggs: number;
  unitId: number;
  varietyId?: string | null;
  typeId?: string | null;
}

export const addEggProduction = async (
  payload: AddEggProductionPayload
) => {
  try {
    const response = await api.post(
      'api/EggProduction/add-eggProduction',
      payload
    );

    console.log(' Egg Production Added:', response.data);
    return response.data;
  } catch (error: any) {
    console.log(' Add Egg Production Error:', error?.response || error);
    throw error;
  }
};

export const getEggProducedUnits = async (flockId: string) => {
  const response = await api.get(
    `api/Master/get-flock-egg-produced-units/${flockId}`
  );
  return response.data.data;
};

export const getFlockTotalEggs = async (flockId: string) => {
  try {
    const response = await api.get(
      `api/EggProduction/Get-flock-total-eggs/${flockId}`
    );
    if (response.data.status === 'Success') {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.log('Error fetching flock eggs:', error);
    return null;
  }
};

export const addEggSale = async (payload: {
  businessUnitId: string;
  customerId: string;
  flockId: string;
  unitId: number;
  price: number;
  date: string;
  saleTypeId: number;
  quantity?: number | null;
  patti?: number | null;
  tray?: number | null;
  eggs?: number | null;
  note?: string | null;
}) => {
  try {
    const response = await api.post(
      "api/Sale/add-sale",
      payload
    );

    console.log("Add Sale Response:", response.data);
    return response.data.data;
  } catch (error: any) {
    console.log("Add Sale Error:", error?.response?.data || error);
    throw error;
  }
};

export const deleteEggProduction = async (eggProductionId: string) => {
  try {
    const response = await api.delete(`api/EggProduction/delete-eggProduction/${eggProductionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete Egg Production Error:', error);
    throw error;
  }
};

export interface UpdateEggProductionPayload {
  eggProductionId: string;
  ref: string;
  flockId: string;
  businessUnitId: string;
  unitId: number | null;
  date: string;
  fertileEggs: number;
  brokenEggs: number;
  totalEggs: number;
  typeId?: string | null;
  varietyId?: string | null;
}

export const updateEggProduction = async (
  eggProductionId: string,
  payload: UpdateEggProductionPayload
) => {
  try {
    const response = await api.put(
      `api/EggProduction/update-eggProduction/${eggProductionId}`,
      payload
    );

    console.log(' Update Egg Production Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.log(' Update Egg Production Error:', error?.response || error);
    throw error;
  }
};