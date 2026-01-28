import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';
import { CustomConstants, ScreenType } from '../../constants/CustomConstants';

interface Props {
  screen: ScreenType;
}

const tipsMap: Partial<Record<ScreenType, { title: string; tip: string }>> = {
  [CustomConstants.FLOCKS_SCREEN]: {
    title: 'Flocks Tip',
    tip: 'Keep track of daily feed consumption  for better FCR 🐔',
  },
  [CustomConstants.FLOCKS_MORTALITY_SCREEN]: {
    title: 'Mortality Tip',
    tip: 'Early disease detection reduces losses ⚠️',
  },
  [CustomConstants.FLOCK_STOCK_SCREEN]: {
    title: 'Stock Tip',
    tip: 'Monitor feed stock weekly 🌾',
  },
  [CustomConstants.FLOCK_SALE_SCREEN]: {
    title: 'Sales Tip',
    tip: 'Track sales daily to improve profit 💰',
  },
  [CustomConstants.HOSPITALITY_SCREEN]: {
    title: 'Hospitality Tip',
    tip: 'Isolate sick birds immediately 🏥',
  },
  [CustomConstants.DASHBOARD_DETAIL_SCREEN]: {
    title: 'Dashboard Tip',
    tip: 'Track your poultry performance at a glance ',
  },
  [CustomConstants.VACCINATIONS_SCREEN]:
    { title: 'Vaccination Tip', tip: 'Ensure timely vaccination to prevent disease outbreaks ', },
  [CustomConstants.VACCINE_SCHEDULE_SCREEN]: 
  { title: 'Vaccination Tip', tip: 'Follow vaccination dates strictly to prevent disease outbreaks ', },
   [CustomConstants.VACCINATION_STOCK_SCREEEN]: 
   { title: 'Vaccine Stock Tip', tip: 'Always check vaccine expiry and maintain minimum stock ', },
};

const images = [
  Theme.icons.image1,
  Theme.icons.image2,
  Theme.icons.image3,
  Theme.icons.image4,
  Theme.icons.image5,
  Theme.icons.image6,
];

const ScreenTipCard: React.FC<Props> = ({ screen }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const data = tipsMap[screen];
  if (!data) return null;

  return (
    <View style={styles.card}>
      <View style={styles.textArea}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.tip}>{data.tip}</Text>
      </View>
      <Image source={images[index]} style={styles.image} />
    </View>
  );
};

export default ScreenTipCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f0efaf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginTop: -8,
  },
  textArea: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.error,
    marginBottom: 6,
  },
  tip: {
    fontSize: 14,
    color: Theme.colors.black,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 12,
  },
});
