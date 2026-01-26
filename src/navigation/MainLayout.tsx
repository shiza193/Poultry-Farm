import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../components/Sidebar';
import DashboardScreen from '../screens/DashboardScreen';
import FlocksScreen from '../screens/flocks/FlocksScreen';
import FlockSaleScreen from '../screens/flocks/FlockSaleScreen';
import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
import FlockStockScreen from '../screens/flocks/FlockStockScreen';
import HospitalityScreen from '../screens/flocks/HospitalityScreen';
import DashboardDetailScreen from '../screens/DashboardDetailScreen';
import { CustomConstants, ScreenType } from '../constants/CustomConstants';
import Theme from '../theme/Theme';
import EggProductionScreen from '../screens/eggs/EggProductionScreen';
import EggStockScreen from '../screens/eggs/EggStockScreen';
import EggSaleScreen from '../screens/eggs/EggSaleScreen';
import SidebarWrapper from '../components/customButtons/SidebarWrapper';
import VaccinationsScreen from '../screens/vaccinations/VaccinationsScreen';
import VaccinationStockScreen from '../screens/vaccinations/VaccinationStockScreen';
import VaccineScheduleScreen from '../screens/vaccinations/VaccineScheduleScreen';

const MainLayout = () => {
  // Sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Active screen
  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    CustomConstants.DASHBOARD_DETAIL_SCREEN
  );

  // Animation value
  const slideAnim = useRef(new Animated.Value(sidebarVisible ? 0 : -252)).current;

  // Animate sidebar when visibility changes
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? 0 : -252,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  // Render content based on active screen
  const renderContent = () => {
    switch (activeScreen) {
      case CustomConstants.DASHBOARD_DETAIL_SCREEN:
        return <DashboardDetailScreen />;

      // 🐔 FLOCKS
      case CustomConstants.FLOCKS_SCREEN:
        return <FlocksScreen />;
      case CustomConstants.FLOCKS_MORTALITY_SCREEN:
        return <FlocksMortalityScreen />;
      case CustomConstants.FLOCK_STOCK_SCREEN:
        return <FlockStockScreen />;
      case CustomConstants.FLOCK_SALE_SCREEN:
        return <FlockSaleScreen />;
      case CustomConstants.HOSPITALITY_SCREEN:
        return <HospitalityScreen />;

      // 🥚 EGGS
      case CustomConstants.EGG_PRODUCTION_SCREEN:
        return <EggProductionScreen />;
      case CustomConstants.EGG_STOCK_SCREEN:
        return <EggStockScreen />;
      case CustomConstants.EGG_SALE_SCREEN:
        return <EggSaleScreen />;
        
      // VACCINATIONS
      case CustomConstants.VACCINATIONS_SCREEN:
        return <VaccinationsScreen />;
      case CustomConstants.VACCINATION_STOCK_SCREEEN:
        return <VaccinationStockScreen />;
      case CustomConstants.VACCINE_SCHEDULE_SCREEN:
        return <VaccineScheduleScreen />;
      default:
        return <DashboardDetailScreen />;
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <Sidebar
          isVisible={sidebarVisible}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />
      </Animated.View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setSidebarVisible(!sidebarVisible)}
      >
        <Image
          source={sidebarVisible ? Theme.icons.close1 : Theme.icons.open}
          style={{ width: 22, height: 22, tintColor: '#FFF' }}
        />
      </TouchableOpacity>

      {/* Main Content */}
      <SidebarWrapper
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
      >
        {renderContent()}
      </SidebarWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f8f8f8' },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 252,
    zIndex: 20,
  },

  content: { flex: 1 },

  toggleButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default MainLayout;
