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
import Header from '../../components/common/LogoHeader';
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

  // ===== FILTER STATES =====
  const [search, setSearch] = useState('');
  const [complete, setComplete] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
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
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isFeedModalVisible, setIsFeedModalVisible] = useState(false);
  const [isFCRModalVisible, setIsFCRModalVisible] = useState(false);
  const [isMortalityModalVisible, setIsMortalityModalVisible] = useState(false);
  const [isHospitalityModalVisible, setIsHospitalityModalVisible] =
    useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
  // ===== SELECTED FLOCK STATES =====
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  const [flockToDelete, setFlockToDelete] = useState<Flock | null>(null);

  // ===== FETCH FLOCKS BASED ON FILTERS =====
  const fetchFlocks = async (
    searchValue?: string,
    filterFlock?: string,
    filterSupplier?: string,
    filterComplete?: boolean,
  ) => {
    if (!businessUnitId) return;
    setLoading(true);

    try {
      const data = await getFlockByFilter({
        businessUnitId,
        searchKey: searchValue ?? search,
        isEnded:
          filterComplete === undefined
            ? complete
              ? true
              : null
            : filterComplete === null
            ? null
            : filterComplete,

        flockId: filterFlock || null,
        supplierId: filterSupplier || null,
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
      key: 'flockName',
      title: 'FLOCK NAME',
      width: 140,
      isTitle: true,
      showDots: true,
      render: (value, row) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(CustomConstants.FLOCK_DETAIL_SCREEN, {
              flock: row.raw,
            })
          }
        >
          <Text style={{ fontWeight: '700', color: Theme.colors.blue }}>
            {value}
          </Text>
        </TouchableOpacity>
      ),
      onDotsPress: row => {
        setOpenRowDotsId(prev =>
          prev === row.raw.flockId ? null : row.raw.flockId,
        );
      },
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
          <Text style={{ fontWeight: '700', color: Theme.colors.blue }}>
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
          <Text style={{ fontWeight: '700', color: Theme.colors.blue }}>
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
  }, [businessUnitId]);


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
    setIsAddModalVisible(false);
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
    setIsFeedModalVisible(false);
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
    setIsMortalityModalVisible(false);
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
    setIsHospitalityModalVisible(false);
  };

  const DeleteFlock = async () => {
    if (!flockToDelete) return;

    await deleteFlock(flockToDelete.flockId);
    fetchFlocks();
    fetchDropdownFlocks();
    setIsConfirmModalVisible(false);
    setFlockToDelete(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Header
        title="My Flocks"
        alignWithLogo
        onPressDots={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
      /> */}
      <ScrollView>
        {isDotsMenuVisible && (
          <TouchableOpacity
            style={styles.dotsOverlay}
            activeOpacity={1}
            onPress={() => setIsDotsMenuVisible(false)}
          >
            <View style={styles.dotsMenu}>
              <TouchableOpacity
                style={styles.dotsMenuItem}
                onPress={() => {
                  const newValue = !complete;
                  setComplete(newValue);

                  fetchFlocks(
                    search,
                    selectedFlockId ?? undefined,
                    selectedSupplier ?? undefined,
                    newValue,
                  );

                  setIsDotsMenuVisible(false);
                }}
              >
                <View style={styles.menuItemRow}>
                  <View
                    style={[
                      styles.checkboxSmall,
                      complete && {
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
                  setIsDotsMenuVisible(false);
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
                  setIsAddModalVisible(true);
                  setIsDotsMenuVisible(false);
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
                initialValue={search}
                onSearch={value => {
                  setSearch(value);
                  fetchFlocks(
                    value,
                    selectedFlockId ?? undefined,
                    selectedSupplier ?? undefined,
                    complete,
                  );
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setIsFilterModalVisible(true)}
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
            <Image
              source={Theme.icons.nodata}
              style={{
                width: 290,
                height: 290,
                resizeMode: 'contain',
                marginBottom: 12,
              }}
            />
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <DataCard
                columns={columns}
                data={tableData}
                renderRowMenu={(row, closeMenu) => {
                  const f = row.raw;

                  return (
                    <View>
                      {/* Feed */}
                      {!f.isEnded && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFlock(f);
                            setIsFeedModalVisible(true);
                            closeMenu();
                          }}
                        >
                          <Text style={styles.menuItem}>Feed</Text>
                        </TouchableOpacity>
                      )}

                      {/* FCR */}
                      {!f.isEnded && f.remainingQuantity > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFlock(f);
                            setIsFCRModalVisible(true);
                            closeMenu();
                          }}
                        >
                          <Text style={styles.menuItem}>FCR</Text>
                        </TouchableOpacity>
                      )}

                      {/* Mortality */}
                      {!f.isEnded && f.remainingQuantity > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFlock(f);
                            setIsMortalityModalVisible(true);
                            closeMenu();
                          }}
                        >
                          <Text style={styles.menuItem}>Mortality</Text>
                        </TouchableOpacity>
                      )}

                      {/* Hospitality */}
                      {!f.isEnded && f.remainingQuantity > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedFlock(f);
                            setIsHospitalityModalVisible(true);
                            closeMenu();
                          }}
                        >
                          <Text style={styles.menuItem}>Hospitality</Text>
                        </TouchableOpacity>
                      )}

                      {/* Complete */}
                      {!f.isEnded && (
                        <TouchableOpacity
                          onPress={async () => {
                            await updateFlockIsEnded(f.flockId, true);
                            fetchFlocks();
                            closeMenu();
                          }}
                        >
                          <Text style={styles.menuItem}>Complete</Text>
                        </TouchableOpacity>
                      )}

                      {/* Delete (ALWAYS) */}
                      <TouchableOpacity
                        onPress={() => {
                          setFlockToDelete(f);
                          setIsConfirmModalVisible(true);
                          closeMenu();
                        }}
                      >
                        <Text style={[styles.menuItem, { color: 'red' }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>

        <AddFlockModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          businessUnitId={businessUnitId}
          onSave={AddFlock}
        />

        {/* ===== ITEM ENTRY MODALS (Feed / FCR / Mortality / Hospitality) ===== */}
        <ItemEntryModal
          visible={isFeedModalVisible}
          type="feed"
          onClose={() => setIsFeedModalVisible(false)}
          onSave={FeedEntry}
        />

        <ItemEntryModal
          visible={isFCRModalVisible}
          type="fcr"
          onClose={() => setIsFCRModalVisible(false)}
          onSave={FCR}
        />

        <ItemEntryModal
          visible={isMortalityModalVisible}
          type="mortality"
          onClose={() => setIsMortalityModalVisible(false)}
          onSave={Mortality}
        />

        <ItemEntryModal
          visible={isHospitalityModalVisible}
          type="hospitality"
          onClose={() => setIsHospitalityModalVisible(false)}
          onSave={Hospitality}
        />

        {/* ===== DELETE CONFIRMATION MODAL ===== */}
        <ConfirmationModal
          type="delete"
          title={`Are you sure you want to delete flock ${flockToDelete?.ref}?`}
          visible={isConfirmModalVisible}
          onClose={() => setIsConfirmModalVisible(false)}
          onConfirm={DeleteFlock}
        />

        {/* ===== FILTER MODAL ===== */}
        <BusinessUnitModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          mode="filter"
          flockItems={dropdownItems}
          supplierItems={supplierItems}
          selectedFlockId={selectedFlockId}
          selectedSupplier={selectedSupplier}
          isComplete={complete}
          onApplyFilter={(flockId, supplierId, isComplete) => {
            setSelectedFlockId(flockId);
            setSelectedSupplier(supplierId);
            setComplete(isComplete === null ? false : isComplete);

            fetchFlocks(
              undefined,
              flockId ?? undefined,
              supplierId ?? undefined,
              isComplete === null ? undefined : isComplete,
            );
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
