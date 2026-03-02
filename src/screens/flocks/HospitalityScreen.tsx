import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import SearchBar from '../../components/common/SearchBar';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import { useBusinessUnit } from '../../context/BusinessContext';
import {
  getHospitalityByFilter,
  HospitalityRecord,
  updateHospitality,
} from '../../services/FlockService';
import {
  addHospitality,
  AddHospitalityPayload,
  deleteHospitality,
} from '../../services/FlockService';
import { showSuccessToast } from '../../utils/AppToast';

interface HospitalityScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
}
const HospitalityScreen: React.FC<HospitalityScreenProps> = ({
  openAddModal,
  onCloseAddModal,
}) => {
  const { businessUnitId } = useBusinessUnit();

  const [data, setData] = useState<HospitalityRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<HospitalityRecord | null>(
    null,
  );
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{
    id: string | null;
    visible: boolean;
  }>({
    id: null,
    visible: false,
  });
  // ================= FETCH HOSPITALITY =================
  const fetchHospitality = useCallback(
    async (page: number = 1) => {
      if (!businessUnitId) return;
      try {
        setLoading(true);

        const res = await getHospitalityByFilter({
          businessUnitId,
          pageNumber: page,
          pageSize,
        });

        setData(res.list);
        setTotalRecords(res.totalCount);
      } catch (err) {
        console.error('Fetch hospitality error:', err);
        setData([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [businessUnitId],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchHospitality(1);
  }, [businessUnitId, fetchHospitality]);

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
    date: item.date ? new Date(item.date).toLocaleDateString() : '—',
    quantity: item.quantity,
    diagnosis: item.diagnosis,
    medication: item.medication,
    days: item.treatmentDays,
    vet: item.vetName,
    raw: item,
  }));

  const columns: TableColumn[] = [
    { key: 'flock', title: 'FLOCK', width: 140, showDots: true },
    { key: 'date', title: 'DATE', width: 110 },
    { key: 'quantity', title: 'QTY', width: 80 },
    { key: 'diagnosis', title: 'DIAGNOSIS', width: 140 },
    { key: 'medication', title: 'MEDICATION', width: 140 },
    { key: 'days', title: 'DAYS', width: 90 },
    { key: 'vet', title: 'VET', width: 120 },
  ];

  // ================= DELETE HOSPITALITY =================
  const openDeleteModal = (id: string) => {
    setDeleteModal({ id, visible: true });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await deleteHospitality(deleteModal.id);
      showSuccessToast('Success', 'Hospitality record deleted successfully');

      // Adjust pagination if last item on page deleted
      const newTotal = totalRecords - 1;
      const newPage = Math.min(currentPage, Math.ceil(newTotal / pageSize));

      setCurrentPage(newPage);
      await fetchHospitality(newPage);
    } catch (err) {
      console.error('Delete Hospitality Error:', err);
      // showErrorToast('Error', 'Failed to delete hospitality record');
    } finally {
      setDeleteModal({ id: null, visible: false });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* SEARCH */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <SearchBar
            placeholder="Search Flock..."
            initialValue={search}
            onSearch={setSearch}
          />
        </View>
      </View>

      {/* DATA TABLE */}

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <DataCard
            columns={columns}
            data={tableData}
            itemsPerPage={pageSize}
            loading={loading}
            currentPage={currentPage}
            totalRecords={totalRecords}
            onPageChange={page => {
              setCurrentPage(page);
              fetchHospitality(page);
            }}
            renderRowMenu={(row, closeMenu) => (
              <View>
                <TouchableOpacity
                  style={{ paddingVertical: 3, paddingHorizontal: 1 }}
                  onPress={() => {
                    setEditingRecord(row.raw);
                    onCloseAddModal?.(); // make sure modal opens
                    closeMenu();
                  }}
                >
                  <Text style={styles.menuText}>Edit Record</Text>
                </TouchableOpacity>
                <View style={styles.menuSeparator} />

                <TouchableOpacity
                  style={{ paddingVertical: 3, paddingHorizontal: 1 }}
                  onPress={() => {
                    openDeleteModal(row.raw.hospitalityId);
                    closeMenu();
                  }}
                >
                  <Text style={[styles.menuText, { color: 'red' }]}>
                    Delete Record
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
      </View>

      {/* ADD HOSPITALITY MODAL */}
      <ItemEntryModal
        visible={!!editingRecord || openAddModal}
        type="hospitality"
        record={editingRecord} // NEW PROP for pre-filled data
        onClose={() => {
          setEditingRecord(null);
          onCloseAddModal?.();
        }}
        hideFlockDropdown={false}
        onSave={async data => {
          if (!data.flockId) return console.log('Please select a valid flock!');
          setLoading(true);

          try {
            const payload: AddHospitalityPayload = {
              flockId: data.flockId,
              date: data.date
                ? new Date(data.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              quantity: Number(data.quantity),
              averageWeight: data.averageWeight ?? -1,
              symptoms: data.symptoms ?? '',
              diagnosis: data.diagnosis ?? '',
              medication: data.medication ?? '',
              dosage: data.dosage ?? '',
              treatmentDays: data.treatmentDays ?? 0,
              vetName: data.vetName ?? '',
              remarks: data.remarks ?? '',
              businessUnitId: businessUnitId!,
            };

            if (editingRecord) {
              // EDIT mode: call update API
              await updateHospitality(editingRecord.hospitalityId, payload);
              showSuccessToast(
                'Success',
                'Hospitality record updated successfully',
              );
              setEditingRecord(null);
              await fetchHospitality(currentPage);
            } else {
              // ADD mode: call add API
              await addHospitality(payload);
            }

            await fetchHospitality(currentPage);
          } catch (err) {
            console.error('Hospitality API Error:', err);
          } finally {
            setLoading(false);
            onCloseAddModal?.();
          }
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        type="delete"
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ id: null, visible: false })}
        onConfirm={confirmDelete}
        title="Are you sure you want to delete this hospitality record?"
      />
    </SafeAreaView>
  );
};

export default HospitalityScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    color: Theme.colors.black,
  },
  menuSeparator: {
    height: 2,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataImage: { width: 290, height: 290, resizeMode: 'contain' },
});
