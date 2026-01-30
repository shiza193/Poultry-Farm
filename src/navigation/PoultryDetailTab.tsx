// NewBottomTabNavigation.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Theme from '../theme/Theme';
import DashboardDetailScreen from '../screens/DashboardDetailScreen';
import MenuListScreen from '../screens/more/MenuListScreen';

const Tab = createBottomTabNavigator();

// Empty screen placeholder
const EmptyScreen = ({ name }: { name: string }) => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>{name} Screen</Text>
  </View>
);

const renderIcon = (icon: any, focused: boolean) => {
  return (
    <Image
      source={icon}
      resizeMode="contain"
      style={[
        styles.icon,
        {
          tintColor: focused
            ? Theme.colors.primaryYellow
            : Theme.colors.blue,
        },
      ]}
    />
  );
};

const PoultryDetailTab = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
     component={DashboardDetailScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Theme.colors.primaryYellow : Theme.colors.blue },
            ]}
          >
            Home
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.home, focused),
      }}
    />

    <Tab.Screen
      name="Flock"
      children={() => <EmptyScreen name="Flock" />}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Theme.colors.primaryYellow : Theme.colors.blue },
            ]}
          >
            Flock
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.hen, focused),
      }}
    />

   

    <Tab.Screen
      name="Eggs"
      children={() => <EmptyScreen name="Eggs" />}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Theme.colors.primaryYellow : Theme.colors.blue },
            ]}
          >
            Eggs
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.egg, focused),
      }}
    />

    <Tab.Screen
      name="Vaccination"
      children={() => <EmptyScreen name="Vaccination" />}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Theme.colors.primaryYellow : Theme.colors.blue },
            ]}
          >
            Vaccine
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.injection, focused),
      }}
    />
     <Tab.Screen
      name="More"
     component={MenuListScreen}
      options={{
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Theme.colors.primaryYellow : Theme.colors.blue },
            ]}
          >
            More
          </Text>
        ),
        tabBarIcon: ({ focused }) => renderIcon(Theme.icons.more, focused),
      }}
    />
  </Tab.Navigator>
);

export default PoultryDetailTab;

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
  screen: {
    flex: 1,
    backgroundColor: Theme.colors.screenBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
});
