import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';

interface HeaderProps {
  title: string;
  onPressDots?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onPressDots }) => {
  return (
    <View style={styles.topHeader}>
      {/* LOGO */}
      <Image source={Theme.icons.logo2} style={styles.logo} />

      {/* DYNAMIC TITLE */}
      <Text style={styles.topHeaderText}>{title}</Text>

      {/* DOTS ICON */}
      <TouchableOpacity
        onPress={onPressDots}
        style={styles.dotsIconContainer}
      >
        <Image source={Theme.icons.dots} style={styles.dotsIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  topHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
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
});
