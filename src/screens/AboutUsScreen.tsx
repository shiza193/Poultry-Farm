import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Theme from '../theme/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutUsScreen = ({ navigation }: any) => {
  const images = [
     Theme.icons.logo2,
    Theme.icons.image1,
    Theme.icons.image2,
    Theme.icons.image4,
    Theme.icons.image5,
    Theme.icons.image6,
     Theme.icons.image7,
      Theme.icons.image8,
      
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔁 Auto slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={Theme.icons.back} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>About Us</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ===== Image Slider ===== */}
        <View style={styles.imageBox}>
          <Image
            source={images[currentIndex]}
            style={styles.sliderImage}
          />
        </View>

        {/* ===== App Name ===== */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Happy Poultry Farm</Text>
        </View>

        {/* ===== About Text ===== */}
        <View style={styles.textContainer}>
          <Text style={styles.description}>
            Welcome to{' '}
            <Text style={styles.bold}>Happy Poultry Farm</Text>, a modern poultry
            management application designed to simplify farm operations and
            improve productivity.
          </Text>

          <Text style={styles.description}>
            Our goal is to empower poultry farmers with smart tools that help
            manage birds, feed, eggs, vaccination schedules, sales, and expenses
            — all from one easy-to-use platform.
          </Text>

          <Text style={styles.description}>
            Happy Poultry Farm provides real-time insights into daily farm
            performance, allowing farmers to make informed decisions and reduce
            operational losses.
          </Text>

          <Text style={styles.description}>
            The application is designed with a clean and user-friendly interface
            so farmers of all experience levels can use it comfortably without
            technical complexity.
          </Text>

          <Text style={styles.description}>
            With accurate record keeping and organized data, farmers can easily
            track bird mortality, egg production rates, feed consumption, and
            vaccine availability.
          </Text>

          <Text style={styles.description}>
            Our vision is to combine technology with agriculture to build a
            smarter, more sustainable future for poultry farming.
          </Text>

          <Text style={styles.description}>
            Thank you for choosing Happy Poultry Farm. We are committed to
            continuously improving this platform to better serve farmers and
            support their success.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.screenBackground,
  },

  /* ===== Header ===== */
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  /* ===== Image Slider ===== */
  imageBox: {
    marginTop: 24,
    marginHorizontal: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  /* ===== App Name ===== */
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  /* ===== Text ===== */
  textContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
    marginBottom: 14,
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
});
