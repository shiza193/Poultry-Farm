import { createNavigationContainerRef } from '@react-navigation/native';
import { CustomConstants } from '../constants/CustomConstants';
export const navigationRef = createNavigationContainerRef();

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: CustomConstants.LOGIN_SCREEN }],
    });
  }
}