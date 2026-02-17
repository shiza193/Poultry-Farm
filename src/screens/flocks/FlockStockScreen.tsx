import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';

import { getFlockStock, FlockStock } from '../../services/FlockService';
import { useBusinessUnit } from '../../context/BusinessContext';


interface FlockScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
  setGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlockStockScreen: React.FC<FlockScreenProps> = ({ setGlobalLoading }) => {
  const { businessUnitId } = useBusinessUnit();
  const [data, setData] = useState<FlockStock[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchFlockStock = async () => {
    if (!businessUnitId) return;

    try {
      setLoading(false);
      setGlobalLoading?.(true); 
      const res = await getFlockStock(businessUnitId);
      setData(res ?? []);
    } catch (err: any) {
      setData([]);
    } finally {
      setGlobalLoading?.(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlockStock();
  }, [businessUnitId]);

  // ================= TABLE =================
  const tableData = data.map(item => ({
    flock: item.flock,
    purchased: item.totalPurchased,
    mortality: item.totalMortality,
    hospitality: item.totalHospitality,
    sale: item.totalSale,
    available: item.availableStock,
    status: item.isEnded ? 'Ended' : 'Active',
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 140 },
    { key: 'purchased', title: 'PURCHASED', width: 120 },
    { key: 'mortality', title: 'MORTALITY', width: 120 },
    { key: 'hospitality', title: 'HOSPITALITY', width: 130 },
    { key: 'sale', title: 'SALE', width: 100 },
    { key: 'available', title: 'AVAILABLE', width: 120 },
    { key: 'status', title: 'STATUS', width: 100 },
  ];

  // ================= UI =================
  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && !setGlobalLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.primaryYellow} />
      ) : tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 15 }}>
          <DataCard columns={columns} data={tableData} />
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

  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
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
  noData: {
    textAlign: 'center',
    marginTop: 40,
    color: Theme.colors.grey,
  },
});
