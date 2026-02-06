import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onPressDots?: () => void;
  containerStyle?: any;
  titleStyle?: any;
  alignWithLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onPressDots,
  containerStyle,
  titleStyle,
  alignWithLogo = false,
}) => {
  return (
    <View style={[styles.topHeader, containerStyle]}>
      {/* LOGO */}
      <Image source={Theme.icons.poultrycloud1} style={styles.logo} />

      {/* TITLE + SUBTITLE */}
      {alignWithLogo ? (
        <View style={styles.titleContainerWithLogo}>
          <Text style={[styles.topHeaderText, titleStyle]}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subTitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={[styles.topHeaderText, titleStyle]}>{title}</Text>
      )}

      {/* DOTS ICON */}
      <TouchableOpacity onPress={onPressDots} style={styles.dotsIconContainer}>
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
    paddingHorizontal: 1,
    height: 80,
  },
  logo: {
    width: 110,
    height: 100,
    resizeMode: 'contain',
  },
  titleContainerWithLogo: {
    flex: 1,
    marginLeft: 4,
    justifyContent: 'center',
  },

  topHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    lineHeight: 22,
  },

 subTitle: {
    position: 'absolute',
    top: 40,
    left: 0,
    fontSize: 14,
    color: Theme.colors.settinglable,
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
