import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useBusinessUnit } from "../../../context/BusinessContext";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { getFeedRecords, FeedRecord, FeedTypeItem, getFeedTypes, AddFeedRecordPayload, addFeedRecord, deleteFeedRecord } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getSuppliers } from "../../../services/VaccinationService";
import AddModal from "../../../components/customPopups/AddModal";
import { getFeeds } from "../../../services/FeedService";
import { showErrorToast, showSuccessToast } from "../../../utils/AppToast";
import ConfirmationModal from "../../../components/customPopups/ConfirmationModal";

const FeedRecordScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();
    const [feedData, setFeedData] = useState<FeedRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState<string>("");
    const [feedGroupData, setFeedGroupData] = useState<{
        feeds: { label: string; value: number }[];
        feedTypes: FeedTypeItem[];
        suppliers: { label: string; value: string; isSelected?: boolean }[];
    }>({
        feeds: [],
        feedTypes: [],
        suppliers: [],
    });
    const [modalState, setModalState] = useState<{
        showFeed: boolean;
        delete: {
            visible: boolean;
            record?: FeedRecord;
        };
    }>({
        showFeed: false,
        delete: { visible: false },
    });
    const fetchFeedRecords = async (
        search: string = searchKey,
        supplierId: string | null = null
    ) => {
        try {
            if (!businessUnitId) return;
            setLoading(true)
            const payload = {
                businessUnitId,
                pageNumber: 1,
                pageSize: 10,
                searchKey: search || null,
                supplierId: supplierId,
            };

            const res = await getFeedRecords(payload);
            const mappedData = res.list.map((item: any) => ({
                feedRecordId: item.feedRecordId,
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
    const getSelectedSupplierId = () => {
        return feedGroupData.suppliers.find(s => s.isSelected)?.value ?? null;
    };
    const fetchSuppliers = async () => {
        if (!businessUnitId) return;

        const res = await getSuppliers(businessUnitId);
        const dropdownData = res.map((s: any) => ({
            label: s.name,
            value: s.partyId,
            isSelected: false,
        }));

        setFeedGroupData(prev => ({
            ...prev,
            suppliers: dropdownData,
        }));
    };
    const fetchFeedTypes = async () => {
        const res = await getFeedTypes();
        setFeedGroupData(prev => ({
            ...prev,
            feedTypes: res,
        }));
    };
    const fetchFeeds = async () => {
        const res = await getFeeds();
        setFeedGroupData(prev => ({
            ...prev,
            feeds: res,
        }));
    };
    useEffect(() => {
        fetchFeeds();
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
                feedId: data.feedId!,
                feedTypeId: data.feedTypeId!,
                supplierId: data.supplierId || null,
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
            setModalState(prev => ({
                ...prev,
                showFeed: false
            }));
            fetchFeedRecords();
        } catch (error) {
            showErrorToast("Failed to Add feed Record");
        } finally {
            setLoading(false);
        }
    };
    const columns: TableColumn[] = [
        { key: "feedName", title: "FEED NAME", width: 140, isTitle: true, showDots: true },
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
                onAddNewPress={() =>
                    setModalState(prev => ({
                        ...prev,
                        showFeed: true
                    }))
                } 
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
                        data={feedGroupData.suppliers}
                        labelField="label"
                        valueField="value"
                        placeholder={loading ? "Loading suppliers..." : "Supplier"}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        value={getSelectedSupplierId()}
                        onChange={(item) => {
                            const updated = feedGroupData.suppliers.map(s => ({
                                ...s,
                                isSelected: s.value === item.value,
                            }));
                            setFeedGroupData(prev => ({
                                ...prev,
                                suppliers: updated,
                            }));

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
                        setFeedGroupData(prev => ({
                            ...prev,
                            suppliers: prev.suppliers.map(s => ({
                                ...s,
                                isSelected: false,
                            })),
                        }));

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
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    // Edit logic here
                                }}
                                style={{ marginBottom: 8 }}
                            >
                                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', marginLeft: 10 }}>Edit</Text>
                            </TouchableOpacity>
                            <View style={styles.menuSeparator} />
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState(prev => ({
                                        ...prev,
                                        delete: { visible: true, record: row },
                                    }));
                                    closeMenu();
                                }}
                                style={{ marginTop: 8 }}
                            >
                                <Text style={{ color: 'red', fontWeight: '600', marginLeft: 10 }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
            <LoadingOverlay visible={loading} />
            <AddModal
                visible={modalState.showFeed}
                onClose={() => setModalState(prev => ({
                    ...prev,
                    showFeed: false
                }))}
                type="Feed Record"
                title="Add Feed Record"
                supplierItems={feedGroupData.suppliers}
                feedItems={feedGroupData.feeds}
                feedTypeItems={feedGroupData.feedTypes}
                onSave={handleAddFeedRecords}
            />
            <ConfirmationModal
                type="delete"
                visible={modalState.delete.visible}
                title={`Are you sure you want to delete this Feed Record?`}
                onClose={() =>
                    setModalState(prev => ({
                        ...prev,
                        delete: { visible: false, record: undefined }
                    }))
                }
                onConfirm={async () => {
                    if (!modalState.delete.record) return;
                    try {
                        setLoading(true);
                        await deleteFeedRecord(modalState.delete.record.feedRecordId);
                        showSuccessToast("Feed record deleted successfully");
                        fetchFeedRecords();
                    } catch (error) {
                        showErrorToast("Failed to delete feed record");
                    } finally {
                        setLoading(false);
                        setModalState(prev => ({
                            ...prev,
                            delete: { visible: false, record: undefined }
                        }));
                    }
                }}
            />
        </View>
    );
};
export default FeedRecordScreen;
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
        padding: 16,
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
    menuSeparator: {
        height: 2,
        backgroundColor: Theme.colors.SeparatorColor,
        marginHorizontal: 8,
    },
});
