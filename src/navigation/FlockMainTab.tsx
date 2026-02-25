import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Theme from '../theme/Theme';
import Header from '../components/common/LogoHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { useBusinessUnit } from '../context/BusinessContext';
import {
  getFlocksExcel,
  getFlockStockExcel,
} from '../screens/Report/ReportHelpers';
// FLOCK SCREENS
import FlocksScreen from '../screens/flocks/FlocksScreen';
import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
import FlockStockScreen from '../screens/flocks/FlockStockScreen';
import FlockSaleScreen from '../screens/flocks/FlockSaleScreen';
import HospitalityScreen from '../screens/flocks/HospitalityScreen';
import { useRoute } from '@react-navigation/native';
type TabType = 'flocks' | 'mortality' | 'stock' | 'sale' | 'hospitality';

type FilterState = {
  searchKey: string;
  isEnded: boolean;
  selected: { flockId: string | null; supplierId: string | null };
  options?: {
    flocks?: { label: string; id: string }[];
    suppliers?: { label: string; id: string }[];
  };
};

const FlockMainScreen = () => {
  const { businessUnitId } = useBusinessUnit();
const route = useRoute<any>();

const [activeTab, setActiveTab] = useState<TabType>(
  route.params?.initialTab || 'flocks'
);  const [openAddModal, setOpenAddModal] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // same as your table page size

  const [filterState, setFilterState] = useState<FilterState>({
    searchKey: '',
    isEnded: false,
    selected: { flockId: null, supplierId: null },
    options: { flocks: [], suppliers: [] },
  });

  // ================= RENDER SCREEN =================
  const renderScreen = () => {
    const commonProps = {
      openAddModal,
      onCloseAddModal: () => setOpenAddModal(false),
      setGlobalLoading,
    };

    switch (activeTab) {
      case 'mortality':
        return <FlocksMortalityScreen {...commonProps} />;
      case 'stock':
        return <FlockStockScreen {...commonProps} />;
      case 'sale':
        return <FlockSaleScreen {...commonProps} />;
      case 'hospitality':
        return <HospitalityScreen {...commonProps} />;
      default:
        return (
          <FlocksScreen
            {...commonProps}
            filterState={filterState}
            setFilterState={setFilterState}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onOpenAddModal={() => setOpenAddModal(true)}
          />
        );
    }
  };


useEffect(() => {
  if (route.params?.initialTab) {
    setActiveTab(route.params.initialTab); // always update
  }
}, [route.params?.initialTab]);
  // ================= TAB BUTTON =================
  const TabButton = ({
    title,
    active,
    onPress,
  }: {
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={globalLoading} text="Loading..." />

      <Header
        title="Flocks"
        onAddNewPress={
          activeTab === 'flocks' ||
          activeTab === 'sale' ||
          activeTab === 'hospitality'
            ? () => setOpenAddModal(true)
            : undefined
        }
        onReportPress={
          activeTab === 'flocks' || activeTab === 'stock'
            ? async () => {
                if (!businessUnitId) return;
                try {
                  setGlobalLoading(true);

                  if (activeTab === 'flocks') {
                    await getFlocksExcel('Flocks_2026', {
                      businessUnitId,
                      searchKey: filterState.searchKey || null,
                      flockId: filterState.selected.flockId || null,
                      supplierId: filterState.selected.supplierId || null,
                      isEnded: filterState.isEnded ? true : null,
                      pageNumber: currentPage,
                      pageSize: pageSize,
                    });
                  } else if (activeTab === 'stock') {
                    await getFlockStockExcel('FlockStock_2026', businessUnitId);
                  }
                } catch (error) {
                  console.log('Error exporting Excel:', error);
                } finally {
                  setGlobalLoading(false);
                }
              }
            : undefined
        }
        showAdminPortal={true}
        showLogout={true}
      />

      {/* ===== TABS ===== */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainerScroll}
        >
          <TabButton
            title="Flocks"
            active={activeTab === 'flocks'}
            onPress={() => setActiveTab('flocks')}
          />
          <View style={styles.separator} />
          <TabButton
            title="Mortality"
            active={activeTab === 'mortality'}
            onPress={() => setActiveTab('mortality')}
          />
          <View style={styles.separator} />
          <TabButton
            title="Stock"
            active={activeTab === 'stock'}
            onPress={() => setActiveTab('stock')}
          />
          <View style={styles.separator} />
          <TabButton
            title="Sale"
            active={activeTab === 'sale'}
            onPress={() => setActiveTab('sale')}
          />
          <View style={styles.separator} />
          <TabButton
            title="Hospitality"
            active={activeTab === 'hospitality'}
            onPress={() => setActiveTab('hospitality')}
          />
        </ScrollView>
      </View>

      {/* ===== SCREEN CONTENT ===== */}
      <View style={styles.screenContent}>{renderScreen()}</View>
    </SafeAreaView>
  );
};

export default FlockMainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },
  tabsWrapper: { paddingHorizontal: 13, marginTop: 18 },
  tabContainerScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
  },
  screenContent: { flex: 1 },
  tabButton: {
    minWidth: 90,
    height: 39,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: { backgroundColor: Theme.colors.mainButton },
  tabText: { fontSize: 13, fontWeight: '600', color: Theme.colors.black },
  activeTabText: { color: Theme.colors.white },
  separator: {
    width: 1,
    backgroundColor: Theme.colors.sky,
    alignSelf: 'stretch',
    marginHorizontal: 2,
  },
});
