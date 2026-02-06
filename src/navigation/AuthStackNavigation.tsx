import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SplashScreen from "../screens/auth/SplashScreen";
import { CustomConstants } from "../constants/CustomConstants";
import DashboardScreen from "../screens/DashboardScreen";
import BootomTabNavigation from "./BootomTabNavigation";
import UserScreen from "../screens/UserScreen";
import CustomerScreen from "../screens/CustomerScreen";
import EggTabs from "./EggTabs";
import FlocksScreen from "../screens/flocks/FlocksScreen";
import FlockSaleScreen from "../screens/flocks/FlockSaleScreen";
import FlocksMortalityScreen from "../screens/flocks/FlocksMortalityScreen";
import FlockStockScreen from "../screens/flocks/FlockStockScreen";
import HospitalityScreen from "../screens/flocks/HospitalityScreen";
import EmployeeScreen from "../screens/EmployeeScreen";
import SupplierScreen from "../screens/SupplierScreen";
import PoultryDetailTab from "./PoultryDetailTab";
import SettingsScreen from "../screens/more/SettingsScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import AccountHeadScreen from "../screens/more/AccountHeadScreen";
import LedgerScreen from "../screens/more/LedgerScreen";

const Stack = createNativeStackNavigator();

const AuthStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={CustomConstants.SPLASH_SCREEN}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={CustomConstants.SPLASH_SCREEN}
        component={SplashScreen}
      />
      <Stack.Screen
        name={CustomConstants.LOGIN_SCREEN}
        component={LoginScreen}
      />
        <Stack.Screen
        name={CustomConstants.SIGN_UP_SCREEN}
        component={SignupScreen}
      />
      
       <Stack.Screen
        name={CustomConstants.USER_SCREEN}
        component={UserScreen}
      />
        <Stack.Screen
        name={CustomConstants.CUSTOMER_SCREEN}
        component={CustomerScreen}
      />
         <Stack.Screen
        name={CustomConstants.SUPPILER_SCREEN}
        component={SupplierScreen}
      />
       <Stack.Screen
        name={CustomConstants.ACCOUNT_HEAD_SCREEN}
        component={AccountHeadScreen}
      />
        <Stack.Screen
        name={CustomConstants.LEDGER_SCREEN}
        component={LedgerScreen}
      />
       <Stack.Screen
        name={CustomConstants.DASHBOARD_SCREEN}
        component={DashboardScreen}
      />
        <Stack.Screen
        name={CustomConstants.DASHBOARD_TABS}
        component={BootomTabNavigation}
      />
        <Stack.Screen
        name={CustomConstants.DASHBOARD_DETAIL_SCREEN}
        component={PoultryDetailTab}
      />
        {/* <Stack.Screen
        name={CustomConstants.DASHBOARD_DETAIL_SCREEN}
        component={DashboardDetailScreen}
      /> */}
        <Stack.Screen
        name={CustomConstants.FLOCKS_SCREEN}
        component={FlocksScreen}
      />
       <Stack.Screen
        name={CustomConstants.FLOCK_SALE_SCREEN}
        component={FlockSaleScreen}
      />
       <Stack.Screen
        name={CustomConstants.FLOCKS_MORTALITY_SCREEN}
        component={FlocksMortalityScreen}
      />
       <Stack.Screen
        name={CustomConstants.FLOCK_STOCK_SCREEN}
        component={FlockStockScreen}
      />
       <Stack.Screen
        name={CustomConstants.HOSPITALITY_SCREEN}
        component={HospitalityScreen}
      />
       <Stack.Screen
        name={CustomConstants.EMPLOYEE_SCREEN}
        component={EmployeeScreen}
      />
      
       <Stack.Screen
        name={CustomConstants.SETTINGS_SCREEN}
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
