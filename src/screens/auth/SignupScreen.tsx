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

    if (!isFormValid) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Form',
        text2: 'Please fill all fields correctly',
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: name,
        companyName: companyName,
        email: email,
        password: password,
      };

      const res = await registerUser(payload);

      if (res?.status === 'Success') {
        Toast.show({
          type: 'success',
          text1: 'Account Created 🎉',
          text2: 'Please login to continue',
        });

        setTimeout(() => {
          navigation.replace(CustomConstants.LOGIN_SCREEN);
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: 'Something went wrong',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Something went wrong. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: errorMessage,
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
          keyboardType="email-address"
          autoCapitalize="none"
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
          title="Sign Up"
          onPress={handleSignup}
          disabled={!isFormValid}
          loading={loading}
        />

        {/* Login navigation */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Text>Already have an account?</Text>
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
             Login 
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;