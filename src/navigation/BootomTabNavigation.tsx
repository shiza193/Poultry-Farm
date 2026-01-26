// BootomTabNavigation.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Theme from '../theme/Theme';
import DashboardScreen from '../screens/DashboardScreen';
import UserScreen from '../screens/UserScreen';
import CustomerScreen from '../screens/CustomerScreen';
import SupplierScreen from '../screens/SupplierScreen';
import EmployeeScreen from '../screens/EmployeeScreen';

const Tab = createBottomTabNavigator();

const EmptyScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Coming Soon</Text>
  </View>
);

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
        tintColor: focused ? Theme.colors.white : Theme.colors.iconSecondary,
      }}
      resizeMode="contain"
    />
  </View>
);

const BootomTabNavigation = () => (
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
      name="Home"
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.home, focused),
      }}
    />
    <Tab.Screen
      name="User"
      component={UserScreen}
      options={{
        tabBarLabel: 'User',
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.user, focused),
      }}
    />
    <Tab.Screen
      name="Customer"
      component={CustomerScreen}
      options={{
        tabBarLabel: 'Customer',
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.customer, focused),
      }}
    />
    <Tab.Screen
      name="Supplier"
      component={SupplierScreen}
      options={{
        tabBarLabel: 'Supplier',
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.supplier, focused),
      }}
    />
    <Tab.Screen
      name="Employee"
      component={EmployeeScreen}
      options={{
        tabBarLabel: 'Employee',
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.employee, focused),
      }}
    />
  </Tab.Navigator>
);

export default BootomTabNavigation;

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.screenBackground },
  text: { fontSize: 18, color: Theme.colors.textPrimary },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
