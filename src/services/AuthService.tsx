import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { saveToStorage, AsyncKeyLiterals } from "../api/Api";

export const loginUser = async (payload: { email: string; password: string }) => {
  try {
    const loginPayload = {
      ...payload,
      rememberMe: true,
    };
    console.log(" Login payload sent to API:", loginPayload);

    const response = await api.post("api/Account/login", loginPayload);

    console.log(" Login status:", response.status);
    console.log(" Login response:", response.data);

    const token = response.data?.token;
    const userId = response.data?.userId;

    if (!token) {
      console.log(" Token not found in API response!");
      throw new Error("Token missing in login response");
    }

    // Save token
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userId", userId);
    console.log(" Token & UserId saved in AsyncStorage");

    return response.data;
  } catch (err: any) {
    console.log(" Login API error:", err.message);
    if (err.response) {
      console.log(" Status:", err.response.status);
      console.log(" Data:", err.response.data);
    }
    throw err;
  }
};

