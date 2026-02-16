import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Theme from "../theme/Theme";
import Header from "../components/common/LogoHeader";
import { useNavigation } from '@react-navigation/native';
import VaccinationsScreen from "../screens/vaccinations/VaccinationsScreen";
import VaccineScheduleScreen from "../screens/vaccinations/VaccineScheduleScreen";
import VaccinationStockScreen from "../screens/vaccinations/VaccinationStockScreen";
import LoadingOverlay from "../components/loading/LoadingOverlay";
import { CustomConstants } from "../constants/CustomConstants";
import ConfirmationModal from "../components/customPopups/ConfirmationModal";
import { Logout } from "./NavigationService";

type TabType = "vaccinations" | "schedule" | "stock";

const VaccinationMainScreen = () => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<TabType>("vaccinations");
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const renderScreen = () => {
        switch (activeTab) {
            case "schedule":
                return (
                    <VaccineScheduleScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                        onOpenAddModal={() => setOpenAddModal(true)}
                        setGlobalLoading={setGlobalLoading}
                    />
                );

            case "stock":
                return (
                    <VaccinationStockScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                        setGlobalLoading={setGlobalLoading}
                    />
                );

            default:
                return (
                    <VaccinationsScreen
                        openAddModal={openAddModal}
                        onCloseAddModal={() => setOpenAddModal(false)}
                        onOpenAddModal={() => setOpenAddModal(true)}
                        setGlobalLoading={setGlobalLoading}
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
            <LoadingOverlay visible={globalLoading} text="Loading..." />
            {/* 🔹 TOP HEADER */}
            <Header
                title="Vaccinations"
                onPressDots={() => setIsDotsMenuVisible(true)}
            />
            {isDotsMenuVisible && (
                <TouchableOpacity
                    style={styles.dotsOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDotsMenuVisible(false)}
                >
                    <View style={styles.dotsMenu}>
                        {/* ADD NEW */}
                        {(activeTab === "vaccinations" || activeTab === "schedule") && (
                            <TouchableOpacity
                                style={styles.dotsMenuItemCustom}
                                onPress={() => {
                                    setIsDotsMenuVisible(false);
                                    setOpenAddModal(true);
                                }}
                            >
                                <Text style={styles.dotsMenuText}>+ Add New</Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.menuSeparator} />

                        {/* EXPORT DATA - vaccination or stock */}
                        {(activeTab === "vaccinations" || activeTab === "stock") && (
                            <TouchableOpacity
                                style={styles.dotsMenuItemCustom}
                                onPress={() => {
                                    setIsDotsMenuVisible(false);
                                    // Export logic
                                }}
                            >
                                <View style={styles.menuItemRowCustom}>
                                    <Image
                                        source={Theme.icons.report}
                                        style={styles.menuIcon}
                                    />
                                    <Text style={styles.dotsMenuText}>Report</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View style={styles.menuSeparator} />

                        {/* LOGOUT - har jagah dikhe */}
                        <TouchableOpacity
                            style={styles.dotsMenuItemCustom}
                            onPress={() => {
                                setIsDotsMenuVisible(false);
                                setShowLogoutModal(true);
                            }}
                        >
                            <View style={styles.menuItemRowCustom}>
                                <Image source={Theme.icons.logout} style={styles.logoutIcon} />
                                <Text style={styles.dotsMenuText}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.menuSeparator} />

                        {/* BACK TO ADMIN - har jagah dikhe */}
                        <TouchableOpacity
                            style={styles.dotsMenuItemCustom}
                            onPress={() => {
                                setIsDotsMenuVisible(false);
                                navigation.navigate(CustomConstants.DASHBOARD_TABS);
                            }}
                        >
                            <View style={styles.menuItemRowCustom}>
                                <Image
                                    source={Theme.icons.back}
                                    style={styles.logoutIcon}
                                />
                                <Text style={styles.dotsMenuText}>Admin Portal</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}
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
            <ConfirmationModal
                type="logout"
                visible={showLogoutModal}
                title="Are you sure you want to logout?"
                onClose={() => setShowLogoutModal(false)}
                onConfirm={Logout}
            />
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
        right: 30,
        backgroundColor: Theme.colors.white,
        borderRadius: 10,
        padding: 5,
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
    dotsMenuText: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    menuIcon: {
        width: 16,
        height: 16,
        marginRight: 10,
        tintColor: Theme.colors.textPrimary,
    },
    menuSeparator: {
        height: 1,
        backgroundColor: Theme.colors.SeparatorColor,
        marginHorizontal: 8,
    },
    logoutIcon: {
        width: 16,
        height: 16,
        marginRight: 10,
    
    },
});
