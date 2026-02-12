import api, { saveToken, saveToStorage, AsyncKeyLiterals } from '../api/Api';

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    const loginPayload = {
      ...payload,
      rememberMe: true,
    };

    const response = await api.post('api/Account/login', loginPayload);

    const token = response.data?.token;
    const userId = response.data?.userId;
    console.log(' FULL RESPONSE:', response);
    console.log(' FULL RESPONSE DATA:', JSON.stringify(response.data, null, 2));

    if (!token) {
      throw new Error('Token missing in login response');
    }

    // Use centralized functions
    await saveToken(token);
    await saveToStorage(AsyncKeyLiterals.userId, userId);

    return response.data;
  } catch (err: any) {
    console.log('Login API error:', err?.response?.data || err.message);
    throw err;
  }
};

type RegisterPayload = {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  try {
    console.log(' Register payload sent to API:', payload);

    const response = await api.post('api/Account/register', payload);

    console.log(' Register status:', response.status);
    console.log(' Register response:', response.data);

    return response.data;
  } catch (err: any) {
    console.log(' Register API error:', err.message);

    if (err.response) {
      console.log(' Status:', err.response.status);
      console.log(' Data:', err.response.data);
    }

    throw err;
  }
};
