import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import { CustomConstants } from "../../constants/CustomConstants";
import {
    getVaccinationStock,
    VaccinationStock,
} from "../../services/VaccinationService";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import ScreenTipCard from "../../components/customCards/ScreenTipCard";
import { stockstyles } from "./style";
import { useBusinessUnit } from "../../context/BusinessContext"

const VaccinationStockScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();

    const [data, setData] = useState<VaccinationStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
    const fetchData = async () => {
        if (!businessUnitId) return;
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
    }, [businessUnitId]);

    // ===== DATA CARD COLUMNS =====
    const columns: TableColumn[] = [
        { key: "vaccine", title: " NAME", isTitle: true },
        { key: "totalPurchased", title: " PURCHASED" },
        { key: "totalSchedule", title: " SCHEDULED" },
        { key: "availableStock", title: "AVAILABLE", width: 90 },
    ];

    // ===== MAP DATA TO MATCH COLUMN KEYS =====
    const tableData = data.map(item => ({
        vaccine: item.vaccine,
        totalPurchased: item.totalPurchased,
        totalSchedule: item.totalSchedule,
        availableStock: item.availableStock,
    }));

    return (
            <View style={stockstyles.container}>
                <LoadingOverlay visible={loading} text="Loading..." />

                {/* ===== TOP ROW ===== */}
                {/* <View style={stockstyles.topRow}>
                    <Text style={stockstyles.title}>Vaccination Stock</Text>
                    <TouchableOpacity
                        style={stockstyles.dotsIconContainer}
                        onPress={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
                    >
                        <Image source={Theme.icons.dots} style={stockstyles.dotsIcon} />
                    </TouchableOpacity>
                </View> */}

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
                {/* ===== DATA CARD TABLE ===== */}
                <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 18 }}>
                    <DataCard
                        columns={columns}
                        data={tableData}
                    />
                </View>
            </View>
    );
};

export default VaccinationStockScreen;
