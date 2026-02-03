import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle } from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Theme from '../theme/Theme';
import Header from '../components/common/Header';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { getPoultryFarmSummary } from '../services/BusinessUnit';
import { useBusinessUnit } from '../context/BusinessContext';
import { CustomConstants } from '../constants/CustomConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmationModal from '../components/customPopups/ConfirmationModal';

const DashboardDetailScreen = ({ navigation, route }: any) => {
  const { businessUnitId, farmName, farmLocation } = useBusinessUnit();
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const fetchData = async () => {
    if (!businessUnitId) return;

    setLoading(true);

    const res = await getPoultryFarmSummary(
      businessUnitId,
      fromDate?.toISOString() || null,
      toDate?.toISOString() || null,
    );

    console.log('===== POULTRY FARM SUMMARY =====');
    console.log('Total Birds:', res?.totalBirds);
    console.log('Remaining Birds:', res?.totalRemainingBirds);
    console.log('Total Eggs Produced:', res?.totalEggsProduced);
    console.log('Production % (API):', res?.totalEggsProductionsPercentage);

    if (res?.totalEggsProduced && res?.totalEggsProductionsPercentage) {
      const calculatedLayingBirds =
        (res.totalEggsProduced * 100) / res.totalEggsProductionsPercentage;

      console.log(
        'Calculated Active Laying Birds:',
        calculatedLayingBirds.toFixed(2),
      );
    }

    setData(res);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [businessUnitId, fromDate, toDate]),
  );

  /** InlineStat for simple numbers */
  const InlineStat = ({ icon, label, value, total }: any) => {
    return (
      <View style={styles.inlineStatWrapper}>
        <View style={styles.inlineStatTopRow}>
          {icon && <Image source={icon} style={styles.inlineIcon} />}
          <Text style={styles.inlineLabel}>{label}</Text>
        </View>

        {total ? (
          <Text style={styles.inlineValue}>
            {/* Swap value aur total */}
            {value ?? 0} / {total ?? 0}
          </Text>
        ) : (
          <Text style={styles.inlineValue}>{value ?? 0}</Text>
        )}
      </View>
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();

      navigation.reset({
        index: 0,
        routes: [{ name: CustomConstants.LOGIN_SCREEN }],
      });
    } catch (error) {
      console.log('Logout failed', error);
    }
  };
  const InlineRowWithDividers = ({ stats }: any) => (
    <View style={styles.inlineRow}>
      {stats.map((stat: any, index: number) => (
        <React.Fragment key={index}>
          <InlineStat
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            total={stat.total}
          />
          {index < stats.length - 1 && (
            <View style={styles.statVerticalDivider} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // eggs = total eggs produced
  // productionPercentage = API se aane wali % value (e.g. 66.67)
  const EggsProductionCard = ({ eggs, productionPercentage }: any) => {
    //  Check: agar percentage null, undefined ya 0 ho
    // is se hum safe rehte hain crash se
    const isZero = !productionPercentage || productionPercentage <= 0;

    //  Circle component percentage nahi leta
    // wo 0 se 1 ke beech value leta hai
    // is liye 66.67% → 0.6667 banane ke liye 100 se divide
    // Math.min is liye taake value 1 (100%) se zyada na ho
    const progress = isZero ? 0 : Math.min(productionPercentage / 100, 1);

    //  Agar production 0 ho to blue color
    // agar production > 0 ho to green color
    const circleColor = isZero ? Theme.colors.grey : Theme.colors.success;

    return (
      //  Main card container
      <View style={styles.eggsProductionCard}>
        {/* ===== LEFT SIDE : CIRCLE GRAPH ===== */}
        <View style={styles.leftBlock}>
          <View style={styles.circleWrapper}>
            {/* Progress circle */}
            <Circle
              size={95} // Circle ka size
              progress={progress} // 0–1 ke beech value (e.g. 0.6667)
              thickness={6} // Circle ki line ki motai
              showsText={false} // Default text hide
              color={circleColor} // Filled part ka color
              unfilledColor={Theme.colors.grey} // Empty part ka color
              borderWidth={0} // Extra border disable
            />

            {/* Circle ke beech ka text */}
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>Production</Text>

              {/* Percentage value show ho rahi hai (as it is API se) */}
              <Text style={[styles.productionValue, { color: circleColor }]}>
                {productionPercentage ?? 0}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.centerWrapper}>
          <View style={styles.verticalSeparator} />
          <View style={styles.centerBlock}>
            <Image source={Theme.icons.dash1} style={styles.eggIcon} />
          </View>
        </View>

        {/* ===== RIGHT SIDE : TOTAL EGGS ===== */}
        <View style={styles.rightBlock}>
          <Text style={styles.eggsLabel}>Total Eggs</Text>

          {/* Total eggs value */}
          <Text style={styles.eggsValue}>{eggs ?? 0}</Text>
        </View>
      </View>
    );
  };

  const ProgressCircleCard = ({
    title,
    value, // Right side: available
    total, // Max value for % calculation
    icon,
    innerLabel, // Graph label inside circle
    innerValue, // Graph value inside circle
  }: any) => {
    // Determine color based on innerValue
    const isZero = !innerValue || innerValue <= 0;
    const circleColor = isZero ? Theme.colors.grey : Theme.colors.success;

    // Progress clamped between 0 and 1
    const progress = total ? Math.min(Math.max(innerValue / total, 0), 1) : 1;

    return (
      <View style={styles.eggsProductionCard}>
        {/* LEFT : CIRCLE GRAPH */}
        <View style={styles.leftBlock}>
          <View style={styles.circleWrapper}>
            <Circle
              size={95}
              progress={progress}
              thickness={6}
              showsText={false}
              color={circleColor} // green or blue part
              unfilledColor={Theme.colors.grey} // grey background for remaining part
              borderWidth={0}
            />

            {/*  TEXT INSIDE CIRCLE */}
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>{innerLabel}</Text>
              <Text style={[styles.productionValue, { color: circleColor }]}>
                {innerValue} / {total}
              </Text>
            </View>
          </View>
        </View>

        {/* CENTER : ICON */}
        <View style={styles.centerWrapper}>
          <View style={styles.verticalSeparator} />
          <View style={styles.centerBlock}>
            <Image source={icon} style={styles.eggIcon} />
          </View>
        </View>

        {/* RIGHT : TOTAL VALUE */}
        <View style={styles.rightBlock}>
          <Text style={styles.eggsLabel}>{title}</Text>
          <Text style={styles.eggsValue}>{value ?? 0}</Text>
        </View>
      </View>
    );
  };

  const SectionDivider = ({ title }: { title: string }) => (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <LoadingOverlay visible={loading} />

        <Header
          title={farmName || 'Poultry Farms'} // show farm name if available
          onPressDots={() => setIsDotsMenuVisible(!isDotsMenuVisible)}
        />

        {isDotsMenuVisible && (
          <View style={styles.dotsOverlayContainer}>
            <TouchableOpacity
              style={styles.dotsOverlay}
              activeOpacity={1}
              onPress={() => setIsDotsMenuVisible(false)}
            />
            <View style={styles.dotsMenu}>
              <TouchableOpacity
                style={styles.dotsMenuItem}
                onPress={() => {
                  setIsDotsMenuVisible(false);
                  setShowLogoutModal(true);
                }}
              >
                <View style={styles.menuItemRow}>
                  <Image
                    source={Theme.icons.logout}
                    style={styles.menuItemIcon}
                  />
                  <Text style={styles.dotsMenuText}>Logout</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.dotsMenuItem}
                onPress={() => {
                  setIsDotsMenuVisible(false);
                  navigation.navigate(CustomConstants.DASHBOARD_TABS);
                }}
              >
                <View style={styles.menuItemRow}>
                  <Image
                    source={Theme.icons.back}
                    style={styles.menuItemIcon}
                  />
                  <Text style={styles.dotsMenuText}>Admin Portal</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.dateRow}>
          {/* LEFT : DATE RANGE */}
          <View style={styles.dateRangeContainer}>
            {/* FROM */}
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>
                {fromDate ? fromDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.dateDash}>—</Text>

            {/* TO */}
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>
                {toDate ? toDate.toLocaleDateString('en-GB') : 'DD/MM/YY'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT : RESET */}
          {(fromDate || toDate) && (
            <TouchableOpacity
              style={styles.resetInlineBtn}
              onPress={() => {
                setFromDate(null);
                setToDate(null);
              }}
            >
              <Text style={styles.resetInlineText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pickers */}
        {showFromPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowFromPicker(false);
                if (event.type === 'set' && selectedDate) {
                  setFromDate(selectedDate);
                }
                // dismissed → kuch bhi mat karo
              } else {
                // iOS
                if (selectedDate) {
                  setFromDate(selectedDate);
                }
              }
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowToPicker(false);
                if (event.type === 'set' && selectedDate) {
                  setToDate(selectedDate);
                }
              } else {
                if (selectedDate) {
                  setToDate(selectedDate);
                }
              }
            }}
          />
        )}

        {data && (
          <View style={{ padding: 12 }}>
            <SectionDivider title="Bird Stats" />
            <InlineRowWithDividers
              stats={[
                {
                  icon: Theme.icons.hen,
                  label: 'Total Birds',
                  value: data.totalRemainingBirds,
                  total: data.totalBirds,
                },
                {
                  icon: Theme.icons.motality,
                  label: 'Mortality',
                  value: data.totalMortalityBirds,
                },
                {
                  icon: Theme.icons.hospital,
                  label: 'Hospitalized',
                  value: data.totalHospitalizedBirds,
                },
              ]}
            />

            <SectionDivider title="Sale Stats" />
            <InlineRowWithDividers
              stats={[
                {
                  icon: Theme.icons.trend,
                  label: 'Bird Sales',
                  value: data.totalBirdsSale,
                },
                {
                  icon: Theme.icons.trend,
                  label: 'Egg Sales',
                  value: data.totalEggSale,
                },
                {
                  icon: Theme.icons.trend,
                  label: 'Other Sales',
                  value: data.totalOtherSale,
                },
              ]}
            />
            <EggsProductionCard
              eggs={data.totalEggsProduced}
              productionPercentage={data.totalEggsProductionsPercentage}
            />

            <ProgressCircleCard
              title="Available Feed"
              value={data.totalAvailableFeed} // Right side
              total={data.totalPurchasedFeed} // Max for % calculation
              innerLabel="Consumed" // Graph label
              innerValue={data.totalFeedConsumed} // Graph value
              icon={Theme.icons.game} // Feed icon
            />

            <ProgressCircleCard
              title="Available Vaccine"
              value={data.totalAvailableVaccine} // Right side
              total={data.totalPurchasedVaccine} // Max for % calculation
              innerLabel="Schedule" // Text inside circle
              innerValue={data.totalVaccineSchedule} // Number inside circle
              icon={Theme.icons.health} // Vaccine icon
            />
          </View>
        )}
        <ConfirmationModal
          type="logout"
          visible={showLogoutModal}
          title="Are you sure you want to logout?"
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 10,
  },

  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetInlineBtn: {
    paddingHorizontal: 10,
    paddingVertical: 1,
  },

  resetInlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.error,
  },

  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateLabel: {
    fontSize: 15,
    color: '#9CA3AF',
    marginRight: 6,
    fontWeight: '500',
  },

  dateValue: {
    fontSize: 16,
    color: Theme.colors.success,
    fontWeight: '700',
  },

  dateDash: {
    fontSize: 18,
    color: '#9CA3AF',
    marginHorizontal: 10,
    fontWeight: '600',
  },

  eggsProductionCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
  circleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleCenterContent: {
    position: 'absolute',
    alignItems: 'center',
  },

  productionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.black,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
  },

  smallFilter: { width: '37%' },
  smallFilterInputBig: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.success,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },

  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },

  resetButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.error,
  },

  productionValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.blue,
    marginTop: 2,
  },

  leftBlock: {
    flex: 1.3, // graph side thora wide
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerBlock: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eggIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  eggsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.black,
  },

  eggsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.black,
    marginTop: 4,
  },
  centerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verticalSeparator: {
    width: 1,
    height: 60,
    backgroundColor: Theme.colors.sky,
    marginRight: 12,
  },

  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  inlineStatWrapper: { flex: 1, alignItems: 'center' },
  inlineStatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inlineIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
    tintColor: Theme.colors.blue,
  },
  inlineLabel: { fontSize: 11, color: Theme.colors.blue },
  inlineValue: { fontSize: 16, fontWeight: '900', color: Theme.colors.success },
  statVerticalDivider: {
    width: 1,
    backgroundColor: Theme.colors.sky,
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },

  bigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
  bigCardLeft: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
  },
  bigCardIcon: { width: 34, height: 34, tintColor: Theme.colors.buttonPrimary },
  bigCardRight: { marginLeft: 12, flex: 1 },
  bigCardTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  bigCardValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    color: Theme.colors.success,
  },
  bigCardSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Theme.colors.sky },
  dividerText: {
    marginHorizontal: 7,
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.black,
  },
  sectionSpace: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 18 },

  blockLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },

  blockValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.success,
    marginTop: 2,
  },

  cardSeparator: {
    width: 1,
    backgroundColor: Theme.colors.sky,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },

  filterLabel: { fontSize: 12, fontWeight: '600', color: Theme.colors.blue },
  smallFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.success,
    margin: 6,
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: Theme.colors.white,
  },
  filterText: { fontSize: 13, marginRight: 3, color: Theme.colors.success },
  filterIcon: {
    width: 18,
    height: 18,
    marginRight: 2,
    tintColor: Theme.colors.success,
  },
  dotsOverlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  dotsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  dotsMenu: {
    position: 'absolute',
    top: 60,
    right: 13,
    width: 137,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  menuItemRow: { flexDirection: 'row', alignItems: 'center' },
  menuItemIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 10,
  },
  dotsMenuItem: { paddingVertical: 5, paddingHorizontal: 9 },
  dotsMenuText: { fontSize: 16, color: Theme.colors.textPrimary },
  menuDivider: {
    height: 1,
    backgroundColor: Theme.colors.buttonPrimary,
    marginVertical: 6,
    marginHorizontal: 8,
  },
});
