import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import { CustomConstants } from "../../constants/CustomConstants";
import DataCard from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { getVaccinations, Vaccination, getSuppliers, getVaccines, addVaccination } from "../../services/VaccinationService";
import DropDownPicker from "react-native-dropdown-picker";
import { TextInput } from "react-native";
import styles from "./style";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import AddModal from "../../components/customPopups/AddModal";
import { showErrorToast, toastAddSuccess } from "../../utils/AppToast";
const VaccinationsScreen = () => {
    const activeScreen = CustomConstants.VACCINATIONS_SCREEN;

    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
    // ===== SEARCH =====
    const [searchText, setSearchText] = useState("");
    const [supplierOpen, setSupplierOpen] = useState(false);
    const [supplierValue, setSupplierValue] = useState<string | null>(null);
    const [supplierItems, setSupplierItems] = useState<any[]>([]);
    const [addVaccinationModalVisible, setAddVaccinationModalVisible] = useState(false);
    const [vaccineItems, setVaccineItems] = useState<{ label: string; value: string }[]>([]);

    const businessUnitId = "157cc479-dc81-4845-826c-5fb991bd3d47";

    // Header labels for DataCard
    const headerLabels = {
        vaccineName: "VACCINE NAME",
        supplierName: "SUPPLIER",
        vaccineDate: "DATE",
        vaccineQuantity: "QUANTITY",
        vaccinePrice: "PRICE",
    };

    useEffect(() => {
        const fetchVaccinations = async () => {
            setLoading(true);
            const data = await getVaccinations(businessUnitId);
            console.log("Vaccinations API Response:", data);

            setVaccinations(data);
            setLoading(false);
        };
        fetchVaccinations();
    }, []);
    useEffect(() => {
        const fetchSuppliers = async () => {
            const suppliers = await getSuppliers(businessUnitId);

            console.log("Supplier API Response:", suppliers);

            const dropdownData = suppliers.map((s: any) => ({
                label: s.name,
                value: s.partyId,
            }));

            setSupplierItems(dropdownData);
        };

        fetchSuppliers();
    }, []);
    useEffect(() => {
        const fetchVaccines = async () => {
            const data = await getVaccines(); // API call
            setVaccineItems(data);
            console.log("Vaccines fetched:", data);
        };

        fetchVaccines();
    }, []);
    const filteredVaccinations = vaccinations.filter((item) => {
        // supplier filter
        const supplierMatch = supplierValue
            ? item.supplierId === supplierValue
            : true;

        // search filter (vaccine name)
        const searchMatch = searchText
            ? item.vaccine.toLowerCase().includes(searchText.toLowerCase())
            : true;

        return supplierMatch && searchMatch;
    });
    const handleAddVaccination = async (data: any) => {
        const payload = {
            vaccineId: data.vaccine,
            date: data.date.toISOString().split("T")[0],
            quantity: Number(data.quantity),
            price: Number(data.price || 0),
            note: data.note || "",
            supplierId: data.supplier,
            businessUnitId: businessUnitId,
            isPaid: data.paymentStatus === "Paid",
        };
        try {
            setLoading(true);
            const res = await addVaccination(payload);
            console.log("Vaccination added:", res);

            if (res.status === "Success") {
                setVaccinations(prev => [...prev, res.data]);
                toastAddSuccess();
            } else {
                showErrorToast(res.message || "Failed to add vaccination");
            }
        } catch (error: any) {
            showErrorToast(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    return (
        <SidebarWrapper
            activeScreen={activeScreen}
            setActiveScreen={() => { }}
        >
            <View style={styles.container}>
                <LoadingOverlay
                    visible={loading}
                    text="Loading vaccinations..."
                />
                {/* ===== TOP ROW: TITLE + DOTS MENU ===== */}
                <View style={styles.topRow}>
                    <Text style={styles.topRowTitle}>Vaccinations</Text>
                    <TouchableOpacity
                        style={styles.friendIconContainer}
                        onPress={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
                    >
                        <Image source={Theme.icons.dots} style={styles.friendIcon} />
                    </TouchableOpacity>
                </View>
                {/* ===== SEARCH + SUPPLIER FILTER ROW ===== */}
                <View style={styles.filterRow}>
                    {/* ===== SEARCH BAR ===== */}
                    <View style={styles.searchContainer}>
                        <Image source={Theme.icons.search} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search vaccine..."
                            placeholderTextColor={Theme.colors.textSecondary}
                            value={searchText}
                            onChangeText={setSearchText}
                            style={styles.searchInput}
                        />
                    </View>
                    {/* ===== SUPPLIER DROPDOWN ===== */}
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

                {/* ===== DOTS MENU ===== */}
                {isDotsMenuVisible && (
                    <TouchableOpacity
                        style={styles.dotsOverlay}
                        activeOpacity={1}
                        onPress={() => setIsDotsMenuVisible(false)}
                    >
                        <View style={styles.dotsMenu}>
                            <TouchableOpacity
                                style={styles.dotsMenuItemCustom}
                                onPress={() => {
                                    setAddVaccinationModalVisible(true);
                                    setIsDotsMenuVisible(false);
                                }}
                            >
                                <View style={styles.menuItemRowCustom}>
                                    <View
                                        style={[styles.circleIcon, { backgroundColor: "#D7F4E2" }]}
                                    >
                                        <Image source={Theme.icons.plus} style={styles.menuIconCustom} />
                                    </View>
                                    <Text style={styles.dotsMenuText}>New Vaccine</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dotsMenuItemCustom}
                                onPress={() => {
                                    Alert.alert("Export Data clicked");
                                    setIsDotsMenuVisible(false);
                                }}
                            >
                                <View style={styles.menuItemRowCustom}>
                                    <View
                                        style={[styles.circleIcon, { backgroundColor: "#FFD8B5" }]}
                                    >
                                        <Image
                                            source={Theme.icons.download}
                                            style={styles.menuIconCustom}
                                        />
                                    </View>
                                    <Text style={styles.dotsMenuText}>Export Data</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}

                {/* ===== TABLE ===== */}
                <ScrollView style={{ width: "100%", paddingHorizontal: 20 }}>
                    <ScrollView horizontal>
                        <View style={{ flex: 1 }}>
                            {/* Header Row */}
                            <DataCard
                                isHeader={true}
                                labels={headerLabels}
                                showVaccinations={true}
                            />

                            {!loading && filteredVaccinations.length === 0 ? (
                                <View style={{ alignItems: "flex-start", marginTop: 40 }}>
                                    <Image
                                        source={Theme.icons.nodata}
                                        style={{ width: 200, height: 200, resizeMode: "contain", marginLeft: 40 }}
                                    />
                                </View>
                            ) : (
                                filteredVaccinations.map((item) => (
                                    <DataCard
                                        key={item.vaccinationId}
                                        showVaccinations={true}
                                        vaccineName={item.vaccine}
                                        supplierName={item.supplier}
                                        vaccineDate={item.date.split("T")[0]}
                                        vaccineQuantity={item.quantity}
                                        vaccinePrice={item.price}
                                        onEdit={() => Alert.alert(`Edit ${item.vaccine}`)}
                                        onDelete={() => Alert.alert(`Delete ${item.vaccine}`)}
                                    />
                                ))
                            )}
                        </View>
                    </ScrollView>
                </ScrollView>
                <AddModal
                    visible={addVaccinationModalVisible}
                    type="vaccination"
                    title="Add Vaccination"
                    onClose={() => setAddVaccinationModalVisible(false)}
                    onSave={(data) => {
                        handleAddVaccination(data);
                        setAddVaccinationModalVisible(false);
                    }}
                    vaccineItems={vaccineItems}
                    supplierItems={supplierItems}
                />
            </View>
        </SidebarWrapper>
    );
};

export default VaccinationsScreen;

