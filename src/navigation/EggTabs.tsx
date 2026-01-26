import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import Sidebar from '../components/Sidebar';
import Theme from '../theme/Theme';

// ===== Egg Screens =====
import EggProductionScreen from '../screens/eggs/EggProductionScreen';
import EggStockScreen from '../screens/eggs/EggStockScreen';
import EggSaleScreen from '../screens/eggs/EggSaleScreen';

import { CustomConstants, ScreenType } from '../constants/CustomConstants';

const Tab = createBottomTabNavigator();

/* ===== Tab Icon Renderer ===== */
const renderIcon = (icon: any, focused: boolean) => (
  <View
    style={[
      styles.iconContainer,
      focused && { backgroundColor: Theme.colors.primaryYellow },
    ]}
  >
    <Image
      source={icon}
      style={{
        width: 24,
        height: 24,
        tintColor: focused
          ? Theme.colors.white
          : Theme.colors.iconSecondary,
      }}
      resizeMode="contain"
    />
  </View>
);

const EggTabs = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    CustomConstants.EGG_TABS, 
  );

  const slideAnim = useRef(new Animated.Value(-250)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ===== Sidebar ===== */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Sidebar
          isVisible={sidebarVisible}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />
      </Animated.View>

      {/* ===== Sidebar Toggle Button ===== */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setSidebarVisible(!sidebarVisible)}
        >
          <Image
            source={
              sidebarVisible
                ? Theme.icons.close1
                : Theme.icons.open
            }
            style={{ width: 22, height: 22, tintColor: Theme.colors.white }}
          />
        </TouchableOpacity>
      </View>

      {/* ===== Bottom Tabs ===== */}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Theme.colors.white,
            borderTopColor: Theme.colors.lightGrey,
            height: 70,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 2,
            color: Theme.colors.textSecondary,
          },
        }}
      >
        <Tab.Screen
          name="EggProduction"
          component={EggProductionScreen}
          options={{
            tabBarLabel: 'Egg Production',
            tabBarIcon: ({ focused }) =>
              renderIcon(Theme.icons.production, focused),
          }}
        />

        <Tab.Screen
          name="EggStock"
          component={EggStockScreen}
          options={{
            tabBarLabel: ' Egg Stock',
            tabBarIcon: ({ focused }) =>
              renderIcon(Theme.icons.feedGreen, focused),
          }}
        />

        <Tab.Screen
          name="EggSale"
          component={EggSaleScreen}
          options={{
            tabBarLabel: ' Egg Sale',
            tabBarIcon: ({ focused }) =>
              renderIcon(Theme.icons.finance, focused),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default EggTabs;

/* ===== Styles ===== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.screenBackground,
  },

 sidebar: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 252,
  zIndex: 20,
  backgroundColor: 'transparent',
},


  toggleContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 30,
  },

  toggleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Theme.colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
