import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';

import { getFlockStock, FlockStock } from '../../services/FlockService';
import { useBusinessUnit } from '../../context/BusinessContext';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';

const FlockStockScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const [data, setData] = useState<FlockStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // ================= FETCH =================
  const fetchFlockStock = async () => {
    if (!businessUnitId) return;
    try {
      setLoading(true);

      const response = await getFlockStock(businessUnitId);

      const stockList = normalizeDataFormat(response, 'array', 'Flock Stock');

      setData(stockList);
      setTotalRecords(stockList.length);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Flock stock fetch error:', err);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlockStock();
  }, [businessUnitId]);

  // ================= PAGINATION =================
  const tableData = data.map(item => ({
    flock: item.flock,
    purchased: item.totalPurchased,
    mortality: item.totalMortality,
    hospitality: item.totalHospitality,
    sale: item.totalSale,
    available: item.availableStock,
    status: item.isEnded,
    raw: item,
  }));
  // ================= COLUMNS =================
  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 140 },
    { key: 'purchased', title: 'PURCHASED', width: 120 },
    { key: 'mortality', title: 'MORTALITY', width: 120 },
    { key: 'hospitality', title: 'HOSPITALITY', width: 130 },
    { key: 'sale', title: 'SALE', width: 100 },
    { key: 'available', title: 'AVAILABLE', width: 120 },
    {
      key: 'status',
      title: 'STATUS',
      width: 100,
      render: (_val: boolean, row: any) => {
        const isEnded = row.raw.isEnded;

        return (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: isEnded
                ? Theme.colors.success
                : Theme.colors.success, // border always shows
              backgroundColor: isEnded ? Theme.colors.success : 'transparent', // fill only for ended
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEnded && (
              <Text
                style={{
                  color: Theme.colors.white,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                ✔
              </Text>
            )}
          </View>
        );
      },
    },
  ];

  // ================= UI =================
  return (
    <SafeAreaView style={styles.safeArea}>
      {tableData.length > 0 ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16, marginTop: 15 }}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <DataCard
              columns={columns}
              data={tableData}
              showPagination={false}
              itemsPerPage={pageSize}
               loading={loading} 
              currentPage={currentPage}
              totalRecords={totalRecords}
              onPageChange={page => setCurrentPage(page)}
            />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Image source={Theme.icons.nodata} style={styles.noDataImage} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default FlockStockScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
});
