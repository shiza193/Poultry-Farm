import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import InputField from '../../components/customInputs/Input';
import PrimaryButton from '../../components/customButtons/customButtom';
import { CustomConstants } from '../../constants/CustomConstants';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginUser } from '../../services/AuthService';

import styles from './style';
import Theme from '../../theme/Theme';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const handleEmailBlur = () => {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  AsyncStorage.getItem('token').then(t => console.log(' STORED TOKEN:', t));
const isFormValid = email.trim().length > 0 && password.length > 0;

const handleLogin = async () => {
  Keyboard.dismiss();

  if (!isValidEmail(email)) {
    setEmailError('Enter a valid email address');
    return;
  }

  if (!isValidPassword(password)) {
    console.log('Invalid password');
    return;
  }

  try {
    setLoading(true);

    const res = await loginUser({ email, password });

    const token = res?.token;
    const userId = res?.userId;

    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId?.toString() || '');

      navigation.replace(CustomConstants.DASHBOARD_TABS);
    }
  } catch (error) {
    console.log('Login failed', error);
  } finally {
    setLoading(false);
  }
};


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={Theme.icons.poultrycloud} style={styles.logo} />

        <Text style={styles.title}>Welcome Back !</Text>

        {/* Email */}
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          onBlur={handleEmailBlur}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Password */}
        <View style={{ position: 'relative', width: '100%' }}>
          <InputField
            label="Password"
            placeholder="*********"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            inputStyle={{ paddingRight: 45 }}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 15,
              top: 35,
            }}
          >
            <Image
              source={
                showPassword
                  ? Theme.icons.showPassword
                  : Theme.icons.hidePassword
              }
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <PrimaryButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={!isFormValid || loading}
          style={
            !isFormValid ? { backgroundColor: Theme.colors.buttonDisabled } : {}
          }
          textStyle={{ color: Theme.colors.black }}
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color={Theme.colors.borderYellow}
            style={{ marginTop: 10 }}
          />
        )}
        {/* Signup navigation */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Text style={{ color: '#555' }}>Not an account? </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate(CustomConstants.SIGN_UP_SCREEN)}
          >
            <Text
              style={{
                color: Theme.colors.success,
                fontWeight: '600',
              }}
            >
              Signup now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
