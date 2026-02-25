import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import InputField from '../../components/customInputs/Input';
import PrimaryButton from '../../components/customButtons/customButton';
import { CustomConstants } from '../../constants/CustomConstants';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { loginUser } from '../../services/AuthService';

import styles from './style';
import Theme from '../../theme/Theme';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Email validation
  const handleEmailBlur = () => {
    if (!isValidEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Password validation
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

      // Login API call
      const res = await loginUser({ email, password });
      // token already saved in loginUser
      const token = res?.token;

      if (token) {
        Toast.show({
          type: 'success',
          text1: 'Welcome Back to PoultryCloud 🐔',
          text2: 'Your farm insights and operations are ready to manage.',
        });

        navigation.replace(CustomConstants.DASHBOARD_TABS);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid email or password',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
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
          keyboardType="email-address"
          autoCapitalize="none"
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
          title="Login"
          onPress={handleLogin}
          disabled={!isFormValid || loading}
          loading={loading}
          textStyle={{ color: Theme.colors.black }}
        />

        {/* Signup navigation */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Text style={{ color: '#555' }}>Don't have an account? </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate(CustomConstants.SIGN_UP_SCREEN)}
          >
            <Text
              style={{
                color: Theme.colors.success,
                fontWeight: '600',
              }}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
