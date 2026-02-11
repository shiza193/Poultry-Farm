import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToLogin } from '../navigation/NavigationService';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import axios, { AxiosRequestConfig } from 'axios';

// Extend AxiosRequestConfig with optional property
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showSuccessToast?: boolean;
}

// AsyncStorage keys
export const AsyncKeyLiterals = {
  token: 'token',
  userId: 'userId',
};

// Axios instance
const api = axios.create({
  baseURL: 'https://inventstarts.com:5003/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(AsyncKeyLiterals.token);
  if (token) {
    // Type assertion to satisfy TypeScript
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log('Token attached automatically');
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => {
    // Cast config to custom type
    const config = response.config as CustomAxiosRequestConfig;

    if (response.status === 200 && config.showSuccessToast) {
      showSuccessToast('Success!', response.data?.message || '');
    }

    return response;
  },
  async error => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    switch (status) {
      case 400:
        showErrorToast('Bad Request', message);
        break;
      case 401:
        showErrorToast('Unauthorized', 'Please login again.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        resetToLogin();
        break;
      case 403:
        showErrorToast('Forbidden', message);
        break;
      case 404:
        showErrorToast('Not Found', 'The requested resource does not exist.');
        break;
      case 500:
        showErrorToast('Server Error', 'Please try again later.');
        break;
      default:
        showErrorToast('Error', message);
        break;
    }
    console.log(
      ' INTERCEPTOR ERROR HIT:',
      error.response?.status,
      error.response?.data,
    );

    return Promise.reject(error);
  },
);

// Utility functions for AsyncStorage
export const saveToStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

export const getFromStorage = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log('Error reading data:', error);
    return null;
  }
};

export default api;
