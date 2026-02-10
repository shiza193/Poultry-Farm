import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Theme from '../theme/Theme';
import Header from '../components/common/LogoHeader';
import { useNavigation } from '@react-navigation/native';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 FLOCK SCREENS
import FlocksScreen from '../screens/flocks/FlocksScreen';
import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
import FlockStockScreen from '../screens/flocks/FlockStockScreen';
import FlockSaleScreen from '../screens/flocks/FlockSaleScreen';
import HospitalityScreen from '../screens/flocks/HospitalityScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'flock' | 'mortality' | 'stock' | 'sale' | 'hospitality';

const FlockMainScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('flock');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  // ================= HEADER TITLE =================
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'mortality':
        return 'Flocks Mortality';
      case 'stock':
        return 'Flock Stock';
      case 'sale':
        return 'Flock Sale';
      case 'hospitality':
        return 'Hospitality';
      default:
        return 'Flocks';
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    } catch (error) {
      console.log('Logout failed', error);
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
      <Header title={getHeaderTitle()} />

      {/* ===== TABS ===== */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainerScroll}
        >
          <TabButton
            title="Flock"
            active={activeTab === 'flock'}
            onPress={() => setActiveTab('flock')}
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

      {/* ===== LOGOUT MODAL ===== */}
      <ConfirmationModal
        type="logout"
        visible={showLogoutModal}
        title="Are you sure you want to logout?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
};

export default FlockMainScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.white },

  // Tabs container
  tabsWrapper: {
    paddingHorizontal: 13,
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

});
