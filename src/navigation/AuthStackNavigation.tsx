import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SplashScreen from "../screens/auth/SplashScreen";
import { CustomConstants } from "../constants/CustomConstants";
import DashboardScreen from "../screens/DashboardScreen";
import BootomTabNavigation from "./BootomTabNavigation";
import UserScreen from "../screens/UserScreen";
import CustomerScreen from "../screens/CustomerScreen";
import DashboardDetailScreen from "../screens/DashboardDetailScreen";
import MainLayout from "./MainLayout";
import EggTabs from "./EggTabs";
import FlocksScreen from "../screens/flocks/FlocksScreen";
import FlockSaleScreen from "../screens/flocks/FlockSaleScreen";
import FlocksMortalityScreen from "../screens/flocks/FlocksMortalityScreen";
import FlockStockScreen from "../screens/flocks/FlockStockScreen";
import HospitalityScreen from "../screens/flocks/HospitalityScreen";
import EggProductionScreen from "../screens/eggs/EggProductionScreen";
import EggSaleScreen from "../screens/eggs/EggSaleScreen";
import EggStockScreen from "../screens/eggs/EggStockScreen";
import AboutUsScreen from "../screens/AboutUsScreen";
import VaccinationsScreen from "../screens/vaccinations/VaccinationsScreen";
import VaccinationStockScreen from "../screens/vaccinations/VaccinationStockScreen";
import VaccineScheduleScreen from "../screens/vaccinations/VaccineScheduleScreen";
import EmployeeScreen from "../screens/EmployeeScreen";
import SupplierScreen from "../screens/SupplierScreen";
import PoultryDetailTab from "./PoultryDetailTab";

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
        name={CustomConstants.MAIN_LAYOUT}
        component={MainLayout}
      />
          <Stack.Screen
        name={CustomConstants.EGG_PRODUCTION_SCREEN}
        component={EggProductionScreen}
      />
       <Stack.Screen
        name={CustomConstants.EGG_SALE_SCREEN}
        component={EggSaleScreen}
      />
       <Stack.Screen
        name={CustomConstants.EGG_STOCK_SCREEN}
        component={EggStockScreen}
      />
        <Stack.Screen
        name={CustomConstants.ABOUT_US_SCREEN}
        component={AboutUsScreen}
      />
        <Stack.Screen
        name={CustomConstants.VACCINATIONS_SCREEN}
        component={VaccinationsScreen}
      />
         <Stack.Screen
        name={CustomConstants.VACCINATION_STOCK_SCREEEN}
        component={VaccinationStockScreen}
      />
         <Stack.Screen
        name={CustomConstants.VACCINE_SCHEDULE_SCREEN}
        component={VaccineScheduleScreen}
      />
       <Stack.Screen
        name={CustomConstants.EMPLOYEE_SCREEN}
        component={EmployeeScreen}
      />
      
    </Stack.Navigator>
  );
};

export default AuthStackNavigation;
