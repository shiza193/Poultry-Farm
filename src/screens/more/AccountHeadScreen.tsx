import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Theme from "../../theme/Theme";

import BackArrow from "../../components/common/BackArrow";
import SearchBar from "../../components/common/SearchBar";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";

import { getAccountHeads } from "../../services/AccountHeadService";
import { useBusinessUnit } from "../../context/BusinessContext";

// AccountHead type
export interface AccountHead {
  accountHeadId: string;
  name: string;
  code: string;
  type: string | null;
  createdBy: string;
  createdAt: string;
}

// ================= MAIN SCREEN =================
const AccountHeadScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const [data, setData] = useState<AccountHead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 10; // show 10 per page

  const loadData = useCallback(
    async (search: string = "", pageNumber: number = 1) => {
      if (!businessUnitId) return; // wait for BU ID
      setLoading(true);

      try {
        const response = await getAccountHeads({
          search,
          page: pageNumber,
          pageSize,
          filters: { businessUnitId },
        });

        console.log("Fetched page:", pageNumber, "Response:", response);

        if (response.status === "Success") {
          setData(response.list);
          setTotalCount(response.totalCount);
          setPage(pageNumber);
        } else {
          setData([]);
          setTotalCount(0);
          console.warn("API warning:", response.message);
        }
      } catch (error) {
        console.error("Error fetching account heads:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [businessUnitId]
  );

  // Load first page initially
  useEffect(() => {
    loadData(searchText, 1);
  }, [loadData]);

  const columns: TableColumn[] = [
    { key: "code", title: "Code", width: 100 },
    { key: "name", title: "Name", width: 150, isTitle: true },
    { key: "createdBy", title: "Created By", width: 150 },
    { key: "createdAt", title: "Created At", width: 220 },
    { key: "type", title: "Type", width: 120 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <BackArrow
        title="Account Head"
        showBack
        onAddNewPress={() => console.log("Add New Pressed")}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder="Search Account Head..."
          initialValue={searchText}
          onSearch={(value: string) => {
            setSearchText(value);
            loadData(value, 1); // start search from page 1
          }}
        />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.success} />
        ) : (
          <DataCard
            columns={columns}
            data={data}
            itemsPerPage={pageSize}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AccountHeadScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.white },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.white,
  },
  content: { flex: 1, paddingHorizontal: 10 },
});
