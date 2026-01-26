import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import { CustomConstants } from "../../constants/CustomConstants";
import DataCard from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { getVaccinations, Vaccination, getSuppliers } from "../../services/VaccinationService";
import DropDownPicker from "react-native-dropdown-picker";
import { TextInput } from "react-native";
import styles from "./style";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
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
    return (
        <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
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
                                    Alert.alert("Add New Vaccination clicked");
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
            </View>
        </SidebarWrapper>
    );
};

export default VaccinationsScreen;

