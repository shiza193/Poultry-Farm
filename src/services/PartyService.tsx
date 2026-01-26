import api from '../api/Api';

interface GetPartyPayload {
  searchKey?: string | null;
  isActive?: boolean | null;
  pageNumber: number;
  pageSize: number;
  partyTypeId?: number;
  businessUnitId?: string | null;
}

export const getPartyBySearchAndFilter = async (
  payload: GetPartyPayload
) => {
  try {
    const response = await api.post(
      'api/Party/get-party-by-search-and-filter-with-pagination',
      payload
    );

    if (response.data && response.data.status === 'Success') {
      return response.data.data; 
    }

    console.warn('Unexpected response:', response.data);
    return null;
  } catch (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }
};



interface AddPartyPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string;
  partyTypeId: number;
  businessUnitId: string;
}
export const addParty = async (payload: AddPartyPayload) => {
  try {
    const response = await api.post(
      'api/Party/add-party',
      payload
    );

    if (response.data && response.data.status === 'Success') {
      return response.data.data;
    }

    console.warn('Unexpected response:', response.data);
    return null;
  } catch (error) {
    console.error('Error adding party:', error);
    throw error;
  }
};





export const updatePartyIsActive = async (partyId: string, isActive: boolean) => {
  try {
    const response = await api.put(
      `api/Party/update-party-is-active/${partyId}/${isActive}`
    );

    if (response.data && response.data.status === 'Success') {
      return response.data.data; 
    }

    console.warn('Unexpected response:', response.data);
    return null;
  } catch (error) {
    console.error('Error updating party status:', error);
    throw error;
  }
};




