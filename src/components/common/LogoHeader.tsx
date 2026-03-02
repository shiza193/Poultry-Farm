import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';
import { useState } from 'react';
import { CustomConstants } from '../../constants/CustomConstants';
import { useNavigation } from '@react-navigation/native';
import ConfirmationModal from '../customPopups/ConfirmationModal';
import { Logout } from '../../navigation/NavigationService';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onPressDots?: () => void;
  onAddNewPress?: () => void;
  onReportPress?: () => void;
  showAdminPortal?: boolean;
  showLogout?: boolean;
  containerStyle?: any;
  titleStyle?: any;
  alignWithLogo?: boolean;
}
const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onPressDots,
  onAddNewPress,
  onReportPress,
  showAdminPortal = false,
  showLogout = false,
  containerStyle,
  titleStyle,
  alignWithLogo = false,
}) => {
  const navigation = useNavigation<any>();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  return (
    <>
      <View style={[styles.topHeader, containerStyle]}>
        {/* ===== LOGO LEFT ===== */}
        <Image source={Theme.icons.poultrycloud1} style={styles.logo} />

        {/* ===== TITLE ===== */}
        {alignWithLogo ? (
          <View style={styles.titleContainerWithLogo}>
            <Text style={[styles.topHeaderText, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
          </View>
        ) : (
          <View style={styles.centeredTitleContainer}>
            <Text style={[styles.topHeaderText, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.subTitle}>{subtitle}</Text>}
          </View>
        )}

        {/* ===== DOTS ===== */}
        <TouchableOpacity
          onPress={() => {
            setShowMenu(!showMenu);
            onPressDots?.();
          }}
          style={styles.dotsIconContainer}
        >
          <Image source={Theme.icons.dots} style={styles.dotsIcon} />
        </TouchableOpacity>
        {/* ===== OVERLAY + MENU ===== */}
        {showMenu && (
          <>
            {/* FULL SCREEN TRANSPARENT OVERLAY */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill} // full screen cover
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            />

            {/* MENU */}
            <View style={styles.menu}>
              {onAddNewPress && (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onAddNewPress();
                    }}
                  >
                    <Image source={Theme.icons.add} style={styles.menuIcon} />
                    <Text style={styles.menuText}>Add New</Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                </>
              )}

              {onReportPress && (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onReportPress();
                    }}
                  >
                    <Image source={Theme.icons.report} style={styles.menuIcon} />
                    <Text style={styles.menuText}>Report</Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                </>
              )}

              {showAdminPortal && (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      navigation.navigate(CustomConstants.DASHBOARD_TABS);
                    }}
                  >
                    <Image source={Theme.icons.back} style={styles.backmenuIcon} />
                    <Text style={styles.menuText}>Admin Portal</Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                </>
              )}

              {showLogout && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <Image source={Theme.icons.logout} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
        {/* ===== LOGOUT MODAL ===== */}
        <ConfirmationModal
          type="logout"
          visible={showLogoutModal}
          title="Are you sure you want to logout?"
          onClose={() => setShowLogoutModal(false)}
          onConfirm={Logout}
        />
      </View>
    </>
  );
};

export default Header;
const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
    paddingHorizontal: 10,

    zIndex: 1000,
    elevation: 1000,
  },
  logo: {
    width: 100,
    height: 90,
    marginLeft: -8,
    resizeMode: 'contain',
  },
  titleContainerWithLogo: {
    flex: 1,
    justifyContent: 'center',
  },
  centeredTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderText: {
    fontSize: 19,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    lineHeight: 26,
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 14,
    color: Theme.colors.settinglable,
  },
  dotsIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsIcon: {
    width: 40,
    height: 29,
    resizeMode: 'contain',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 99999,
    elevation: 20,
  },

  menu: {
    position: 'absolute',
    top: 55,
    right: 28,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 6,
    elevation: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  menuIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: 'contain',
  },
  backmenuIcon: {
    width: 15,
    height: 15,
    marginRight: 8,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 15,
    color: Theme.colors.textPrimary,
  },

  menuSeparator: {
    height: 1,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
});
