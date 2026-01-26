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
import SidebarWrapper from '../../components/customButtons/SidebarWrapper';
import ScreenTipCard from '../../components/customCards/ScreenTipCard';
import FlockTableComponent from '../../components/customCards/FlockCard';
import AddFlockModal from '../../components/customPopups/AddFlockModal';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import BusinessUnitModal from '../../components/customPopups/BusinessUnitModal';

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
import { CustomConstants, ScreenType } from '../../constants/CustomConstants';

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

const FlocksScreen = (navigation: any) => {
  const businessUnitId = '157cc479-dc81-4845-826c-5fb991bd3d47';

  // ===== FILTER STATES =====
  const [search, setSearch] = useState('');
  const [complete, setComplete] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // ===== MAIN SCREEN STATES =====
  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    CustomConstants.FLOCKS_SCREEN,
  );
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
    filterFlock?: string,
    filterSupplier?: string,
    filterComplete?: boolean,
  ) => {
    setLoading(true);
    try {
      const data = await getFlockByFilter({
        businessUnitId,
        searchKey: search,
        isEnded:
          filterComplete !== undefined
            ? filterComplete
            : complete
            ? true
            : null,
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

  // ===== FETCH FLOCKS FOR DROPDOWN =====
  const fetchDropdownFlocks = async () => {
    const data = await getFlocks(businessUnitId);
    setDropdownItems(
      data.map((i: any) => ({
        label: `${i.flockRef} (${i.breed})`,
        value: i.flockId,
      })),
    );
  };

  // ===== FETCH SUPPLIERS =====
  useEffect(() => {
    const fetchSuppliers = async () => {
      const data = await getParties(businessUnitId, 1);
      setSupplierItems(
        data.map((s: any) => ({ label: s.name, value: s.partyId })),
      );
    };

    fetchSuppliers();
    fetchDropdownFlocks();
    fetchFlocks();
  }, []);

  // ===== REFRESH FLOCKS ON SEARCH OR COMPLETE STATUS CHANGE =====
  useEffect(() => {
    fetchFlocks();
  }, [search, complete]);

  return (
   <ScrollView
  style={{ flex: 1, backgroundColor: Theme.colors.white }}
  contentContainerStyle={{ flexGrow: 1 }}
>

    <SidebarWrapper
      activeScreen={activeScreen}
      setActiveScreen={setActiveScreen}
    >
      <View style={{ flex: 1, backgroundColor: Theme.colors.white }}>

      {/* ===== TOP ROW: TITLE + DOTS MENU ===== */}
      <View style={styles.topRow}>
        <Text style={styles.topRowTitle}>My Flocks</Text>
        <TouchableOpacity
          style={styles.friendIconContainer}
          onPress={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
        >
          <Image source={Theme.icons.dots} style={styles.friendIcon} />
        </TouchableOpacity>
      </View>

      {/* ===== DOTS MENU ===== */}
      {/* ===== DOTS MENU ===== */}
      {isDotsMenuVisible && (
        <TouchableOpacity
          style={styles.dotsOverlay}
          activeOpacity={1}
          onPress={() => setIsDotsMenuVisible(false)}
        >
          <View style={styles.dotsMenu}>
            {/* ===== TOGGLE COMPLETE (keep same) ===== */}
            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                setComplete(!complete);
                setIsDotsMenuVisible(false);
              }}
            >
              <View style={styles.menuItemRow}>
                <View
                  style={[
                    styles.checkboxSmall,
                    complete && { backgroundColor: Theme.colors.primaryYellow },
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
                <View
                  style={[styles.circleIcon, { backgroundColor: '#FFD8B5' }]}
                >
                  <Image
                    source={Theme.icons.download}
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
                <View
                  style={[styles.circleIcon, { backgroundColor: '#D7F4E2' }]}
                >
                  <Image
                    source={Theme.icons.plus}
                    style={styles.menuIconCustom}
                  />
                </View>
                <Text style={styles.dotsMenuText}>New Flock</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* ===== TIP CARD ===== */}
      <View style={styles.tipCardContainer}>
        <ScreenTipCard screen={CustomConstants.FLOCKS_SCREEN} />
      </View>

      <View style={styles.mainContainer}>
        {/* ===== SEARCH + FILTER ROW ===== */}
        <View style={styles.searchRow}>
          <View style={styles.searchBoxSmall}>
            <Image source={Theme.icons.search} style={styles.icon} />
            <TextInput
              placeholder="Search Flock..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
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
            <FlockTableComponent
              flocks={flocks}
              onFlockPress={item =>
                navigation.navigate('FlocksScreen', { flockId: item.flockId })
              }
              onFeed={flock => {
                setSelectedFlock(flock);
                setIsFeedModalVisible(true);
              }}
              onFCR={flock => {
                setSelectedFlock(flock);
                setIsFCRModalVisible(true);
              }}
              onMortality={flock => {
                setSelectedFlock(flock);
                setIsMortalityModalVisible(true);
              }}
              onHospital={flock => {
                setSelectedFlock(flock);
                setIsHospitalityModalVisible(true);
              }}
              onComplete={async flock => {
                if (flock.isEnded) {
                  Alert.alert('Info', 'This flock is already ended.');
                  return;
                }
                try {
                  const result = await updateFlockIsEnded(flock.flockId, true);
                  if (result) {
                    setFlocks(prev =>
                      prev.map(f =>
                        f.flockId === flock.flockId
                          ? { ...f, isEnded: true }
                          : f,
                      ),
                    );
                    Alert.alert(
                      'Success',
                      'Flock has been successfully ended.',
                    );
                  }
                } catch (error: any) {
                  Alert.alert(
                    'Error',
                    error.response?.data?.message || 'Failed to end flock',
                  );
                }
              }}
              onDelete={flock => {
                setFlockToDelete(flock);
                setIsConfirmModalVisible(true);
              }}
            />
          )}
        
      </View>

      {/* ===== ADD FLOCK MODAL ===== */}
      <AddFlockModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        businessUnitId={businessUnitId}
        onSave={async data => {
          const payload: AddFlockPayload = {
            businessUnitId,
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
        }}
      />

      {/* ===== ITEM ENTRY MODALS (Feed / FCR / Mortality / Hospitality) ===== */}
      <ItemEntryModal
        visible={isFeedModalVisible}
        type="feed"
        onClose={() => setIsFeedModalVisible(false)}
        onSave={async data => {
          if (!selectedFlock) return;

          const payload: AutoFeedRecordPayload = {
            flockId: selectedFlock.flockId,
            feedId: Number(data.feed),
            quantity: Number(data.quantity),
            businessUnitId,
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
        }}
      />

      <ItemEntryModal
        visible={isFCRModalVisible}
        type="fcr"
        onClose={() => setIsFCRModalVisible(false)}
        onSave={async data => {
          if (!selectedFlock) return;
          const payload: CalculateFCRPayload = {
            flockId: selectedFlock.flockId,
            currentWeight: Number(data.currentWeight),
          };
          return await calculateFCR(payload);
        }}
      />

      <ItemEntryModal
        visible={isMortalityModalVisible}
        type="mortality"
        onClose={() => setIsMortalityModalVisible(false)}
        onSave={async data => {
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
        }}
      />

      <ItemEntryModal
        visible={isHospitalityModalVisible}
        type="hospitality"
        onClose={() => setIsHospitalityModalVisible(false)}
        onSave={async data => {
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
            businessUnitId,
          };
          const response = await addHospitality(payload);
          Alert.alert('Success', response.message);
          fetchFlocks();
          setIsHospitalityModalVisible(false);
        }}
      />

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      <ConfirmationModal
        type="delete"
        title={`Are you sure you want to delete flock ${flockToDelete?.ref}?`}
        visible={isConfirmModalVisible}
        onClose={() => setIsConfirmModalVisible(false)}
        onConfirm={async () => {
          if (!flockToDelete) return;
          await deleteFlock(flockToDelete.flockId);
          fetchFlocks();
          fetchDropdownFlocks();
          setIsConfirmModalVisible(false);
          setFlockToDelete(null);
        }}
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
        onApplyFilter={(flockId, supplierId) => {
          setSelectedFlockId(flockId);
          setSelectedSupplier(supplierId);
          fetchFlocks(flockId ?? undefined, supplierId ?? undefined, complete);
        }}
      />
      </View>
    </SidebarWrapper>
    </ScrollView>
  );
};

export default FlocksScreen;

// ===== STYLES =====
const styles = StyleSheet.create({
  mainContainer: {
  flex: 1,
  backgroundColor: Theme.colors.white,
},
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
  checkboxSmall: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: 4,
    marginRight: 8,
  },
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
    marginTop: -10,
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
    borderColor: '#ccc',
  },
  filterIcon: { width: 22, height: 22 },
  tipCardContainer: { marginTop: 20 },
});
