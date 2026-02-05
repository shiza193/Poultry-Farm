import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect, } from '@react-navigation/native';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { getVaccinations, Vaccination, getSuppliers, getVaccines, addVaccination, updateVaccination, deleteVaccination } from "../../services/VaccinationService";
import DropDownPicker from "react-native-dropdown-picker";
import styles from "./style";
import AddModal from "../../components/customPopups/AddModal";
import ConfirmationModal from "../../components/customPopups/ConfirmationModal";
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import { useBusinessUnit } from "../../context/BusinessContext"
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
    const [searchText, setSearchText] = useState("");
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [supplierValue, setSupplierValue] = useState<string | null>(null);
    const [supplierItems, setSupplierItems] = useState<any[]>([]);
    const [vaccineItems, setVaccineItems] = useState<{ label: string; value: number }[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);

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
            setSupplierValue(null);
        }, [businessUnitId])
    );

    useEffect(() => {
        if (!businessUnitId) return;
        const fetchSuppliers = async () => {
            const suppliers = await getSuppliers(businessUnitId);
            const dropdownData = suppliers.map((s: any) => ({ label: s.name, value: s.partyId }));
            setSupplierItems(dropdownData);
        };
        fetchSuppliers();
    }, [businessUnitId]);

    useEffect(() => {
        const fetchVaccines = async () => {
            const data = await getVaccines();
            setVaccineItems(data);
        };
        fetchVaccines();
    }, []);

    const filteredVaccinations = vaccinations.filter(item => {
        const supplierMatch = supplierValue
            ? item.supplierId === supplierValue
            : true;
        const searchMatch = searchText
            ? item.vaccine.toLowerCase().includes(searchText.toLowerCase())
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
        if (!selectedVaccination || !businessUnitId) return;
        const payload = {
            vaccinationId: selectedVaccination.vaccinationId,
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
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search vaccine..."
                        placeholderTextColor={Theme.colors.textSecondary}
                        value={searchText}
                        onChangeText={setSearchText}
                        style={styles.searchInput}
                    />

                    {/*  CLEAR ICON */}
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchText("");
                                fetchVaccinationsData();
                            }}
                        >
                            <Image source={Theme.icons.close1} style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}
                    {/*  SEARCH ICON */}
                    <TouchableOpacity onPress={() => fetchVaccinationsData()}>
                        <Image
                            source={Theme.icons.search}
                            style={styles.searchIcon}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.dropdownWrapper}>
                    <DropDownPicker
                        open={supplierOpen}
                        value={supplierValue}
                        items={supplierItems}
                        setOpen={setSupplierOpen}
                        setValue={setSupplierValue}
                        setItems={setSupplierItems}
                        placeholder="Supplier"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        textStyle={styles.dropdownText}
                    />
                </View>
            </View>
            {(supplierValue) && (
                <View style={styles.resetRow}>
                    <TouchableOpacity onPress={() => {
                        setSupplierValue(null);
                    }}>
                        <Text style={styles.resetText}>Reset Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* ===== DATA CARD ===== */}
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <DataCard
                    columns={columns}
                    data={filteredVaccinations}
                    itemsPerPage={5}
                    renderRowMenu={(row, closeMenu) => (
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsEditMode(true);
                                    setSelectedVaccination(row);
                                    onOpenAddModal();
                                    closeMenu();
                                }}
                            >
                                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600' }}>Edit </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setVaccinationToDelete(row);
                                    setDeleteModalVisible(true);
                                    closeMenu();
                                }}
                                style={{ marginTop: 8 }}
                            >
                                <Text style={{ color: 'red', fontWeight: '600' }}>Delete </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {/* ===== ADD / EDIT MODAL ===== */}
            <AddModal
                visible={openAddModal}
                type="vaccination"
                title={isEditMode ? "Edit Vaccination" : "Add Vaccination"}
                isEdit={isEditMode}
                initialData={selectedVaccination}
                onClose={() => {
                    onCloseAddModal();
                    setIsEditMode(false);
                    setSelectedVaccination(null);
                }}
                onSave={(data) => {
                    isEditMode ? handleUpdateVaccination(data) : handleAddVaccination(data);
                    onCloseAddModal();
                }}
                vaccineItems={vaccineItems}
                supplierItems={supplierItems}
            />
            {/* ===== DELETE MODAL ===== */}
            <ConfirmationModal
                type="delete"
                visible={deleteModalVisible}
                title={`Are you sure you want to delete ${vaccinationToDelete?.vaccine}?`}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setVaccinationToDelete(null);
                }}
                onConfirm={async () => {
                    if (!vaccinationToDelete) return;
                    try {
                        const res = await deleteVaccination(vaccinationToDelete.vaccinationId);
                        if (res.status === "Success") {
                            setVaccinations(prev =>
                                prev.filter(v => v.vaccinationId !== vaccinationToDelete.vaccinationId)
                            );
                            showSuccessToast("Vaccination deleted successfully");
                        } else {
                            showErrorToast(res.message || "Delete failed");
                        }
                    } catch (error: any) {
                        showErrorToast(error.message || "Something went wrong");
                    } finally {
                        setDeleteModalVisible(false);
                        setVaccinationToDelete(null);
                    }
                }}
            />
        </View>
    );
};

export default VaccinationsScreen;
