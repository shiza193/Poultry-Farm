import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Theme from '../../theme/Theme';

interface Props {
  visible: boolean;
  text?: string;
  spinnerColor?: string;
}

const { width, height } = Dimensions.get('window');

const LoadingOverlay: React.FC<Props> = ({
  visible,
  text = 'Loading...',
  spinnerColor = Theme.colors.primaryYellow,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={spinnerColor} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // Slightly darker for better focus
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: Theme.colors.white,
    paddingVertical: 25,
    paddingHorizontal: 35,
    borderRadius: 20,
    elevation: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 150,
  },
  text: {
    marginTop: 15,
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingOverlay;
