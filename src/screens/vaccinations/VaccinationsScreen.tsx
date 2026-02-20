import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    Image, ScrollView,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { getVaccinations, Vaccination, getSuppliers, getVaccines, addVaccination, updateVaccination, deleteVaccination } from "../../services/VaccinationService";
import styles from "./style";
import AddModal from "../../components/customPopups/AddModal";
import ConfirmationModal from "../../components/customPopups/ConfirmationModal";
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import { useBusinessUnit } from "../../context/BusinessContext"
import SearchBar from "../../components/common/SearchBar";
import { Dropdown } from "react-native-element-dropdown";
import { formatDisplayDate } from "../../utils/validation";
import { normalizeDataFormat } from "../../utils/NormalizeDataFormat";
interface Props {
    openAddModal: boolean;
    onCloseAddModal: () => void;
    onOpenAddModal: () => void;
    setGlobalLoading: (val: boolean) => void;
    filters: { searchKey: string; supplierId: string | null };
    setFilters: React.Dispatch<React.SetStateAction<{ searchKey: string; supplierId: string | null }>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
const VaccinationsScreen: React.FC<Props> = ({
    openAddModal,
    onCloseAddModal,
    onOpenAddModal,
    setGlobalLoading,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
}) => {
    const { businessUnitId } = useBusinessUnit();
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [dropdownData, setDropdownData] = useState<{
        suppliers: { label: string; value: string }[];
        vaccines: { label: string; value: number }[];
    }>({
        suppliers: [],
        vaccines: [],
    });
    const [modalState, setModalState] = useState<{
        selectedVaccinationModal: 'edit' | 'delete' | null;
        vaccinerecord: Vaccination | null;
    }>({
        selectedVaccinationModal: null,
        vaccinerecord: null,
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;
    const fetchVaccinationsData = async (page: number = 1) => {
        if (!businessUnitId) return;
        setGlobalLoading(true);
        try {
            const res = await getVaccinations(
                businessUnitId,
                page,
                pageSize,
                filters.searchKey,
                filters.supplierId
            );
            const normalizedVaccinations = normalizeDataFormat(res.data.list, 'array', 'Vaccinations');
            setVaccinations(normalizedVaccinations);
            setTotalRecords(res.data.totalCount);
        } finally {
            setGlobalLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            setCurrentPage(1)
            fetchVaccinationsData(1);
            setFilters({
                supplierId: null,
                searchKey: "",
            });
        }, [businessUnitId])
    );
    const fetchSuppliers = async () => {
        const suppliers = await getSuppliers(businessUnitId);
        const formatted = suppliers.map((s: any) => ({ label: s.name, value: s.partyId }));
        setDropdownData(prev => ({ ...prev, suppliers: formatted }));
    };

    const fetchVaccines = async () => {
        const vaccines = await getVaccines();
        setDropdownData(prev => ({ ...prev, vaccines }));
    };
    useEffect(() => {
        fetchSuppliers();
        fetchVaccines();
    }, [businessUnitId]);
    useEffect(() => {
        if (businessUnitId) {
            fetchVaccinationsData(1);
        }
    }, [filters, businessUnitId, ]);
    const handleAddVaccination = async (data: any) => {
        if (!businessUnitId) return;
        const payload = {
            vaccineId: data.vaccine,
            date: data.date.toISOString().split("T")[0],
            quantity: Number(data.quantity),
            price: Number(data.price || 0),
            note: data.note || "",
            supplierId: data.supplier,
            businessUnitId,
            isPaid: data.paymentStatus === "Paid",
        };
        try {
            const res = await addVaccination(payload);
            if (res.status === "Success") {
                setVaccinations(prev => [...prev, res.data]);
                setTotalRecords(prev => prev + 1);
                setCurrentPage(1);
                showSuccessToast("Vaccination added successfully");
            } else {
                showErrorToast(res.message || "Failed to add vaccination");
            }
        } catch (error: any) {
            showErrorToast(error.message || "Something went wrong");
        } finally {
        }
    };
    const handleUpdateVaccination = async (data: any) => {
        if (modalState.selectedVaccinationModal !== 'edit' || !modalState.vaccinerecord || !businessUnitId) return; const payload = {
            vaccinationId: modalState.vaccinerecord!.vaccinationId,
            vaccineId: Number(data.vaccine),
            date: data.date.toISOString().split('T')[0],
            quantity: Number(data.quantity),
            price: Number(data.price || 0),
            note: data.note || '',
            supplierId: data.supplier,
            businessUnitId,
        };
        try {
            const res = await updateVaccination(payload);
            if (res.status === 'Success') {
                setVaccinations(prev =>
                    prev.map(v => v.vaccinationId === payload.vaccinationId ? res.data : v)
                );
                setCurrentPage(1);
                showSuccessToast("Vaccination updated successfully");
            } else {
                showErrorToast(res.message || 'Update failed');
            }
        } catch (error: any) {
            showErrorToast(error.message || 'Something went wrong');
        }
    };
    // ===== DATA CARD COLUMNS =====
    const columns: TableColumn[] = [
        { key: "vaccine", title: "VACCINE NAME", isTitle: true, showDots: true },
        { key: "supplier", title: "SUPPLIER" },
        {
            key: "date",
            title: "DATE",
            render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
        },
        { key: "quantity", title: "QUANTITY" },
        {
            key: "price",
            title: "PRICE",
            width: 90,
            render: (val: number) => <Text>{`${val}`}</Text>
        },
    ];
    return (
        <View style={styles.container}>
            {/* ===== SEARCH + FILTER ===== */}
            <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        placeholder="Search vaccine..."
                        onSearch={(val) =>
                            setFilters(prev => ({
                                ...prev,
                                searchKey: val,
                            }))
                        }
                    />
                </View>
                <View style={styles.dropdownWrapper}>
                    <Dropdown
                        style={styles.inlineDropdown}
                        containerStyle={styles.inlineDropdownContainer}
                        data={dropdownData.suppliers}
                        labelField="label"
                        valueField="value"
                        placeholder="Supplier"
                        selectedTextStyle={styles.dropdownText}
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
            {(filters.supplierId) && (
                <TouchableOpacity
                    onPress={() =>
                        setFilters(prev => ({
                            ...prev,
                            supplierId: null,
                        }))
                    }
                >
                    <Text style={styles.resetText}>Reset Filters</Text>
                </TouchableOpacity>
            )}
            {/* ===== DATA CARD ===== */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
                <DataCard
                    columns={columns}
                    data={vaccinations}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    onPageChange={page => {
                        setCurrentPage(page);
                        fetchVaccinationsData(page);
                    }}
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState({
                                        selectedVaccinationModal: 'edit',
                                        vaccinerecord: row,
                                    });
                                    onOpenAddModal();
                                    closeMenu();
                                }}
                                style={{ marginBottom: 8 }}
                            >
                                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Edit</Text>
                            </TouchableOpacity>
                            <View style={styles.menuSeparator} />
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState({
                                        selectedVaccinationModal: 'delete',
                                        vaccinerecord: row,
                                    });
                                    closeMenu();
                                }}
                                style={{ marginTop: 8 }}
                            >
                                <Text style={{ color: 'red', fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </ScrollView>
            {/* ===== ADD / EDIT MODAL ===== */}
            <AddModal
                visible={openAddModal}
                type="vaccination"
                title={
                    modalState.selectedVaccinationModal === 'edit'
                        ? "Edit Vaccination"
                        : "Add Vaccination"
                }
                isEdit={modalState.selectedVaccinationModal === 'edit'}
                initialData={modalState.vaccinerecord}
                onClose={() => {
                    onCloseAddModal();
                    setModalState({
                        selectedVaccinationModal: null,
                        vaccinerecord: null,
                    });
                }}
                onSave={(data) => {
                    if (modalState.selectedVaccinationModal === 'edit' && modalState.vaccinerecord) {
                        handleUpdateVaccination(data);
                    } else {
                        handleAddVaccination(data);
                    }

                    onCloseAddModal();
                    setModalState({
                        selectedVaccinationModal: null,
                        vaccinerecord: null,
                    });
                }}
                vaccineItems={dropdownData.vaccines}
                supplierItems={dropdownData.suppliers}
            />
            {/* ===== DELETE MODAL ===== */}
            <ConfirmationModal
                type="delete"
                visible={modalState.selectedVaccinationModal === 'delete'}
                title={`Are you sure you want to delete ${modalState.vaccinerecord?.vaccine}?`}
                onClose={() => {
                    setModalState({
                        selectedVaccinationModal: null,
                        vaccinerecord: null,
                    });
                }}
                onConfirm={async () => {
                    if (modalState.selectedVaccinationModal !== 'delete' || !modalState.vaccinerecord) return;
                    try {
                        const res = await deleteVaccination(modalState.vaccinerecord.vaccinationId);
                        if (res.status === "Success") {
                            setVaccinations(prev =>
                                prev.filter(v => v.vaccinationId !== modalState.vaccinerecord!.vaccinationId)
                            );
                            setTotalRecords(prev => prev - 1);
                            if ((vaccinations.length - 1) === 0 && currentPage > 1) {
                                const newPage = currentPage - 1;
                                setCurrentPage(newPage);
                                fetchVaccinationsData(newPage);
                            }
                            showSuccessToast("Vaccination deleted successfully");
                        } else {
                            showErrorToast(res.message || "Delete failed");
                        }
                    } catch (error: any) {
                        showErrorToast(error.message || "Something went wrong");
                    } finally {
                        setModalState(prev => ({
                            ...prev,
                            delete: {
                                visible: false,
                                record: null,
                            },
                        }));
                    }
                }}
            />
        </View>
    );
};
export default VaccinationsScreen;
