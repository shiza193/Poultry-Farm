import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Theme from '../../theme/Theme';
import AddFlockModal from '../../components/customPopups/AddFlockModal';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';

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

const FlocksScreen = () => {
  const navigation = useNavigation<any>();
  const { businessUnitId } = useBusinessUnit();

  // ===== FILTER & SEARCH STATE =====
  const [filters, setFilters] = useState({
    searchKey: '',
    flockId: null as string | null,
    supplierId: null as string | null,
    isEnded: false,
  });
  const [openRowDotsId, setOpenRowDotsId] = useState<string | null>(null);

  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [dropdownItems, setDropdownItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [supplierItems, setSupplierItems] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // ===== MODAL VISIBILITY STATES =====
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

  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  const [flockToDelete, setFlockToDelete] = useState<Flock | null>(null);

  // ===== FETCH FLOCKS BASED ON FILTERS =====
  const fetchFlocks = async () => {
    if (!businessUnitId) return;
    setLoading(true);

    try {
      const data = await getFlockByFilter({
        businessUnitId,
        searchKey: filters.searchKey || null,
        flockId: filters.flockId || null,
        supplierId: filters.supplierId || null,
        isEnded: filters.isEnded ? true : null,
        pageNumber: 1,
        pageSize: 10,
      });

      setFlocks(data.list || []);
    } catch {
      setFlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    console.log('businessUnitId changed:', businessUnitId);
  }, [businessUnitId]);

  const fetchDropdownFlocks = async () => {
    if (!businessUnitId) {
      console.warn('Business Unit ID is not set');
      return;
    }
    const data = await getFlocks(businessUnitId);
    setDropdownItems(
      data.map((i: any) => ({
        label: `${i.flockRef} (${i.breed})`,
        value: i.flockId,
      })),
    );
  };

  const tableData = flocks.map(f => ({
    flockName: `${f.ref} (${f.breed})`,
    supplier: f.supplier,
    quantity: f.quantity,
    expired: f.expireQuantity,
    hospitalized: f.hospitalizedQuantity,
    currentQty: f.remainingQuantity,
    saleQty: f.saleQuantity,
    arrivalDate: formatDate(f.arrivalDate),
    raw: f,
  }));

  const columns: TableColumn[] = [
     {
      key: 'rowAction',
      title: 'Action',
      width: 80,
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
            style={{ width: 18, height: 18, tintColor: Theme.colors.blue }}
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

    setFlocks([]);

    fetchFlocks();
    fetchDropdownFlocks();

    const fetchSuppliers = async () => {
      const data = await getParties(businessUnitId, 1);
      setSupplierItems(
        // map use kia taake dropdown ke liye label/value format ban jaye
        data.map((s: any) => ({ label: s.name, value: s.partyId })),
      );
    };
    fetchSuppliers();
  }, [businessUnitId, filters]);

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

    await addFlock(payload);
    fetchFlocks();
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
    await addAutomaticFeedRecord(payload);
    setFlocks(prev =>
      prev.map(f =>
        f.flockId === selectedFlock.flockId ? { ...f, hasFeed: true } : f,
      ),
    );
    Alert.alert('Success', 'Feed record added');
    setModals(prev => ({ ...prev, feed: false }));
    fetchFlocks();
  };

  const FCR = async (data: any) => {
    if (!selectedFlock) return;

    const payload: CalculateFCRPayload = {
      flockId: selectedFlock.flockId,
      currentWeight: Number(data.currentWeight),
    };
    return await calculateFCR(payload);
  };

  const Mortality = async (data: any) => {
    if (!selectedFlock) return;

    const payload = {
      flockId: selectedFlock.flockId,
      quantity: Number(data.quantity),
      date:
        data.expireDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      flockHealthStatusId: 1,
    };
    const response = await addFlockHealthRecord(payload);
    Alert.alert('Success', response.message);
    setModals(prev => ({ ...prev, mortality: false }));
    fetchFlocks();
  };

  const Hospitality = async (data: any) => {
    if (!selectedFlock) return;

    const payload = {
      flockId: selectedFlock.flockId,
      date:
        data.hospitalityDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      quantity: Number(data.quantity),
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
    const response = await addHospitality(payload);
    Alert.alert('Success', response.message);
    fetchFlocks();
    setModals(prev => ({ ...prev, hospitality: false }));
  };

  const DeleteFlock = async () => {
    if (!flockToDelete) return;

    await deleteFlock(flockToDelete.flockId);
    fetchFlocks();
    fetchDropdownFlocks();
    setModals(prev => ({ ...prev, confirmDelete: false }));
    setFlockToDelete(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        {modals.dotsMenu && (
          <TouchableOpacity
            style={styles.dotsOverlay}
            activeOpacity={1}
            onPress={() => setModals(prev => ({ ...prev, dotsMenu: false }))}
          >
            <View style={styles.dotsMenu}>
              <TouchableOpacity
                style={styles.dotsMenuItem}
                onPress={() => {
                  const newValue = !filters.isEnded;
                  setFilters(prev => ({ ...prev, isEnded: newValue }));
                  setModals(prev => ({ ...prev, dotsMenu: false }));
                }}
              >
                <View style={styles.menuItemRow}>
                  <View
                    style={[
                      styles.checkboxSmall,
                      filters.isEnded && {
                        backgroundColor: Theme.colors.primaryYellow,
                      },
                    ]}
                  />
                  <Text style={styles.dotsMenuText}>Complete</Text>
                </View>
              </TouchableOpacity>

              {/* ===== EXPORT EXCEL / DATA ===== */}
              <TouchableOpacity
                style={styles.dotsMenuItemCustom}
                onPress={() => {
                  console.log('Export Data clicked');
                  setModals(prev => ({ ...prev, dotsMenu: false }));
                }}
              >
                <View style={styles.menuItemRowCustom}>
                  <View>
                    <Image
                      source={Theme.icons.report}
                      style={styles.menuIconCustom}
                    />
                  </View>
                  <Text style={styles.dotsMenuText}>Export Data</Text>
                </View>
              </TouchableOpacity>

              {/* ===== ADD NEW FLOCK ===== */}
              <TouchableOpacity
                style={styles.dotsMenuItemCustom}
                onPress={() => {
                  setModals(prev => ({ ...prev, add: true }));
                  setModals(prev => ({ ...prev, dotsMenu: false }));
                }}
              >
                <View style={styles.menuItemRowCustom}>
                  <Text style={styles.dotsMenuText}> + New Flock</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.mainContainer}>
          {/* ===== SEARCH + FILTER ROW ===== */}
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                placeholder="Search Flock..."
                initialValue={filters.searchKey}
                onSearch={value => {
                  setFilters(prev => ({ ...prev, searchKey: value }));
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setModals(prev => ({ ...prev, filter: true }))}
            >
              <Image source={Theme.icons.filter} style={styles.filterIcon} />
            </TouchableOpacity>
          </View>

          {/* ===== FLOCK LIST ===== */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Theme.colors.primaryYellow}
            />
          ) : flocks.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Image source={Theme.icons.nodata} style={styles.noDataImage} />
            </View>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 11 }}>
              <DataCard
                columns={columns}
                data={tableData}
                renderExpandedRow={row => {
                  const f = row.raw;

                  const actions = [
                    {
                      label: 'Feed',
                      icon: Theme.icons.feedGreen,
                      color: Theme.colors.green,
                      show: !f.isEnded,
                      onPress: () => {
                        setSelectedFlock(f);
                        setModals(prev => ({ ...prev, feed: true }));
                      },
                    },
                    {
                      label: 'FCR',
                      icon: Theme.icons.trend,
                      color: Theme.colors.warning,
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
                      color: Theme.colors.primaryYellow,
                      show: !f.isEnded,
                      onPress: async () => {
                        await updateFlockIsEnded(f.flockId, true);
                        fetchFlocks();
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
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-start',marginLeft:24, }}>
                      {/* ACTIONS */}
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
          visible={modals.add}
          onClose={() => setModals(prev => ({ ...prev, add: false }))}
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

        {/* ===== FILTER MODAL ===== */}
        <BusinessUnitModal
          visible={modals.filter}
          onClose={() => setModals(prev => ({ ...prev, filter: false }))}
          mode="filter"
          flockItems={dropdownItems}
          supplierItems={supplierItems}
          selectedFlockId={filters.flockId}
          selectedSupplier={filters.supplierId}
          isComplete={filters.isEnded}
          onApplyFilter={(flockId, supplierId, isComplete) => {
            setFilters({
              searchKey: filters.searchKey, // keep current search
              flockId: flockId || null,
              supplierId: supplierId || null,
              isEnded: isComplete ?? false,
            });
            setModals(prev => ({ ...prev, filter: false }));
          }}
        />
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

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.white,
  },
  expandedRow: {
    paddingVertical: 8,
    paddingLeft: 10,
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
    color: Theme.colors.white,
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
