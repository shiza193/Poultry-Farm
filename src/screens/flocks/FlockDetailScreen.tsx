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
import { useEffect } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Circle } from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { useRoute } from '@react-navigation/native';

import Theme from '../../theme/Theme';
import BackArrow from '../../components/common/ScreenHeaderWithBack';
import ExpandableCard from '../../components/common/ExpandableCard';
import {
  getEggProductions,
  getFeedConsumptions,
  getFlockDetail,
  getFlockHealthRecord,
  getFlockSummary,
  getHospitalities,
  getVaccinationSchedules,
  getFlockTypes,
  updateFlockDetail,
  getFeeds,
  addFlockHealthRecord,
  addHospitality,
} from '../../services/FlockService';
import LoadingOverlay from '../../components/loading/LoadingOverlay';
import {
  addVaccinationSchedule,
  getSuppliers,
  getVaccines,
} from '../../services/VaccinationService';
import { showErrorToast, showSuccessToast } from '../../utils/AppToast';
import AddModal from '../../components/customPopups/AddModal';
import {
  addEggProduction,
  getUnitsByProductType,
} from '../../services/EggsService';
import {
  addFeedConsumption,
  AddFeedConsumptionPayload,
} from '../../services/FeedService';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';
import { useBusinessUnit } from '../../context/BusinessContext';

const FlockDetailScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const flock = route.params?.flock;
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [hospitalityData, setHospitalityData] = useState<any[]>([]);
  const [flockTypes, setFlockTypes] = useState<any[]>([]);
  const [suppliers, setsuppliers] = useState<any[]>([]);
  const [openEggModal, setOpenEggModal] = useState(false);
  // For unit dropdown inside modal
  const [masterData, setMasterData] = useState({
    units: [] as { label: string; value: number }[],
  });
  const [openFeedModal, setOpenFeedModal] = useState(false);
  const [feedMasterData, setFeedMasterData] = useState({
    feeds: [] as { label: string; value: number }[],
  });
  const [openVaccinationModal, setOpenVaccinationModal] = useState(false);
  const [vaccineItems, setVaccineItems] = useState<
    { label: string; value: number }[]
  >([]);
  const [openMortalityModal, setOpenMortalityModal] = useState(false);
  const [flockData, setFlockData] = useState<any>(null);
  const [eggProductionData, setEggProductionData] = useState<any[]>([]);
  const [feedConsumptionData, setFeedConsumptionData] = useState<any[]>([]);
  const [vaccinationData, setVaccinationData] = useState<any[]>([]);
  const [mortalityData, setMortalityData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modals, setModals] = useState({
    mortality: false,
    hospitality: false,
  });
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
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
      width: 150,
      showDots: true,
    },
    { key: 'unit', title: 'UNIT', width: 80 },
    { key: 'date', title: 'DATE', width: 100 },
    { key: 'totalEggs', title: 'TOTAL', width: 90 },
    { key: 'intactEggs', title: 'INTACT', width: 90 },
    { key: 'brokenEggs', title: 'BROKEN', width: 90 },
  ];

  const feedColumns: TableColumn[] = [
    {
      key: 'ref',
      title: 'REF',
      width: 150,
      showDots: true,
    },
    { key: 'date', title: 'Date', width: 100 },
    { key: 'feed', title: 'Feed Name', width: 120 },
    { key: 'totalQuantity', title: 'Total Bag', width: 80 },
    { key: 'quantity', title: 'Bag', width: 80 },
  ];

  const vaccinationColumns: TableColumn[] = [
    {
      key: 'ref',
      title: 'REF',
      width: 180,
      showDots: true,
    },
    { key: 'vaccinationName', title: 'Vaccine Name', width: 150 },
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
    },
    {
      key: 'mortalityQuantity',
      title: 'Mortality Quantity',
      width: 130,
    },
  ];

  const flockId = route.params?.flockId || route.params?.flock?.id;

  useEffect(() => {
    fetchInitialData();
  }, [flockId, fromDate, toDate]);

  useEffect(() => {
    if (!flockData?.businessUnitId) return;

    fetchSuppliers();
    fetchFlockTypes();
    fetchUnits();
    fetchVaccines();
    fetchFeeds();
  }, [flockData?.businessUnitId]);

  useEffect(() => {
    if (!flockId) return;

    switch (activeTab) {
      case 'Egg Production':
        fetchEggProduction();
        break;

      case 'Feed Consumption':
        fetchFeedConsumption();
        break;

      case 'Vaccination Schedule':
        fetchVaccinationSchedules();
        break;

      case 'Mortality':
        fetchMortalityRecords();
        break;

      case 'Hospitality':
        fetchHospitality();
        break;
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    if (!flockId) return;

    try {
      setLoadingSummary(true);

      //  1. Sirf ek baar call
      const flockDetail = await getFlockDetail(flockId);

      //  2. Summary call
      const summaryResponse = await getFlockSummary(
        flockDetail.businessUnitId,
        fromDate?.toISOString(),
        toDate?.toISOString(),
        flockId,
      );

      //  3. Pehle summary set karo
      setSummaryData(summaryResponse.data || summaryResponse);

      //  4. Phir flock info set karo
      setFlockData(flockDetail);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchEggProduction = async () => {
    if (!flockId) return;
    setLoading(true);
    try {
      const eggData = await getEggProductions(flockId);
      // Map API response to table format
      const formattedData = eggData.map((item: any) => ({
        ref: item.ref,
        unit: item.unit,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        totalEggs: item.totalEggs,
        intactEggs: item.totalEggs - item.brokenEggs, // calculate intact
        brokenEggs: item.brokenEggs,
        raw: item,
      }));
      setEggProductionData(formattedData);
    } catch (error) {
      console.error('Error fetching egg production:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedConsumption = async () => {
    if (!flockId) return;
    setLoading(true);
    try {
      const feedData = await getFeedConsumptions(flockId);
      // Map API response to your table format if needed
      const formattedFeedData = feedData.map((item: any) => ({
        ref: item.ref,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        feed: item.feed,
        totalQuantity: item.totalQuantity,
        quantity: item.quantity,
        raw: item,
      }));
      setFeedConsumptionData(formattedFeedData);
    } catch (error) {
      console.error('Error fetching feed consumption:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinationSchedules = async () => {
    if (!flockId) return;
    setLoading(true);

    try {
      const vaccineData = await getVaccinationSchedules(flockId);

      const formattedVaccineData = vaccineData.map((item: any) => ({
        ref: item.ref,
        vaccinationName: item.vaccine,
        scheduledDate: new Date(item.scheduledDate).toLocaleDateString('en-GB'),
        quantity: item.quantity,
        done: item.isVaccinated ? 'Yes' : 'No',
        raw: item, // edit/delete ke liye
      }));

      setVaccinationData(formattedVaccineData);
    } catch (error) {
      console.error('Error fetching vaccination schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMortalityRecords = async () => {
    if (!flockId) return;
    setLoading(true);

    try {
      const healthResponse = await getFlockHealthRecord(flockId);

      // records array is inside healthResponse.data
      const records = healthResponse?.data || [];

      const formattedMortalityData = records.map((item: any) => ({
        expireDate: new Date(item.date).toLocaleDateString('en-GB'),
        mortalityQuantity: item.quantity,
        raw: item,
      }));

      setMortalityData(formattedMortalityData);
    } catch (error) {
      console.error('Error fetching mortality records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitality = async () => {
    if (!flockId) return;
    setLoading(true);

    try {
      const hospData = await getHospitalities(flockId);

      const formattedHospitalityData = hospData.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-GB'),
        quantity: item.quantity,
        avgWeight: item.averageWeight,
        symptoms: item.symptoms,
        diagnosis: item.diagnosis,
        medication: item.medication,
        dosage: item.dosage,
        treatmentDays: item.treatmentDays,
        vetName: item.vetName,
        raw: item,
      }));

      setHospitalityData(formattedHospitalityData);
    } catch (error) {
      console.error('Error fetching hospitality:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlockTypes = async () => {
    try {
      const types = await getFlockTypes();
      setFlockTypes(types);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!flockData?.businessUnitId) return;

      const supplierList = await getSuppliers(flockData.businessUnitId);

      setsuppliers(supplierList || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleAddEditEggProduction = async (data: any) => {
    if (!flockId) return;
    setLoading(true);

    try {
      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);

      const payload = {
        flockId: data.flockId, // this will come from modal initialData
        businessUnitId: flockData?.businessUnitId,
        date: data.date?.toISOString().split('T')[0],
        fertileEggs: intact,
        brokenEggs: broken,
        totalEggs: intact + broken,
        unitId: data.unitId,
        varietyId: null,
        typeId: null,
      };

      // Call API to add egg production
      await addEggProduction(payload);
      showSuccessToast('Egg production added successfully');

      // Refresh table
      fetchEggProduction();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedConsumption = async (data: any) => {
    if (!flockData?.businessUnitId) return;

    try {
      setLoading(true);

      const payload: AddFeedConsumptionPayload = {
        businessUnitId: flockData.businessUnitId,
        flockId: flockId, // ensure this is a GUID
        feedId: Number(data.feedId),
        quantity: Number(data.bag),
        price: Number(data.bag),
        date: data.date,
      };

      await addFeedConsumption(payload);
      showSuccessToast('Feed consumption added successfully');
      setOpenFeedModal(false);
      fetchFeedConsumption(); // refresh table
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Failed to add feed consumption';
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVaccination = async (data: any) => {
    if (!flockData?.businessUnitId) return;

    try {
      const payload = {
        businessUnitId: flockData.businessUnitId,
        flockId, // current flock
        vaccineId: data.vaccineId,
        scheduledDate: data.scheduledDate?.toISOString().split('T')[0] || null,
        quantity: Number(data.quantity),
      };

      const res = await addVaccinationSchedule(payload);
      if (res.status === 'Success') {
        showSuccessToast('Vaccination schedule added successfully');
        fetchVaccinationSchedules(); // refresh table
      } else {
        showErrorToast(res.message || 'Failed to add vaccination schedule');
      }
    } catch (err: any) {
      showErrorToast(
        err?.response?.data?.message || err.message || 'Something went wrong',
      );
    }
  };

  const handleMortality = async (data: any) => {
    if (!flockId) return;

    try {
      setLoading(true);

      const payload = {
        flockId: flockId,
        quantity: Number(data.quantity),
        date:
          data.expireDate?.toISOString().split('T')[0] ||
          new Date().toISOString().split('T')[0],
        flockHealthStatusId: 1,
      };

      await addFlockHealthRecord(payload);

      showSuccessToast('Mortality added successfully');

      setOpenMortalityModal(false);
      fetchMortalityRecords(); // refresh table
    } catch (err) {
      console.error('Mortality error:', err);
      showErrorToast('Failed to add mortality');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitality = async (data: any) => {
    if (!flockId) return;

    const payload = {
      flockId: flockId,
      date:
        data.hospitalityDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0],
      quantity: Number(data.quantity),
      averageWeight: Number(data.averageWeight),
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      medication: data.medication,
      dosage: data.dosage,
      treatmentDays: Number(data.treatmentDays),
      vetName: data.vetName,
      remarks: data.remarks || null,
      businessUnitId: businessUnitId!,
    };

    try {
      const result = await addHospitality(payload);

      normalizeDataFormat(result, 'object', 'Hospitality');

      showSuccessToast('Hospitality added successfully');

      setModals(prev => ({ ...prev, hospitality: false }));
      fetchHospitality();
    } catch (err) {
      console.log('Hospitality error:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      const units = await getUnitsByProductType(1);
      const dropdownData = units.map((u: any) => ({
        label: u.value,
        value: u.unitId,
      }));
      setMasterData(prev => ({ ...prev, units: dropdownData }));
    } catch (error) {
      console.error('Failed to fetch units', error);
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await getFeeds(); // API returns array of feeds
      if (!res || res.length === 0) return;

      const mappedFeeds = res.map((f: any) => ({
        label: f.name ?? f.feed ?? 'Unknown Feed', // display name
        value: f.feedId, // actual id
      }));

      setFeedMasterData({ feeds: mappedFeeds });
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const data = await getVaccines();

      console.log('Vaccines:', data);

      setVaccineItems(data || []);
    } catch (err) {
      console.error('Failed to fetch vaccines', err);
    }
  };

  const openFeedModalHandler = async () => {
    if (feedMasterData.feeds.length === 0) {
      await fetchFeeds(); // wait until feeds are loaded
    }
    setOpenFeedModal(true);
  };

  const birdStats = summaryData
    ? [
        {
          icon: Theme.icons.hen,
          label: 'Total Birds',
          value: summaryData.totalBirds,
          total: summaryData.totalRemainingBirds,
        },
        {
          icon: Theme.icons.motality,
          label: 'Mortality',
          value: summaryData.totalMortalityBirds,
        },
        {
          icon: Theme.icons.hospital,
          label: 'Hospitalized',
          value: summaryData.totalHospitalizedBirds,
        },
      ]
    : [];
  const saleStats = summaryData
    ? [
        {
          icon: Theme.icons.trend,
          label: 'Bird Sales',
          value: summaryData.totalBirdsSale,
        },
        {
          icon: Theme.icons.trend,
          label: 'Egg Sales',
          value: summaryData.totalEggSale,
        },
        {
          icon: Theme.icons.trend,
          label: 'Other Sales',
          value: summaryData.totalOtherSale,
        },
      ]
    : [];
  const feedStats = summaryData
    ? [
        {
          icon: Theme.icons.game,
          label: 'Available',
          value: summaryData.totalAvailableFeed,
        },
        {
          icon: Theme.icons.game,
          label: 'Purchased',
          value: summaryData.totalPurchasedFeed,
        },
        {
          icon: Theme.icons.game,
          label: 'Consumed',
          value: summaryData.totalFeedConsumed,
        },
      ]
    : [];
  const vaccineStats = summaryData
    ? [
        {
          icon: Theme.icons.health,
          label: 'Schedule',
          value: summaryData.totalVaccineSchedule,
        },
        {
          icon: Theme.icons.health,
          label: 'Available',
          value: summaryData.totalAvailableVaccine,
        },
        {
          icon: Theme.icons.health,
          label: 'Purchased',
          value: summaryData.totalPurchasedVaccine,
        },
      ]
    : [];

  const InlineStat = ({ icon, label, value, total }: any) => {
    const isTotalBirds = label === 'Total Birds';
    return (
      <View style={styles.inlineStatWrapper}>
        <View style={styles.titleRow}>
          {icon && <Image source={icon} style={styles.inlineIcon} />}
          <Text style={styles.inlineLabel}>{label}</Text>
        </View>

        {isTotalBirds ? (
          <Text style={[styles.inlineValue, { fontSize: 16 }]}>
            {total ?? 0}/{value ?? 0}
          </Text>
        ) : (
          <Text style={styles.inlineValue}>
            {value}
            {total ? ` / ${total}` : ''}
          </Text>
        )}
      </View>
    );
  };

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
    const isAboveHundred = productionPercentage > 100;

    // Graph progress (0–1)
    const progress =
      productionPercentage && productionPercentage > 0
        ? Math.min(productionPercentage / 100, 1)
        : 0;

    // Graph color
    const circleColor = isAboveHundred
      ? Theme.colors.lightblue
      : Theme.colors.success;
    return (
      <View style={styles.eggsProductionCard}>
        {/* LEFT : GRAPH + LEGENDS */}
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

            {/* CENTER TEXT */}
            <View style={styles.circleCenterContent}>
              <Text style={styles.productionLabel}>Production</Text>
              <Text style={[styles.productionValue, { color: circleColor }]}>
                {productionPercentage ?? 0}%
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* > 100 */}
            <View style={[styles.statusRow, { marginRight: 14 }]}>
              <View
                style={[
                  styles.statusBox,
                  { backgroundColor: Theme.colors.lightblue },
                ]}
              />
              <Text style={styles.statusText}>&gt; 100%</Text>
            </View>

            {/* < 100 */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBox,
                  { backgroundColor: Theme.colors.success },
                ]}
              />
              <Text style={styles.statusText}>&lt; 100%</Text>
            </View>
          </View>
        </View>

        {/* CENTER ICON */}
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

  const onTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow
        title={flock ? `${flock.ref} (${flock.breed})` : 'Flock Detail'}
        showBack
      />

      <LoadingOverlay
        visible={loadingSummary || loading}
        text="Fetching data..."
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
              <Text style={styles.resetInlineText}>Reset Filter</Text>
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

        <EggsProductionCard
          eggs={summaryData?.totalEggsProduced ?? 0}
          productionPercentage={
            summaryData?.totalEggsProductionsPercentage ?? 0
          }
        />
        {flockData && (
          <ExpandableCard
            title="Flock Information"
            customLabels={{
              flockTypeId: 'Flock Type',
              supplierId: 'Supplier',
            }}
            flockTypes={flockTypes}
            suppliers={suppliers}
            initialData={{
              quantity: flockData.quantity?.toString() ?? '',
              breed: flockData.breed ?? '',
              flockTypeId: flockData.flockTypeId ?? null,
              arrivalDate: flockData.arrivalDate ?? '',
              gender: flockData.isHen ? 'Hen' : 'Rooster',
              supplierId: flockData.supplierId ?? null,
              averageWeight: flockData.weight?.toString() ?? '',
              price: flockData.price?.toString() ?? '',
              dateOfBirth: flockData.dateOfBirth ?? '',
            }}
            onSave={async formData => {
              try {
                setLoading(true);

                const payload = {
                  businessUnitId: flockData?.businessUnitId,
                  breed: formData.breed,
                  quantity: Number(formData.quantity),
                  price: Number(formData.price),
                  weight: Number(formData.averageWeight),
                  arrivalDate: formData.arrivalDate
                    ? new Date(formData.arrivalDate).toISOString()
                    : null,
                  dateOfBirth: formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toISOString()
                    : null,
                  isHen: formData.gender === 'Hen',
                  flockTypeId: formData.flockTypeId
                    ? String(formData.flockTypeId)
                    : null,
                  supplierId: formData.supplierId
                    ? String(formData.supplierId)
                    : null,
                };

                await updateFlockDetail(flockId, payload);
                showSuccessToast('Flock Information Updated successfully');
                console.log('flockData supplierId:', flockData?.supplierId);
                // Refresh data after update
                const updatedFlock = await getFlockDetail(flockId);
                console.log('flockData:', flockData);

                setFlockData(updatedFlock);
              } catch (error) {
                console.error(error);
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

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
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 70 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Egg Production</Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setOpenEggModal(true)}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={eggProductionColumns}
              data={eggProductionData}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Edit', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text style={{ fontWeight: '600', marginLeft: 10 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text
                      style={{
                        color: 'red',
                        fontWeight: '600',
                        marginLeft: 10,
                      }}
                    >
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
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 70 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Feed Consumption</Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={openFeedModalHandler}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

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
                    <Text style={{ fontWeight: '600', marginLeft: 10 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Feed', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text
                      style={{
                        color: 'red',
                        fontWeight: '600',
                        marginLeft: 10,
                      }}
                    >
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
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 70 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Vaccination Schedule</Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setOpenVaccinationModal(true)}
              >
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
                    <Text style={{ fontWeight: '600', marginLeft: 10 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Vaccination', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text
                      style={{
                        color: 'red',
                        fontWeight: '600',
                        marginLeft: 10,
                      }}
                    >
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
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 70 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Mortality Records</Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={() =>
                  setModals(prev => ({ ...prev, mortality: true }))
                }
              >
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
                    <Text style={{ fontWeight: '600', marginLeft: 10 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.menuSeparator} />

                  <TouchableOpacity
                    onPress={() => {
                      console.log('Delete Mortality', row.raw);
                      closeMenu();
                    }}
                    style={{ paddingVertical: 10 }}
                  >
                    <Text
                      style={{
                        color: 'red',
                        fontWeight: '600',
                        marginLeft: 10,
                      }}
                    >
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
          <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 70 }}>
            <View style={styles.eggHeaderRow}>
              <Text style={styles.eggHeaderTitle}>Hospitality</Text>
              <TouchableOpacity
                style={styles.newButton}
                onPress={() =>
                  setModals(prev => ({ ...prev, hospitality: true }))
                }
              >
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
                { key: 'treatmentDays', title: 'Treatment Days', width: 120 },
                { key: 'vetName', title: 'Vet Name', width: 120 },
              ]}
              data={hospitalityData}
            />
          </View>
        )}

        <AddModal
          visible={openEggModal}
          title="Add Egg Production"
          type="Egg production"
          unitItems={masterData.units} // from fetchUnits
          flockItems={[]} // empty since we hide flock dropdown
          hideFlockField={true} // hide the flock selector
          initialData={{ flockId }} // pass the current flockId
          isEdit={false} // only Add for now
          onClose={() => setOpenEggModal(false)}
          onSave={async data => {
            const payload = { ...data, flockId }; // ensure flockId is included
            await handleAddEditEggProduction(payload);
            setOpenEggModal(false);
          }}
        />

        <AddModal
          visible={openFeedModal}
          title="Add Feed Consumption"
          type="Feed Consumption"
          flockItems={[{ label: flock?.ref, value: flockId }]} // only current flock
          feedItems={feedMasterData.feeds}
          hideFlockField={true} // hide flock selector
          initialData={{ flockId }} // pass current flockId
          isEdit={false}
          onClose={() => setOpenFeedModal(false)}
          onSave={handleAddFeedConsumption}
        />

        <AddModal
          visible={openVaccinationModal}
          title="Add Vaccination Schedule"
          type="vaccination Schedule"
          vaccineItems={vaccineItems}
          flockItems={[{ label: flock?.ref, value: flockId }]} // only current flock
          hideFlockField={true} // hide flock dropdown
          initialData={{ flockId }}
          isEdit={false}
          onClose={() => setOpenVaccinationModal(false)}
          onSave={handleAddVaccination}
        />

        <ItemEntryModal
          visible={modals.mortality}
          onClose={() => setModals(prev => ({ ...prev, mortality: false }))}
          type="mortality"
          onSave={handleMortality}
        />

        <ItemEntryModal
          visible={modals.hospitality}
          onClose={() => setModals(prev => ({ ...prev, hospitality: false }))}
          type="hospitality"
          onSave={handleHospitality}
        />
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  menuSeparator: {
    height: 2,
    backgroundColor: Theme.colors.SeparatorColor,
    marginHorizontal: 8,
  },
  statusBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.black,
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
    paddingLeft: 10, // keep left padding
    paddingRight: 90, // add extra space on the right
    marginVertical: 10,
  },

  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetInlineBtn: {
    paddingHorizontal: 30,
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
    fontSize: 13,
    color: Theme.colors.error,
    fontWeight: '700',
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
