import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Theme from '../../theme/Theme';
import Header from '../../components/common/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import { CustomConstants } from '../../constants/CustomConstants';
import { useBusinessUnit } from '../../context/BusinessContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuItem = ({ title, icon, onPress }: any) => (
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
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MenuListScreen = ({ navigation }: any) => {
  const { farmName, farmLocation, businessUnitId } = useBusinessUnit();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);

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
        title={farmName || 'Poultry Farms'}
        subtitle={farmLocation || ''}
        onPressDots={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        alignWithLogo={true}
      />

      {isDotsMenuVisible && (
        <View style={styles.dotsOverlayContainer}>
          <TouchableOpacity
            style={styles.dotsOverlay}
            activeOpacity={1}
            onPress={() => setIsDotsMenuVisible(false)}
          />

          {/* Actual menu */}
          <View style={styles.dotsMenu}>
            {/* LOGOUT */}
            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                setIsDotsMenuVisible(false);
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

            {/* ADMIN PORTAL */}
            <TouchableOpacity
              style={styles.dotsMenuItem}
              onPress={() => {
                setIsDotsMenuVisible(false);
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
      <ScrollView>
        {/* FEED */}
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

        {/* FINANCE */}
        <Section title="Finance">
          <MenuItem
            title="Account Head"
            icon={Theme.icons.moneys}
            onPress={() => navigation.navigate('AccountHead')}
          />
          <MenuItem
            title="Vouchers"
            icon={Theme.icons.voucture}
            onPress={() => navigation.navigate('Vouchers')}
          />
          <MenuItem
            title="Ledger"
            icon={Theme.icons.ledger}
            onPress={() => navigation.navigate('Ledger')}
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

        {/* MANAGEMENT */}
        <Section title="Management">
          <MenuItem
            title="Customers"
            icon={Theme.icons.customer}
            onPress={() =>
              navigation.navigate(CustomConstants.CUSTOMER_SCREEN, {
                fromMenu: true,
                businessUnitId: businessUnitId,
              })
            }
          />

          <MenuItem
            title="Employees"
            icon={Theme.icons.employee}
            onPress={() =>
              navigation.navigate(CustomConstants.EMPLOYEE_SCREEN, {
                fromMenu: true,
                businessUnitId: businessUnitId,
              })
            }
          />
          <MenuItem
            title="Suppliers"
            icon={Theme.icons.supplier}
            onPress={() =>
              navigation.navigate(CustomConstants.SUPPILER_SCREEN, {
                fromMenu: true,
                businessUnitId: businessUnitId,
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

      {/* LOGOUT MODAL */}
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
    fontSize: 15,
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
  divider: {
    height: 1,
    backgroundColor: Theme.colors.sky,
    marginVertical: 6,
    marginLeft: 50,
    marginRight: 16,
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
    width: 15,
    height: 15,
    tintColor: Theme.colors.greater,
  },

  dotsOverlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },

  dotsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },

  dotsMenu: {
    position: 'absolute',
    top: 60,
    right: 13,
    width: 140,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },

  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 10,
  },

  dotsMenuItem: {
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  dotsMenuText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
});
