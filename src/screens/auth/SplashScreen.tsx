import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomConstants } from "../../constants/CustomConstants";
import Theme from "../../theme/Theme";

const SplashScreen = () => {
  const navigation: any = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        // If token exists, navigate to dashboard
        navigation.replace(CustomConstants.DASHBOARD_TABS);
      } else {
        // Otherwise, go to login
        navigation.replace(CustomConstants.LOGIN_SCREEN);
      }
    };

    const timeout = setTimeout(checkLoginStatus, 2000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={Theme.icons.poultrycloud1} style={styles.logo} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});
