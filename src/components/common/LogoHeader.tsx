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
      {/* LOGO LEFT */}
      <Image source={Theme.icons.poultrycloud1} style={styles.logo} />

      {/* TITLE + SUBTITLE */}
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

      {/* DOTS ICON RIGHT */}
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
    height: 80,
    paddingHorizontal: 10,
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
    marginBottom:14,
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
});
