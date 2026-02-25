import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useBusinessUnit } from "../../../context/BusinessContext";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { getFeedRecords, FeedRecord, FeedTypeItem, getFeedTypes, AddFeedRecordPayload, addFeedRecord, deleteFeedRecord, updateFeedRecord, UpdateFeedRecordPayload } from "../../../services/FeedService";
import { useFocusEffect } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import SearchBar from "../../../components/common/SearchBar";
import { getSuppliers } from "../../../services/VaccinationService";
import AddModal from "../../../components/customPopups/AddModal";
import { getFeeds } from "../../../services/FeedService";
import { showErrorToast, showSuccessToast } from "../../../utils/AppToast";
import ConfirmationModal from "../../../components/customPopups/ConfirmationModal";
import { formatDisplayDate } from "../../../utils/validation";
import { normalizeDataFormat } from "../../../utils/NormalizeDataFormat";
import { getFeedRecordsExcel } from "../../Report/ReportHelpers";
const FeedRecordScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();
    const [feedData, setFeedData] = useState<FeedRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchKey: "",
        supplierId: null as string | null,
    });
    const [feedGroupData, setFeedGroupData] = useState<{
        feeds: { label: string; value: number }[];
        feedTypes: FeedTypeItem[];
        suppliers: { label: string; value: string; }[];
    }>({
        feeds: [],
        feedTypes: [],
        suppliers: [],
    });
    const [modalState, setModalState] = useState<{
        type: 'add' | 'edit' | 'delete' | null;
        selectedRecord: FeedRecord | null;
    }>({
        type: null,
        selectedRecord: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;
    const fetchFeedRecords = async (page = currentPage) => {
        if (!businessUnitId) return;
        setLoading(true);

        const payload = {
            businessUnitId,
            pageNumber: page,
            pageSize: pageSize,
            searchKey: filters.searchKey || null,
            supplierId: filters.supplierId,
        };
        try {
            const res = await getFeedRecords(payload);
            const normalizedData = normalizeDataFormat(res.list, 'array', 'FeedRecords');
            const mappedData = normalizedData.map((item: any) => ({
                feedRecordId: item.feedRecordId ?? null,
                feedTypeId: item.feedTypeId ?? null,
                supplierId: item.supplierId ?? null,
                feedName: item.feed ?? '',
                feedType: item.feedType ?? '',
                supplier: item.supplier ?? '',
                date: item.date ?? '',
                expiryDate: item.expiryDate ?? '',
                quantity: item.quantity ?? 0,
                price: item.price ?? 0,
            }));
            setFeedData(mappedData);
            setTotalRecords(res.totalCount ?? 0);
        } catch (e) {
            console.log("Feed Record Screen Error:", e);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchFeedRecords();
        }, [businessUnitId, filters])
    );
    const fetchSuppliers = async () => {
        if (!businessUnitId) return;
        try {
            const res = await getSuppliers(businessUnitId);
            const normalizedSuppliers = normalizeDataFormat(res, 'array', 'Suppliers');
            const dropdownData = normalizedSuppliers.map((s: any) => ({
                label: s.name ?? 'Unknown Supplier',
                value: s.partyId ?? null,
            }));
            setFeedGroupData(prev => ({
                ...prev,
                suppliers: dropdownData,
            }));
        } catch (err) {
            console.error("Fetch Suppliers Error:", err);
        }
    };
    const fetchFeedTypes = async () => {
        const res = await getFeedTypes();
        const normalizedFeedTypes = normalizeDataFormat(res, 'array', 'FeedTypes');
        setFeedGroupData(prev => ({
            ...prev,
            feedTypes: res,
        }));
    };
    const fetchFeeds = async () => {
        const res = await getFeeds();
        const normalizedFeeds = normalizeDataFormat(res, 'array', 'Feeds');
        setFeedGroupData(prev => ({
            ...prev,
            feeds: res,
        }));
    };
    useEffect(() => {
        fetchFeeds();
        fetchFeedTypes();
        fetchSuppliers();
    }, []);
    const formatDate = (d: Date | string | undefined | null) => {
        if (!d) return "";
        const dateObj = d instanceof Date ? d : new Date(d);
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";
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
                const newRow = {
                    ...res.data,
                    feedName: res.data.feed ?? "",
                    feedType: res.data.feedType ?? "",
                    supplier: res.data.supplier ?? "",
                    date: res.data.date ?? "",
                    quantity: res.data.quantity ?? 0,
                    price: res.data.price ?? 0,
                };
                setFeedData(prev => [...prev, newRow]);
                setTotalRecords(prev => prev + 1);
                showSuccessToast("Feed Record Added Successfully");
            }
            setModalState({ type: null, selectedRecord: null });
        } catch (error) {
            showErrorToast("Failed to Add feed Record");
        } finally {
            setLoading(false);
        }
    };
    const handleUpdateFeedRecord = async (data: any) => {
        if (!businessUnitId || !modalState.selectedRecord) {
            return;
        }
        const payload: UpdateFeedRecordPayload = {
            feedRecordId: modalState.selectedRecord.feedRecordId,
            businessUnitId,
            feedId: Number(data.feedId),
            feedTypeId: Number(data.feedTypeId),
            supplierId: data.supplierId || null,
            quantity: Number(data.quantity),
            price: Number(data.price),
            date: formatDate(data.date ?? modalState.selectedRecord.date),
            expiryDate: formatDate(data.expiryDate ?? modalState.selectedRecord.expiryDate),
            note: data.note || "",
        };
        console.log("Payload to update API:", payload);
        try {
            setLoading(true);
            const res = await updateFeedRecord(payload);
            if (res.status === "Success") {
                const updatedRow = {
                    ...res.data,
                    feedName: res.data.feed ?? "",
                    feedType: res.data.feedType ?? "",
                    supplier: res.data.supplier ?? "",
                    date: res.data.date ?? "",
                    expiryDate: res.data.expiryDate ?? "",
                    quantity: res.data.quantity ?? 0,
                    price: res.data.price ?? 0,
                };
                setFeedData(prev =>
                    prev.map(item =>
                        item.feedRecordId === updatedRow.feedRecordId
                            ? updatedRow
                            : item
                    )
                );
                showSuccessToast("Feed Record Updated Successfully");
            } else {
                console.warn("Update failed:", res);
                showErrorToast("Failed to update feed record");
            }
        } catch (error) {
            console.error("Update Error:", error);
        } finally {
            setLoading(false);
            setModalState({ type: null, selectedRecord: null });
        }
    };
    const handleGenerateReport = async () => {
        if (!businessUnitId) return;
        try {
            setLoading(true);
            const reportPayload = {
                businessUnitId,
                pageNumber: currentPage,
                pageSize: pageSize,
                searchKey: filters.searchKey || null,
                supplierId: filters.supplierId || null,
            };
            await getFeedRecordsExcel('FeedRecordsReport', reportPayload);
            showSuccessToast('Report generated successfully');
        } catch (error) {
            console.error('Error generating Feed Records report:', error);
            showErrorToast('Failed to generate report');
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
            render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
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
                    setModalState({
                        type: 'add',
                        selectedRecord: null,
                    })
                }
                onReportPress={handleGenerateReport}
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
                {/* SUPPLIER DROPDOWN */}
                <View style={{ width: 120, marginLeft: 10 }}>
                    <Dropdown
                        style={styles.dropdown}
                        data={feedGroupData.suppliers}
                        labelField="label"
                        valueField="value"
                        placeholder="Supplier"
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        value={filters.supplierId}
                        onChange={(item) => {
                            setFilters(prev => ({
                                ...prev,
                                supplierId: item.value,
                            }));
                        }}
                    />
                </View>
            </View>
            {/* RIGHT SIDE: RESET FILTER */}
            {(filters.supplierId) && (
                <Text
                    style={styles.resetText}
                    onPress={() => {
                        setFilters({
                            searchKey: "",
                            supplierId: null,
                        });
                    }}
                >
                    Reset Filters
                </Text>
            )}
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 5 }}>
                <DataCard
                    columns={columns}
                    data={feedData}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    onPageChange={page => {
                        setCurrentPage(page);
                        fetchFeedRecords(page);
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
                                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', marginLeft: 10 }}>Edit</Text>
                            </TouchableOpacity>
                            <View style={styles.menuSeparator} />
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState({ type: 'delete', selectedRecord: row });
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
                visible={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, selectedRecord: null })}
                type="Feed Record"
                initialData={modalState.selectedRecord ?? undefined}
                title={modalState.type === 'edit' ? "Edit Feed Records" : "Add Feed Records"}
                isEdit={modalState.type === 'edit'}
                supplierItems={feedGroupData.suppliers}
                feedItems={feedGroupData.feeds}
                feedTypeItems={feedGroupData.feedTypes}
                onSave={
                    modalState.type === "edit"
                        ? handleUpdateFeedRecord
                        : handleAddFeedRecords
                }
            />
            <ConfirmationModal
                type="delete"
                visible={modalState.type == 'delete'}
                title={`Are you sure you want to delete this Feed Record?`}
                onClose={() => setModalState({ type: null, selectedRecord: null })}
                onConfirm={async () => {
                    if (modalState.type !== 'delete' || !modalState.selectedRecord) return;
                    try {
                        setLoading(true);
                        await deleteFeedRecord(modalState.selectedRecord!.feedRecordId);
                        showSuccessToast("Feed record deleted successfully");
                        fetchFeedRecords();
                    } catch (error) {
                        showErrorToast("Failed to delete feed record");
                    } finally {
                        setLoading(false);
                        setModalState({ type: null, selectedRecord: null });
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
        fontSize: 13,
        color: Theme.colors.black,
    },
    resetText: {
        color: Theme.colors.error,
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 250,
        marginTop: -9,
    },
    menuSeparator: {
        height: 2,
        backgroundColor: Theme.colors.SeparatorColor,
        marginHorizontal: 8,
    },
});
