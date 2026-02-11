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
import PrimaryButton from '../../components/customButtons/customButton';
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
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Email validation
  const handleEmailBlur = () => {
    if (!isValidEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordBlur = () => {
    if (!isValidPassword(password)) {
      setErrors(prev => ({
        ...prev,
        password:
          'Password must be 8+ chars, with uppercase, lowercase, number & special char',
      }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  // Form valid if all fields filled
  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0 &&
    !errors.email &&
    !errors.password;

  const handleLogin = async () => {
    Keyboard.dismiss();
    handleEmailBlur();
    handlePasswordBlur();
    if (!isFormValid) return;
    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      const token = res?.token;
      if (token) {
        // Save only token
        await AsyncStorage.setItem('token', token);
        navigation.replace(CustomConstants.DASHBOARD_TABS);
      }
    } catch (error) {
      console.log('Login failed', error); // interceptors  handel erro toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={Theme.icons.poultrycloud1} style={styles.logo} />

        <Text style={styles.title}>Welcome Back !</Text>

        {/* Email */}
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          onBlur={handleEmailBlur}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        {/* Password */}
        <View style={{ position: 'relative', width: '100%' }}>
          <InputField
            label="Password"
            placeholder="*********"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            onBlur={handlePasswordBlur}
            inputStyle={{ paddingRight: 45 }}
          />
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
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
