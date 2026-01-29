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
  const isFormValid = isValidEmail(email) && isValidPassword(password);

  const handleLogin = async () => {
    Keyboard.dismiss();
    console.log(' Login button clicked with email:', email);

    if (!email || !password) {
      console.log(' Email or password missing');
      return;
    }

    try {
      setLoading(true);

      //  Call API
      const res = await loginUser({ email, password });
      console.log(' Login success, response:', res);

      const token = res?.token;
      const userId = res?.userId;

      if (token) {
        //  Save to AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', userId?.toString() || '');
        console.log(' Token & UserId saved');

        //  Navigate to dashboard
        navigation.replace(CustomConstants.DASHBOARD_TABS);
      } else {
        console.log(' Token missing in response');
      }
    } catch (error) {
      console.log('Login failed on screen level', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={Theme.icons.logo} style={styles.logo} />

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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
