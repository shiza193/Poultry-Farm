import React, { useEffect, useState } from "react";
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
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import AddModal from "../../components/customPopups/AddModal";
import ConfirmationModal from "../../components/customPopups/ConfirmationModal";
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import { useBusinessUnit } from "../../context/BusinessContext"

const VaccinationsScreen = () => {
    const { businessUnitId } = useBusinessUnit();
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState(""); const [supplierOpen, setSupplierOpen] = useState(false);
    const [supplierValue, setSupplierValue] = useState<string | null>(null);
    const [supplierItems, setSupplierItems] = useState<any[]>([]);
    const [vaccineItems, setVaccineItems] = useState<{ label: string; value: number }[]>([]);
    const [addVaccinationModalVisible, setAddVaccinationModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);

    useEffect(() => {
        if (!businessUnitId) return;
        const fetchVaccinations = async () => {
            setLoading(true);
            const data = await getVaccinations(businessUnitId);
            setVaccinations(data);
            setLoading(false);
        };
        fetchVaccinations();
    }, [businessUnitId]);

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
            setLoading(true);
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
            setLoading(false);
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
            render: (val: number) => <Text>{`$${val}`}</Text>
        },
    ];
    return (
        <View style={styles.container}>
            <LoadingOverlay visible={loading} text="Loading vaccinations..." />
         
          
            {/* ===== SEARCH + FILTER ===== */}
            <View style={styles.filterRow}>
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search vaccine..."
                        placeholderTextColor={Theme.colors.textSecondary}
                        value={tempSearch}
                        onChangeText={setTempSearch}
                        style={styles.searchInput}
                    />

                    {/*  CLEAR ICON */}
                    {tempSearch.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setTempSearch("");
                                setSearchText("");
                            }}
                        >
                            <Image
                                source={Theme.icons.close1}
                                style={styles.clearIcon}
                            />
                        </TouchableOpacity>
                    )}
                    {/*  SEARCH ICON */}
                    <TouchableOpacity
                        onPress={() => setSearchText(tempSearch)}
                    >
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

            {/* ===== DATA CARD ===== */}
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                <DataCard
                    columns={columns}
                    data={filteredVaccinations}
                    showActions={true}
                    onEdit={(row) => {
                        setIsEditMode(true);
                        setSelectedVaccination(row);
                        setAddVaccinationModalVisible(true);
                    }}
                    onDelete={(row) => {
                        setVaccinationToDelete(row);
                        setDeleteModalVisible(true);
                    }}
                />
            </View>
            {/* ===== ADD / EDIT MODAL ===== */}
            <AddModal
                visible={addVaccinationModalVisible}
                type="vaccination"
                title={isEditMode ? "Edit Vaccination" : "Add Vaccination"}
                isEdit={isEditMode}
                initialData={selectedVaccination}
                onClose={() => {
                    setAddVaccinationModalVisible(false);
                    setIsEditMode(false);
                    setSelectedVaccination(null);
                }}
                onSave={(data) => {
                    isEditMode ? handleUpdateVaccination(data) : handleAddVaccination(data);
                    setAddVaccinationModalVisible(false);
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
