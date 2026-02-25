// import React, { useCallback, useEffect, useState } from "react";
// import { View, StyleSheet } from "react-native";
// import Theme from "../../../theme/Theme";
// import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
// import LoadingOverlay from "../../../components/loading/LoadingOverlay";
// import BackArrow from "../../../components/common/ScreenHeaderWithBack";
// import { useBusinessUnit } from "../../../context/BusinessContext";
// import { useFocusEffect } from "@react-navigation/native";
// import { getFeedStock } from "../../../services/FeedService";
// interface FeedStockRow {
//     feedRecord: string;
//     totalPurchased: number;
//     totalConsumed: number;
//     availableStock: number;
// }

// const FeedStockScreen: React.FC = () => {
//     const { businessUnitId } = useBusinessUnit();
//     const [data, setData] = useState<FeedStockRow[]>([]);
//     const [loading, setLoading] = useState(false);

//     const fetchFeedStock = async () => {
//         try {
//             setLoading(true);

//             const res = await getFeedStock(businessUnitId);
//             const mappedData: FeedStockRow[] = res.map(item => ({
//                 feedRecord: item.feed,
//                 totalPurchased: item.totalPurchased,
//                 totalConsumed: item.totalConsumed,
//                 availableStock: item.availableStock,
//             }));
//             setData(mappedData);
//         } catch (error) {
//             console.log("Feed Stock Screen Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };
//     useFocusEffect(
//         useCallback(() => {
//             fetchFeedStock();
//         }, [businessUnitId])
//     );
//     const columns: TableColumn[] = [
//         { key: "feedRecord", title: "FEED RECORD", width: 100, isTitle: true },
//         { key: "totalPurchased", title: " PURCHASED", width: 100 },
//         { key: "totalConsumed", title: " CONSUMED", width: 90 },
//         { key: "availableStock", title: "AVAILABLE ", width: 90 },
//     ];

//     return (
//         <View style={styles.container}>
//             <BackArrow title="Feed Stock" showBack
//                 onReportPress={() => console.log("Generate Report")}
//             />
//             <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
//                 <DataCard
//                     columns={columns}
//                     data={data}
//                     itemsPerPage={5}
//                 />
//             </View>

//             <LoadingOverlay visible={loading} />
//         </View>
//     );
// };

// export default FeedStockScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Theme.colors.background,
//     },
// });

import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Theme from "../../../theme/Theme";
import DataCard, { TableColumn } from "../../../components/customCards/DataCard";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import BackArrow from "../../../components/common/ScreenHeaderWithBack";
import { useBusinessUnit } from "../../../context/BusinessContext";
import { useFocusEffect } from "@react-navigation/native";
import { getFeedStock } from "../../../services/FeedService";
import { getFeedStockExcel } from "../../Report/ReportHelpers";
interface FeedStockRow {
    feedRecord: string;
    totalPurchased: number;
    totalConsumed: number;
    availableStock: number;
}

const FeedStockScreen: React.FC = () => {
    const { businessUnitId } = useBusinessUnit();
    const [data, setData] = useState<FeedStockRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalRecords = data.length;
    const fetchFeedStock = async () => {
        try {
            setLoading(true);
            const res = await getFeedStock(businessUnitId);
            const mappedData: FeedStockRow[] = res.map(item => ({
                feedRecord: item.feed,
                totalPurchased: item.totalPurchased,
                totalConsumed: item.totalConsumed,
                availableStock: item.availableStock,
            }));
            setData(mappedData);
        } catch (error) {
            console.log("Feed Stock Screen Error:", error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchFeedStock();
        }, [businessUnitId])
    );
    const columns: TableColumn[] = [
        { key: "feedRecord", title: "FEED RECORD", width: 100, isTitle: true },
        { key: "totalPurchased", title: " PURCHASED", width: 100 },
        { key: "totalConsumed", title: " CONSUMED", width: 90 },
        { key: "availableStock", title: "AVAILABLE ", width: 90 },
    ];

    return (
        <View style={styles.container}>
            <BackArrow
                title="Feed Stock"
                showBack
                onReportPress={async () => {
                    if (!businessUnitId) return;
                    setLoading(true)
                    await getFeedStockExcel(businessUnitId, 'FeedStockReport');
                    setLoading(false)
                }}
            />
            <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 10 }}>
                <DataCard
                    columns={columns}
                    data={data}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    onPageChange={(page) => setCurrentPage(page)} />
            </View>

            <LoadingOverlay visible={loading} />
        </View>
    );
};

export default FeedStockScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
});
