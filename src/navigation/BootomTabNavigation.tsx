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
import { CustomConstants } from '../constants/CustomConstants';

const Tab = createBottomTabNavigator();

const renderIcon = (icon: any, focused: boolean) => {
  return (
    <Image
      source={icon}
      resizeMode="contain"
      style={[
        styles.icon,
        {
          tintColor: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
        },
      ]}
    />
  );
};

const BootomTabNavigation = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name={CustomConstants.DASHBOARD_SCREEN}
      component={DashboardScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              {
                color: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
              },
            ]}
          >
            Home
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.home, focused),
      }}
    />

    <Tab.Screen
      name={CustomConstants.USER_SCREEN}
      component={UserScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              {
                color: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
              },
            ]}
          >
            User
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.user, focused),
      }}
    />

    <Tab.Screen
      name={CustomConstants.CUSTOMER_SCREEN}
      component={CustomerScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              {
                color: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
              },
            ]}
          >
            Customer
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.customer, focused),
      }}
    />

    <Tab.Screen
      name={CustomConstants.SUPPILER_SCREEN}
      component={SupplierScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              {
                color: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
              },
            ]}
          >
            Supplier
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.supplier, focused),
      }}
    />

    <Tab.Screen
      name={CustomConstants.EMPLOYEE_SCREEN}
      component={EmployeeScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              {
                color: focused ? Theme.colors.primaryYellow : Theme.colors.blue,
              },
            ]}
          >
            Employee
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.employee, focused),
      }}
    />
  </Tab.Navigator>
);

export default BootomTabNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.white,
    borderTopColor: Theme.colors.lightGrey,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
