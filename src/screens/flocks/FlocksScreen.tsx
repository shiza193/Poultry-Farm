import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Theme from '../../theme/Theme';
import AddFlockModal from '../../components/customPopups/AddFlockModal';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { formatDisplayDate } from '../../utils/validation';

import {
  getFlockByFilter,
  getFlocks,
  getParties,
  addFlock,
  updateFlockIsEnded,
  addAutomaticFeedRecord,
  calculateFCR,
  addFlockHealthRecord,
  addHospitality,
  deleteFlock,
  AddFlockPayload,
  AutoFeedRecordPayload,
  CalculateFCRPayload,
} from '../../services/FlockService';
import { useNavigation } from '@react-navigation/native';
import { CustomConstants } from '../../constants/CustomConstants';
import { useBusinessUnit } from '../../context/BusinessContext';
import SearchBar from '../../components/common/SearchBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';
import { showSuccessToast } from '../../utils/AppToast';

// object ka structure define karta hai.
interface Flock {
  flockId: string;
  ref: string;
  breed: string;
  quantity: number;
  hasFeed?: boolean;
  expireQuantity: number;
  hospitalizedQuantity: number;
  saleQuantity: number;
  remainingQuantity: number;
  arrivalDate: string;
  supplier: string;
  isEnded: boolean;
}

interface FlocksScreenProps {
  openAddModal?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
  setGlobalLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlocksScreen: React.FC<FlocksScreenProps> = ({
  setGlobalLoading,
  openAddModal,
  onCloseAddModal,
}) => {
  const navigation = useNavigation<any>();
  const { businessUnitId } = useBusinessUnit();

  // ===== search aur filter functionality =====
  const [filterState, setFilterState] = useState({
    searchKey: '',
    isEnded: false,

    selected: {
      flockId: null as string | null,
      supplierId: null as string | null,
    },

    options: {
      flocks: [] as { label: string; id: string }[],
      suppliers: [] as { label: string; id: string }[],
    },
  });
  const [flocks, setFlocks] = useState<Flock[]>([]);
  // =====modals ka visibility control =====
  const [modals, setModals] = useState({
    add: false,
    filter: false,
    feed: false,
    fcr: false,
    mortality: false,
    hospitality: false,
    confirmDelete: false,
    dotsMenu: false,
  });
  //wo flock jo currently kisi action ke liye select kiya gaya ho
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  //wo flock jo delete ke liye select kiya gaya ho
  const [flockToDelete, setFlockToDelete] = useState<Flock | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // ===== FETCH FLOCKS BASED ON FILTERS =====
  const fetchFlocks = async (page: number = 1) => {
    if (!businessUnitId) return;

    setGlobalLoading?.(true);

    try {
      const data = await getFlockByFilter({
        businessUnitId,
        searchKey: filterState.searchKey || null,
        flockId: filterState.selected.flockId,
        supplierId: filterState.selected.supplierId,
        isEnded: filterState.isEnded ? true : null,
        pageNumber: page,
        pageSize,
      });

      const normalizedData = normalizeDataFormat(
        data,
        'object',
        'Flocks Filter',
      );

      setFlocks(
        normalizeDataFormat(normalizedData.list, 'array', 'Flocks List'),
      );
      setTotalRecords(normalizedData.totalCount || 0);
    } catch (err) {
      console.log('fetchFlocks error:', err);
      setFlocks([]);
      setTotalRecords(0);
    } finally {
      setGlobalLoading?.(false);
    }
  };

  const fetchDropdownFlocks = async () => {
    if (!businessUnitId) return;

    const data = await getFlocks(businessUnitId);
    const flocksList = normalizeDataFormat(data, 'array', 'Flocks Dropdown');

    setFilterState(prev => ({
      ...prev,
      options: {
        ...prev.options,
        flocks: flocksList.map((i: any) => ({
          label: `${i.flockRef}`,
          id: i.flockId,
        })),
      },
    }));
  };
  const fetchSuppliers = async () => {
    if (!businessUnitId) return;

    const data = await getParties(businessUnitId, 1);
    const suppliersList = normalizeDataFormat(
      data,
      'array',
      'Suppliers Dropdown',
    );

    setFilterState(prev => ({
      ...prev,
      options: {
        ...prev.options,
        suppliers: suppliersList.map((s: any) => ({
          label: s.name,
          id: s.partyId,
        })),
      },
    }));
  };

  const tableData = flocks.map(f => ({
    flockName: `${f.ref} (${f.breed})`,
    supplier: f.supplier,
    quantity: f.quantity,
    expired: f.expireQuantity,
    hospitalized: f.hospitalizedQuantity,
    currentQty: f.remainingQuantity,
    saleQty: f.saleQuantity,
    arrivalDate: formatDisplayDate(f.arrivalDate),
    raw: f,
  }));

  const columns: TableColumn[] = [
    {
      key: 'rowAction',
      title: 'Action',
      width: 70,
      render: (_v, _r, index, toggleExpand) => (
        <TouchableOpacity
          onPress={() => {
            if (typeof index === 'number') {
              toggleExpand?.(index);
            }
          }}
          style={{ alignItems: 'center' }}
        >
          <Image
            source={Theme.icons.dropdown}
            style={{ width: 18, height: 18, tintColor: Theme.colors.success }}
          />
        </TouchableOpacity>
      ),
    },
    {
      key: 'flockName',
      title: 'FLOCK NAME',
      width: 140,
      isTitle: true,
      // showDots: true,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(CustomConstants.FLOCK_DETAIL_SCREEN, {
              flock: row.raw,
              flockId: row.raw.flockId,
            })
          }
        >
          <Text style={{ fontWeight: '700', color: Theme.colors.black }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    { key: 'supplier', title: 'SUPPLIER', width: 120 },
    { key: 'quantity', title: 'QUANTITY', width: 90 },
    {
      key: 'expired',
      title: 'EXPIRED',
      width: 100,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(CustomConstants.FLOCKS_MORTALITY_SCREEN, {
              flockId: row.raw.flockId,
            })
          }
        >
          <Text style={{ fontWeight: '700', color: Theme.colors.black }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    {
      key: 'hospitalized',
      title: 'HOSPITALIZED',
      width: 110,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(CustomConstants.HOSPITALITY_SCREEN, {
              flockId: row.raw.flockId,
            })
          }
        >
          <Text style={{ fontWeight: '700', color: Theme.colors.black }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
    },
    { key: 'currentQty', title: 'CURRENT', width: 110 },
    { key: 'saleQty', title: 'SALE', width: 100 },
    { key: 'arrivalDate', title: 'ARRIVAL DATE', width: 130 },
  ];

  useEffect(() => {
    if (!businessUnitId) return;

    fetchDropdownFlocks();
    fetchSuppliers();
  }, [businessUnitId]);

  useEffect(() => {
    if (!businessUnitId) return;

    setCurrentPage(1);
    fetchFlocks(1);
  }, [
    businessUnitId,
    filterState.searchKey,
    filterState.selected.flockId,
    filterState.selected.supplierId,
    filterState.isEnded,
  ]);

  const AddFlock = async (data: any) => {
    const payload: AddFlockPayload = {
      businessUnitId: businessUnitId!,
      flockTypeId: Number(data.flockType),
      breed: data.breed,
      quantity: Number(data.quantity),
      price: Number(data.price),
      supplierId: data.supplier!,
      isHen: data.isHen,
      isPaid: data.isPaid,
      dateOfBirth: data.dob?.toISOString().split('T')[0] || '',
      arrivalDate: data.arrivalDate?.toISOString().split('T')[0] || '',
      weight: data.avgWeight ? Number(data.avgWeight) : null,
    };
    const response = await addFlock(payload);
    showSuccessToast('Flock added successfully');

    normalizeDataFormat(response, 'object', 'Add Flock');
    setCurrentPage(1);
    fetchFlocks(1);
    fetchDropdownFlocks();
    setModals(prev => ({ ...prev, add: false }));
  };

  const FeedEntry = async (data: any) => {
    if (!selectedFlock) return;

    const payload: AutoFeedRecordPayload = {
      flockId: selectedFlock.flockId,
      feedId: Number(data.feed),
      quantity: Number(data.quantity),
      businessUnitId: businessUnitId!,
    };

    try {
      const feedResult = await addAutomaticFeedRecord(payload);
      normalizeDataFormat(feedResult, 'object', 'Feed Entry');
      showSuccessToast('Feed added successfully');

      setModals(prev => ({ ...prev, feed: false }));
    } catch (err) {
      console.log('FeedEntry error:', err);
    }
  };

  const FCR = async (data: any) => {
    if (!selectedFlock) return;

    const payload: CalculateFCRPayload = {
      flockId: selectedFlock.flockId,
      currentWeight: Number(data.currentWeight),
    };

    try {
      const result = await calculateFCR(payload);
      const normalizedResult = normalizeDataFormat(
        result,
        'object',
        'FCR Result',
      );
      return normalizedResult;
    } catch (err) {
      console.log('FCR error:', err);
    }
  };

  const Mortality = async (data: any) => {
    if (!selectedFlock) return;

    const quantity = Number(data.quantity);
    const payload = {
      flockId: selectedFlock.flockId,
      quantity,
      date:
        data.expireDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      flockHealthStatusId: 1,
    };

    try {
      const mortalityResult = await addFlockHealthRecord(payload);
      normalizeDataFormat(mortalityResult, 'object', 'Mortality');
      showSuccessToast('Mortality added successfully');
      setModals(prev => ({ ...prev, mortality: false }));
    } catch (err) {
      console.log('Mortality error:', err);
    }
  };

  const Hospitality = async (data: any) => {
    if (!selectedFlock) return;

    const quantity = Number(data.quantity);
    const payload = {
      flockId: selectedFlock.flockId,
      date:
        data.hospitalityDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      quantity,
      averageWeight: Number(data.averageWeight),
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      medication: data.medication,
      dosage: data.dosage,
      treatmentDays: Number(data.treatmentDays),
      vetName: data.vetName,
      remarks: data.remarks || null,
      businessUnitId: businessUnitId!,
    };

    try {
      const hospResult = await addHospitality(payload);
      normalizeDataFormat(hospResult, 'object', 'Hospitality');
      showSuccessToast('Hospitality added successfully');
      setModals(prev => ({ ...prev, hospitality: false }));
    } catch (err) {
      console.log('Hospitality error:', err);
    }
  };

  const DeleteFlock = async () => {
    if (!flockToDelete) return;

    try {
      // Call the API to delete the flock
      const deleted = await deleteFlock(flockToDelete.flockId);
      normalizeDataFormat(deleted, 'object', 'Delete Flock');

      setFlocks(prev => prev.filter(f => f.flockId !== flockToDelete.flockId));

          // Update total records and current page if needed
      setTotalRecords(prev => prev - 1);
      setCurrentPage(prev =>
        Math.min(prev, Math.ceil((totalRecords - 1) / pageSize)),
      );

      setModals(prev => ({ ...prev, confirmDelete: false }));
      setFlockToDelete(null);

      showSuccessToast('Flock deleted successfully');
    } catch (err) {
      console.log('DeleteFlock error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.mainContainer}>
          <View style={styles.filterSection}>
            <View style={styles.searchCompleteRow}>
              {/* SEARCH BAR */}
              <View style={{ flex: 1 }}>
                <SearchBar
                  placeholder="Search Flock..."
                  initialValue={filterState.searchKey}
                  onSearch={value => {
                    setFilterState(prev => ({ ...prev, searchKey: value }));
                  }}
                />
              </View>

              {/* COMPLETE CHECKBOX */}
              <TouchableOpacity
                style={styles.completeCheckboxContainerRow}
                onPress={() =>
                  setFilterState(prev => ({ ...prev, isEnded: !prev.isEnded }))
                }
              >
                <View
                  style={[
                    styles.checkboxSmall,
                    filterState.isEnded && {
                      backgroundColor: Theme.colors.primaryYellow,
                    },
                  ]}
                />
                <Text style={styles.completeText}>Complete</Text>
              </TouchableOpacity>
            </View>

            {/* ===== DROPDOWNS + RESET BUTTON ===== */}
            <View style={styles.dropdownRow}>
              <Dropdown
                style={styles.inlineDropdown}
                containerStyle={styles.inlineDropdownContainer}
                data={filterState.options.flocks}
                labelField="label"
                valueField="id"
                value={filterState.selected.flockId}
                onChange={item =>
                  setFilterState(prev => ({
                    ...prev,
                    selected: { ...prev.selected, flockId: item.id },
                  }))
                }
              />

              <Dropdown
                style={styles.inlineDropdown}
                containerStyle={styles.inlineDropdownContainer}
                data={filterState.options.suppliers}
                labelField="label"
                valueField="id"
                value={filterState.selected.supplierId}
                onChange={item =>
                  setFilterState(prev => ({
                    ...prev,
                    selected: { ...prev.selected, supplierId: item.id },
                  }))
                }
              />

              {(filterState.isEnded ||
                filterState.selected.flockId ||
                filterState.selected.supplierId ||
                filterState.searchKey) && (
                <TouchableOpacity
                  style={styles.inlineResetButton}
                  onPress={() => {
                    setFilterState(prev => ({
                      ...prev,
                      isEnded: false,
                      selected: { flockId: null, supplierId: null },
                      searchKey: '',
                    }));
                  }}
                >
                  <Text style={styles.resetText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* ===== FLOCK LIST ===== */}
          {flocks.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Image source={Theme.icons.nodata} style={styles.noDataImage} />
            </View>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <DataCard
                columns={columns}
                data={tableData}
                itemsPerPage={pageSize}
                currentPage={currentPage}
                totalRecords={totalRecords}
                onPageChange={page => {
                  setCurrentPage(page);
                  fetchFlocks(page);
                }}
                renderExpandedRow={row => {
                  const f = row.raw;

                  const actions = [
                    {
                      label: 'Feed',
                      icon: Theme.icons.feedGreen,
                      color: Theme.colors.warning,
                      show: !f.isEnded,
                      onPress: () => {
                        setSelectedFlock(f);
                        setModals(prev => ({ ...prev, feed: true }));
                      },
                    },
                    {
                      label: 'FCR',
                      icon: Theme.icons.trend,
                      color: Theme.colors.green,
                      show: !f.isEnded && f.remainingQuantity > 0,
                      onPress: () => {
                        setSelectedFlock(f);
                        setModals(prev => ({ ...prev, fcr: true }));
                      },
                    },
                    {
                      label: 'Mortality',
                      icon: Theme.icons.motality,
                      color: Theme.colors.motalitycolor,
                      show: !f.isEnded && f.remainingQuantity > 0,
                      onPress: () => {
                        setSelectedFlock(f);
                        setModals(prev => ({ ...prev, mortality: true }));
                      },
                    },
                    {
                      label: 'Hospitality',
                      icon: Theme.icons.hospital,
                      color: Theme.colors.expand,
                      show: !f.isEnded && f.remainingQuantity > 0,
                      onPress: () => {
                        setSelectedFlock(f);
                        setModals(prev => ({ ...prev, hospitality: true }));
                      },
                    },
                    {
                      label: 'Complete',
                      icon: Theme.icons.tick,
                      color: Theme.colors.complete,
                      show: !f.isEnded,
                      onPress: async () => {
                        await updateFlockIsEnded(f.flockId, true);
                        showSuccessToast('Ended', 'Flock ended successfully');
                        fetchFlocks(currentPage);
                      },
                    },
                    {
                      label: 'Delete',
                      icon: Theme.icons.delete,
                      color: Theme.colors.pink,
                      show: true,
                      onPress: () => {
                        setFlockToDelete(f);
                        setModals(prev => ({ ...prev, confirmDelete: true }));
                      },
                    },
                  ];

                  return (
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'flex-start',
                        marginLeft: 24,
                      }}
                    >
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 14 }}
                      >
                        {actions
                          .filter(a => a.show)
                          .map((action, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={action.onPress}
                              style={[
                                styles.actionButton,
                                { backgroundColor: action.color },
                              ]}
                            >
                              <Image
                                source={action.icon}
                                style={styles.actionIcon}
                              />
                              <Text style={styles.actionText}>
                                {action.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>

        <AddFlockModal
          visible={openAddModal || modals.add}
          onClose={
            onCloseAddModal ??
            (() => setModals(prev => ({ ...prev, add: false })))
          }
          businessUnitId={businessUnitId}
          onSave={AddFlock}
        />

        {/* ===== ITEM ENTRY MODALS (Feed / FCR / Mortality / Hospitality) ===== */}
        <ItemEntryModal
          visible={modals.feed}
          onClose={() => setModals(prev => ({ ...prev, feed: false }))}
          type="feed"
          onSave={FeedEntry}
        />

        <ItemEntryModal
          visible={modals.fcr}
          onClose={() => setModals(prev => ({ ...prev, fcr: false }))}
          type="fcr"
          onSave={FCR}
        />

        <ItemEntryModal
          visible={modals.mortality}
          onClose={() => setModals(prev => ({ ...prev, mortality: false }))}
          type="mortality"
          onSave={Mortality}
        />

        <ItemEntryModal
          visible={modals.hospitality}
          onClose={() => setModals(prev => ({ ...prev, hospitality: false }))}
          type="hospitality"
          onSave={Hospitality}
        />

        {/* ===== DELETE CONFIRMATION MODAL ===== */}
        <ConfirmationModal
          visible={modals.confirmDelete}
          onClose={() => setModals(prev => ({ ...prev, confirmDelete: false }))}
          type="delete"
          title={`Are you sure you want to delete flock ${flockToDelete?.ref}?`}
          onConfirm={DeleteFlock}
        />

        {/* ===== FILTER MODAL =====
        <BusinessUnitModal
          visible={modals.filter}
          onClose={() => setModals(prev => ({ ...prev, filter: false }))}
          mode="filter"
          flockItems={filterState.options.flocks}
          supplierItems={filterState.options.suppliers}
          selectedFlockId={filterState.selected.flockId}
          selectedSupplier={filterState.selected.supplierId}
          isComplete={filterState.isEnded}
          onApplyFilter={(flockId, supplierId, isComplete) => {
            setFilterState(prev => ({
              ...prev,
              selected: {
                flockId: flockId || null,
                supplierId: supplierId || null,
              },
              isEnded: isComplete ?? false,
            }));

            setModals(prev => ({ ...prev, filter: false }));
          }}
        /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FlocksScreen;

// ===== STYLES =====
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.white,
    gap: 10,
  },

  searchContainer: {
    width: '100%',
  },

  completeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  completeCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  completeText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },

  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
  inlineDropdown: {
    width: 150,

    borderWidth: 1,
    borderColor: Theme.colors.success,
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  inlineDropdownContainer: {
    borderColor: Theme.colors.success,
    borderRadius: 8,
  },

  inlineResetButton: {
    paddingHorizontal: 12,
  },

  resetText: {
    color: Theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.white,
  },
  searchCompleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  completeCheckboxContainerRow: {
    flexDirection: 'row',
  },

  expandedRow: {
    paddingVertical: 8,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 76,
  },

  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 6,
    tintColor: Theme.colors.blue,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.black,
  },

  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: Theme.colors.primaryYellow,
    fontWeight: '600',
  },

  noDataImage: {
    width: 290,
    height: 290,
    resizeMode: 'contain',
  },
  inlineFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  topRowTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  menuItem: {
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.colors.textPrimary,
  },

  friendIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  friendIcon: { width: 30, height: 30, resizeMode: 'cover' },
  dotsOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dotsMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  dotsMenuItem: { paddingVertical: 10, paddingHorizontal: 16 },
  dotsMenuText: { fontSize: 16, color: Theme.colors.textPrimary },
  menuItemRow: { flexDirection: 'row', alignItems: 'center' },

  dotsMenuItemCustom: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuIconCustom: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },

  menuIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 8,
    borderRadius: 5,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    paddingLeft: 20,
  },
  checkboxSmall: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: 4,
    marginRight: 8,
  },
  searchBoxSmall: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 6 },
  icon: { width: 18, height: 18 },
  filterBtn: {
    marginLeft: 10,
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Theme.colors.success,
  },
  filterIcon: { width: 22, height: 22, tintColor: Theme.colors.success },
  tipCardContainer: { marginTop: 20 },
});
