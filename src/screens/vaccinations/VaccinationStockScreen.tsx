import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import DataCard from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { CustomConstants } from "../../constants/CustomConstants";
import {
    getVaccinationStock,
    VaccinationStock,
} from "../../services/VaccinationService";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import ScreenTipCard from "../../components/customCards/ScreenTipCard";
import { stockstyles } from "./style";

const VaccinationStockScreen: React.FC = () => {
    const activeScreen = CustomConstants.VACCINATION_STOCK_SCREEEN;

    const [data, setData] = useState<VaccinationStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);

    const businessUnitId = "157cc479-dc81-4845-826c-5fb991bd3d47";

    // 🔹 Header labels (table header)
    const headerLabels = {
        stockvaccineName: "VACCINE NAME",
        totalvaccinePurchased: "TOTAL PURCHASED",
        totalSchedule: "TOTAL SCHEDULED",
        availablevaccineStock: "AVAILABLE STOCK",
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getVaccinationStock(businessUnitId);
            setData(result);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
            <View style={stockstyles.container}>
                <LoadingOverlay visible={loading} text="Loading..." />
                {/* ===== TOP ROW: TITLE + DOTS MENU ===== */}
                <View style={stockstyles.topRow}>
                    <Text style={stockstyles.title}>Vaccination Stock</Text>
                    <TouchableOpacity
                        style={stockstyles.dotsIconContainer}
                        onPress={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
                    >
                        <Image source={Theme.icons.dots} style={stockstyles.dotsIcon} />
                    </TouchableOpacity>
                </View>
                {/* ===== DOTS MENU ===== */}
                {isDotsMenuVisible && (
                    <TouchableOpacity
                        style={stockstyles.dotsOverlay}
                        activeOpacity={1}
                        onPress={() => setIsDotsMenuVisible(false)}
                    >
                        <View style={stockstyles.dotsMenu}>
                            <TouchableOpacity
                                style={stockstyles.dotsMenuItem}
                                onPress={() => {
                                    // TODO: Export logic
                                    console.log("Export Data clicked");
                                    setIsDotsMenuVisible(false);
                                }}
                            >
                                <View style={stockstyles.menuRow}>
                                    <View style={[stockstyles.circleIcon, { backgroundColor: "#FFD8B5" }]}>
                                        <Image source={Theme.icons.download} style={stockstyles.menuIcon} />
                                    </View>
                                    <Text style={stockstyles.menuText}>Export Data</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                <View style={stockstyles.tipCardContainer}>
                    <ScreenTipCard screen={CustomConstants.VACCINATION_STOCK_SCREEEN} />
                </View>
                {/* ===== TABLE ===== */}
                <ScrollView style={{ width: "100%", paddingHorizontal: 18 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flex: 1,marginTop:10 }}>
                            {/* Header Row */}
                            <DataCard
                                isHeader
                                labels={headerLabels}
                                showVaccinationStock={true}
                            />
                            {!loading && data.length === 0 ? (
                                <View style={{ marginTop: 40, alignItems: "center" }}>
                                    <Image
                                        source={Theme.icons.nodata}
                                        style={{ width: 200, height: 200, resizeMode: "contain" }}
                                    />
                                </View>
                            ) : (
                                data.map((item) => (
                                    <DataCard
                                        key={item.vaccineId}
                                        showVaccinationStock={true}
                                        stockvaccineName={item.vaccine}
                                        totalvaccinePurchased={item.totalPurchased}
                                        totalSchedule={item.totalSchedule}
                                        availablevaccineStock={item.availableStock}
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
export default VaccinationStockScreen;


