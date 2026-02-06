import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import Theme from '../../theme/Theme';
import Header from '../../components/common/LogoHeader';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import { CustomConstants } from '../../constants/CustomConstants';
import { useBusinessUnit } from '../../context/BusinessContext';

//  Helper Components

interface MenuItemProps {
  title: string;
  icon: any;
  onPress: () => void;
}

const MenuItem = memo(({ title, icon, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.leftRow}>
      <Image source={icon} style={styles.itemIcon} resizeMode="contain" />
      <Text style={styles.itemText}>{title}</Text>
    </View>
    <Image
      source={Theme.icons.greater}
      style={styles.arrow}
      resizeMode="contain"
    />
  </TouchableOpacity>
));

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

//  Main Screen

const MenuListScreen = ({ navigation }: any) => {
  const { farmName, farmLocation, businessUnitId } = useBusinessUnit();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);

  /* ---------- Handlers ---------- */

  const toggleDotsMenu = () => {
    setIsDotsMenuVisible(prev => !prev);
  };

  const closeDotsMenu = () => {
    setIsDotsMenuVisible(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: CustomConstants.LOGIN_SCREEN }],
      });
    } catch (error) {
      console.log('Logout failed', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title={farmName || 'Poultry Farm'}
        subtitle={farmLocation || ''}
        onPressDots={toggleDotsMenu}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        alignWithLogo
      />

      {/* -------- Dots Menu -------- */}
      {isDotsMenuVisible && (
        <View style={styles.dotsOverlayContainer}>
          <TouchableOpacity
            style={styles.dotsOverlay}
            activeOpacity={1}
            onPress={closeDotsMenu}
          />

          <View style={styles.dotsMenu}>
            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                closeDotsMenu();
                setShowLogoutModal(true);
              }}
            >
              <View style={styles.menuItemRow}>
                <Image
                  source={Theme.icons.logout}
                  style={styles.menuItemIcon}
                />
                <Text style={styles.dotsMenuText}>Logout</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                closeDotsMenu();
                navigation.navigate(CustomConstants.DASHBOARD_TABS);
              }}
            >
              <View style={styles.menuItemRow}>
                <Image source={Theme.icons.back} style={styles.menuItemIcon} />
                <Text style={styles.dotsMenuText}>Admin Portal</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* -------- Menu Sections -------- */}
      <ScrollView>
        <Section title="Feed">
          <MenuItem
            title="Feed Record"
            icon={Theme.icons.feedc}
            onPress={() => navigation.navigate('FeedRecord')}
          />
          <MenuItem
            title="Feed Consumption"
            icon={Theme.icons.feeds}
            onPress={() => navigation.navigate('FeedConsumption')}
          />
          <MenuItem
            title="Feed Stock"
            icon={Theme.icons.feedGreen}
            onPress={() => navigation.navigate('FeedStock')}
          />
        </Section>

        <Section title="Finance">
          <MenuItem
            title="Account Head"
            icon={Theme.icons.star}
            onPress={() =>navigation.navigate(CustomConstants.ACCOUNT_HEAD_SCREEN)}
          />
          <MenuItem
            title="Vouchers"
            icon={Theme.icons.voucture}
            onPress={() => navigation.navigate('Vouchers')}
          />
          <MenuItem
            title="Ledger"
            icon={Theme.icons.ledger}
            onPress={() =>navigation.navigate(CustomConstants.LEDGER_SCREEN)}
          />
          <MenuItem
            title="Receivables"
            icon={Theme.icons.receivables}
            onPress={() => navigation.navigate('Receivables')}
          />
          <MenuItem
            title="Payables"
            icon={Theme.icons.payable}
            onPress={() => navigation.navigate('Payables')}
          />
        </Section>

        <Section title="Management">
          <MenuItem
            title="Customers"
            icon={Theme.icons.customer}
            onPress={() =>
              navigation.navigate(CustomConstants.CUSTOMER_SCREEN, {
                fromMenu: true,
                businessUnitId,
              })
            }
          />
          <MenuItem
            title="Employees"
            icon={Theme.icons.employee}
            onPress={() =>
              navigation.navigate(CustomConstants.EMPLOYEE_SCREEN, {
                fromMenu: true,
                businessUnitId,
              })
            }
          />
          <MenuItem
            title="Suppliers"
            icon={Theme.icons.supplier}
            onPress={() =>
              navigation.navigate(CustomConstants.SUPPILER_SCREEN, {
                fromMenu: true,
                businessUnitId,
              })
            }
          />
          <MenuItem
            title="Settings"
            icon={Theme.icons.setting}
            onPress={() =>
              navigation.navigate(CustomConstants.SETTINGS_SCREEN, {
                fromMenu: true,
              })
            }
          />
        </Section>
      </ScrollView>

      {/* -------- Logout Modal -------- */}
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

export default MenuListScreen;
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 13,
    color: Theme.colors.settinglable,
    marginLeft: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.settinglines,
    paddingBottom: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    marginTop: 16,
    marginLeft: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.settinglines,
  },
  itemText: {
    marginLeft: 9,
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.colors.black,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: Theme.colors.success,
  },
  arrow: {
    width: 13,
    height: 14,
    tintColor: Theme.colors.greater,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.sky,
    marginVertical: 6,
    marginLeft: 50,
    marginRight: 16,
  },
  dotsOverlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
  },
  dotsOverlay: {
    ...StyleSheet.absoluteFill,
  },

  dotsMenu: {
    position: 'absolute',
    top: 60,
    right: 13,
    width: 140,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  dotsMenuItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  dotsMenuText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
});
