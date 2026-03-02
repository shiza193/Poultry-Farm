import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { useBusinessUnit } from "../../../context/BusinessContext";
import { addFeedConsumption, deleteFeedConsumption, FeedConsumptionRecord,getFeedConsumptionRecords, getFeeds, updateFeedConsumption } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getFlocks } from "../../../services/FlockService";
import AddModal from "../../../components/customPopups/AddModal";
import { showErrorToast, showSuccessToast } from "../../../utils/AppToast";
import ConfirmationModal from "../../../components/customPopups/ConfirmationModal";
import { normalizeDataFormat } from "../../../utils/NormalizeDataFormat";
import { formatDisplayDate } from "../../../utils/validation";
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
        flockId: null,
    });
    const [feedMasterData, setFeedMasterData] = useState<{
        feeds: { label: string; value: number }[];
        flocks: { label: string; value: string; }[];
    }>({
        feeds: [],
        flocks: [],
    });
    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selectedRecord: FeedConsumptionRecord | null;
    }>({
        type: null,
        selectedRecord: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;
    const fetchFeedConsumption = async (page = currentPage) => {
        if (!businessUnitId) return;
        setLoading(true);
        const payload = {
            businessUnitId,
            pageNumber: page,
            pageSize: pageSize,
            searchKey: filters.searchKey || null,
            flockId: filters.flockId,
            supplierId: null,
        };
        try {
            const res = await getFeedConsumptionRecords(payload);
            const normalizedData = normalizeDataFormat(res.list, 'array', 'FeedConsumption');
            const mappedData = normalizedData.map((item: any) => ({
                feedRecordConsumptionId: item.feedRecordConsumptionId ?? null,
                ref: item.ref ?? '',
                flock: item.flockRef ?? '',
                flockId: item.flockId ?? null,
                feedName: item.feed ?? '',
                feedId: item.feedId ?? null,
                date: item.date ?? '',
                totalBag: item.totalQuantity ?? 0,
                bag: item.quantity ?? 0,
            }));
            setData(mappedData);
            setTotalRecords(res.totalCount ?? 0);
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
        }, [businessUnitId, filters])
    );

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
            const flocks: Flock[] = await getFlocks(businessUnitId);
            const normalizedFlocks: Flock[] = normalizeDataFormat(flocks, 'array', 'Flocks');
            const dropdownData = normalizedFlocks.map((f: Flock) => ({
                label: f.flockRef,
                value: f.flockId,
            }));
            setFeedMasterData(prev => ({
                ...prev,
                flocks: dropdownData,
            }));
        } catch (error) {
            console.error("Failed to fetch flocks:", error);
        }
    };
    const AddFeedConsumption = async (data: {
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
            const res = await addFeedConsumption({
                businessUnitId,
                flockId: data.flockId,
                feedId: data.feedId,
                quantity: data.bag,
                price: data.bag,
                date: data.date,
            });
            if (res.status === "Success") {
                const newRow: FeedConsumptionRecord & { flock: string; feedName: string; totalBag: number; bag: number } = {
                    feedRecordConsumptionId: res.data.feedRecordConsumptionId ?? '',
                    ref: res.data.ref ?? '',
                    date: res.data.date ?? '',
                    flock: res.data.flockRef ?? '',
                    feedName: res.data.feed ?? '',
                    totalBag: res.data.totalQuantity ?? 0,
                    bag: res.data.quantity ?? 0,
                };
                setData(prev => [...prev, newRow]);
                setTotalRecords(prev => prev + 1);
                showSuccessToast("Feed consumption added successfully");
                setModalState({ type: null, selectedRecord: null });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to add feed consumption";
            showErrorToast(msg);
        } finally {
            setLoading(false);
        }
    };
    const EditFeedConsumption = async (payload: {
        flockId: string;
        feedId: number;
        bag: number;
        date: Date | string;
    }) => {
        if (!businessUnitId || !modalState.selectedRecord) {
            showErrorToast("Required data missing");
            return;
        }
        try {
            setLoading(true);
            const formattedDate =
                payload.date instanceof Date
                    ? payload.date.toISOString().split("T")[0]
                    : payload.date;
            const res = await updateFeedConsumption({
                feedRecordConsumptionId:
                    modalState.selectedRecord.feedRecordConsumptionId,
                businessUnitId,
                flockId: payload.flockId,
                feedId: payload.feedId,
                quantity: payload.bag,
                date: formattedDate,
            });
            if (res && res.status === 'Success') {
                const record = modalState.selectedRecord;
                if (record) {
                    setData(prev =>
                        prev.map(fc =>
                            fc.feedRecordConsumptionId === record.feedRecordConsumptionId
                                ? {
                                    ...res.data,
                                    flock: res.data.flockRef,
                                    feedName: res.data.feed,
                                    totalBag: res.data.totalQuantity,
                                    bag: res.data.quantity
                                }
                                : fc
                        )
                    );
                }
            }
            showSuccessToast("Feed consumption updated successfully");
            setModalState({ type: null, selectedRecord: null });
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                "Failed to update feed consumption";
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
            render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
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
                    setModalState({
                        type: 'add',
                        selectedRecord: null,
                    })
                } onReportPress={() => console.log("Generate Report")}
            />
            <View style={styles.filterRow}>
                {/* SEARCH */}
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search Ref,Flock/Fe..."
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
            {(filters.flockId) && (
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
                    loading={loading}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    onPageChange={page => {
                        setCurrentPage(page);
                        fetchFeedConsumption(page);
                    }}
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState({ type: 'edit', selectedRecord: row });
                                    closeMenu();
                                }}
                                style={{ marginBottom: 8 }}
                            >
                                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Edit</Text>
                            </TouchableOpacity>
                            <View style={styles.menuSeparator} />
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState({ type: 'delete', selectedRecord: row });
                                    closeMenu();
                                }}
                                style={{ marginTop: 8 }}
                            >
                                <Text style={{ color: 'red', fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
            <AddModal
                visible={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, selectedRecord: null })}
                initialData={modalState.selectedRecord ?? undefined}
                type="Feed Consumption"
                title={modalState.type === 'edit' ? "Edit Feed Consumption" : "Add Feed Consumption"}
                flockItems={feedMasterData.flocks}
                feedItems={feedMasterData.feeds}
                onSave={
                    modalState.type === "edit"
                        ? EditFeedConsumption
                        : AddFeedConsumption
                } />
            <ConfirmationModal
                type="delete"
                visible={modalState.type === 'delete' && modalState.selectedRecord !== null}
                title={`Are you sure you want to delete this Feed Consumption Record?`}
                onClose={() => setModalState({ type: null, selectedRecord: null })}
                onConfirm={async () => {
                    if (modalState.type !== 'delete' || !modalState.selectedRecord) return;
                    try {
                        setLoading(true);
                        await deleteFeedConsumption(modalState.selectedRecord!.feedRecordConsumptionId);
                        showSuccessToast("Feed consumption record deleted successfully");
                        fetchFeedConsumption();
                    } catch (error) {
                        showErrorToast("Failed to delete feed consumption record");
                    } finally {
                        setLoading(false);
                        setModalState({ type: null, selectedRecord: null });
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
        height: 42,
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
