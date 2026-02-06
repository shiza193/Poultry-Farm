import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import {
    getPayablesAndReceivables,
    PayablesReceivablesItem,
    PayablesReceivablesPayload,
} from "../../services/VoucherService";
import { useBusinessUnit } from "../../context/BusinessContext";
import { useFocusEffect } from "@react-navigation/native";
import SearchBar from "../../components/common/SearchBar";
import DateTimePicker from "@react-native-community/datetimepicker";
import BackArrow from "../../components/common/ScreenHeaderWithBack";

const PayablesScreen = () => {
    const { businessUnitId } = useBusinessUnit();
    const [payables, setPayables] = useState<PayablesReceivablesItem[]>([]);
    const [loading, setLoading] = useState(false);
    // Filters
    const [searchKey, setSearchKey] = useState<string>("");
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    // Table columns
    const columns: TableColumn[] = [
        { key: "accountHeadName", title: "ACCOUNT", isTitle: true, width: 150 },
        { key: "status", title: "TYPE", width: 80 },
        {
            key: "balance",
            title: "PAYABLE BALANCE",
            width: 140,
            render: (val: number) => (
                <Text>
                    {val.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{" "}
                    <Text style={{ fontWeight: "bold" }}>DR</Text>
                </Text>
            ),
        },
    ];

    // Fetch API data
    const fetchPayables = async () => {
        if (!businessUnitId) return;
        setLoading(true);
        try {
            const payload: PayablesReceivablesPayload = {
                searchKey: searchKey || null,
                dateTime: filterDate ? filterDate.toISOString() : new Date().toISOString(),
                businessUnitId,
                balanceTypeId: 1,
                pageNumber: 1,
                pageSize: 100,
            };
            const response = await getPayablesAndReceivables(payload);
            setPayables(response.data.list);
        } catch (error) {
            console.error("Failed to fetch payables:", error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchPayables();
        }, [businessUnitId, searchKey, filterDate])
    );
    const resetFilters = () => {
        setSearchKey("");
        setFilterDate(null);
    };
    return (
        <View style={styles.container}>
            <BackArrow title="Payables" showBack />

            {/* Filters row */}
            <View style={styles.filtersRow}>
                {/* Search bar */}
                <View style={{ flex: 1, marginRight: 8, }}>
                    <SearchBar
                        placeholder="Search account..."
                        initialValue={searchKey}
                        onSearch={(val) => setSearchKey(val)}
                    />
                </View>

                {/* Date filter + Reset button column */}
                <View style={{ width: 120, flexDirection: "column", marginRight: 10 }}>
                    {/* Date filter */}
                    <TouchableOpacity
                        style={styles.dateFilterContainer}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.dateLabel}>Date: </Text>
                        <Text style={styles.dateFilterText}>
                            {filterDate ? filterDate.toLocaleDateString("en-GB") : "DD/MM/YYYY"}
                        </Text>
                        {showPicker && (
                            <DateTimePicker
                                value={filterDate || new Date()}
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                onChange={(event, selectedDate) => {
                                    if (Platform.OS === "android") {
                                        setShowPicker(false);
                                        if (event.type === "set" && selectedDate) {
                                            setFilterDate(selectedDate);
                                        }
                                    } else {
                                        if (selectedDate) setFilterDate(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </TouchableOpacity>

                    {/* Reset filter */}
                    {filterDate && (
                        <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
                            <Text style={styles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <DataCard columns={columns} data={payables} itemsPerPage={5} />
            </View>
            <LoadingOverlay visible={loading} />
        </View>
    );
};

export default PayablesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    filtersRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dateContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        marginRight: 4,
    },
    dateFilterContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: Theme.colors.white,
        marginRight: 5,
    },
    dateLabel: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
    },
    dateFilterText: {
        fontSize: 14,
        color: Theme.colors.success,
        fontWeight: "bold",
        marginLeft: 4,
    },
    resetBtn: {
        paddingVertical: 6,
        backgroundColor: Theme.colors.white,
        alignItems: "center",
    },
    resetText: {
        color: Theme.colors.error,
        fontWeight: "bold",
    },
});
