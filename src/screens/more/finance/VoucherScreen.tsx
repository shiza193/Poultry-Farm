import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import Theme from "../../../theme/Theme";
import { getAccounts, getVouchers, Voucher, VoucherPayload, getVoucherTypes } from "../../../services/VoucherService";
import { useBusinessUnit } from "../../../context/BusinessContext";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useFocusEffect } from "@react-navigation/native";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import SearchBar from "../../../components/common/SearchBar";
import BusinessUnitModal from "../../../components/customPopups/BusinessUnitModal";
import VoucherDetailPopup from "../../../components/customPopups/VoucherDetailPopup";
interface VoucherEntry {
    accountHead: string;
    debit: number;
    credit: number;
    description: string;
    createdAt: string;
}
const formatDate = (date: Date | null): string | null => {
    return date ? date.toISOString().split("T")[0] : null;
};
const VoucherScreen = () => {
    const { businessUnitId } = useBusinessUnit();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchKey: null as string | null,
        fromDate: null as Date | null,
        toDate: null as Date | null,
        accountId: null as string | null,
        voucherTypeId: null as number | null,
    });
    const [filterOptions, setFilterOptions] = useState<{
        accounts: { label: string; value: string }[],
        voucherTypes: { label: string; value: number }[]
    }>({
        accounts: [],
        voucherTypes: [],
    });
    const [modalState, setModalState] = useState<{
        type: 'add' | 'detail' | 'filter' | null;
        selectedVoucher: Voucher | null;
    }>({
        type: null,
        selectedVoucher: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;
    // Simpler fetch function
    const fetchVouchers = async (page = currentPage) => {
        if (!businessUnitId) return;
        setLoading(true);
        const payload = {
            businessUnitId,
            accountHeadId: filters.accountId,
            voucherTypeId: filters.voucherTypeId,
            searchKey: filters.searchKey || null,
            from: filters.fromDate ? formatDate(filters.fromDate) : null,
            to: filters.toDate ? formatDate(filters.toDate) : null,
            pageNumber: page,
            pageSize: pageSize,
        };
        try {
            const response = await getVouchers(payload);
            setVouchers(response.data.list);
            setTotalRecords(response.data.totalCount);
        } catch (err) {
            console.error("Failed to fetch vouchers:", err);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchVouchers();
        }, [businessUnitId, filters])
    );
    // Fetch accounts
    const fetchAccounts = async () => {
        if (!businessUnitId) return;
        try {
            const res = await getAccounts(businessUnitId);
            setFilterOptions(prev => ({ ...prev, accounts: res }));
        } catch (err) {
            console.error("Account fetch error:", err);
        }
    };
    // Fetch voucher types
    const fetchVoucherTypes = async () => {
        try {
            const res = await getVoucherTypes();
            setFilterOptions(prev => ({ ...prev, voucherTypes: res }));
        } catch (err) {
            console.error("Voucher type fetch error:", err);
        }
    };
    useEffect(() => {
        fetchAccounts();
        fetchVoucherTypes();
    }, [businessUnitId]);
    // Define columns for DataCard
    const columns: TableColumn[] = [
        {
            key: "voucherNumber",
            title: "VOUCHER NAME",
            isTitle: true,
            width: 150,
            render: (value: string, row: Voucher) => (
                <TouchableOpacity
                    onPress={() =>
                        setModalState({ type: 'detail', selectedVoucher: row })
                    }
                >
                    <Text style={{ color: Theme.colors.black, fontWeight: "bold" }}>{value}</Text>
                </TouchableOpacity>
            )
        },
        { key: "voucherType", title: "VOUCHER TYPE", width: 140 },
        {
            key: "debit",
            title: "DEBIT (RS)",
            width: 100,
            render: (_, row: Voucher) => {
                const debitEntry = row.voucherEntries.find(e => e.debit > 0);
                return <Text>
                    {debitEntry ? debitEntry.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </Text>;
            },
        },
        {
            key: "credit",
            title: "CREDIT (RS)",
            width: 100,
            render: (_, row: Voucher) => {
                const creditEntry = row.voucherEntries.find(e => e.credit > 0);
                return <Text>
                    {creditEntry ? creditEntry.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </Text>;
            },
        },
        {
            key: "createdAt",
            title: "CREATED AT",
            width: 140,
            render: (_, row: Voucher) => (
                <Text>{new Date(row.createdAt).toLocaleDateString("en-GB")}</Text>
            ),
        }
    ];
    return (
        <View style={styles.container}>
            <BackArrow
                title="Vouchers"
                showBack
                onAddNewPress={() => {
                    console.log("Add New Voucher pressed");
                }}
            />
            <View style={styles.topRow}>
                {/* SEARCH BAR */}
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search voucher"
                        onSearch={(value) => {
                            setFilters(prev => ({
                                ...prev,
                                searchKey: value || null,
                            }));
                        }}
                    />
                </View>
                {/* FILTER ICON */}
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setModalState(prev => ({ ...prev, type: 'filter' }))}
                >
                    <Image
                        source={Theme.icons.filter}
                        style={styles.filterIcon}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
                <DataCard
                    columns={columns}
                    data={vouchers}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    onPageChange={page => {
                        setCurrentPage(page);
                        fetchVouchers(page);
                    }}
                />
            </View>
            <LoadingOverlay visible={loading} />
            <BusinessUnitModal
                visible={modalState.type === 'filter'}
                mode="voucher"
                accountOptions={filterOptions.accounts}
                voucherTypeOptions={filterOptions.voucherTypes}
                onClose={() => setModalState({ type: null, selectedVoucher: null })}
                onApplyvoucherFilter={(fromDate, toDate, accountId, voucherTypeId) => {
                    setFilters(prev => ({
                        ...prev,
                        fromDate,
                        toDate,
                        accountId,
                        voucherTypeId,
                    }));
                }}
            />
            <VoucherDetailPopup
                visible={modalState.type === 'detail' && !!modalState.selectedVoucher}
                title="Voucher Details"
                onClose={() => setModalState({ type: null, selectedVoucher: null })}
                leftDetails={modalState.selectedVoucher ? [
                    { label: "VOUCHER NUMBER", value: modalState.selectedVoucher.voucherNumber },
                    { label: "VOUCHER DATE", value: new Date(modalState.selectedVoucher.createdAt).toLocaleDateString("en-GB") },
                    { label: "DESCRIPTION", value: modalState.selectedVoucher.description || "—" },
                ] : []}

                rightDetails={modalState.selectedVoucher ? [
                    { label: "VOUCHER TYPE", value: modalState.selectedVoucher.voucherType },
                    { label: "CREATED BY", value: modalState.selectedVoucher.createdBy || "—" },
                ] : []}
                tableColumns={[
                    { key: "accountHead", label: "Account Head", width: 140 },
                    {
                        key: "debit",
                        label: "Debit",
                        width: 100,
                        render: (_: unknown, row: VoucherEntry) => Number(row.debit).toFixed(2)
                    },
                    {
                        key: "credit",
                        label: "Credit",
                        width: 100,
                        render: (_: unknown, row: VoucherEntry) => Number(row.credit).toFixed(2)
                    },
                    { key: "description", label: "Description", width: 120 },
                    { key: "createdAt", label: "Created At", width: 120, render: (val: string) => new Date(val).toLocaleDateString("en-GB") },
                ]}
                tableData={modalState.selectedVoucher?.voucherEntries || []} />
        </View>
    );
};
export default VoucherScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
        paddingHorizontal: 16,
    },
    filterBtn: {
        height: 40,
        width: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.success,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Theme.colors.white,
    },
    filterIcon: {
        width: 20,
        height: 20,
        tintColor: Theme.colors.success,
    },
});
