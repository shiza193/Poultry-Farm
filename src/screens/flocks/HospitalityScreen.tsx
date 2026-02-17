import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import SearchBar from '../../components/common/SearchBar';

import {
  getHospitalityByFilter,
  HospitalityRecord,
} from '../../services/FlockService';

import { useBusinessUnit } from '../../context/BusinessContext';

interface FlockScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
  setGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}
const HospitalityScreen: React.FC<FlockScreenProps> = ({
  setGlobalLoading,
}) => {
  const { businessUnitId } = useBusinessUnit();
  const [data, setData] = useState<HospitalityRecord[]>([]);
  const [search, setSearch] = useState('');

  // ================= FETCH =================
  const fetchHospitality = async () => {
    if (!businessUnitId) return;

    try {
      setGlobalLoading?.(true);
      const res = await getHospitalityByFilter({
        businessUnitId,
        pageNumber: 1,
        pageSize: 100,
      });
      setData(res ?? []);
    } catch (err) {
      console.error('Fetch hospitality error:', err);
      setData([]);
    } finally {
      setGlobalLoading?.(false);
    }
  };

  useEffect(() => {
    fetchHospitality();
  }, [businessUnitId]);

  const formatDate = (date?: string) => {
    if (!date) return '—';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // ================= FILTER =================
  const filtered = data.filter(item => {
    if (!search) return true;
    return (
      item.flock?.toLowerCase().includes(search.toLowerCase()) ||
      item.vetName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const tableData = filtered.map(item => ({
    flock: item.flock,
    date: formatDate(item.date),
    quantity: item.quantity,
    diagnosis: item.diagnosis,
    medication: item.medication,
    days: item.treatmentDays,
    vet: item.vetName,
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 140, isTitle: true },
    { key: 'date', title: 'DATE', width: 110 },
    { key: 'quantity', title: 'QTY', width: 80 },
    { key: 'diagnosis', title: 'DIAGNOSIS', width: 140 },
    { key: 'medication', title: 'MEDICATION', width: 140 },
    { key: 'days', title: 'DAYS', width: 90 },
    { key: 'vet', title: 'VET', width: 120 },
  ];

  // ================= UI =================
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* SEARCH + ACTION */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <SearchBar
            placeholder="Search Flock..."
            initialValue={search}
            onSearch={setSearch}
          />
        </View>

        {/* <TouchableOpacity
          style={styles.newButton}
          onPress={() => console.log('Add Hospitality')}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity> */}
      </View>

      {tableData.length > 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
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

export default HospitalityScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },

  newButton: {
    backgroundColor: Theme.colors.primaryYellow,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },

  newButtonText: {
    fontWeight: '600',
    color: Theme.colors.black,
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
