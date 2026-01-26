import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SidebarWrapper from '../components/customButtons/SidebarWrapper';
import Theme from '../theme/Theme';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { CustomConstants, ScreenType } from '../constants/CustomConstants';
import { getPoultryFarmSummary } from '../services/BusinessUnit';
import ScreenTipCard from '../components/customCards/ScreenTipCard';

const DashboardDetailScreen = ({ navigation }: any) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [poultryData, setPoultryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const activeScreen = CustomConstants.DASHBOARD_DETAIL_SCREEN;
  const businessUnitId = '157cc479-dc81-4845-826c-5fb991bd3d47';

  const bannerImages = [
    Theme.icons.image1,
    Theme.icons.image2,
    Theme.icons.image3,
    Theme.icons.image4,
    Theme.icons.image5,
    Theme.icons.image6,
  ];

  // Cycle banner images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1,
      );
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Fetch poultry data
  const fetchPoultrySummary = async () => {
    try {
      setLoading(true);
      const data = await getPoultryFarmSummary(
        businessUnitId,
        fromDate ? fromDate.toISOString() : null,
        toDate ? toDate.toISOString() : null,
      );
      setPoultryData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoultrySummary();
  }, [fromDate, toDate]);

  // Stat card component
  const StatCard = ({ title, value, bgColor, icon }: any) => {
    return (
      <View style={[styles.statCard, { backgroundColor: bgColor }]}>
        <Image source={icon} style={styles.statIconImg} />
        <Text style={styles.statValue}>{value ?? 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => {}}>
        <View style={{ backgroundColor: Theme.colors.white }}>
          <LoadingOverlay visible={loading} />
          <View style={styles.topRow}>
            {/* Center Title */}
            <Text style={styles.topTitle}>Farm Dashboard</Text>

            {/* Right dots icon */}
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Image source={Theme.icons.dots} style={styles.profileIcon} />
            </TouchableOpacity>
          </View>

          {menuVisible && (
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate('Settings');
                  }}
                >
                  <Image source={Theme.icons.setting} style={styles.menuIcon} />
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate(CustomConstants.ABOUT_US_SCREEN);
                  }}
                >
                  <Image source={Theme.icons.user} style={styles.menuIcon} />
                  <Text style={styles.menuText}>About Us</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {/* ===== TIP CARD ===== */}
          <View style={styles.tipCardContainer}>
            <ScreenTipCard screen={CustomConstants.DASHBOARD_DETAIL_SCREEN} />
          </View>
          {/* ===== Banner =====
          <View style={styles.topBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Farm Dashboard 👋</Text>
              <Text style={styles.bannerSubtitle}>
                Track your poultry performance at a glance
              </Text>
            </View>
            <Image
              source={bannerImages[currentImageIndex]}
              style={styles.bannerImage}
            />
          </View> */}

          {/* ===== Date Filters ===== */}
          <View style={styles.topRow}>
            <View style={styles.smallFilter}>
              <Text style={styles.filterLabel}>From</Text>
              <TouchableOpacity
                style={styles.smallFilterInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Text style={styles.filterText}>
                  {fromDate ? fromDate.toLocaleDateString() : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.filterIcon} />
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker
                  value={fromDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => {
                    setShowFromPicker(false);
                    if (d) setFromDate(d);
                  }}
                />
              )}
            </View>

            <View style={styles.smallFilter}>
              <Text style={styles.filterLabel}>To</Text>
              <TouchableOpacity
                style={styles.smallFilterInput}
                onPress={() => setShowToPicker(true)}
              >
                <Text style={styles.filterText}>
                  {toDate ? toDate.toLocaleDateString() : 'mm/dd/yyyy'}
                </Text>
                <Image source={Theme.icons.date} style={styles.filterIcon} />
              </TouchableOpacity>
              {showToPicker && (
                <DateTimePicker
                  value={toDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => {
                    setShowToPicker(false);
                    if (d) setToDate(d);
                  }}
                />
              )}
            </View>
          </View>

          {/* ===== Poultry Data Cards ===== */}
          {poultryData && (
            <View style={styles.cardsContainer}>
              {/* Birds */}
              <Text style={styles.sectionTitle}>BIRDS</Text>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Total Birds"
                  value={poultryData.totalBirds}
                  bgColor="#FFF4CC"
                  icon={Theme.icons.hen}
                />
                <StatCard
                  title="Mortality"
                  value={poultryData.totalMortalityBirds}
                  bgColor="#FFE5E5"
                  icon={Theme.icons.motality}
                />
              </View>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Hospitalized"
                  value={poultryData.totalHospitalizedBirds}
                  bgColor="#E8F2FF"
                  icon={Theme.icons.hospital}
                />
                <StatCard
                  title="Remaining"
                  value={poultryData.totalRemainingBirds}
                  bgColor="#E8FFF1"
                  icon={Theme.icons.animal}
                />
              </View>

              {/* Eggs */}
              <Text style={styles.sectionTitle}>EGGS</Text>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Total Eggs"
                  value={poultryData.totalEggsProduced}
                  bgColor="#FFF1E6"
                  icon={Theme.icons.egg}
                />
                <StatCard
                  title="Production %"
                  value={`${poultryData.totalEggsProductionsPercentage}%`}
                  bgColor="#E6F7FF"
                  icon={Theme.icons.production}
                />
              </View>

              {/* Feed */}
              <Text style={styles.sectionTitle}>FEED</Text>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Purchased"
                  value={poultryData.totalPurchasedFeed}
                  bgColor="#F1F1FF"
                  icon={Theme.icons.finance}
                />
                <StatCard
                  title="Consumed"
                  value={poultryData.totalFeedConsumed}
                  bgColor="#FFE6F1"
                  icon={Theme.icons.feedc}
                />
              </View>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Available"
                  value={poultryData.totalAvailableFeed}
                  bgColor="#F1FFE6"
                  icon={Theme.icons.animal}
                />
              </View>

              {/* Vaccine */}
              <Text style={styles.sectionTitle}>VACCINE</Text>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Purchased"
                  value={poultryData.totalPurchasedVaccine}
                  bgColor="#E6ECFF"
                  icon={Theme.icons.vstock}
                />
                <StatCard
                  title="Schedule"
                  value={poultryData.totalVaccineSchedule}
                  bgColor="#FFF0F6"
                  icon={Theme.icons.vschedule}
                />
              </View>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Available"
                  value={poultryData.totalAvailableVaccine}
                  bgColor="#F3E6FF"
                  icon={Theme.icons.injection}
                />
              </View>

              {/* Sales */}
              <Text style={styles.sectionTitle}>SALES</Text>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Bird Sales"
                  value={poultryData.totalBirdsSale}
                  bgColor="#E6FFF1"
                  icon={Theme.icons.payable}
                />
                <StatCard
                  title="Egg Sales"
                  value={poultryData.totalEggSale}
                  bgColor="#FFFBE6"
                  icon={Theme.icons.egg}
                />
              </View>
              <View style={styles.rowWrap}>
                <StatCard
                  title="Other Sales"
                  value={poultryData.totalOtherSale}
                  bgColor="#F0F0F0"
                  icon={Theme.icons.receivables}
                />
              </View>
            </View>
          )}
        </View>
      </SidebarWrapper>
    </ScrollView>
  );
};

export default DashboardDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  cardsContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  sectionTitle: {
    marginTop: 3,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 16,
    left: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },

  menuContainer: {
    position: 'absolute',
    top: 40, // topRow ke just neeche
    right: 12,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  tipCardContainer: { marginTop: 20 },

  menuIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: Theme.colors.buttonPrimary,
  },

  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },

  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#020617' },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
    color: '#475569',
    fontWeight: '600',
  },
  statIconImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 9,
    borderRadius: 18,
    backgroundColor: '#f0efaf',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  bannerSubtitle: { fontSize: 14, marginTop: 4, color: '#000000' },
  bannerImage: { width: 100, height: 100, resizeMode: 'contain' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 14,
  },

  topTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  profileIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    marginTop: -9,
    backgroundColor: Theme.colors.white,
  },

  smallFilter: { width: '48%' },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    color: Theme.colors.black,
  },
  smallFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    margin: 6,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  filterText: { fontSize: 14, color: '#0F172A' },
  filterIcon: {
    width: 18,
    height: 18,
    tintColor: Theme.colors.secondaryYellow,
  },
});
