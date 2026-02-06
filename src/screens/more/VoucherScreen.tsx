import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { getAccounts, getVouchers, Voucher, VoucherPayload, getVoucherTypes } from "../../services/VoucherService";
import { useBusinessUnit } from "../../context/BusinessContext";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import { useFocusEffect } from "@react-navigation/native";
import BackArrow from "../../components/common/BackArrow";
import SearchBar from "../../components/common/SearchBar";
import BusinessUnitModal from "../../components/customPopups/BusinessUnitModal";
import ReusableDetailsModal from "../../components/customPopups/VoucherDetailPopup";
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
    const [searchKey, setSearchKey] = useState<string | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        fromDate: null as Date | null,
        toDate: null as Date | null,
        accountId: null as string | null,
        voucherTypeId: null as number | null,
    });
    const [accountOptions, setAccountOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [voucherTypeOptions, setVoucherTypeOptions] = useState<
        { label: string; value: number }[]
    >([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const openVoucherModal = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
        setShowVoucherModal(true);
    };
    const fetchVouchers = useCallback(async () => {
        if (!businessUnitId) return;

        setLoading(true);
        try {
            const payload: VoucherPayload = {
                searchKey,
                businessUnitId,
                accountHeadId: filters.accountId,
                voucherTypeId: filters.voucherTypeId,
                from: formatDate(filters.fromDate),
                to: formatDate(filters.toDate),
                pageNumber: 1,
                pageSize: 1000,
            };
            const response = await getVouchers(payload);
            setVouchers(response.data.list);
        } catch (error) {
            console.error("Failed to fetch vouchers:", error);
        } finally {
            setLoading(false);
        }
    }, [businessUnitId, searchKey, filters]);
    useFocusEffect(
        useCallback(() => {
            fetchVouchers();
        }, [fetchVouchers])
    );
    useEffect(() => {
        if (!businessUnitId) return;

        getAccounts(businessUnitId)
            .then(res => setAccountOptions(res))
            .catch(err => {
                console.error("Account fetch error", err);
                setAccountOptions([]);
            });
    }, [businessUnitId]);
    useEffect(() => {
        getVoucherTypes()
            .then(res => setVoucherTypeOptions(res))
            .catch(err => {
                console.error("Voucher type fetch error", err);
                setVoucherTypeOptions([]);
            });
    }, []);
    // Define columns for DataCard
    const columns: TableColumn[] = [
        {
            key: "voucherNumber",
            title: "VOUCHER NAME",
            isTitle: true,
            width: 150,
            render: (value: string, row: Voucher) => (
                <TouchableOpacity onPress={() => openVoucherModal(row)}>
                    <Text style={{ color: Theme.colors.black, fontWeight: "bold" }}>{value}</Text>
                </TouchableOpacity>
            )
        },
        { key: "voucherType", title: "VOUCHER TYPE", width: 130 },
        {
            key: "debit",
            title: "DEBIT (RS)",
            width: 100,
            render: (_, row: Voucher) => {
                const totalDebit = row.voucherEntries.reduce((sum, entry) => sum + entry.debit, 0);
                return <Text>{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>;
            },
        },
        {
            key: "credit",
            title: "CREDIT (RS)",
            width: 100,
            render: (_, row: Voucher) => {
                const totalCredit = row.voucherEntries.reduce((sum, entry) => sum + entry.credit, 0);
                return <Text>{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>;
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
                            setSearchKey(value || null);
                        }}
                    />
                </View>
                {/* FILTER ICON */}
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Image
                        source={Theme.icons.filter}
                        style={styles.filterIcon}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
                <DataCard columns={columns} data={vouchers} itemsPerPage={10} />
            </View>
            <LoadingOverlay visible={loading} />
            <BusinessUnitModal
                visible={showFilterModal}
                mode="voucher"
                accountOptions={accountOptions}
                voucherTypeOptions={voucherTypeOptions}
                onClose={() => setShowFilterModal(false)}
                onApplyvoucherFilter={(fromDate, toDate, accountId, voucherTypeId) => {
                    setFilters({
                        fromDate,
                        toDate,
                        accountId,
                        voucherTypeId,
                    });
                }}
            />
            <ReusableDetailsModal
                visible={showVoucherModal && !!selectedVoucher}
                title="Voucher Details"
                onClose={() => setShowVoucherModal(false)}
                leftDetails={selectedVoucher ? [
                    { label: "VOUCHER NUMBER", value: selectedVoucher.voucherNumber },
                    { label: "VOUCHER DATE", value: new Date(selectedVoucher.createdAt).toLocaleDateString("en-GB") },
                    { label: "DESCRIPTION", value: selectedVoucher.description || "—" },
                ] : []}
                rightDetails={selectedVoucher ? [
                    { label: "VOUCHER TYPE", value: selectedVoucher.voucherType },
                    { label: "CREATED BY", value: selectedVoucher.createdBy || "—" },
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
                tableData={selectedVoucher?.voucherEntries || []}
            />
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
