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
  updateFlockHealth,
} from '../../services/FlockService';

import { useBusinessUnit } from '../../context/BusinessContext';
import { Dropdown } from 'react-native-element-dropdown';
import { showSuccessToast } from '../../utils/AppToast';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';

const FlocksMortalityScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const route = useRoute<any>();
  const flockIdFromRoute = route.params?.flockId ?? null;

  const [records, setRecords] = useState<FlockHealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [flockOptions, setFlockOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(
    flockIdFromRoute,
  );
  const [mortalityModalVisible, setMortalityModalVisible] = useState(false);
  const [editMortality, setEditMortality] = useState<FlockHealthRecord | null>(
    null,
  );
  const [modalState, setModalState] = useState<{
    selectedModal: 'edit' | 'delete' | null;
    record: FlockHealthRecord | null;
  }>({
    selectedModal: null,
    record: null,
  });

  const fetchRecords = async () => {
    if (!businessUnitId) return;

    try {
      setLoading(true);
      const res = await getFlockHealthRecords(businessUnitId, 1);
      const fetchedRecords = res?.data?.data ?? [];
      setRecords(fetchedRecords);

      // Build unique flock dropdown options
      const uniqueFlocks = Array.from(
        new Set(fetchedRecords.map(r => r.flockId)),
      ).map(id => {
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

      return () => {
        // Cleanup function runs on unmount
        setSelectedFlockId(null); // Reset the filter
      };
    }, [businessUnitId]),
  );

  const handleDeleteRecord = async () => {
    if (!modalState.record) return;
    try {
      const res = await deleteFlockHealthRecord(
        modalState.record.flockHealthId,
      );

      if (res?.status === 'Success') {
        // Remove from table
        setRecords(prev =>
          prev.filter(
            item => item.flockHealthId !== modalState.record!.flockHealthId,
          ),
        );

        showSuccessToast('Record deleted successfully');
      }
    } catch (error: any) {
      console.error('Delete mortality error:', error);
    } finally {
      setModalState({ selectedModal: null, record: null });
    }
  };
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

  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 140, showDots: true },
    { key: 'date', title: 'DATE', width: 125 },
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
 loading={loading}
             showPagination={false}
            renderRowMenu={(row, closeMenu) => (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setEditMortality(row.raw); // jo record edit karna hai
                    setMortalityModalVisible(true); // modal open karo
                    closeMenu();
                  }}
                  style={{ marginBottom: 3 }}
                >
                  <Text
                    style={{
                      color: Theme.colors.textPrimary,
                      fontWeight: '600',
                      fontSize: 16,
                      marginLeft: 20,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuSeparator} />

                <View
                  style={{
                    height: 1,
                    backgroundColor: Theme.colors.white,
                    marginVertical: 4,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setModalState({ selectedModal: 'delete', record: row.raw });
                    closeMenu();
                  }}
                >
                  <Text
                    style={{
                      color: 'red',
                      fontWeight: '600',
                      fontSize: 16,
                      marginLeft: 20,
                    }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
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
        visible={modalState.selectedModal === 'delete'}
        title={`Are you sure you want to delete ${modalState.record?.flock}?`}
        onClose={() => setModalState({ selectedModal: null, record: null })}
        onConfirm={handleDeleteRecord}
      />
      <ItemEntryModal
        visible={mortalityModalVisible}
        type="mortality"
        initialData={
          editMortality
            ? {
                quantity: editMortality.quantity,
                expireDate: new Date(editMortality.date), // <-- yahan date ko expireDate me convert
                id: editMortality.flockHealthId, // Date object hona chahiye
              }
            : undefined
        }
        onClose={() => setMortalityModalVisible(false)}
        onSave={async data => {
          if (!editMortality) return;

          try {
            setLoading(true);
            const payload = {
              flockHealthId: editMortality.flockHealthId,
              flockId: editMortality.flockId,
              quantity: Number(data.quantity),
              date:
                data.date instanceof Date
                  ? data.date.toISOString().split('T')[0]
                  : data.date,
              flockHealthStatusId: 1,
            };

            await updateFlockHealth(payload);

            setRecords(prev =>
              prev.map(item =>
                item.flockHealthId === payload.flockHealthId
                  ? { ...item, ...payload }
                  : item,
              ),
            );

            showSuccessToast('Mortality record updated successfully');
            setEditMortality(null);
            setMortalityModalVisible(false);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
      />
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
  menuSeparator: {
    height: 2,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
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
