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

import Theme from '../theme/Theme';
import Header from '../components/common/Header';
import LoadingOverlay from '../components/loading/LoadingOverlay';
import { getPoultryFarmSummary } from '../services/BusinessUnit';
import { useBusinessUnit } from '../context/BusinessContext';
import { CustomConstants } from '../constants/CustomConstants';

const DashboardDetailScreen = ({ navigation, route }: any) => {
  const { businessUnitId } = useBusinessUnit();
  const { farmName } = route.params || {};
  const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
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
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [businessUnitId, fromDate, toDate]);

  /** InlineStat for simple numbers */
  const InlineStat = ({ icon, label, value, total }: any) => {
    return (
      <View style={styles.inlineStatWrapper}>
        <View style={styles.inlineStatTopRow}>
          {icon && <Image source={icon} style={styles.inlineIcon} />}
          <Text style={styles.inlineLabel}>{label}</Text>
        </View>

        {/* Show as 1 / 35 style */}
        <Text style={styles.inlineValue}>
          {total ? `${value} / ${total}` : value ?? 0}
        </Text>
      </View>
    );
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

  const EggsProductionCard = ({ eggs, productionPercentage }: any) => {
    const isZero = productionPercentage === 0 || !productionPercentage;

    const progress = isZero
      ? 1
      : Math.min(Math.max(productionPercentage, 0), 100) / 100;

    const circleColor = Theme.colors.blue; // 🔵 blue graph

    return (
      <View style={styles.eggsProductionCard}>
        {/* LEFT : GRAPH WITH TEXT INSIDE */}
        <View style={styles.leftBlock}>
          <View style={styles.circleWrapper}>
            <Circle
              size={95}
              progress={progress}
              thickness={6}
              showsText={false}
              color={circleColor}
              borderWidth={0}
            />

            {/* 🔥 TEXT INSIDE CIRCLE */}
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>Production</Text>
              <Text style={styles.productionValue}>
                {productionPercentage ?? 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* CENTER : EGG ICON */}
        {/* CENTER : SEPARATOR + ICON */}
        <View style={styles.centerWrapper}>
          <View style={styles.verticalSeparator} />

          <View style={styles.centerBlock}>
            <Image source={Theme.icons.dash1} style={styles.eggIcon} />
          </View>
        </View>

        {/* RIGHT : TOTAL EGGS */}
        <View style={styles.rightBlock}>
          <Text style={styles.eggsLabel}>Total Eggs</Text>
          <Text style={styles.eggsValue}>{eggs ?? 0}</Text>
        </View>
      </View>
    );
  };

  const ProgressCircleCard = ({
    title,
    value,
    total,
    icon,
    innerLabel,
    innerValue,
  }: any) => {
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
              color={Theme.colors.success} // green
              borderWidth={0}
            />
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>{innerLabel}</Text>
              <Text style={styles.productionValue}>{innerValue ?? 0}</Text>
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

  const BigCard = ({ title, value, total, icon }: any) => {
    const progress = total ? value / total : 0;

    return (
      <View style={styles.bigCard}>
        <View style={styles.bigCardLeft}>
          {total ? (
            <Circle
              size={50}
              progress={progress}
              showsText
              thickness={5}
              color={Theme.colors.success}
              borderWidth={0}
              formatText={() => `${Math.round(progress * 100)}%`}
            />
          ) : (
            <Image source={icon} style={styles.bigCardIcon} />
          )}
        </View>
        <View style={styles.bigCardRight}>
          <Text style={styles.bigCardTitle}>{title}</Text>
          <Text style={styles.bigCardValue}>{value ?? 0}</Text>
          {total && (
            <Text style={styles.bigCardSub}>
              {value} / {total}
            </Text>
          )}
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
                onPress={() => setIsDotsMenuVisible(false)}
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
<View style={styles.topRow}>
  {/* From Date */}
   <View style={[styles.smallFilter, { marginRight: 9 }]}>
    <Text style={styles.filterLabel}>From</Text>
    <TouchableOpacity
      style={styles.smallFilterInputBig} // make input slightly bigger
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

  {/* To Date */}
  <View style={styles.smallFilter}>
    <Text style={styles.filterLabel}>To</Text>
    <TouchableOpacity
      style={styles.smallFilterInputBig} // make input slightly bigger
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

  {/* Reset Filters: show only if any date is selected */}
  {(fromDate || toDate) && (
    <TouchableOpacity
      style={styles.resetButton}
      onPress={() => {
        setFromDate(null);
        setToDate(null);
        fetchData(); // refresh API call
      }}
    >
      <Text style={styles.resetButtonText}>Reset Filters</Text>
    </TouchableOpacity>
  )}
</View>


        {data && (
          <View style={{ padding: 12 }}>
            <SectionDivider title="Bird Stats" />
            <InlineRowWithDividers
              stats={[
                {
                  icon: Theme.icons.hen,
                  label: 'Total Birds',
                  value: data.totalBirds, // numerator
                  total: data.totalRemainingBirds, // denominator
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
              total={data.totalVaccineSchedule} // Max for % calculation
              innerLabel="Schedule" // Graph label
              innerValue={data.totalVaccineSchedule} // Graph value
              icon={Theme.icons.health} // Vaccine icon
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
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
  filterText: { fontSize: 13,  marginRight:3,color: Theme.colors.success },
  filterIcon: { width: 18, height: 18, marginRight:2, tintColor: Theme.colors.success },
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
    width: 20,
    height: 20,
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
