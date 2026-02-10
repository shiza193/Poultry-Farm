import api from '../api/Api';

export const deleteBusinessUnit = async (businessUnitId: string) => {
  try {
    console.log(' Deleting BusinessUnit ID:', businessUnitId);

    const response = await api.delete(
      `api/BusinessUnit/delete-business-unit${businessUnitId}`,
    );

    console.log(' Status:', response.status);
    console.log(' Data:', response.data);

    return response.data;
  } catch (error: any) {
    console.log(' Delete Business Unit Error');
//agar backend ne error response bheja
    if (error.response) {
      console.log(' Status:', error.response.status);
      console.log(' Data:', error.response.data);
    } else {
      console.log(' Message:', error.message);
    }

    throw error;
  }
};

// ===== ADD BUSINESS UNIT =====

export const addBusinessUnit = async (payload: {
  name: string;
  location: string;
  businessTypeId: number;
}) => {
  try {
    console.log(' ADD BusinessUnit payload:', payload);

    const response = await api.post(
      'api/BusinessUnit/add-business-unit',
      payload,
    );

    console.log('ADD Status:', response.status);
    console.log(' ADD Response:', response.data);

    return response.data;
  } catch (error: any) {
    console.log(' ADD Business Unit ERROR');

    if (error.response) {
      console.log(' Status:', error.response.status);
      console.log(' Data:', error.response.data);
      console.log(' Headers:', error.response.headers);
    } else if (error.request) {
      console.log(' No response received:', error.request);
    } else {
      console.log(' Error message:', error.message);
    }

    throw error;
  }
};

// ===== GET ALL BUSINESS UNITS =====
export const getAllBusinessUnits = async () => {
  try {
    const response = await api.get('api/BusinessUnit/get-all-business-unit');
    console.log(' Fetched Business Units:', response.data);

    return response.data.data;
  } catch (error: any) {
    console.log(' Fetch Business Units Error', error);

    if (error.response) {
      console.log(' Status:', error.response.status);
      console.log(' Data:', error.response.data);
    } else if (error.request) {
      console.log(' No response received:', error.request);
    } else {
      console.log(' Error message:', error.message);
    }

    throw error;
  }
};



// ===== UPDATE BUSINESS UNIT =====
export const updateBusinessUnit = async (
  businessUnitId: string,
  payload: { name: string; location: string; businessTypeId: number }
) => {
  try {
    console.log(' Updating BusinessUnit ID:', businessUnitId, 'Payload:', payload);

    const response = await api.put(
      `api/BusinessUnit/update-business-unit/${businessUnitId}`,
      payload
    );

    console.log(' Update Response:', response.data);
    return response.data; 
  } catch (error: any) {
    console.log(' Update Business Unit Error');

    if (error.response) {
      console.log(' Status:', error.response.status);
      console.log(' Data:', error.response.data);
    } else {
      console.log(' Message:', error.message);
    }

    throw error;
  }
};






export const getBusinessUnits = async () => {
  try {
    // Removed the extra slash
    const response = await api.get('api/Master/get-business-units');

    // Response structure: { status, message, data }
    if (response.data && response.data.status === 'Success') {
      return response.data.data; 
    }

    console.warn('Unexpected response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching business units:', error);
    return [];
  }
};


// ===== GET POULTRY FARM SUMMARY =====
export const getPoultryFarmSummary = async (businessUnitId: string,  from: string | null = null, to: string | null = null) => {
  try {
    console.log(' Fetching Poultry Farm Summary for BusinessUnit ID:', businessUnitId);

    const payload = {
      businessUnitId,
      from,
      to
    };

    const response = await api.post(
      'api/PoultryFarm/get-summary',
      payload
    );

    console.log(' Poultry Farm Summary:', response.data);

    // Ensure the API returns the expected structure
    if (response.data && response.data.status === 'Success') {
      return response.data.data;
    }

    console.warn(' Unexpected response format:', response.data);
    return null;
  } catch (error: any) {
    console.error(' Error fetching Poultry Farm Summary');

    if (error.response) {
      console.error(' Status:', error.response.status);
      console.error(' Data:', error.response.data);
    } else {
      console.error(' Message:', error.message);
    }

    throw error;
  }
};



