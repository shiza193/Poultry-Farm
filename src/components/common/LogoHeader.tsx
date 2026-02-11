import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Theme from '../../theme/Theme';
import ConfirmationModal from '../customPopups/ConfirmationModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CustomConstants } from '../../constants/CustomConstants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  containerStyle?: any;
  titleStyle?: any;
  alignWithLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  alignWithLogo = false,
}) => {
  const navigation = useNavigation<any>();

  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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
    <>
      {/* HEADER */}
      <View style={[styles.topHeader, containerStyle]}>
        {/* LOGO */}
        <Image source={Theme.icons.poultrycloud1} style={styles.logo} />

        {/* TITLE */}
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

        {/* DOTS ICON */}
        <TouchableOpacity
          style={styles.dotsIconContainer}
          onPress={() => setShowMenu(true)}
        >
          <Image source={Theme.icons.dots} style={styles.dotsIcon} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {showMenu && (
        <TouchableOpacity
          style={styles.dotsOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        />
      )}

      {/* MENU */}
      {showMenu && (
        <View style={styles.dotsMenu}>
          <TouchableOpacity
            style={styles.dotsMenuItem}
            onPress={() => {
              setShowMenu(false);
              setShowLogout(true);
            }}
          >
            <View style={styles.menuItemRow}>
              <Image source={Theme.icons.logout} style={styles.menuItemIcon} />
              <Text style={styles.dotsMenuText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* LOGOUT CONFIRMATION */}
      <ConfirmationModal
        type="logout"
        visible={showLogout}
        title="Are you sure you want to logout?"
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 80,
  },
  logo: {
    width: 80,
    height: 80,
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
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  subTitle: {
    fontSize: 14,
    color: Theme.colors.settinglable,
    marginBottom: 14,
  },
  dotsIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  dotsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dotsMenu: {
    position: 'absolute',
    top: 60,
    right: 13,
    width: 130,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  dotsMenuItem: {
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  dotsMenuText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
});
