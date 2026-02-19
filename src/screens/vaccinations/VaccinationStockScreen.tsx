import React, { useCallback, useEffect, useState } from "react";
import {
    View,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import {
    getVaccinationStock,
    VaccinationStock,
} from "../../services/VaccinationService";
import { stockstyles } from "./style";
import { useBusinessUnit } from "../../context/BusinessContext"
import { useFocusEffect } from "@react-navigation/native";
interface Props {
    openAddModal: boolean;
    onCloseAddModal: () => void;
    setGlobalLoading: (val: boolean) => void;
}
const VaccinationStockScreen: React.FC<Props> = ({
    setGlobalLoading,
}) => {
    const { businessUnitId } = useBusinessUnit();
    const [data, setData] = useState<VaccinationStock[]>([]);

    const fetchData = async () => {
        if (!businessUnitId) return;
        setGlobalLoading(true);
        try {
            const result = await getVaccinationStock(businessUnitId);
            setData(result);
        } finally {
            setGlobalLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [businessUnitId])
    );

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
