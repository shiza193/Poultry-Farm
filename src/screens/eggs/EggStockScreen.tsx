import React, { useState, useCallback } from 'react';
import { View, StyleSheet, } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { useBusinessUnit } from "../../context/BusinessContext";
import { useFocusEffect } from '@react-navigation/native';
import { getEggStock, EggStock } from '../../services/EggsService';

type Props = {
  openAddModal: boolean;
  onCloseAddModal: () => void;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const EggStockScreen: React.FC<Props> = ({ setGlobalLoading }) => {
  const [eggStockData, setEggStockData] = useState<EggStock[]>([]);
  const { businessUnitId } = useBusinessUnit();

  const columns: TableColumn[] = [
    { key: 'unit', title: 'UNIT', width: 80, isTitle: true },
    { key: 'totalProduced', title: 'PRODUCED', width: 90 },
    { key: 'totalSold', title: 'SOLD', width: 90 },
    { key: 'availableStock', title: 'STOCK', width: 80 },
  ];

  const fetchEggStock = async () => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    const data = await getEggStock(businessUnitId);
    setEggStockData(data);
    setGlobalLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEggStock();
    }, [businessUnitId])
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16 ,marginTop:5}}>
        <DataCard columns={columns} data={eggStockData} itemsPerPage={5} />
      </View>
    </View>
  );
};

export default EggStockScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white, paddingTop: 40 },
});
