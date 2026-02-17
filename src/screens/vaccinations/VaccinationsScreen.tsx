import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, } from '@react-navigation/native';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
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
interface Props {
    openAddModal: boolean;
    onCloseAddModal: () => void;
    onOpenAddModal: () => void;
    setGlobalLoading: (val: boolean) => void;

}
const VaccinationsScreen: React.FC<Props> = ({
    openAddModal,
    onCloseAddModal,
    onOpenAddModal,
    setGlobalLoading,
}) => {
    const { businessUnitId } = useBusinessUnit();
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [filters, setFilters] = useState({
        searchKey: "",
        supplierId: null as string | null,
    });
    const [dropdownData, setDropdownData] = useState<{
        suppliers: { label: string; value: string }[];
        vaccines: { label: string; value: number }[];
    }>({
        suppliers: [],
        vaccines: [],
    });
    const [modalState, setModalState] = useState<{
        showVaccinationModal: boolean;
        editRecord: Vaccination | null;
        delete: {
            visible: boolean;
            record: Vaccination | null;
        };
    }>({
        showVaccinationModal: false,
        editRecord: null,
        delete: {
            visible: false,
            record: null,
        },
    });
    const fetchVaccinationsData = async () => {
        if (!businessUnitId) return;
        setGlobalLoading(true);
        try {
            const data = await getVaccinations(businessUnitId);
            setVaccinations(data);
        } finally {
            setGlobalLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVaccinationsData();

            setFilters(prev => ({
                ...prev,
                supplierId: null,
            }));
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
    const filteredVaccinations = vaccinations.filter(item => {
        const supplierMatch = filters.supplierId
            ? item.supplierId === filters.supplierId
            : true;

        const searchMatch = filters.searchKey
            ? item.vaccine.toLowerCase().includes(filters.searchKey.toLowerCase())
            : true;

        return supplierMatch && searchMatch;
    });

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
        if (!modalState.editRecord || !businessUnitId) return;
        const payload = {
            vaccinationId: modalState.editRecord.vaccinationId,
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
            render: (val: string) => {
                const dateObj = new Date(val);
                const formatted = dateObj.toLocaleDateString("en-GB");
                return <Text>{formatted}</Text>;
            }
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
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <DataCard
                    columns={columns}
                    data={filteredVaccinations}
                    itemsPerPage={10}
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalState(prev => ({
                                        ...prev,
                                        showVaccinationModal: true,
                                        editRecord: row,
                                    }));
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
                                    setModalState(prev => ({
                                        ...prev,
                                        delete: {
                                            visible: true,
                                            record: row,
                                        },
                                    }));
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
            {/* ===== ADD / EDIT MODAL ===== */}
            <AddModal
                visible={openAddModal}
                type="vaccination"
                title={modalState.editRecord ? "Edit Vaccination" : "Add Vaccination"}
                isEdit={!!modalState.editRecord}
                initialData={modalState.editRecord}
                onClose={() => {
                    onCloseAddModal();
                    setModalState(prev => ({
                        ...prev,
                        showVaccinationModal: false,
                        editRecord: null,
                    }));
                }}
                onSave={(data) => {
                    if (modalState.editRecord) {
                        handleUpdateVaccination(data);
                    } else {
                        handleAddVaccination(data);
                    }

                    onCloseAddModal();
                    setModalState(prev => ({
                        ...prev,
                        showVaccinationModal: false,
                        editRecord: null,
                    }));
                }}
                vaccineItems={dropdownData.vaccines}
                supplierItems={dropdownData.suppliers}
            />
            {/* ===== DELETE MODAL ===== */}
            <ConfirmationModal
                type="delete"
                visible={modalState.delete.visible}
                title={`Are you sure you want to delete ${modalState.delete.record?.vaccine}?`}
                onClose={() => {
                    setModalState(prev => ({
                        ...prev,
                        delete: {
                            visible: false,
                            record: null,
                        },
                    }));
                }}
                onConfirm={async () => {
                    if (!modalState.delete.record) return;
                    try {
                        const res = await deleteVaccination(modalState.delete.record!.vaccinationId);
                        if (res.status === "Success") {
                            setVaccinations(prev =>
                                prev.filter(v => v.vaccinationId !== modalState.delete.record!.vaccinationId)
                            );
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
