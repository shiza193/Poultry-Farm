import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import {
  getEggProduction, EggProduction,
  getUnitsByProductType, addEggProduction, AddEggProductionPayload,
  deleteEggProduction, updateEggProduction,
  UpdateEggProductionPayload
} from '../../services/EggsService';
import { useBusinessUnit } from "../../context/BusinessContext";
import { useFocusEffect } from '@react-navigation/native';
import { getFlocks } from "../../services/FlockService";
import AddModal from '../../components/customPopups/AddModal';
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import SearchBar from '../../components/common/SearchBar';
import { Dropdown } from 'react-native-element-dropdown';
import { formatDisplayDate } from '../../utils/validation';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';

interface Flock {
  flockId: string;
  flockRef: string;
  breed: string;
  remainingQuantity: number;
}
type Props = {
  openAddModal: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal?: () => void;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
const EggProductionScreen: React.FC<Props> = ({
  setGlobalLoading,
  openAddModal,
  onCloseAddModal,
  onOpenAddModal,
}) => {
  // Use Context Api
  const { businessUnitId } = useBusinessUnit();
  // States
  const [eggProductionList, setEggProductionList] = useState<EggProduction[]>([]);
  const [filters, setFilters] = useState({
    searchKey: "",
    flockId: null as string | null,
  });
  const [masterData, setMasterData] = useState<{
    flocks: { label: string; value: string }[];
    units: { label: string; value: number }[];
  }>({
    flocks: [],
    units: [],
  });
  const [modalState, setModalState] = useState<{
    type: 'edit' | 'delete' | null;
    selectedRecord: EggProduction | null;
  }>({
    type: null,
    selectedRecord: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  // TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'ref', title: 'REF', width: 150, isTitle: true, showDots: true,
    },
    { key: 'flockRef', title: 'FLOCK', width: 160 },
    {
      key: 'date',
      title: 'DATE',
      width: 120,
      render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
    },
    { key: 'totalEggs', title: 'TOTAL EGGS', width: 120 },
    { key: 'fertileEggs', title: 'FERTILE', width: 100 },
    { key: 'brokenEggs', title: 'BROKEN', width: 80 },
  ];
  // FETCH DATA
  const fetchEggProduction = async (page = currentPage) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    const payload = {
      businessUnitId,
      flockId: filters.flockId,
      searchKey: filters.searchKey || null,
      pageNumber: page,
      pageSize: pageSize,
    };
    try {
      const response = await getEggProduction(payload);
      const normalizedEggProduction = normalizeDataFormat(response.items, 'array', 'EggProduction');
      setEggProductionList(normalizedEggProduction);
      setTotalRecords(response.totalRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchEggProduction();
      setMasterData(prev => ({ ...prev, selectedFlock: null }));
    }, [businessUnitId, filters])
  );
  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const normalizedFlocks: Flock[] = normalizeDataFormat(flocks, 'array', 'Flocks');
      const dropdownData = normalizedFlocks.map((f: Flock) => ({
        label: f.flockRef,
        value: f.flockId,
      }));
      setMasterData(prev => ({
        ...prev,
        flocks: dropdownData,
      }));
    } catch (error) {
      console.error("Failed to fetch flocks:", error);
    }
  };
  const fetchUnits = async () => {
    try {
      const units = await getUnitsByProductType(1);
      const normalizedUnits = normalizeDataFormat(units, 'array', 'Units');
      const dropdownData = normalizedUnits.map((u: any) => ({
        label: u.value,
        value: u.unitId,
      }));
      setMasterData(prev => ({ ...prev, units: dropdownData }));
    } catch (error) {
      console.error("Failed to fetch units", error);
    }
  };
  useEffect(() => {
    fetchFlocks();
    fetchUnits();
  }, [businessUnitId]);
  // ===== HANDLERS =====
  const handleAddEggProduction = async (data: any) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    try {
      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);

      const payload: AddEggProductionPayload = {
        flockId: data.flockId,
        businessUnitId,
        date: data.date.toISOString().split('T')[0],
        fertileEggs: intact,
        brokenEggs: broken,
        totalEggs: intact + broken,
        unitId: data.unitId,
        varietyId: null,
        typeId: null,
      };
      const res = await addEggProduction(payload);
      if (res.status === "Success") {
        setEggProductionList(prev => [...prev, res.data]);
        setTotalRecords(prev => prev + 1);
        setCurrentPage(1);
        showSuccessToast("Egg production added successfully");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to add egg production");
    } finally {
      setGlobalLoading(false);
      setModalState({ type: null, selectedRecord: null });
    }
  };
  const handleEditEggProduction = async (data: any, selectedRecord: EggProduction) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    try {
      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);
      const updatePayload: UpdateEggProductionPayload = {
        eggProductionId: selectedRecord.eggProductionId,
        ref: selectedRecord.ref,
        flockId: data.flockId,
        businessUnitId,
        unitId: data.unitId !== null ? Number(data.unitId) : null,
        date: data.date.toISOString().split('T')[0],
        fertileEggs: intact,
        brokenEggs: broken,
        totalEggs: intact + broken,
        typeId: null,
        varietyId: null,
      };
      const res = await updateEggProduction(selectedRecord.eggProductionId, updatePayload);
      if (res && res.status === 'Success') {
        setEggProductionList(prev =>
          prev.map(ep => ep.eggProductionId === selectedRecord.eggProductionId ? res.data : ep)
        );
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to update egg production");
    } finally {
      setGlobalLoading(false);
      setModalState({ type: null, selectedRecord: null });
    }
  };
  const handleDelete = async () => {
    if (!modalState.selectedRecord) return;
    setGlobalLoading(true);
    try {
      const res = await deleteEggProduction(modalState.selectedRecord.eggProductionId);
      if (res.status === "Success") {
        setEggProductionList(prev =>
          prev.filter(v => v.eggProductionId !== modalState.selectedRecord!.eggProductionId)
        );
        setTotalRecords(prev => prev - 1);
        if ((eggProductionList.length - 1) === 0 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          fetchEggProduction(newPage);
        }
        showSuccessToast("Egg production deleted successfully");
      }
    } catch (err: any) {
      showErrorToast("Failed to delete");
    } finally {
      setModalState({
        type: null,
        selectedRecord: null,
      });
      setGlobalLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
      <View style={styles.filterRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search Ref/Flock..."
            onSearch={(val) =>
              setFilters(prev => ({
                ...prev,
                searchKey: val,
              }))
            }
          />
        </View>
        <View style={styles.dropdownWrapper}>
          <Dropdown
            style={styles.inlineDropdown}
            containerStyle={styles.inlineDropdownContainer}
            data={
              masterData.flocks.length > 0
                ? masterData.flocks
                : [{ label: "No result found", value: null, disabled: true }]
            } labelField="label"
            valueField="value"
            placeholder="Select Flock"
            value={filters.flockId}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            onChange={(item) => {
              setFilters(prev => ({
                ...prev,
                flockId: item.value,
              }));
            }}
          />
        </View>
      </View>
      {filters.flockId && (
        <View style={styles.resetRow}>
          <TouchableOpacity
            onPress={() =>
              setFilters(prev => ({
                ...prev,
                flockId: null,
              }))
            }
          >
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <DataCard
          columns={columns}
          data={eggProductionList}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          totalRecords={totalRecords}
          onPageChange={page => {
            setCurrentPage(page);
            fetchEggProduction(page);
          }}
          renderRowMenu={(row, closeMenu) => (
            <View>
              <TouchableOpacity onPress={() => {
                setModalState({
                  type: 'edit',
                  selectedRecord: row,
                });
                onOpenAddModal?.();
                closeMenu();
              }}
                style={{ marginBottom: 8 }}
              >
                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', marginLeft: 10 }}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.menuSeparator} />
              <TouchableOpacity
                onPress={() => {
                  setModalState({
                    type: 'delete',
                    selectedRecord: row,
                  });
                  closeMenu();
                }}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: 'red', fontWeight: '600', marginLeft: 10 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
      {/* ===== ADD / EDIT MODAL ===== */}
      <AddModal
        visible={openAddModal}
        title={modalState.type === 'edit' ? "Edit Egg Production" : "Add Egg Production"}
        type="Egg production"
        unitItems={masterData.units}
        flockItems={masterData.flocks}
        initialData={modalState.selectedRecord}
        isEdit={modalState.type === 'edit'}
        onClose={() => {
          onCloseAddModal();
          setModalState({ type: null, selectedRecord: null });
        }}
        onSave={(formData) => {
          if (modalState.type === 'edit' && modalState.selectedRecord) {
            handleEditEggProduction(formData, modalState.selectedRecord);
          } else {
            handleAddEggProduction(formData);
          }
        }} />
      {/* ===== DELETE CONFIRMATION ===== */}
      <ConfirmationModal
        type="delete"
        visible={modalState.type === 'delete'}
        title={`Are you sure you want to delete ${modalState.selectedRecord?.ref}?`}
        onClose={() =>
          setModalState({
            type: null,
            selectedRecord: null,
          })
        }
        onConfirm={handleDelete}
      />
    </View>
  );
};
export default EggProductionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  // ===== SEARCH + DROPDOWN ROW =====
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingVertical: 8,
    gap: 8,
  },
  dropdownWrapper: {
    width: 120,
    zIndex: 1
  },
  inlineDropdown: {
    width: 120,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 42,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  inlineDropdownContainer: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
  },
  placeholderStyle: {
    fontSize: 12,
    color: Theme.colors.black,
  },
  selectedTextStyle: {
    fontSize: 12,
    color: Theme.colors.black,
  },
  resetRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 5
  },
  resetText: {
    fontSize: 13,
    fontWeight: "500",
    color: Theme.colors.error,
  },
  menuSeparator: {
    height: 2,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
});
