import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { useBusinessUnit } from "../../../context/BusinessContext";
import { FeedConsumptionRecord, getFeedConsumptionRecords } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getFlocks } from "../../../services/FlockService";
import AddModal from "../../../components/customPopups/AddModal";

interface Flock {
    flockId: string;
    flockRef: string;
    breed: string;
    remainingQuantity: number;
}
const FeedConsumptionScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();
    const [data, setData] = useState<FeedConsumptionRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState<string>("");
    const [flocks, setFlocks] = useState<
        { label: string; value: string; isSelected?: boolean }[]
    >([]);
    const [showFeedModal, setShowFeedModal] = useState(false);

    const fetchFeedConsumption = async (
        search: string = searchKey,
        flockId: string | null = null
    ) => {
        try {
            setLoading(true);

            const payload = {
                businessUnitId,
                pageNumber: 1,
                pageSize: 10,
                searchKey: search || null,
                flockId: flockId,
                supplierId: null,
            };

            const res = await getFeedConsumptionRecords(payload);

            const mappedData = res.list.map((item: any) => ({
                ref: item.ref,
                flock: item.flockRef,
                feedName: item.feed,
                date: item.date,
                totalBag: item.totalQuantity,
                bag: item.quantity,
            }));

            setData(mappedData);
        } catch (error) {
            console.log("Feed Consumption Screen Error:", error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchFeedConsumption();
            fetchFlocks();
        }, [businessUnitId])
    );
    // ===== FETCH FLOCKS =====
    const fetchFlocks = async () => {
        if (!businessUnitId) return;

        try {
            const res: Flock[] = await getFlocks(businessUnitId);
            const dropdownData = res.map(f => ({
                label: f.flockRef,
                value: f.flockId,
                isSelected: false,
            }));
            setFlocks(dropdownData);
        } catch (error) {
            console.error("Failed to fetch flocks:", error);
        }
    };
    const columns: TableColumn[] = [
        { key: "ref", title: "REF", width: 140, isTitle: true },
        { key: "flock", title: "FLOCK", width: 160 },
        { key: "feedName", title: "FEED NAME", width: 140 },
        {
            key: "date",
            title: "DATE",
            width: 120,
            render: (value) => {
                const d = new Date(value);
                const day = d.getDate().toString().padStart(2, "0");
                const month = (d.getMonth() + 1).toString().padStart(2, "0");
                const year = d.getFullYear();
                return <Text>{`${day}/${month}/${year}`}</Text>;
            },
        },
        { key: "totalBag", title: "TOTAL BAG", width: 120 },
        { key: "bag", title: "BAG", width: 80 },
    ];

    return (
        <View style={styles.container}>
            <BackArrow
                title="Feed Consumption"
                showBack
                onAddNewPress={() => setShowFeedModal(true)}
                onReportPress={() => console.log("Generate Report")}
            />
            <View style={styles.filterRow}>
                {/* SEARCH */}
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search feed..."
                        onSearch={(val) => {
                            setSearchKey(val);
                            fetchFeedConsumption(val,);
                        }}
                    />
                </View>
                {/* SUPPLIER DROPDOWN */}
                <View style={{ width: 120, marginLeft: 10 }}>
                    <Dropdown
                        style={styles.dropdown}
                        data={flocks}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Flock"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        value={flocks.find(f => f.isSelected)?.value}
                        onChange={(item) => {
                            const updated = flocks.map(f => ({
                                ...f,
                                isSelected: f.value === item.value,
                            }));

                            setFlocks(updated);
                            fetchFeedConsumption(searchKey, item.value);
                        }}
                    />
                </View>
            </View>
            {/* RIGHT SIDE: RESET FILTER */}
            {flocks.some(f => f.isSelected) && (
                <Text
                    style={styles.resetText}
                    onPress={() => {
                        const reset = flocks.map(f => ({
                            ...f,
                            isSelected: false,
                        }));

                        setFlocks(reset);
                        fetchFeedConsumption("", null);
                    }}
                >
                    Reset Filters
                </Text>
            )}
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
                <DataCard
                    columns={columns}
                    data={data}
                    itemsPerPage={5}
                />
            </View>

            <LoadingOverlay visible={loading} />
         
        </View>
    );
};

export default FeedConsumptionScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
        padding: 16
    },

    dropdown: {
        height: 40,
        borderColor: Theme.colors.success,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: Theme.colors.white,
    },
    placeholderStyle: {
        fontSize: 12,
        color: Theme.colors.black,
    },
    selectedTextStyle: {
        fontSize: 13,
        color: Theme.colors.black,
    },
    resetText: {
        color: Theme.colors.error,
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 250,
    },
});
