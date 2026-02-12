import { createNavigationContainerRef } from '@react-navigation/native';
import { CustomConstants } from '../constants/CustomConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const navigationRef = createNavigationContainerRef();

export const Logout = async () => {
  console.log(' LOGOUT INITIATED'); 

  if (navigationRef.isReady()) {
    try {
      console.log(' Clearing AsyncStorage...');
      await AsyncStorage.clear();

      console.log(' Resetting navigation to LOGIN screen...');
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
