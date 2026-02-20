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
    flocks: { label: string; value: string; isSelected?: boolean }[];
    units: { label: string; value: number }[];
  }>({
    flocks: [],
    units: [],
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEggProduction, setSelectedEggProduction] = useState<EggProduction | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
      render: (value: string) => {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return <Text>{`${day}/${month}/${year}`}</Text>;
      },
    },
    { key: 'totalEggs', title: 'TOTAL EGGS', width: 120 },
    { key: 'fertileEggs', title: 'FERTILE', width: 100 },
    { key: 'brokenEggs', title: 'BROKEN', width: 80 },
  ];
  // FETCH DATA
  const fetchEggProduction = async (page: number = 1) => {
    if (!businessUnitId) return;

    setGlobalLoading(true);

    const payload = {
      businessUnitId,
      flockId: filters.flockId,
      searchKey: filters.searchKey || null,
      pageNumber: page,
      pageSize,
    };

    try {
      const data = await getEggProduction(payload);
      setEggProductionList(data.items);
      setTotalRecords(data.totalRecords);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchEggProduction(1);
      setMasterData(prev => ({ ...prev, selectedFlock: null }));
    }, [businessUnitId])
  );
  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;

    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const dropdownData = flocks.map(f => ({
        label: f.flockRef,
        value: f.flockId,
        isSelected: false,
      }));
      setMasterData(prev => ({ ...prev, flocks: dropdownData }));
    } catch (error) {
      console.error("Failed to fetch flocks:", error);
    }
  };

  useEffect(() => {
    fetchFlocks();
    fetchUnits();
  }, [businessUnitId]);
  useEffect(() => {
    if (businessUnitId) {
      fetchEggProduction();
    }
  }, [filters]);
  const fetchUnits = async () => {
    try {
      const units = await getUnitsByProductType(1);
      const dropdownData = units.map((u: any) => ({
        label: u.value,
        value: u.unitId,
      }));
      setMasterData(prev => ({ ...prev, units: dropdownData }));
    } catch (error) {
      console.error("Failed to fetch units", error);
    }
  };
  // ===== HANDLERS =====
  const handleAddEditEggProduction = async (data: any) => {
    if (!businessUnitId) return;
    setGlobalLoading(true);

    try {
      // Convert numbers
      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);
      if (isEditMode && selectedEggProduction) {
        // ===== EDIT PAYLOAD =====
        const updatePayload: UpdateEggProductionPayload = {
          eggProductionId: selectedEggProduction.eggProductionId,
          ref: selectedEggProduction.ref,
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
        // Call Update API
        await updateEggProduction(
          selectedEggProduction.eggProductionId,
          updatePayload
        );
        showSuccessToast("Egg production updated successfully");
      } else {
        // ===== ADD PAYLOAD =====
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
        // Call Add API
        await addEggProduction(payload);
        showSuccessToast("Egg production added successfully");
      }
      // Refresh list
      fetchEggProduction();
    } catch (err: any) {
      showErrorToast(err.message || "Failed to save egg production");
    } finally {
      setGlobalLoading(false);
      setIsEditMode(false);
      setSelectedEggProduction(null);
    }
  };
  const handleDelete = async () => {
    if (!selectedEggProduction) return;
    setGlobalLoading(true);
    try {
      await deleteEggProduction(selectedEggProduction.eggProductionId);
      showSuccessToast("Egg production deleted successfully");
      fetchEggProduction();
    } catch (err: any) {
      showErrorToast("Failed to delete");
    } finally {
      setDeleteModalVisible(false);
      setSelectedEggProduction(null);
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
            data={masterData.flocks}
            labelField="label"
            valueField="value"
            placeholder="Flock"
            value={filters.flockId}
            selectedTextStyle={styles.dropdownText}
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
          }} renderRowMenu={(row, closeMenu) => (
            <View>
              <TouchableOpacity onPress={() => { setIsEditMode(true); setSelectedEggProduction(row); onOpenAddModal?.(); closeMenu(); }}
                style={{ marginBottom: 8 }}
              >
                <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', marginLeft: 10 }}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.menuSeparator} />
              <TouchableOpacity
                onPress={() => {
                  setSelectedEggProduction(row);
                  setDeleteModalVisible(true);
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
        title={isEditMode ? "Edit Egg Production" : "Add Egg Production"}
        type="Egg production"
        unitItems={masterData.units}
        flockItems={masterData.flocks}
        initialData={selectedEggProduction}
        isEdit={isEditMode}
        onClose={() => { onCloseAddModal(); setIsEditMode(false); setSelectedEggProduction(null); }}
        onSave={handleAddEditEggProduction}
      />
      {/* ===== DELETE CONFIRMATION ===== */}
      <ConfirmationModal
        type="delete"
        visible={deleteModalVisible}
        title={`Are you sure you want to delete ${selectedEggProduction?.ref}?`}
        onClose={() => { setDeleteModalVisible(false); setSelectedEggProduction(null); }}
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
  dropdownText: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
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
