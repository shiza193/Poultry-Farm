import api from '../api/Api';

/* ================= TYPES ================= */
export interface GetAccountHeadPayload {
  searchKey: string | null;
  businessUnitId: string | null;
  pageNumber: number;
  pageSize: number;
}

/* ================= GET ACCOUNT HEADS ================= */
export const getAccountHeads = async (
  payload: GetAccountHeadPayload
) => {
  try {
    const response = await api.post(
      'api/AccountHead/get-account-head-by-search-and-filter-with-pagination',
      payload
    );

    console.log('Fetched Account Heads:', response.data);

   
    return response.data.data;
  } catch (error: any) {
    console.error(
      'Fetch Account Heads Error:',
      error.response || error.message
    );
    throw error;
  }
};



/* ================= TYPES ================= */
export interface ParentAccountHead {
  parentAccountHeadId: string;
  name: string;
}


/* ================= GET PARENT ACCOUNT HEADS ================= */
export const getParentAccountHeads = async (
  businessUnitId: string
): Promise<ParentAccountHead[]> => {
  try {
    const response = await api.get(
      'api/Master/get-parent-accounts',
      {
        params: { businessUnitId },
      }
    );

    console.log('Fetched Parent Account Heads:', response.data);

    return response.data.data || [];
  } catch (error: any) {
    console.error(
      'Fetch Parent Account Heads Error:',
      error.response || error.message
    );
    throw error;
  }
};




export interface AddAccountHeadPayload {
  name: string;
  accountType: string;
  isActive: boolean;
  businessUnitId: string; // required
  parentId?: string | null; // optional, agar parent select kar rahe ho
}

export const addAccountHead = async (payload: AddAccountHeadPayload) => {
  try {
    const response = await api.post('api/AccountHead/add-account-head', payload);
    console.log('Add Account Head Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Add Account Head Error:', error.response || error.message);
    throw error;
  }
};
