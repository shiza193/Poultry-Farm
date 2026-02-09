import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useBusinessUnit } from "../../../context/BusinessContext";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { getFeedRecords, FeedRecord, FeedTypeItem, getFeedTypes, AddFeedRecordPayload, addFeedRecord } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getSuppliers } from "../../../services/VaccinationService";
import AddModal from "../../../components/customPopups/AddModal";
import { getFeeds } from "../../../services/FeedService";
import { showErrorToast, showSuccessToast } from "../../../utils/AppToast";

const FeedRecordScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();
    const [feedData, setFeedData] = useState<FeedRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState<string>("");
    const [suppliers, setSuppliers] = useState<
        { label: string; value: string; isSelected?: boolean }[]
    >([]);
    const [showFeedModal, setShowFeedModal] = useState(false);
    const [feedItems, setFeedItems] = useState<{ label: string; value: number }[]>([]);
    const [feedTypes, setFeedTypes] = useState<FeedTypeItem[]>([]);

    const fetchFeedRecords = async (
        search: string = searchKey,
        supplierId: string | null = null
    ) => {
        try {
            if (!businessUnitId) return;

            setLoading(true);

            const payload = {
                businessUnitId,
                pageNumber: 1,
                pageSize: 10,
                searchKey: search || null,
                supplierId: supplierId,
            };

            const res = await getFeedRecords(payload);

            const mappedData = res.list.map((item: any) => ({
                feedName: item.feed,
                feedType: item.feedType,
                supplier: item.supplier,
                date: item.date,
                quantity: item.quantity,
                price: item.price,
            }));

            setFeedData(mappedData);
        } catch (e) {
            console.log("Feed Record Screen Error:", e);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchFeedRecords();
            fetchSuppliers();
        }, [businessUnitId])
    );
    const fetchSuppliers = async () => {
        const res = await getSuppliers(businessUnitId);
        const dropdownData = res.map((s: any) => ({
            label: s.name,
            value: s.partyId,
            isSelected: false,
        }));

        setSuppliers(dropdownData);
    };
    const getSelectedSupplierId = () => {
        return suppliers.find(s => s.isSelected)?.value ?? null;
    };
    useEffect(() => {
        const fetchFeeds = async () => {
            const res = await getFeeds();
            setFeedItems(res);
        };
        fetchFeeds();
    }, []);
    useEffect(() => {
        const fetchFeedTypes = async () => {
            const res = await getFeedTypes();
            setFeedTypes(res);
        };
        fetchFeedTypes();
    }, []);
    const formatDate = (d: Date | string) => {
        const dateObj = typeof d === "string" ? new Date(d) : d;
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        return `${year}-${month}-${day}`;
    };
    const handleAddFeedRecords = async (data: any) => {
        if (!businessUnitId) return;

        try {
            setLoading(true);
            const payload: AddFeedRecordPayload = {
                businessUnitId,
                feedId: Number(data.feed),
                feedTypeId: Number(data.feedType),
                supplierId: data.supplier,
                quantity: Number(data.quantity),
                price: Number(data.price),
                date: formatDate(data.date),
                expiryDate: formatDate(data.expiryDate || data.date),
                note: data.note || "",
                isPaid: data.paymentStatus === "Paid",
            };
            console.log("Payload before API:", payload);

            const res = await addFeedRecord(payload);

            if (res.status === "Success") {
                showSuccessToast("Feed Record Added Successfully");
            }
            setShowFeedModal(false);
            fetchFeedRecords();
        } catch (error) {
            showErrorToast("Failed to Add feed Recordy");
        } finally {
            setLoading(false);
        }
    };

    const columns: TableColumn[] = [
        { key: "feedName", title: "FEED NAME", width: 140, isTitle: true },
        { key: "feedType", title: "FEED TYPE", width: 120 },
        { key: "supplier", title: "SUPPLIER", width: 140 },
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
        { key: "quantity", title: "QUANTITY", width: 100 },
        { key: "price", title: "PRICE", width: 100 },
    ];
    return (
        <View style={styles.container}>
            <BackArrow
                title="Feed Records"
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
                            fetchFeedRecords(val,);
                        }}
                    />
                </View>
                {/* SUPPLIER DROPDOWN */}
                <View style={{ width: 120, marginLeft: 10 }}>
                    <Dropdown
                        style={styles.dropdown}
                        data={suppliers}
                        labelField="label"
                        valueField="value"
                        placeholder="Supplier"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        value={suppliers.find(s => s.isSelected)?.value}
                        onChange={(item) => {
                            const updated = suppliers.map(s => ({
                                ...s,
                                isSelected: s.value === item.value,
                            }));
                            setSuppliers(updated);
                            fetchFeedRecords(searchKey, item.value);
                        }}
                    />
                </View>
            </View>
            {/* RIGHT SIDE: RESET FILTER */}
            {getSelectedSupplierId() && (
                <Text
                    style={styles.resetText}
                    onPress={() => {
                        const reset = suppliers.map(s => ({
                            ...s,
                            isSelected: false,
                        }));

                        setSuppliers(reset);
                        fetchFeedRecords("", null);
                    }}
                >
                    Reset Filters
                </Text>
            )}
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 5 }}>
                <DataCard
                    columns={columns}
                    data={feedData}
                    itemsPerPage={5}
                />
            </View>
            <LoadingOverlay visible={loading} />
            <AddModal
                visible={showFeedModal}
                onClose={() => setShowFeedModal(false)}
                type="Feed Record"
                title="Add Feed Record"
                supplierItems={suppliers}
                feedItems={feedItems}
                feedTypeItems={feedTypes}
                onSave={handleAddFeedRecords}
            />
        </View>
    );
};
export default FeedRecordScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        marginTop: 20
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
