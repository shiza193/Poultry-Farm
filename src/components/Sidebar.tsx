import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import Theme from '../theme/Theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { CustomConstants, ScreenType } from '../constants/CustomConstants';
import ConfirmationModal from './customPopups/ConfirmationModal';

interface SidebarProps {
  isVisible: boolean;
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
}

type MenuItem = {
  name: string;
  icon: any;
  screen?: ScreenType;
};





/* ===== SUB MENU ITEMS ===== */
const flocksSubItems = [
  {
    name: 'Flocks',
    tab: 'Flocks',
    icon: Theme.icons.hen,
    screen: CustomConstants.FLOCKS_SCREEN,
  },
  {
    name: 'Mortality',
    tab: 'Mortality',
    icon: Theme.icons.motality,
    screen: CustomConstants.FLOCKS_MORTALITY_SCREEN,
  },
  {
    name: 'Stock',
    tab: 'Stock',
    icon: Theme.icons.feedGreen,
    screen: CustomConstants.FLOCK_STOCK_SCREEN,
  },
  {
    name: 'Sale',
    tab: 'Sale',
    icon: Theme.icons.finance,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Hospitality',
    tab: 'Hospitality',
    icon: Theme.icons.hospital,
    screen: CustomConstants.HOSPITALITY_SCREEN,
  },
];

const eggsSubItems = [
  {
    name: 'Egg Productions',
    tab: 'Productions',
    icon: Theme.icons.production,
    screen: CustomConstants.EGG_PRODUCTION_SCREEN,
  },
  {
    name: 'Egg Stock',
    tab: 'Stock',
    icon: Theme.icons.feedGreen,
    screen: CustomConstants.EGG_STOCK_SCREEN,
  },
  {
    name: 'Egg Sale',
    tab: 'Sale',
    icon: Theme.icons.finance,
    screen: CustomConstants.EGG_SALE_SCREEN,
  },
];

const vaccinationsSubItems = [
  {
    name: 'Vaccinations',
    tab: 'vaccinations',
    icon: Theme.icons.vaccinesch1,
    screen: CustomConstants.VACCINATIONS_SCREEN,
  },

  {
    name: 'Vaccine Schedule',
    tab: 'Schedule',
    icon: Theme.icons.vschedule,
    screen: CustomConstants.VACCINE_SCHEDULE_SCREEN,
  },
  {
    name: 'Vaccine Stock',
    tab: 'Stock',
    icon: Theme.icons.vstock,
    screen: CustomConstants.VACCINATION_STOCK_SCREEEN,
  },
];

const feedSubItems = [
  {
    name: 'Feed Records',
    tab: 'Records',
    icon: Theme.icons.animal,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Feed Consumption',
    tab: 'Consumption',
    icon: Theme.icons.feedc,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Feed Stock',
    tab: 'Stock',
    icon: Theme.icons.feedGreen,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
];

const financeSubItems = [
  {
    name: 'Account Head',
    tab: 'AccountHead',
    icon: Theme.icons.star,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Vouchers',
    tab: 'Vouchers',
    icon: Theme.icons.voucture,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Ledger',
    tab: 'Ledger',
    icon: Theme.icons.ledger,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Receivables',
    tab: 'Receivables',
    icon: Theme.icons.receivables,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
  {
    name: 'Payables',
    tab: 'Payables',
    icon: Theme.icons.payable,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
];

const managementSubItems = [
  {
    name: 'Customers',
    tab: 'Customers',
    icon: Theme.icons.customer,
    screen: CustomConstants.CUSTOMER_SCREEN,
  },
  {
    name: 'Suppliers',
    tab: 'Suppliers',
    icon: Theme.icons.supplier,
    screen: CustomConstants.SUPPILER_SCREEN,
  },
  {
    name: 'Employees',
    tab: 'Employees',
    icon: Theme.icons.employee,
    screen: CustomConstants.EMPLOYEE_SCREEN,
  },
  {
    name: 'Settings',
    tab: 'Settings',
    icon: Theme.icons.setting,
    screen: CustomConstants.FLOCK_SALE_SCREEN,
  },
];

/* ===== MAIN MENU ===== */
const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: Theme.icons.dashboard,
    screen: CustomConstants.DASHBOARD_DETAIL_SCREEN,
  },
  { name: 'Flocks', icon: Theme.icons.hen },
  { name: 'Eggs', icon: Theme.icons.egg },
  { name: 'Vaccinations', icon: Theme.icons.injection },
  { name: 'Feed', icon: Theme.icons.feedGreen },
  { name: 'Finance', icon: Theme.icons.finance },
  { name: 'Management', icon: Theme.icons.management },
];

/* ===== BOTTOM FIXED MENU ===== */
const bottomItems = [
  { name: 'Back to Admin', icon: Theme.icons.back },
  { name: 'Logout', icon: Theme.icons.logout },
];

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  activeScreen,
  setActiveScreen,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const slideAnim = useRef(new Animated.Value(-220)).current;

  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({
    Flocks: false,
    Eggs: false,
    Vaccinations: false,
    Feed: false,
    Finance: false,
    Management: false,
  });
  const [logoutVisible, setLogoutVisible] = useState(false);

const flockScreens: ScreenType[] = [
  CustomConstants.FLOCKS_SCREEN,
  CustomConstants.FLOCKS_MORTALITY_SCREEN,
  CustomConstants.FLOCK_STOCK_SCREEN,
  CustomConstants.FLOCK_SALE_SCREEN,
  CustomConstants.HOSPITALITY_SCREEN,
];

const eggScreens: ScreenType[] = [
  CustomConstants.EGG_PRODUCTION_SCREEN,
  CustomConstants.EGG_STOCK_SCREEN,
  CustomConstants.EGG_SALE_SCREEN,
];


useEffect(() => {
  const newExpandedMenus = {
    Flocks: false,
    Eggs: false,
    Vaccinations: false,
    Feed: false,
    Finance: false,
    Management: false,
  };

  if (flockScreens.includes(activeScreen)) {
    newExpandedMenus.Flocks = true;
  } else if (eggScreens.includes(activeScreen)) {
    newExpandedMenus.Eggs = true;
  }

  setExpandedMenus(newExpandedMenus);
}, [activeScreen]);

  /* ===== SLIDE ANIMATION ===== */
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -220,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  /* ===== MENU PRESS ===== */
 const handleMenuPress = (name: string, screen?: ScreenType) => {
  if (screen) {
    setActiveScreen(screen); // highlight menu
    navigation.navigate(screen); // navigate stack
    // collapse all menus
    setExpandedMenus({
      Flocks: false,
      Eggs: false,
      Vaccinations: false,
      Feed: false,
      Finance: false,
      Management: false,
    });
    return;
  }

  // toggle submenu expansion
  setExpandedMenus(prev => ({
    ...prev,
    [name]: !prev[name],
    ...Object.fromEntries(
      Object.keys(prev)
        .filter(k => k !== name)
        .map(k => [k, false]),
    ),
  }));
};


  const getSubItems = (name: string) => {
    switch (name) {
      case 'Flocks':
        return flocksSubItems;
      case 'Eggs':
        return eggsSubItems;
      case 'Vaccinations':
        return vaccinationsSubItems;
      case 'Feed':
        return feedSubItems;
      case 'Finance':
        return financeSubItems;
      case 'Management':
        return managementSubItems;
      default:
        return [];
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.sidebarWrapper,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.sidebar}>
          {/* ===== LOGO ===== */}
          <Image source={Theme.icons.logo2} style={styles.logo} />

          {/* ===== SCROLLABLE MENU ===== */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => {
              const isActive =
                expandedMenus[item.name] || item.screen === activeScreen;
              const subItems = getSubItems(item.name);

              return (
                <View key={index}>
                  <TouchableOpacity
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => handleMenuPress(item.name, item.screen)}
                  >
                    <Image
                      source={item.icon}
                      style={[
                        styles.icon,
                        isActive && { tintColor: Theme.colors.white },
                      ]}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        isActive && { color: Theme.colors.white },
                      ]}
                    >
                      {item.name}
                    </Text>

                    {subItems.length > 0 && (
                      <Image
                        source={Theme.icons.dropdowns}
                        style={[
                          styles.dropdownIcon,
                          expandedMenus[item.name] && {
                            transform: [{ rotate: '180deg' }],
                          },
                        ]}
                      />
                    )}
                  </TouchableOpacity>

                  {expandedMenus[item.name] && subItems.length > 0 && (
                    <View style={styles.expandContainer}>
                      {subItems.map((sub, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.subMenuItem}
                          onPress={() => {
                            if (sub.screen) {
                              setActiveScreen(sub.screen); // highlight menu
                              navigation.navigate(sub.screen); // navigate stack
                            }
                          }}
                        >
                          <Image source={sub.icon} style={styles.subIcon} />
                          <Text style={styles.subMenuText}>{sub.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* ===== FIXED BOTTOM ===== */}
          <View style={styles.bottomContainer}>
            {bottomItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  if (item.name === 'Back to Admin')
                    navigation.navigate(CustomConstants.DASHBOARD_TABS);
                  else if (item.name === 'Logout') setLogoutVisible(true);
                }}
              >
                <Image source={item.icon} style={styles.icon} />
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      <ConfirmationModal
        type="logout"
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onConfirm={() => setLogoutVisible(false)}
      />
    </>
  );
};

export default Sidebar;

const styles = StyleSheet.create({
  sidebarWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 222,
    backgroundColor: Theme.colors.primaryYellow,
    borderTopRightRadius: 200,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },

  sidebar: {
    width: 220,
    height: '100%',
    backgroundColor: Theme.colors.white,
    paddingTop: 40,
    paddingHorizontal: 10,
    borderTopRightRadius: 198,
    borderBottomRightRadius: 28,
  },

  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 7,
    alignSelf: 'center',
  },

  menuContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
  },

  activeMenuItem: {
    backgroundColor: Theme.colors.primaryYellow,
  },

  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
    color: Theme.colors.textPrimary,
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  dropdownIcon: {
    width: 14,
    height: 14,
    marginLeft: 'auto',
    tintColor: Theme.colors.iconSecondary,
  },

  expandContainer: {
    backgroundColor: Theme.colors.lightGrey,
    marginLeft: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 20,
  },

  subMenuText: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: 'bold',
    color: Theme.colors.black,
  },

  subIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: Theme.colors.iconPrimary,
  },

  bottomContainer: {
    borderTopWidth: 3,
    borderTopColor: Theme.colors.primaryYellow,
    paddingTop: 5,
    paddingBottom: 16,
  },
});
