import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Theme from '../theme/Theme';
import Header from '../components/common/LogoHeader';
import { useNavigation } from '@react-navigation/native';

//  FLOCK SCREENS
import FlocksScreen from '../screens/flocks/FlocksScreen';
import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
import FlockStockScreen from '../screens/flocks/FlockStockScreen';
import FlockSaleScreen from '../screens/flocks/FlockSaleScreen';
import HospitalityScreen from '../screens/flocks/HospitalityScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFlocksExcel } from '../screens/Report/ReportHelpers';
import { useBusinessUnit } from '../context/BusinessContext';

type TabType = 'flocks' | 'mortality' | 'stock' | 'sale' | 'hospitality';

const FlockMainScreen = () => {
  const navigation = useNavigation<any>();
  const { businessUnitId } = useBusinessUnit();
  const [activeTab, setActiveTab] = useState<TabType>('flocks');
  const [openAddModal, setOpenAddModal] = useState(false);

  // ================= RENDER SCREEN =================
  const renderScreen = () => {
    switch (activeTab) {
      case 'mortality':
        return <FlocksMortalityScreen />;
      case 'stock':
        return <FlockStockScreen />;
      case 'sale':
        return <FlockSaleScreen />;
      case 'hospitality':
        return <HospitalityScreen />;
      default:
        return <FlocksScreen />;
    }
  };

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
      {/* ===== HEADER ===== */}
      {/* <Header title={getHeaderTitle()} /> */}
      <Header
        title="Flocks"
        onAddNewPress={
          activeTab === 'flocks' ||
            activeTab === 'sale' ||
            activeTab === 'hospitality'
            ? () => {
              console.log("Open Add Modal");
            }
            : undefined
        }
        onReportPress={
          activeTab === 'flocks' || activeTab === 'stock'
            ? async () => {
              try {
                if (!businessUnitId) return;

                if (activeTab === 'flocks') {
                  await getFlocksExcel('Flocks_2026', businessUnitId);
                }

                // Agar stock ki alag API hai to yahan call karo
              } catch (error) {
                console.log('Error exporting Flocks Excel:', error);
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

  // Tabs container
  tabsWrapper: {
    paddingHorizontal: 13,
    marginTop: 18,
  },
  tabContainerScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.borderColor,
    borderWidth: 1,
    borderRadius: 10,
  },
  screenContent: {
    flex: 1,
  },
  tabButton: {
    minWidth: 90,
    height: 39,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: Theme.colors.mainButton,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.black,
  },
  activeTabText: {
    color: Theme.colors.white,
  },
  separator: {
    width: 1,
    backgroundColor: Theme.colors.sky,
    alignSelf: 'stretch',
    marginHorizontal: 2,
  },
  dotsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  dotsMenu: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    padding: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dotsMenuItemCustom: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemRowCustom: { flexDirection: 'row', alignItems: 'center' },
  circleIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dotsMenuText: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
  },
  menuIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    tintColor: Theme.colors.textPrimary,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
  logoutIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
});
