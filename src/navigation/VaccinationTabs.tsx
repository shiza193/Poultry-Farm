import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Theme from "../theme/Theme";
import Header from "../components/common/LogoHeader";
import VaccinationsScreen from "../screens/vaccinations/VaccinationsScreen";
import VaccineScheduleScreen from "../screens/vaccinations/VaccineScheduleScreen";
import VaccinationStockScreen from "../screens/vaccinations/VaccinationStockScreen";
import { getVaccinesExcel, getVaccineStockExcel } from "../screens/Report/ReportHelpers";
import { useBusinessUnit } from "../context/BusinessContext";

type TabType = "vaccinations" | "schedule" | "stock";

const VaccinationMainScreen = () => {
    const { businessUnitId } = useBusinessUnit();
    const [activeTab, setActiveTab] = useState<TabType>("vaccinations");
    const [openAddModal, setOpenAddModal] = useState(false);
    const pageSize = 10;
    const [filters, setFilters] = useState({
        searchKey: "",
        supplierId: null as string | null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const renderScreen = () => {
        switch (activeTab) {
            case "schedule":
                return (
                    <VaccineScheduleScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                        onOpenAddModal={() => setOpenAddModal(true)}
                    />
                );
            case "stock":
                return (
                    <VaccinationStockScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                    />
                );

            default:
                return (
                    <VaccinationsScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                        onOpenAddModal={() => setOpenAddModal(true)}
                        filters={filters}
                        setFilters={setFilters}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                );
        }
    };
    const TabButton = ({
        title,
        active,
        onPress,
    }: {
        title: string;
        active: boolean;
        onPress: () => void;
    }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.tabButton,
                    active && styles.activeTabButton,
                ]}
            >
                <Text
                    style={[
                        styles.tabText,
                        active && styles.activeTabText,
                    ]}
                >
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };
    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.white }}>
            {/* 🔹 TOP HEADER */}
            <Header
                title="Vaccinations"
                onAddNewPress={
                    activeTab === "vaccinations" || activeTab === "schedule"
                        ? () => setOpenAddModal(true)
                        : undefined
                }
                onReportPress={
                    activeTab === "vaccinations" || activeTab === "stock"
                        ? async () => {
                            if (!businessUnitId) return;
                            try {
                                if (activeTab === "vaccinations") {
                                    // Prepare payload based on current filters
                                    const payload = {
                                        businessUnitId,
                                        searchKey: filters.searchKey || null,
                                        supplierId: filters.supplierId || null,
                                        pageNumber: currentPage,
                                        pageSize: pageSize,
                                    };
                                    console.log("Vaccination report payload:", payload);
                                    const response = await getVaccinesExcel("VaccinationsReport", payload);
                                    console.log("Excel response:", response);
                                }
                                if (activeTab === "stock") {
                                    await getVaccineStockExcel(businessUnitId, "VaccineStockReport");
                                }
                            } catch (error) {
                                console.error("Error exporting Vaccinations Excel:", error);
                            } finally {
                            }
                        }
                        : undefined
                }
                showAdminPortal={true}
                showLogout={true}
            />
            {/* TOP TOGGLE BUTTONS */}
            <View style={styles.tabContainer}>
                <TabButton
                    title="Vaccinations"
                    active={activeTab === "vaccinations"}
                    onPress={() => setActiveTab("vaccinations")}
                />
                <View style={styles.separator} />
                <TabButton
                    title="Schedule"
                    active={activeTab === "schedule"}
                    onPress={() => setActiveTab("schedule")}
                />
                <View style={styles.separator} />

                <TabButton
                    title="Stock"
                    active={activeTab === "stock"}
                    onPress={() => setActiveTab("stock")}
                />
            </View>
            {/* SCREEN CONTENT */}
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>
        </View>
    );
};

export default VaccinationMainScreen;
const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        margin: 16,
        backgroundColor: Theme.colors.white,
        borderColor: Theme.colors.borderColor,
        borderWidth: 1,
        borderRadius: 10,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    activeTabButton: {
        flex: 1,
        backgroundColor: Theme.colors.mainButton,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: Theme.colors.black,
    },
    activeTabText: {
        color: Theme.colors.white,
    },
    separator: {
        width: 2,
        backgroundColor: Theme.colors.settinglines,
        marginVertical: 4,
    },
});
