import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Theme from '../../theme/Theme';

const { width } = Dimensions.get('window');

interface CardLoadingProps {
  visible?: boolean;
  lines?: number; // number of shimmer lines
}

const CardLoading = ({ visible, lines = 6 }: any) => {
  const translateX = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: width,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={{ width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ marginVertical: 6, width: '100%', height: 20, borderRadius: 6, backgroundColor: Theme.colors.borderLight, overflow: 'hidden' }}>
          <Animated.View
            style={{
              width,
              height: '100%',
              transform: [{ translateX }],
            }}
          >
            <LinearGradient
              colors={['transparent', Theme.colors.primaryYellow, Theme.colors.secondaryYellow, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      ))}
    </View>
  );
};
export default CardLoading;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  lineWrapper: {
    marginVertical: 6,
  },
  line: {
    width: '100%',
    height: 20,
    backgroundColor: Theme.colors.borderLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  wave: {
    width: width,
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});