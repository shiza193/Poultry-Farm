
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef, resetToLogin } from "../navigation/NavigationService";
//  AsyncStorage keys
export const AsyncKeyLiterals = {
  token: "token",
  userId: "userId",
};


//  Axios instance (main API handler)
const api = axios.create({
  baseURL: "https://inventstarts.com:5003/",
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AsyncKeyLiterals.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(" Token attached automatically");
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log(" 401 Unauthorized - Logging out");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      resetToLogin();
    }
    return Promise.reject(error);
  }
);

//  Save data to AsyncStorage
export const saveToStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(" Error saving data:", error);
  }
};


// Get data from AsyncStorage
export const getFromStorage = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log(" Error reading data:", error);
    return null;
  }
};

export default api;
