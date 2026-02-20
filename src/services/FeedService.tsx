import api from '../api/Api';

export interface FeedRecord {
  feedRecordId: string;
  feed: string;
  feedType: string;
  supplier: string;
  date: string;
  quantity: number;
  price: number;
}

export interface GetFeedRecordPayload {
  businessUnitId: string;
  pageNumber: number;
  pageSize: number;
  searchKey?: string | null;
  supplierId?: string | null;
}

export const getFeedRecords = async (payload: GetFeedRecordPayload) => {
  try {
    const response = await api.post(
      'api/FeedRecord/get-feed-record-by-search-and-filter-with-pagination',
      payload,
    );

    return response.data.data;
    // { totalCount, list }
  } catch (error) {
    console.log('Get Feed Records Error:', error);
    throw error;
  }
};

/* ===== MODELS ===== */
export interface FeedConsumptionRecord {
  feedRecordConsumptionId: string;
  ref: string;
  flockRef: string;
  feed: string;
  date: string;
  totalQuantity: number;
  quantity: number;
}

export interface GetFeedConsumptionPayload {
  businessUnitId: string;
  pageNumber: number;
  pageSize: number;
  searchKey?: string | null;
  flockId?: string | null;
  supplierId?: string | null;
}

/* ===== API CALL ===== */
export const getFeedConsumptionRecords = async (
  payload: GetFeedConsumptionPayload,
) => {
  try {
    const response = await api.post(
      'api/FeedRecordConsumption/get-feed-record-consumption-by-search-and-filter-with-pagination',
      payload,
    );

    return response.data.data;
    // { totalCount, list }
  } catch (error) {
    console.log('Get Feed Consumption Error:', error);
    throw error;
  }
};

/* ===== MODEL ===== */
export interface FeedStock {
  feedId: number;
  feed: string;
  totalPurchased: number;
  totalConsumed: number;
  availableStock: number;
}

/* ===== API CALL ===== */
export const getFeedStock = async (businessUnitId: string) => {
  try {
    const response = await api.get(
      `api/FeedRecord/get-feed-stock/${businessUnitId}`,
    );

    return response.data.data as FeedStock[];
  } catch (error) {
    console.log('Get Feed Stock Error:', error);
    throw error;
  }
};

// Function to get feeds from API
export const getFeeds = async (): Promise<
  { label: string; value: number }[]
> => {
  try {
    const res = await api.get('api/Master/get-feeds');

    if (res.data.status === 'Success' && Array.isArray(res.data.data)) {
      return res.data.data.map((feed: any) => ({
        label: feed.name,
        value: feed.feedId.toString(),
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.log('Error fetching feeds:', error);
    return [];
  }
};

export interface FeedTypeItem {
  label: string;
  value: number;
}

export const getFeedTypes = async (): Promise<FeedTypeItem[]> => {
  try {
    const res = await api.get('api/Master/get-feed-types');
    if (res.data.status === 'Success' && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => ({
        label: item.feedType,
        value: item.feedTypeId,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.log('Error fetching feed types:', error);
    return [];
  }
};

export interface AddFeedRecordPayload {
  businessUnitId: string;
  feedId: number;
  feedTypeId: number;
  supplierId: string;
  quantity: number;
  price: number;
  date: string;
  expiryDate: string;
  note?: string;
  isPaid: boolean;
}

export interface AddFeedRecordResponse {
  status: string;
  message: string;
  data: any;
}

export const addFeedRecord = async (
  payload: AddFeedRecordPayload,
): Promise<AddFeedRecordResponse> => {
  try {
    const res = await api.post('api/FeedRecord/add-feed-record', payload);
    return res.data;
  } catch (error) {
    console.log('Add Feed Record Error:', error);
    throw error;
  }
};

export interface AddFeedConsumptionPayload {
  businessUnitId: string;
  flockId: string;
  feedId: number;
  quantity: number;
  price: number;
  date: Date | string;
}

export const addFeedConsumption = async (
  payload: AddFeedConsumptionPayload,
) => {
  const response = await api.post(
    'api/FeedRecordConsumption/add-feed-record-consumption',
    {
      businessUnitId: payload.businessUnitId,
      flockId: payload.flockId,
      feedId: payload.feedId,
      quantity: payload.quantity,
      price: payload.price,
      date:
        typeof payload.date === 'string'
          ? payload.date
          : payload.date.toISOString().split('T')[0],
    },
  );

  return response.data;
};

export const deleteFeedRecord = async (feedRecordId: string) => {
  try {
    const response = await api.delete(
      `api/FeedRecord/delete-feed-record?feedRecordId=${feedRecordId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Delete Feed Record Error:', error);
    throw error;
  }
};

export const deleteFeedConsumption = async (
  feedRecordConsumptionId: string,
) => {
  try {
    const response = await api.delete(
      `api/FeedRecordConsumption/delete-feed-record-consumption/${feedRecordConsumptionId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Delete Feed Consumption Error:', error);
    throw error;
  }
};

//for update

export interface UpdateFeedConsumptionPayload {
  feedRecordConsumptionId: string;
  businessUnitId: string;
  flockId: string;
  date: string;
  feedId: number;
  quantity: number;
}

export const updateFeedConsumption = async (
  payload: UpdateFeedConsumptionPayload,
) => {
  try {
    const response = await api.put(
      'api/FeedRecordConsumption/update-feed-record-consumption',
      payload,
    );
    return response.data;
  } catch (error) {
    console.log('Update Feed Consumption Error:', error);
    throw error;
  }
};

export const deleteFeedRecordConsumption = async (
  feedRecordConsumptionId: string,
) => {
  try {
    const response = await api.delete(
      `api/FeedRecordConsumption/delete-feed-record-consumption/${feedRecordConsumptionId}`,
    );

    return response.data;
  } catch (error) {
    console.log('Delete Feed Record Consumption Error:', error);
    throw error;
  }
};
