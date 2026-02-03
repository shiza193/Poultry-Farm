import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import {
  getEggProduction, EggProduction,
  getUnitsByProductType, addEggProduction, AddEggProductionPayload
} from '../../services/EggsService';
import { useBusinessUnit } from "../../context/BusinessContext";
import { useFocusEffect } from '@react-navigation/native';
import { getFlocks } from "../../services/FlockService";
import DropDownPicker from "react-native-dropdown-picker";
import AddModal from '../../components/customPopups/AddModal';
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";

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
}) => {
  const { businessUnitId } = useBusinessUnit();
  const [eggProductionList, setEggProductionList] = useState<EggProduction[]>([]);
  const [flockItems, setFlockItems] = useState<{ label: string; value: string }[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [tempSearch, setTempSearch] = useState<string>("");
  const [flockOpen, setFlockOpen] = useState<boolean>(false);
  const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
  const [unitItems, setUnitItems] = useState<
    { label: string; value: number }[]
  >([]);
  // TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'ref', title: 'REF', width: 150, isTitle: true,
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
  const fetchEggProduction = async () => {
    if (!businessUnitId) return;
    setGlobalLoading(true);
    const payload = {
      businessUnitId,
      flockId: selectedFlock,
      searchKey: searchText || null,
      pageNumber: 1,
      pageSize: 10,
    };
    const data = await getEggProduction(payload);
    setEggProductionList(data);
    setGlobalLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      fetchEggProduction();
      setSelectedFlock(null);
    }, [businessUnitId])
  );
  // ===== FETCH FLOCKS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    try {
      const flocks: Flock[] = await getFlocks(businessUnitId);
      const dropdownData = flocks.map((f: Flock) => ({
        label: f.flockRef,
        value: f.flockId,
      }));
      setFlockItems(dropdownData);
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
  }, [selectedFlock, searchText]);
  const fetchUnits = async () => {
    try {
      const units = await getUnitsByProductType(1);

      const dropdownData = units.map((u: any) => ({
        label: u.value,
        value: u.unitId,
      }));

      setUnitItems(dropdownData);
    } catch (error) {
      console.error("Failed to fetch units", error);
    }
  };

  const handleAddEggProduction = async (data: any) => {
    try {
      setGlobalLoading(true);

      // Convert modal data to payload
      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);

      const payload: AddEggProductionPayload = {
        flockId: data.flockId,
        businessUnitId: businessUnitId,
        date: data.date.toISOString().split('T')[0],
        fertileEggs: intact,
        brokenEggs: broken,
        totalEggs: intact + broken,
        unitId: data.unitId,
        varietyId: null,
        typeId: null,
      };
      console.log('Egg Production Payload:', payload);
      const response = await addEggProduction(payload);
      showSuccessToast("Egg production added successfully");
      console.log(' API Response:', response);
      fetchEggProduction();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to add Egg production");
      console.log(' Add Egg Production Error:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
      <View style={styles.filterRow}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Ref/Flock..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={tempSearch}
            onChangeText={setTempSearch}
            style={styles.searchInput}
          />

          {/*  CLEAR ICON */}
          {tempSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setTempSearch("");
                setSearchText("");
              }}
            >
              <Image
                source={Theme.icons.close1}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          )}

          {/* SEARCH ICON */}
          <TouchableOpacity
            onPress={() => setSearchText(tempSearch)}
          >
            <Image
              source={Theme.icons.search}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={flockOpen}
            value={selectedFlock}
            items={flockItems}
            setOpen={setFlockOpen}
            setValue={setSelectedFlock}
            setItems={setFlockItems}
            placeholder=" Flock"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
          />
        </View>
      </View>
      {(selectedFlock) && (
        <View style={styles.resetRow}>
          <TouchableOpacity onPress={() => {
            setSelectedFlock(null);
          }}>
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ paddingHorizontal: 16, marginTop: 10, }}>
        <DataCard
          columns={columns}
          data={eggProductionList}
          itemsPerPage={5}
        />
      </View>
      <AddModal
        visible={openAddModal}
        title="Agg Egg Production"
        type="Egg production"
        unitItems={unitItems}
        flockItems={flockItems}
        onClose={onCloseAddModal}
        onSave={(data) => {
          handleAddEggProduction(data);
          onCloseAddModal();
        }}
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
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10,
    backgroundColor: Theme.colors.white,
  },
  searchIcon: { width: 18, height: 18, tintColor: Theme.colors.success, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: Theme.colors.black },
  clearIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: Theme.colors.success,
  },
  dropdownWrapper: { width: 120, zIndex: 2000 },
  dropdown: {
    borderColor: Theme.colors.success, height: 40,
    minHeight: 40,
  },
  dropdownContainer: { borderColor: Theme.colors.success },
  dropdownText: { color: Theme.colors.black },
  resetRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "500",
    color: Theme.colors.error,
  },
});
