import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { useBusinessUnit } from "../../../context/BusinessContext";
import { addFeedConsumption, deleteFeedConsumption, FeedConsumptionRecord, getFeedConsumptionRecords, getFeeds } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getFlocks } from "../../../services/FlockService";
import AddModal from "../../../components/customPopups/AddModal";
import { showErrorToast, showSuccessToast } from "../../../utils/AppToast";
import ConfirmationModal from "../../../components/customPopups/ConfirmationModal";

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
    const [filters, setFilters] = useState({
        searchKey: "",
        flockId: null ,
    }); const [feedMasterData, setFeedMasterData] = useState<{
        feeds: { label: string; value: number }[];
        flocks: { label: string; value: string;}[];
    }>({
        feeds: [],
        flocks: [],
    });
    const [modalState, setModalState] = useState<{
        showFeed: boolean;
        delete: {
            visible: boolean;
            record?: FeedConsumptionRecord;
        };
    }>({
        showFeed: false,
        delete: { visible: false },
    });
    const fetchFeedConsumption = async () => {
        try {
            if (!businessUnitId) return;
            setLoading(true);

            const payload = {
                businessUnitId,
                pageNumber: 1,
                pageSize: 10,
                searchKey: filters.searchKey || null,
                flockId: filters.flockId,
                supplierId: null,
            };

            const res = await getFeedConsumptionRecords(payload);
            const mappedData = res.list.map((item: any) => ({
                feedRecordConsumptionId: item.feedRecordConsumptionId,
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
    useEffect(() => {
        fetchFeedConsumption();
    }, [filters, businessUnitId]);
    useEffect(() => {
        const fetchFeeds = async () => {
            const res = await getFeeds();
            setFeedMasterData(prev => ({
                ...prev,
                feeds: res,
            }));
        };
        fetchFeeds();
    }, []);
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

            setFeedMasterData(prev => ({
                ...prev,
                flocks: dropdownData,
            }));
        } catch (error) {
            console.error("Failed to fetch flocks:", error);
        }
    };
    const AddFeedConsumption = async (payload: {
        flockId: string;
        feedId: number;
        bag: number;
        date: Date | string;
    }) => {
        if (!businessUnitId) {
            showErrorToast("Business Unit not found");
            return;
        }
        try {
            setLoading(true);
            await addFeedConsumption({
                businessUnitId,
                flockId: payload.flockId,
                feedId: payload.feedId,
                quantity: payload.bag,
                price: payload.bag,
                date: payload.date,
            });
            showSuccessToast("Feed consumption added successfully");
            setModalState(prev => ({
                ...prev,
                showFeed: false
            })); fetchFeedConsumption();
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                "Failed to add feed consumption";

            showErrorToast(msg);
        } finally {
            setLoading(false);
        }
    };

    const columns: TableColumn[] = [
        { key: "ref", title: "REF", width: 140, isTitle: true, showDots: true },
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
                onAddNewPress={() =>
                    setModalState(prev => ({
                        ...prev,
                        showFeed: true
                    }))
                } onReportPress={() => console.log("Generate Report")}
            />
            <View style={styles.filterRow}>
                {/* SEARCH */}
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search feed..."
                        onSearch={(val) => {
                            setFilters(prev => ({
                                ...prev,
                                searchKey: val,
                            }));
                        }}
                    />
                </View>
                {/* FLOCK DROPDOWN */}
                <View style={{ width: 120, marginLeft: 10 }}>
                    <Dropdown
                        style={styles.dropdown}
                        data={
                            feedMasterData.flocks.length > 0
                                ? feedMasterData.flocks
                                : [{ label: "No result found", value: null, disabled: true }]
                        }
                        labelField="label"
                        valueField="value"
                        placeholder="Select Flock"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        value={filters.flockId}
                        onChange={(item) => {
                            if (!item.value) return;
                            setFilters(prev => ({
                                ...prev,
                                flockId: item.value,
                            }));
                        }}
                    />
                </View>
            </View>
            {/* RIGHT SIDE: RESET FILTER */}
            {( filters.flockId) && (
                <Text
                    style={styles.resetText}
                    onPress={() => {
                        setFilters({
                            searchKey: "",
                            flockId: null,
                        });
                    }}
                >
                    Reset Filters
                </Text>
            )}
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
                <DataCard
                    columns={columns}
                    data={data}
                    itemsPerPage={10}
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    // Edit logic (if needed)
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
                                    })); closeMenu();
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
                type="Feed Consumption"
                title="Add Feed Consumption"
                flockItems={feedMasterData.flocks}
                feedItems={feedMasterData.feeds}
                onSave={AddFeedConsumption}
            />
            <ConfirmationModal
                type="delete"
                visible={modalState.delete.visible}
                title={`Are you sure you want to delete this Feed Consumption Record?`}
                onClose={() =>
                    setModalState(prev => ({
                        ...prev,
                        delete: { visible: false, record: undefined }
                    }))
                } onConfirm={async () => {
                    if (!modalState.delete.record) return;
                    try {
                        setLoading(true);
                        await deleteFeedConsumption(modalState.delete.record.feedRecordConsumptionId);
                        showSuccessToast("Feed consumption record deleted successfully");
                        fetchFeedConsumption();
                    } catch (error) {
                        showErrorToast("Failed to delete feed consumption record");
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
        fontSize: 12,
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
