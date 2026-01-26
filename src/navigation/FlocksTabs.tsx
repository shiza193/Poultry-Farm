// import React, { useState } from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { View, Image } from 'react-native';
// import Theme from '../theme/Theme';

// import FlocksScreen from '../screens/flocks/FlocksScreen';
// import FlocksMortalityScreen from '../screens/flocks/FlocksMortalityScreen';
// import FlockStockScreen from '../screens/flocks/FlockStockScreen';
// import FlockSaleScreen from '../screens/flocks/FlockSaleScreen';
// import HospitalityScreen from '../screens/flocks/HospitalityScreen';

// const Tab = createBottomTabNavigator();

// const renderIcon = (icon: any, focused: boolean) => (
//   <View
//     style={{
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: focused ? Theme.colors.primaryYellow : 'transparent',
//     }}
//   >
//     <Image
//       source={icon}
//       style={{
//         width: 24,
//         height: 24,
//         tintColor: focused ? Theme.colors.white : Theme.colors.iconSecondary,
//       }}
//       resizeMode="contain"
//     />
//   </View>
// );

// const FlocksTabs = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: Theme.colors.white,
//           borderTopColor: Theme.colors.lightGrey,
//           height: 70,
//           paddingBottom: 10,
//           paddingTop: 5,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           marginTop: 2,
//           color: Theme.colors.textSecondary,
//         },
//       }}
//     >
//       <Tab.Screen
//         name="Flocks"
//         component={FlocksScreen}
//         options={{
//           tabBarLabel: 'Flocks',
//           tabBarIcon: ({ focused }) => renderIcon(Theme.icons.hen, focused),
//         }}
//       />
//       <Tab.Screen
//         name="Mortality"
//         component={FlocksMortalityScreen}
//         options={{
//           tabBarLabel: 'Mortality',
//           tabBarIcon: ({ focused }) =>
//             renderIcon(Theme.icons.motality, focused),
//         }}
//       />
//       <Tab.Screen
//         name="Stock"
//         component={FlockStockScreen}
//         options={{
//           tabBarLabel: 'Stock',
//           tabBarIcon: ({ focused }) =>
//             renderIcon(Theme.icons.feedGreen, focused),
//         }}
//       />
//       <Tab.Screen
//         name="Sale"
//         component={FlockSaleScreen}
//         options={{
//           tabBarLabel: 'Sale',
//           tabBarIcon: ({ focused }) => renderIcon(Theme.icons.finance, focused),
//         }}
//       />
//       <Tab.Screen
//         name="Hospitality"
//         component={HospitalityScreen}
//         options={{
//           tabBarLabel: 'Hospitality',
//           tabBarIcon: ({ focused }) =>
//             renderIcon(Theme.icons.hospital, focused),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// export default FlocksTabs;
