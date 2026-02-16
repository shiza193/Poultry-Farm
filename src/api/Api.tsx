import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logout } from '../navigation/NavigationService';
import { showErrorToast, showSuccessToast } from '../utils/AppToast';
import axios, { AxiosRequestConfig } from 'axios';


 // Extend AxiosRequestConfig to optionally show success toast

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showSuccessToast?: boolean;
}


 //AsyncStorage keys used in the app
 
export const AsyncKeyLiterals = {
  token: 'token',
  userId: 'userId',
};


 //In-memory token to avoid reading AsyncStorage on every API call

let token: string | null = null;


 // Save token in memory and AsyncStorage
 //Call this function after login or token refresh
 
export async function saveToken(data: string) {
  token = data;
  try {
    await AsyncStorage.setItem(AsyncKeyLiterals.token, data);
  } catch (error) {
    console.log('Failed to save token to storage:', error);
  }
}


 // Initialize token from AsyncStorage on app start
 //Call this in App.tsx or main entry point
 
export async function initToken() {
  try {
    const storedToken = await AsyncStorage.getItem(AsyncKeyLiterals.token);
    if (storedToken) token = storedToken;
  } catch (error) {
    console.log('Failed to load token from storage:', error);
  }
}


 // Axios instance

const api = axios.create({
  baseURL: 'https://inventstarts.com:5003/',
  headers: {
    'Content-Type': 'application/json',
  },
});


 // Request interceptor
 //Automatically attaches token from memory to Authorization header

// Request interceptor: attach token
api.interceptors.request.use(async config => {
  // Use in-memory token first
  if (!token) {
    // Fallback: read from AsyncStorage if memory is empty
    try {
      const storedToken = await AsyncStorage.getItem(AsyncKeyLiterals.token);
      if (storedToken) token = storedToken;
    } catch (error) {
      console.log('Failed to load token for request', error);
    }
  }

  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log('Token attached to request');
  }

  return config;
});


 //Response interceptor
  //Centralized success handling + defensive response validation
 
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
        showErrorToast(
          'Oops!',
          'Your request could not be processed. Please check and try again.',
        );
        break;

      case 401:
        showErrorToast('Unauthorized', 'You need to login again.');
        Logout(); //  Auto logout on token expiry
        break;

      case 403:
        showErrorToast(
          'Access Denied',
          'You don’t have permission to do this.',
        );
        break;

      case 404:
        showErrorToast(
          'Not Found',
          'We couldn’t find what you’re looking for.',
        );
        break;

      case 500:
        showErrorToast(
          'Server Error',
          'Something went wrong on our end. Please try later.',
        );
        break;

      default:
        showErrorToast('Error', message);
        break;
    }

    console.log(
      'INTERCEPTOR ERROR:',
      error.response?.status,
      error.response?.data,
    );

    return Promise.reject(error);
  },
);


 //Utility function to save any key-value pair in AsyncStorage

export const saveToStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log('Error saving data to storage:', error);
  }
};


 // Utility function to get any key from AsyncStorage

export const getFromStorage = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log('Error reading data from storage:', error);
    return null;
  }
};

export default api;
