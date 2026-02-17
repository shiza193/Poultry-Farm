import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import LoadingOverlay from '../../components/loading/LoadingOverlay';

import {
  getFlockHealthRecords,
  deleteFlockHealthRecord,
  FlockHealthRecord,
} from '../../services/FlockService';

import { useBusinessUnit } from '../../context/BusinessContext';
import { Dropdown } from 'react-native-element-dropdown';

interface FlockScreenProps {
  setGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlocksMortalityScreen: React.FC<FlockScreenProps> = ({ setGlobalLoading }) => {
  const { businessUnitId } = useBusinessUnit();
  const route = useRoute<any>();
  const flockIdFromRoute = route.params?.flockId ?? null;

  const [records, setRecords] = useState<FlockHealthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [flockOptions, setFlockOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(flockIdFromRoute);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!businessUnitId) return;

    try {
      setLoading(true);
      const res = await getFlockHealthRecords(businessUnitId, 1);
      const fetchedRecords = res?.data?.data ?? [];
      setRecords(fetchedRecords);

      // Build unique flock dropdown options
      const uniqueFlocks = Array.from(new Set(fetchedRecords.map(r => r.flockId))).map(id => {
        const flock = fetchedRecords.find(r => r.flockId === id);
        return {
          label: flock?.flock ?? 'Unknown',
          value: flock?.flockId ?? '',
        };
      });
      setFlockOptions(uniqueFlocks);

      // Preselect if navigation sent flockId
      if (flockIdFromRoute) {
        setSelectedFlockId(flockIdFromRoute);
      }
    } catch (err) {
      console.error('Fetch mortality error:', err);
      setRecords([]);
      setFlockOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [businessUnitId])
  );

  // ================= FILTER RECORDS =================
  const filteredRecords = selectedFlockId
    ? records.filter(r => r.flockId === selectedFlockId)
    : records;

  const tableData = filteredRecords.map(item => ({
    flock: item.flock,
    date: new Date(item.date).toLocaleDateString(),
    quantity: item.quantity,
    raw: item,
  }));

  // ================= DELETE RECORD =================
  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      setLoading(true);
      await deleteFlockHealthRecord(selectedId);
      setRecords(prev => prev.filter(item => item.flockHealthId !== selectedId));
    } catch (err) {
      console.error('Delete mortality error:', err);
    } finally {
      setSelectedId(null);
      setDeleteModalVisible(false);
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 130 },
    { key: 'date', title: 'DATE', width: 120 },
    { key: 'quantity', title: 'QUANTITY', width: 110 },
  ];

  const displayedFlockOptions =
    flockOptions.length > 0
      ? flockOptions
      : [{ label: 'There is nothing to show', value: null }];

  // ================= UI =================
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.filterRow}>
        <Dropdown
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          data={displayedFlockOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Flock"
          value={selectedFlockId}
          onChange={item => setSelectedFlockId(item.value)}
        />

        {selectedFlockId && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setSelectedFlockId(null)}
          >
            <Text style={styles.resetText}>Reset Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {tableData.length > 0 ? (
        <View style={styles.tableContainer}>
          <DataCard
            columns={columns}
            data={tableData}
            renderRowMenu={(row, closeMenu) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedId(row.raw.flockHealthId);
                  setDeleteModalVisible(true);
                  closeMenu();
                }}
                style={styles.deleteMenu}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        !loading && (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        )
      )}

      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this record?"
      />

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

export default FlocksMortalityScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  dropdown: {
    width: 220,
    height: 40,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  dropdownContainer: { borderRadius: 8 },
  resetButton: {
    marginLeft: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: { color: Theme.colors.error, fontWeight: '600', fontSize: 14 },
  tableContainer: { flex: 1, paddingHorizontal: 16 },
  deleteMenu: { padding: 2 },
  deleteText: { color: 'red', fontWeight: '600' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
