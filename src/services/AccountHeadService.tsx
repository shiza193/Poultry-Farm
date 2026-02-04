import api from "../api/Api";

export const getAccountHeads = async ({
  search = "",
  page = 1,
  pageSize = 10, // default page size
  filters = {},
}: {
  search?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
}) => {
  try {
    const response = await api.post(
      "api/AccountHead/get-account-head-by-search-and-filter-with-pagination",
      {
        search,
        page,
        pageSize,
        filters,
      }
    );

    const { data } = response;

    // ✅ Log API response for debugging
    console.log("API Response:", data);

    return {
      status: data.status,
      message: data.message,
      totalCount: data.data?.totalCount || 0,
      list: data.data?.list || [],
    };
  } catch (error: unknown) {
    console.error("Error fetching account heads:", error);

    let message = "Something went wrong";
    if (error instanceof Error) message = error.message;

    return {
      status: "Error",
      message,
      totalCount: 0,
      list: [],
    };
  }
};
