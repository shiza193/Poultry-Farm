import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import InputField from '../../components/customInputs/Input';
import PrimaryButton from '../../components/customButtons/customButtom';
import { CustomConstants } from '../../constants/CustomConstants';
import { isValidEmail, isValidPassword } from '../../utils/validation';

import { registerUser } from '../../services/AuthService';

import styles from './style';
import Theme from '../../theme/Theme';

const SignupScreen = ({ navigation }: any) => {
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
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

  const isFormValid =
    companyName.trim().length > 0 &&
    name.trim().length > 0 &&
    isValidEmail(email) &&
    isValidPassword(password);

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!isFormValid) return;

    try {
      setLoading(true);

      const payload = {
        fullName: name,
        companyName: companyName,
        email: email,
        password: password,
      };

      console.log(' Signup payload:', payload);

      const res = await registerUser(payload);
      console.log(' Signup response:', res);

      if (res?.status === 'Success') {
        Alert.alert(
          'Success',
          'Account created successfully. Please login.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.replace(CustomConstants.LOGIN_SCREEN),
            },
          ]
        );
      }
    } catch (error: any) {
      console.log(' Signup failed:', error);

      const errorMessage =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Logo */}
        <Image source={Theme.icons.poultrycloud} style={styles.logo} />

        <Text style={styles.title}>Create an Account</Text>

        {/* Company Name */}
        <InputField
          label="Company Name"
          placeholder="Enter company"
          value={companyName}
          onChangeText={setCompanyName}
        />

        {/* Name */}
        <InputField
          label="Name"
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          onBlur={handleEmailBlur}
        />
        {emailError ? (
          <Text style={styles.errorText}>{emailError}</Text>
        ) : null}

        {/* Password */}
        <View style={{ position: 'relative', width: '100%' }}>
          <InputField
            label="Password"
            placeholder="********"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            inputStyle={{ paddingRight: 45 }}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 15, top: 35 }}
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

        {/* Signup Button */}
        <PrimaryButton
          title={loading ? 'Creating account...' : 'Sign Up'}
          onPress={handleSignup}
          disabled={!isFormValid || loading}
          style={
            !isFormValid
              ? { backgroundColor: Theme.colors.buttonDisabled }
              : {}
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

        {/* Login navigation */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Text>Do you have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(CustomConstants.LOGIN_SCREEN)
            }
          >
            <Text
              style={{
                color: Theme.colors.success,
                fontWeight: '600',
              }}
            >
              Please login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
