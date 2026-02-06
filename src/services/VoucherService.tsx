// services/VoucherService.ts

import api from "../api/Api";

// ✅ Request payload type
export interface PayablesReceivablesPayload {
  searchKey: string | null;
  dateTime: string;
  businessUnitId: string;
  balanceTypeId: number;
  pageNumber: number;
  pageSize: number;
}
// ✅ Response types
export interface PayablesReceivablesItem {
  accountHeadId: string;
  accountHeadName: string;
  partyId: string;
  partyName: string;
  totalCredit: number;
  totalDebit: number;
  balance: number;
  status: string;
  voucherCount: number;
}
export interface PayablesReceivablesResponse {
  status: string;
  message: string;
  data: {
    totalCount: number;
    list: PayablesReceivablesItem[];
  };
}
// ✅ API function
export const getPayablesAndReceivables = async (
  payload: PayablesReceivablesPayload
): Promise<PayablesReceivablesResponse> => {
  try {
    const response = await api.post<PayablesReceivablesResponse>(
      "api/Voucher/get-payables-and-receivables-balance-by-search-and-filter-with-pagination",
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching payables/receivables:", error.response?.data || error.message);
    throw error;
  }
};


// Payload type
export interface VoucherPayload {
    searchKey: string | null;
    businessUnitId: string;
    accountHeadId: string | null;
    voucherTypeId: number | null;
    from: string | null;
    to: string | null;  
    pageNumber: number;
    pageSize: number;
}

// Voucher Entry type
export interface VoucherEntry {
    voucherEntryId: string;
    accountHeadId: string;
    accountHead: string;
    debit: number;
    credit: number;
    description: string;
    createdAt: string;
}

// Voucher type
export interface Voucher {
    voucherId: string;
    voucherNumber: string;
    voucherDate: string;
    businessUnitId: string;
    businessUnit: string;
    voucherTypeId: number;
    voucherType: string;
    referenceId: string;
    referenceType: string;
    createdBy: string;
    createdAt: string;
    description: string;
    voucherEntries: VoucherEntry[];
}

// Response type
export interface VoucherResponse {
    status: string;
    message: string;
    data: {
        totalCount: number;
        list: Voucher[];
        totalAssets: number;
        totalLiabilitiesAndCapital: number;
    };
}

// Function to fetch vouchers
export const getVouchers = async (
    payload: VoucherPayload
): Promise<VoucherResponse> => {
    try {
        const response = await api.post(
            "api/Voucher/get-voucher-by-search-and-filter-with-pagination",
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching vouchers:", error.response || error);
        throw error;
    }
};


export type AccountOption = {
  label: string;
  value: string;
};

export const getAccounts = async (businessUnitId: string) => {
  try {
    const response = await api.get(
      `api/Master/get-accounts?businessUnitId=${businessUnitId}`
    );

    // API response → dropdown format
    const accounts: AccountOption[] = response.data.data.map(
      (item: any) => ({
        label: item.name,
        value: item.accountHeadId,
      })
    );

    return accounts;
  } catch (error) {
    console.error("Get Accounts Error:", error);
    throw error;
  }
};


export type VoucherTypeOption = {
  label: string;
  value: number;
};

export const getVoucherTypes = async (): Promise<VoucherTypeOption[]> => {
  try {
    const response = await api.get("api/Master/get-voucher-types");

    return response.data.data.map((item: any) => ({
      label: item.name,
      value: item.voucherTypeId,
    }));
  } catch (error) {
    console.error("Get Voucher Types Error:", error);
    throw error;
  }
};