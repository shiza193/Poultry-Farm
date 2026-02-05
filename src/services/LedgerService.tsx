import api from '../api/Api';

export interface GetLedgersPayload {
  searchKey: string | null;
  fromDate: string | null;
  toDate: string | null;
  pageNumber: number;
  pageSize: number;
  accountHeadId?: string | null; // optional filter
}

export interface LedgerItem {
  voucherId: string;
  voucherTypeId: number;
  voucherType: string;
  voucherNumber: string;
  voucherDate: string;
  referenceId: string;
  referenceType: string;
  createdAt: string;
  voucherEntryId: string;
  accountHeadId: string;
  accountHead: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GetLedgersResponse {
  totalCount: number;
  totalCredit: number;
  totalDebit: number;
  list: LedgerItem[];
}

export const getLedgersWithBalance = async (
  payload: GetLedgersPayload
): Promise<GetLedgersResponse> => {
  try {
    const response = await api.post(
      'api/Voucher/get-ledgers-with-balance-by-search-and-filter-with-pagination',
      payload
    );

    console.log('Fetched Ledgers:', response.data);

    return response.data.data;
  } catch (error: any) {
    console.error('Fetch Ledgers Error:', error.response || error.message);
    throw error;
  }
};





// Request parameters
export interface GetPartiesPayload {
  businessUnitId: string; 
  partyTypeId?: number;   // 0 = Customer, 1 = Supplier
}

// Response data for each party
export interface PartyItem {
  partyId: string;
  name: string;
  partyTypeId: number;
  partyType: string;
}

// Full API response
export interface GetPartiesResponse {
  status: string;
  message: string;
  data: PartyItem[];
}

// Function to fetch parties
export const getParties = async (
  payload: GetPartiesPayload
): Promise<PartyItem[]> => {
  try {
    const response = await api.get('api/Master/get-parties', {
      params: payload,
    });

    console.log('Fetched Parties:', response.data);

    if (response.data.status === 'Success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch parties');
    }
  } catch (error: any) {
    console.error('Fetch Parties Error:', error.response || error.message);
    throw error;
  }
};
