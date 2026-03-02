import api from '../api/Api';

export interface GetLedgersPayload {
  businessUnitId: string;
  searchKey: string | null;
  dateTime: string | null;
  pageNumber: number;
  pageSize: number;
  partyId?: string | null; // optional filter
}

export interface LedgerItem {
  voucherId: string;
  voucherTypeId: number;
  voucherType: string;
  voucherNumber: string;
  voucherDate: string;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
  voucherEntryId: string;
  accountHeadId: string;
  accountHead: string;
  debit: number;
  credit: number;
  balance: number;
}

// Inner data
export interface GetLedgersResponse {
  totalCount: number;
  totalCredit: number;
  totalDebit: number;
  list: LedgerItem[];
}

// Generic API response wrapper
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const getLedgersWithBalance = async (
  payload: GetLedgersPayload
): Promise<GetLedgersResponse> => {
  try {
    const response = await api.post<ApiResponse<GetLedgersResponse>>(
      'api/Voucher/get-ledgers-with-balance-by-search-and-filter-with-pagination',
      payload
    );

    console.log('Fetched Ledgers:', response.data);

    if (response.data.status === 'Success') {
      return response.data.data; // ✅ now TypeScript knows `data` exists
    } else {
      throw new Error(response.data.message || 'Failed to fetch ledgers');
    }
  } catch (error: any) {
    console.error('Fetch Ledgers Error:', error.response || error.message);
    throw error;
  }
};

// --- Parties API (already correct) ---

export interface GetPartiesPayload {
  businessUnitId: string;
  partyTypeId?: number; // 0 = Customer, 1 = Supplier
}

export interface PartyItem {
  partyId: string;
  name: string;
  partyTypeId: number;
  partyType: string;
}

export interface GetPartiesResponse {
  status: string;
  message: string;
  data: PartyItem[];
}

export const getParties = async (
  payload: GetPartiesPayload
): Promise<PartyItem[]> => {
  try {
    const response = await api.get<ApiResponse<PartyItem[]>>('api/Master/get-parties', {
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