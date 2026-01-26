// components/SidebarWrapper.tsx
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { View, Animated, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../Sidebar';
import Theme from '../../theme/Theme';
import { ScreenType } from '../../constants/CustomConstants';

interface SidebarWrapperProps {
  children: ReactNode;
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  
}

const SidebarWrapper: React.FC<SidebarWrapperProps> = ({
  children,
  activeScreen,
  setActiveScreen,
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarVisible ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ===== Sidebar ===== */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <Sidebar
          isVisible={sidebarVisible}
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />
      </Animated.View>

      {/* ===== Sidebar Toggle Button ===== */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setSidebarVisible(!sidebarVisible)}
        >
          <Image
            source={sidebarVisible ? Theme.icons.close1 : Theme.icons.open}
            style={{ width: 22, height: 25, tintColor: Theme.colors.white }}
          />
        </TouchableOpacity>
      </View>

      {/* ===== Wrapped Content ===== */}
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};

export default SidebarWrapper;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.screenBackground,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 252,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  toggleContainer: {
    position: 'absolute',
    top: 1,
    left: 10,
    zIndex: 30,
  },
  toggleButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: Theme.colors.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 46,
    elevation: 3,
  },
});
