import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Theme from '../../theme/Theme';
import ConfirmationModal from '../customPopups/ConfirmationModal';
import { CustomConstants } from '../../constants/CustomConstants';
import { Logout } from '../../navigation/NavigationService';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onAddNewPress?: () => void;
  onReportPress?: () => void;
}

const BackArrow: React.FC<HeaderProps> = ({ title, showBack = false, onAddNewPress, onReportPress }) => {
  const navigation = useNavigation<any>();
  const [showDots, setShowDots] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  return (
    <>
      {/* ===== TOP BAR ===== */}
      <View style={styles.topHeader}>
        {/* LEFT: BACK + TITLE */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={Theme.icons.back} style={styles.icons} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}

          <Text style={styles.title}>{title}</Text>
        </View>

        {/* RIGHT: DOTS */}
        <TouchableOpacity onPress={() => setShowDots(!showDots)}>
          <Image source={Theme.icons.dots} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* ===== DOTS MENU ===== */}
      {showDots && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowDots(false)}
        >
          <View style={styles.menu}>
            {/* ===== ADD NEW (conditionally) ===== */}
            {onAddNewPress && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowDots(false);
                    onAddNewPress();
                  }}
                >
                  <Image source={Theme.icons.add} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Add New</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
              </>
            )}
            {/* ===== Report (conditionally) ===== */}
            {onReportPress && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowDots(false);
                    onReportPress();
                  }}
                >
                  <Image source={Theme.icons.report} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Report</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
              </>
            )}
            {/* ADMIN PORTAL */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowDots(false);
                navigation.navigate(CustomConstants.DASHBOARD_TABS);
              }}
            >
              <Image source={Theme.icons.back} style={styles.menuIcon} />
              <Text style={styles.menuText}>Admin Portal</Text>
            </TouchableOpacity>
            {/* LOGOUT */}
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowDots(false);
                setShowLogoutModal(true);
              }}
            >
              <Image source={Theme.icons.logout} style={styles.menuIcon} />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      {/* ===== LOGOUT MODAL ===== */}
      <ConfirmationModal
        type="logout"
        visible={showLogoutModal}
        title="Are you sure you want to logout?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={Logout}
      />
    </>
  );
};


export default BackArrow;

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1.5,
    borderBottomColor: Theme.colors.settinglines,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 19,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginLeft: 23,
  },

  icons: { width: 25, height: 20, resizeMode: 'contain' },
  icon: { width: 28, height: 28, resizeMode: 'contain' },

  iconPlaceholder: { width: 25 },

  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 2,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  menuIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
    resizeMode: 'contain',
  },

  menuText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },

  divider: {
    height: 1,
    backgroundColor: Theme.colors.SeparatorColor,
    marginVertical: 6,
    marginHorizontal: 10,
  },
});
