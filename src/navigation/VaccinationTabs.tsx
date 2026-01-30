import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, } from "react-native";
import Theme from "../theme/Theme";
import Header from "../components/common/Header";

import VaccinationsScreen from "../screens/vaccinations/VaccinationsScreen";
import VaccineScheduleScreen from "../screens/vaccinations/VaccineScheduleScreen";
import VaccinationStockScreen from "../screens/vaccinations/VaccinationStockScreen";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "vaccination" | "schedule" | "stock";

const VaccinationMainScreen = () => {
    const [activeTab, setActiveTab] = useState<TabType>("vaccination");
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [addVaccinationModalVisible, setAddVaccinationModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedVaccination, setSelectedVaccination] = useState<any>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [modalType, setModalType] = useState<TabType | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const renderScreen = () => {
        switch (activeTab) {
            case "schedule":
                return <VaccineScheduleScreen />;
            case "stock":
                return <VaccinationStockScreen />;
            default:
                return <VaccinationsScreen />;
        }
    };
    const getHeaderTitle = () => {
        switch (activeTab) {
            case "schedule":
                return "Vaccination Schedule";
            case "stock":
                return "Vaccination Stock";
            default:
                return "Vaccinations";
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
        <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.white }}>
            {/* 🔹 TOP HEADER */}
            <Header
                title={getHeaderTitle()}
                onPressDots={() => setIsDotsMenuVisible(true)}
            />

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
                                setIsEditMode(false);
                                setSelectedVaccination(null);
                                setAddVaccinationModalVisible(true);
                            }}
                        >
                            <View style={styles.menuItemRowCustom}>
                                <Text style={styles.dotsMenuText}> + Add New</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dotsMenuItemCustom}
                            onPress={() => {
                                setIsDotsMenuVisible(false);
                            }}
                        >
                            <View style={styles.menuItemRowCustom}>
                                <Text style={styles.dotsMenuText}>Export Data</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}

            {/* TOP TOGGLE BUTTONS */}
            <View style={styles.tabContainer}>
                <TabButton
                    title="Vaccination"
                    active={activeTab === "vaccination"}
                    onPress={() => setActiveTab("vaccination")}
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
        </SafeAreaView>
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
        width: 1,
        backgroundColor: Theme.colors.sky,
        marginVertical: 4,
    },
    dotsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
    },
    dotsMenu: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: Theme.colors.white,
        borderRadius: 10,
        padding: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dotsMenuItemCustom: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    menuItemRowCustom: { flexDirection: "row", alignItems: "center" },
    circleIcon: {
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuIconCustom: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },
    dotsMenuText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
});
