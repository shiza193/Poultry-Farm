import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Circle } from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { useRoute } from '@react-navigation/native';

import Theme from '../../theme/Theme';
import BackArrow from '../../components/common/ScreenHeaderWithBack';
import ExpandableCard from '../../components/common/ExpandableCard';

const FlockDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const flock = route.params?.flock;

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [eggProductionData, setEggProductionData] = useState([
    {
      ref: 1,
      unit: 'Unit 1',
      date: '01/02/2026',
      totalEggs: 200,
      intactEggs: 190,
      brokenEggs: 10,
    },
    {
      ref: 2,
      unit: 'Unit 2',
      date: '01/02/2026',
      totalEggs: 150,
      intactEggs: 145,
      brokenEggs: 5,
    },
  ]);

  const [vaccinationData, setVaccinationData] = useState([
    {
      ref: 1,
      vaccinationName: 'Newcastle',
      scheduledDate: '08/02/2026',
      quantity: 20,
      done: 'No',
      raw: {},
    },
    {
      ref: 2,
      vaccinationName: 'IBD',
      scheduledDate: '10/02/2026',
      quantity: 20,
      done: 'Yes',
      raw: {},
    },
  ]);
  const [mortalityData, setMortalityData] = useState([
    {
      expireDate: '01/02/2026',
      mortalityQuantity: 2,
      raw: {},
    },
    {
      expireDate: '02/02/2026',
      mortalityQuantity: 3,
      raw: {},
    },
  ]);
  const [feedConsumptionData, setFeedConsumptionData] = useState([
    {
      ref: 1,
      date: '01/02/2026',
      feedName: 'Layer Mash',
      totalBag: 10,
      raw: {},
    },
    {
      ref: 2,
      date: '02/02/2026',
      feedName: 'Grower Mash',
      totalBag: 8,
      raw: {},
    },
  ]);

  const [feedCardOpen, setFeedCardOpen] = useState(false);

  const toggleFeedCard = () => {
    setFeedCardOpen(prev => !prev);
  };

  const [activeTab, setActiveTab] = useState('Egg Production');
  const tabs = [
    'Egg Production',
    'Feed Consumption',
    'Vaccination Schedule',
    'Mortality',
    'Hospitality',
  ];
  const eggProductionColumns: TableColumn[] = [
    {
      key: 'ref',
      title: 'REF',
      width: 50,
      showDots: true,
      onDotsPress: row => {
        console.log('DOTS PRESSED', row.raw);
      },
    },
    { key: 'unit', title: 'UNIT', width: 80 },
    { key: 'date', title: 'DATE', width: 90 },
    { key: 'totalEggs', title: 'TOTAL EGGS', width: 90 },
    { key: 'intactEggs', title: 'INTACT EGGS', width: 90 },
    { key: 'brokenEggs', title: 'BROKEN EGGS', width: 90 },
  ];

  const feedColumns: TableColumn[] = [
    {
      key: 'ref',
      title: 'REF',
      width: 50,
      showDots: true,
      onDotsPress: row => {
        console.log('Feed Dots Pressed', row.raw);
      },
    },
    { key: 'date', title: 'Date', width: 90 },
    { key: 'feedName', title: 'Feed Name', width: 120 },
    { key: 'totalBag', title: 'Total Bag', width: 80 },
    { key: 'Bag', title: 'Bag', width: 80 },
  ];

  const vaccinationColumns: TableColumn[] = [
    {
      key: 'ref',
      title: 'REF',
      width: 50,
      showDots: true,
      onDotsPress: row => {
        console.log('Vaccination Dots', row.raw);
      },
    },
    { key: 'vaccinationName', title: 'Vaccination Name', width: 150 },
    { key: 'scheduledDate', title: 'Scheduled Date', width: 120 },
    { key: 'quantity', title: 'Quantity', width: 80 },
    { key: 'done', title: 'Done', width: 80 },
  ];

  const mortalityColumns: TableColumn[] = [
    {
      key: 'expireDate',
      title: 'Expire Date',
      width: 140,
      showDots: true,
      onDotsPress: row => {
        console.log('Mortality Dots', row.raw);
      },
    },
    {
      key: 'mortalityQuantity',
      title: 'Mortality Quantity',
      width: 130,
    },
  ];

  const initialFlockData = {
    quantity: '200',
    flockType: 'Layer',
    arrivalDate: '01/02/2026',
    gender: 'Mixed',
    supplier: 'Local Farm',
    averageWeight: '2.3 kg',
    price: '$5 per bird',
    dateOfBirth: '15/01/2026',
  };

  const birdStats = [
    { icon: Theme.icons.hen, label: 'Total Birds', value: 20, total: 25 },
    { icon: Theme.icons.motality, label: 'Mortality', value: 5 },
    { icon: Theme.icons.hospital, label: 'Hospitalized', value: 3 },
  ];

  const saleStats = [
    { icon: Theme.icons.trend, label: 'Bird Sales', value: 20 },
    { icon: Theme.icons.trend, label: 'Egg Sales', value: 500 },
    { icon: Theme.icons.trend, label: 'Other Sales', value: 50 },
  ];

  const feedStats = [
    { icon: Theme.icons.game, label: 'Available', value: 4 },
    { icon: Theme.icons.game, label: 'Purchased', value: 9 },
    { icon: Theme.icons.game, label: 'Consumed', value: 5 },
  ];

  const vaccineStats = [
    { icon: Theme.icons.health, label: 'Schedule', value: 6 },
    { icon: Theme.icons.health, label: 'Available', value: 43 },
    { icon: Theme.icons.health, label: 'Purchased', value: 49 },
  ];

  const tableData = eggProductionData.map(item => ({
    ref: item.ref,
    unit: item.unit,
    date: item.date,
    totalEggs: item.totalEggs,
    intactEggs: item.intactEggs,
    brokenEggs: item.brokenEggs,
    raw: item, // optional for actions later
  }));

  const InlineStat = ({ icon, label, value, total }: any) => (
    <View style={styles.inlineStatWrapper}>
      <View style={styles.titleRow}>
        {icon && <Image source={icon} style={styles.inlineIcon} />}
        <Text style={styles.inlineLabel}>{label}</Text>
      </View>
      <Text style={styles.inlineValue}>
        {value}
        {total ? ` / ${total}` : ''}
      </Text>
    </View>
  );

  const InlineRow = ({ stats }: any) => (
    <View style={styles.inlineRow}>
      {stats.map((stat: any, idx: number) => (
        <React.Fragment key={idx}>
          <InlineStat {...stat} />
          {idx < stats.length - 1 && (
            <View style={styles.statVerticalDivider} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const SectionDivider = ({ title }: { title: string }) => (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  );

  const EggsProductionCard = ({ eggs, productionPercentage }: any) => {
    const progress = productionPercentage
      ? Math.min(productionPercentage / 100, 1)
      : 0;
    const circleColor =
      productionPercentage > 100
        ? Theme.colors.lightblue
        : Theme.colors.success;

    return (
      <View style={styles.eggsProductionCard}>
        <View style={styles.leftBlock}>
          <View style={styles.circleWrapper}>
            <Circle
              size={95}
              progress={progress}
              thickness={6}
              showsText={false}
              color={circleColor}
              unfilledColor={Theme.colors.grey}
              borderWidth={0}
            />
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>Production</Text>
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

        <View style={styles.rightBlock}>
          <Text style={styles.eggsLabel}>Total Eggs</Text>
          <Text style={styles.eggsValue}>{eggs ?? 0}</Text>
        </View>
      </View>
    );
  };

  const onTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow
        title={flock ? `${flock.ref} (${flock.breed})` : 'Flock Detail'}
        showBack
      />

      <ScrollView style={{ padding: 11 }} keyboardShouldPersistTaps="handled">
        {/* Date Picker */}
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
        {showFromPicker && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              if (Platform.OS === 'android') setShowFromPicker(false);
              if (date) setFromDate(date);
            }}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              if (Platform.OS === 'android') setShowToPicker(false);
              if (date) setToDate(date);
            }}
          />
        )}

        <SectionDivider title="Bird Stats" />
        <InlineRow stats={birdStats} />

        <SectionDivider title="Sale Stats" />
        <InlineRow stats={saleStats} />

        <SectionDivider title="Feed Stats" />
        <InlineRow stats={feedStats} />

        <SectionDivider title="Vaccine Stats" />
        <InlineRow stats={vaccineStats} />

        <SectionDivider title="Flock Egg Production" />
        <EggsProductionCard eggs={1200} productionPercentage={95} />

        <ExpandableCard
          title="Flock Information"
          initialData={initialFlockData}
        />

        {/* Tabs */}
        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => onTabPress(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Egg Production Table */}
        {activeTab === 'Egg Production' && (
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 40 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Egg Production</Text>
              <TouchableOpacity style={styles.newButton}>
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={eggProductionColumns}
              data={tableData}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Edit', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ color: 'red', fontWeight: '600' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Feed Consumption Table */}
        {activeTab === 'Feed Consumption' && (
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 40 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Feed Consumption</Text>
              <TouchableOpacity style={styles.newButton}>
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            {/* Show DataCard automatically */}
            <DataCard
              columns={feedColumns}
              data={feedConsumptionData}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Edit Feed', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Feed', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ color: 'red', fontWeight: '600' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Vaccination Schedule Table */}
        {activeTab === 'Vaccination Schedule' && (
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 40 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Vaccination Schedule</Text>
              <TouchableOpacity style={styles.newButton}>
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={vaccinationColumns}
              data={vaccinationData}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Edit Vaccination', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Vaccination', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ color: 'red', fontWeight: '600' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Mortality Table */}
        {activeTab === 'Mortality' && (
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 40 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Mortality Records</Text>
              <TouchableOpacity style={styles.newButton}>
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={mortalityColumns}
              data={mortalityData}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Edit Mortality', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Mortality', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ color: 'red', fontWeight: '600' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Hospitality Table */}
        {activeTab === 'Hospitality' && (
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 40 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Hospitality</Text>
              <TouchableOpacity style={styles.newButton}>
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={[
                { key: 'date', title: 'Date', width: 90 },
                { key: 'quantity', title: 'Quantity', width: 80 },
                { key: 'avgWeight', title: 'Avg Weight', width: 90 },
                { key: 'symptoms', title: 'Symptoms', width: 120 },
                { key: 'diagnosis', title: 'Diagnosis', width: 120 },
                { key: 'medication', title: 'Medication', width: 100 },
                { key: 'dosage', title: 'Dosage', width: 80 },
                { key: 'treatmentDays', title: 'Treatment Days', width: 100 },
                { key: 'vetName', title: 'Vet Name', width: 120 },
              ]}
              data={[
                {
                  date: '01/02/2026',
                  quantity: 5,
                  avgWeight: '2.1kg',
                  symptoms: 'Cough',
                  diagnosis: 'Mild infection',
                  medication: 'Med A',
                  dosage: '2ml',
                  treatmentDays: 3,
                  vetName: 'Dr. Khan',
                },
                {
                  date: '02/02/2026',
                  quantity: 3,
                  avgWeight: '2.0kg',
                  symptoms: 'Weakness',
                  diagnosis: 'Vitamin deficiency',
                  medication: 'Med B',
                  dosage: '1ml',
                  treatmentDays: 5,
                  vetName: 'Dr. Ali',
                },
              ]}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FlockDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  inlineStatWrapper: { flex: 1, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  inlineIcon: {
    width: 18,
    height: 18,
    tintColor: Theme.colors.blue,
    marginRight: 4,
  },
  inlineLabel: { fontSize: 11, fontWeight: '600', color: Theme.colors.blue },
  inlineValue: { fontSize: 16, fontWeight: '900', color: Theme.colors.success },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statVerticalDivider: {
    width: 1,
    backgroundColor: Theme.colors.sky,
    marginHorizontal: 8,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Theme.colors.sky },
  dividerText: {
    marginHorizontal: 7,
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.black,
  },
  eggsProductionCard: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginVertical: 12,
    backgroundColor: Theme.colors.white,
    elevation: 3,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftBlock: { flex: 1.3, alignItems: 'center', justifyContent: 'center' },
  centerWrapper: { flexDirection: 'row', alignItems: 'center' },
  verticalSeparator: {
    width: 1,
    height: 60,
    backgroundColor: Theme.colors.sky,
    marginRight: 12,
  },
  centerBlock: { width: 70, alignItems: 'center', justifyContent: 'center' },
  rightBlock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleCenterContent: { position: 'absolute', alignItems: 'center' },
  productionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.black,
  },
  productionValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.blue,
    marginTop: 2,
  },
  eggsLabel: { fontSize: 13, fontWeight: '700', color: Theme.colors.black },
  eggsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.black,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 30, // keep left padding
    paddingRight: 90, // add extra space on the right
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

  eggIcon: { width: 50, height: 50, resizeMode: 'contain' },
  tabsContainer: {
    paddingHorizontal: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Theme.colors.feedGreen,
    marginRight: 8,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: Theme.colors.feedGreen },
  tabText: { fontSize: 16, fontWeight: '600', color: Theme.colors.feedGreen },
  activeTabText: { color: Theme.colors.white, fontWeight: '700' },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginRight: 6,
  },
  dateValue: { fontSize: 13, color: Theme.colors.success, fontWeight: '700' },
  dateDash: { fontSize: 18, marginHorizontal: 6, color: '#9CA3AF' },
  resetInlineText: {
    fontSize: 12,
    color: Theme.colors.error,
    fontWeight: '600',
  },
  eggHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  eggHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.black,
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.success,
    backgroundColor: Theme.colors.white,
    borderRadius: 5,
  },
  newButtonText: { color: Theme.colors.success, fontWeight: '700' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.sky,
    padding: 8,
  },
  tableHeaderCell: { fontWeight: '700', color: Theme.colors.black },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: Theme.colors.sky,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  floatingMenu: {
    position: 'absolute',
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    elevation: 6,
    width: 100,
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 8, paddingHorizontal: 9 },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  deleteText: { color: Theme.colors.error },
  menuDivider: { height: 1, backgroundColor: '#ccc' },
  floatingMenuInsideRow: {
    position: 'absolute',
    right: 10, // adjust as needed
    backgroundColor: Theme.colors.white,
    borderRadius: 10,
    padding: 6,
    elevation: 5,
    zIndex: 100,
  },
});
