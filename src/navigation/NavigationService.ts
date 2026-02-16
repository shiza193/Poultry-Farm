import { createNavigationContainerRef } from '@react-navigation/native';
import { CustomConstants } from '../constants/CustomConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const navigationRef = createNavigationContainerRef();

export const Logout = async () => {
  if (navigationRef.isReady()) {
    try {
      await AsyncStorage.clear();

      navigationRef.reset({
        index: 0,
        routes: [{ name: CustomConstants.LOGIN_SCREEN }],
      });

      console.log(' LOGOUT SUCCESSFUL');
    } catch (error) {
      console.error(' LOGOUT FAILED:', error);
    }
  } else {
    console.warn(' Navigation not ready. Logout could not reset navigation.');
  }
};
