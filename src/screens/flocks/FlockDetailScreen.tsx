import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Circle } from 'react-native-progress';
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
  deleteFlockHealthRecord,
} from '../../services/FlockService';
import {
  addVaccinationSchedule,
  deleteVaccinationSchedule,
  getSuppliers,
  getVaccines,
  updateVaccinationSchedule,
  updateVaccinationStatus,
} from '../../services/VaccinationService';
import {
  addEggProduction,
  deleteEggProduction,
  getUnitsByProductType,
  updateEggProduction,
} from '../../services/EggsService';
import {
  addFeedConsumption,
  AddFeedConsumptionPayload,
  deleteFeedRecordConsumption,
  updateFeedConsumption,
} from '../../services/FeedService';
import { showErrorToast, showSuccessToast } from '../../utils/AppToast';
import AddModal from '../../components/customPopups/AddModal';
import LoadingOverlay from '../../components/loading/LoadingOverlay';
import ItemEntryModal from '../../components/customPopups/ItemEntryModal';
import { normalizeDataFormat } from '../../utils/NormalizeDataFormat';
import { useBusinessUnit } from '../../context/BusinessContext';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';

type StatItem = {
  icon: any;
  label: string;
  value: number | string;
  total?: number;
};

type StatsState = {
  bird: StatItem[];
  sale: StatItem[];
  feed: StatItem[];
  vaccine: StatItem[];
};

const FlockDetailScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const route = useRoute<any>();
  const flock = route.params?.flock;
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [modals, setModals] = useState({
    egg: false,
    feed: false,
    vaccination: false,
    mortality: false,
    hospitality: false,
  }); // Controls visibility of various add/edit modals

  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [editType, setEditType] = useState<
    'egg' | 'feed' | 'vaccination' | 'mortality' | null
  >(null);

  const [masterData, setMasterData] = useState({
    units: [],
    feeds: [],
    vaccines: [],
    flockTypes: [],
    suppliers: [],
  }); // Stores master/dropdown data fetched from APIs
  const [stats, setStats] = useState<StatsState>({
    bird: [],
    sale: [],
    feed: [],
    vaccine: [],
  }); // Holds summary statistics for display in InlineRow components
  const [feedConsumptions, setFeedConsumptions] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    type?: 'egg' | 'feed' | 'vaccination' | 'mortality';
    recordId?: string;
  }>({ visible: false });

  const [flockData, setFlockData] = useState<any>(null);
  const [dataState, setDataState] = useState({
    eggProductionData: [] as any[],
    feedConsumptionData: [] as any[],
    vaccinationData: [] as any[],
    mortalityData: [] as any[],
    hospitalityData: [] as any[],
    flockTypes: [] as any[],
    suppliers: [] as any[],
    feedMasterData: { feeds: [] as any[] },
    vaccineItems: [] as any[],
  }); // Stores table/list data and related master info for rendering
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false); // Controls loading state specifically for summary fetch

  const [activeTab, setActiveTab] = useState('Egg Production'); // Tracks currently active tab in the bottom section

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
    {
      key: 'isVaccinated',
      title: 'Done',
      width: 80,
      render: (val: boolean, row: any) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={async () => {
            const newStatus = !row.isVaccinated;

            // Optimistic UI update
            setDataState(prev => ({
              ...prev,
              vaccinationData: prev.vaccinationData.map(item =>
                item.vaccinationScheduleId === row.vaccinationScheduleId
                  ? { ...item, isVaccinated: newStatus }
                  : item,
              ),
            }));

            const success = await updateVaccinationStatus(
              row.vaccinationScheduleId,
              newStatus,
            );

            if (success) {
              showSuccessToast(
                `Vaccination marked as ${
                  newStatus ? 'completed' : 'incomplete'
                }`,
              );
            } else {
              // rollback if API fails
              setDataState(prev => ({
                ...prev,
                vaccinationData: prev.vaccinationData.map(item =>
                  item.vaccinationScheduleId === row.vaccinationScheduleId
                    ? { ...item, isVaccinated: !newStatus }
                    : item,
                ),
              }));

              showErrorToast('Failed to update vaccination status');
            }
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: row.isVaccinated
                ? Theme.colors.success
                : Theme.colors.borderColor,
              backgroundColor: row.isVaccinated
                ? Theme.colors.success
                : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {row.isVaccinated && (
              <Text
                style={{
                  color: Theme.colors.white,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                ✔
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ),
    },
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
  }, [flockId, dateRange.from, dateRange.to]);

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
        dateRange.from?.toISOString(),
        dateRange.to?.toISOString(),
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
      const formattedData = eggData.map((item: any) => ({
        ref: item.ref,
        unit: item.unit,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        totalEggs: item.totalEggs,
        intactEggs: item.totalEggs - item.brokenEggs,
        brokenEggs: item.brokenEggs,
        raw: item,
      }));
      setDataState(prev => ({ ...prev, eggProductionData: formattedData }));
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
        feedId: item.feedId,
        totalQuantity: item.totalQuantity,
        quantity: item.quantity,
        raw: {
          ...item,
          date: new Date(item.date),
          bag: item.quantity,
        },
      }));

      setDataState(prev => ({
        ...prev,
        feedConsumptionData: formattedFeedData,
      }));
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
        vaccinationScheduleId: item.vaccinationScheduleId,
        ref: item.ref,
        vaccinationName: item.vaccine,
        scheduledDate: new Date(item.scheduledDate).toLocaleDateString('en-GB'),
        quantity: item.quantity,
        isVaccinated: item.isVaccinated,
        raw: item,
      }));

      setDataState(prev => ({
        ...prev,
        vaccinationData: formattedVaccineData,
      }));
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

      setDataState(prev => ({
        ...prev,
        mortalityData: formattedMortalityData,
      }));
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

      setDataState(prev => ({
        ...prev,
        hospitalityData: formattedHospitalityData,
      }));
    } catch (error) {
      console.error('Error fetching hospitality:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditEggProduction = async (data: any) => {
    if (!businessUnitId || !flockId) return;

    try {
      setLoading(true);

      const intact = Number(data?.intactEggs || 0);
      const broken = Number(data?.brokenEggs || 0);

      if (editData) {
        //  UPDATE PAYLOAD
        const updatePayload = {
          eggProductionId: editData.eggProductionId,
          ref: editData.ref,
          flockId,
          businessUnitId,
          date: data.date.toISOString().split('T')[0],
          fertileEggs: intact,
          brokenEggs: broken,
          totalEggs: intact + broken,
          unitId: data.unitId,
          varietyId: null,
          typeId: null,
        };

        await updateEggProduction(editData.eggProductionId, updatePayload);

        showSuccessToast('Egg production updated successfully');
      } else {
        //  ADD PAYLOAD
        const addPayload = {
          flockId,
          businessUnitId,
          date: data.date.toISOString().split('T')[0],
          fertileEggs: intact,
          brokenEggs: broken,
          totalEggs: intact + broken,
          unitId: data.unitId,
          varietyId: null,
          typeId: null,
        };

        await addEggProduction(addPayload);

        showSuccessToast('Egg production added successfully');
      }

      fetchEggProduction();
    } catch (err: any) {
      showErrorToast(
        err?.response?.data?.message || 'Failed to save egg production',
      );
    } finally {
      setLoading(false);
      setEditData(null);
    }
  };

const handleAddEditFeedConsumption = async (data: any) => {
  if (!businessUnitId || !flockId) return;

  try {
    setLoading(true);

    if (editData && editData.feedRecordConsumptionId) {
      // EDIT existing record
      const recordId = String(editData.feedRecordConsumptionId);

      const updatePayload = {
        feedRecordConsumptionId: recordId,
        businessUnitId: String(businessUnitId),
        flockId: String(flockId),
        date:
          data.date instanceof Date
            ? data.date.toISOString().split('T')[0]
            : new Date(data.date).toISOString().split('T')[0],
        feedId: Number(data.feedId),
        quantity: Number(data.bag ?? data.quantity ?? editData.quantity ?? 1),
      };

      const updatedRecord = await updateFeedConsumption(updatePayload);

      // Update dataState immediately so table shows changes
      setDataState(prev => ({
        ...prev,
        feedConsumptionData: prev.feedConsumptionData.map(item =>
          item.raw.feedRecordConsumptionId === updatedRecord.data.feedRecordConsumptionId
            ? {
                ...item,
                ref: updatedRecord.data.ref,
                date: new Date(updatedRecord.data.date).toLocaleDateString('en-GB'),
                feed: updatedRecord.data.feed,
                feedId: updatedRecord.data.feedId,
                totalQuantity: updatedRecord.data.totalQuantity,
                quantity: updatedRecord.data.quantity,
                raw: updatedRecord.data,
              }
            : item,
        ),
      }));

      showSuccessToast('Feed consumption updated successfully');
    } else {
      // ADD new record
      const payload: AddFeedConsumptionPayload = {
        businessUnitId: flockData.businessUnitId,
        flockId,
        feedId: Number(data.feedId),
        quantity: Number(data.bag),
        price: Number(data.bag),
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };

      const newRecord = await addFeedConsumption(payload);

      // Immediately add new record to table
      setDataState(prev => ({
        ...prev,
        feedConsumptionData: [
          ...prev.feedConsumptionData,
          {
            ref: newRecord.data.ref,
            date: new Date(newRecord.data.date).toLocaleDateString('en-GB'),
            feed: newRecord.data.feed,
            feedId: newRecord.data.feedId,
            totalQuantity: newRecord.data.totalQuantity,
            quantity: newRecord.data.quantity,
            raw: newRecord.data,
          },
        ],
      }));

      showSuccessToast('Feed consumption added successfully');
    }
  } catch (err: any) {
    showErrorToast(
      err?.response?.data?.message || 'Failed to save feed consumption',
    );
  } finally {
    setLoading(false);
    setEditData(null);
    setEditType(null);
  }
};

  const handleAddOrEditVaccination = async (data: any) => {
    if (!flockData?.businessUnitId) return;

    try {
      const payload = {
        businessUnitId: flockData.businessUnitId,
        flockId,
        vaccineId: data.vaccineId,
        scheduledDate: data.scheduledDate?.toISOString().split('T')[0] || null,
        quantity: Number(data.quantity),
      };

      if (editData && editData.vaccinationScheduleId) {
        // EDIT existing vaccination
        const updatedRecord = await updateVaccinationSchedule(
          editData.vaccinationScheduleId, // ID as first argument
          payload, // payload only contains allowed fields
        );

        showSuccessToast('Vaccination schedule updated successfully');
      } else {
        // ADD new vaccination
        const res = await addVaccinationSchedule(payload);
        if (res.status === 'Success') {
          showSuccessToast('Vaccination schedule added successfully');
        } else {
          showErrorToast(res.message || 'Failed to add vaccination schedule');
        }
      }

      fetchVaccinationSchedules(); // refresh table
    } catch (err: any) {
      showErrorToast(
        err?.response?.data?.message || err.message || 'Something went wrong',
      );
    } finally {
      setModals(prev => ({ ...prev, vaccination: false }));
      setEditData(null);
      setEditType(null);
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

      setModals(prev => ({ ...prev, mortality: false }));
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

  const fetchFlockTypes = async () => {
    try {
      const types = await getFlockTypes();
      setDataState(prev => ({ ...prev, flockTypes: types || [] }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!flockData?.businessUnitId) return;
      const supplierList = await getSuppliers(flockData.businessUnitId);
      setDataState(prev => ({ ...prev, suppliers: supplierList || [] }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFeeds = async () => {
    try {
      const res = await getFeeds();
      const mappedFeeds = res.map((f: any) => ({
        label: f.name ?? f.feed ?? 'Unknown Feed',
        value: f.feedId,
      }));
      setDataState(prev => ({
        ...prev,
        feedMasterData: { feeds: mappedFeeds },
      }));
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const data = await getVaccines();
      setDataState(prev => ({ ...prev, vaccineItems: data || [] }));
    } catch (err) {
      console.error('Failed to fetch vaccines', err);
    }
  };

  const handleDeleteFeedConsumption = async (
    feedRecordConsumptionId: string,
  ) => {
    try {
      setLoading(true);

      await deleteFeedRecordConsumption(feedRecordConsumptionId);

      // Remove deleted record from local state
      setDataState(prev => ({
        ...prev,
        feedConsumptionData: prev.feedConsumptionData.filter(
          item => item.raw.feedRecordConsumptionId !== feedRecordConsumptionId,
        ),
      }));

      showSuccessToast('Feed consumption deleted successfully');
    } catch (err: any) {
      console.error('Delete feed consumption error:', err);
      showErrorToast(
        err?.response?.data?.message || 'Failed to delete feed consumption',
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteEggProduction = async (eggProductionId: string) => {
    try {
      setLoading(true);

      await deleteEggProduction(eggProductionId);

      // Remove deleted record from local state
      setDataState(prev => ({
        ...prev,
        eggProductionData: prev.eggProductionData.filter(
          item => item.raw.eggProductionId !== eggProductionId,
        ),
      }));

      showSuccessToast('Egg production deleted successfully');
    } catch (err: any) {
      console.error('Delete Egg Production Error:', err);
      showErrorToast(
        err?.response?.data?.message || 'Failed to delete egg production',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaccinationSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);

      const res = await deleteVaccinationSchedule(scheduleId);

      if (res.status === 'Success') {
        // Remove deleted record from local state
        setDataState(prev => ({
          ...prev,
          vaccinationData: prev.vaccinationData.filter(
            item => item.vaccinationScheduleId !== scheduleId,
          ),
        }));

        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    } catch (err: any) {
      console.error('Delete Vaccination Schedule Error:', err);
      showErrorToast('Failed to delete vaccination schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHealthRecord = async (recordId: string) => {
    try {
      setLoading(true);
      const res = await deleteFlockHealthRecord(recordId);

      if (res.status === 'Success') {
        // Remove from local state
        setDataState(prev => ({
          ...prev,
          mortalityData: prev.mortalityData.filter(
            item => item.raw.flockHealthId !== recordId,
          ),
        }));
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    } catch (err: any) {
      console.error('Delete Mortality Error:', err);
      showErrorToast('Failed to delete mortality record');
    } finally {
      setLoading(false);
    }
  };
  const openFeedModalHandler = async () => {
    if (dataState.feedMasterData.feeds.length === 0) {
      await fetchFeeds();
    }
    setModals(prev => ({ ...prev, feed: true }));
  };

  useEffect(() => {
    if (!summaryData) return;

    setStats({
      bird: [
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
      ],
      sale: [
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
      ],
      feed: [
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
      ],
      vaccine: [
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
      ],
    });
  }, [summaryData]);

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
            {/* FROM Picker */}
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => setActivePicker('from')}
            >
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>
                {dateRange.from
                  ? dateRange.from.toLocaleDateString('en-GB')
                  : 'DD/MM/YY'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.dateDash}>—</Text>

            {/* TO Picker */}
            <TouchableOpacity
              style={styles.dateItem}
              onPress={() => setActivePicker('to')}
            >
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>
                {dateRange.to
                  ? dateRange.to.toLocaleDateString('en-GB')
                  : 'DD/MM/YY'}
              </Text>
            </TouchableOpacity>

            {/* RIGHT : RESET */}
            {(dateRange.from || dateRange.to) && (
              <TouchableOpacity
                style={styles.resetInlineBtn}
                onPress={() => setDateRange({ from: null, to: null })}
              >
                <Text style={styles.resetInlineText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* DateTimePicker */}
        {activePicker && (
          <DateTimePicker
            value={
              activePicker === 'from'
                ? dateRange.from || new Date()
                : dateRange.to || new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                // Only update date if user pressed "OK"
                setDateRange(prev => ({
                  ...prev,
                  [activePicker]: selectedDate,
                }));
              }
              // Close the picker in both cases (Android/iOS)
              setActivePicker(null);
            }}
          />
        )}

        {activePicker === 'to' && (
          <DateTimePicker
            value={dateRange.to || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              // Only update date if user pressed "OK"
              if (event.type === 'set' && selectedDate) {
                setDateRange(prev => ({
                  ...prev,
                  to: selectedDate,
                }));
              }
              // Close the picker in all cases (OK or Cancel)
              setActivePicker(null);
            }}
          />
        )}

        <SectionDivider title="Bird Stats" />
        <InlineRow stats={stats.bird} />
        <SectionDivider title="Sale Stats" />
        <InlineRow stats={stats.sale} />
        <SectionDivider title="Feed Stats" />
        <InlineRow stats={stats.feed} />
        <SectionDivider title="Vaccine Stats" />
        <InlineRow stats={stats.vaccine} />

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
            flockTypes={dataState.flockTypes}
            suppliers={dataState.suppliers}
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
                onPress={() => setModals(prev => ({ ...prev, egg: true }))}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={eggProductionColumns}
              data={dataState.eggProductionData}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      // Set edit mode and data
                      setEditType('egg');
                      setEditData(row.raw);
                      setModals(prev => ({ ...prev, egg: true }));
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
                      closeMenu();
                      setDeleteModal({
                        visible: true,
                        type: 'egg', // ya 'feed', 'vaccination', 'mortality'
                        recordId: row.raw.eggProductionId,
                      });
                    }}
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
              data={dataState.feedConsumptionData}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditType('feed');
                      setEditData(row.raw);
                      console.log('Edit feedData:', row.raw);
                      setModals(prev => ({ ...prev, feed: true }));
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
                      closeMenu();
                      setDeleteModal({
                        visible: true,
                        type: 'feed',
                        recordId: row.raw.feedRecordConsumptionId,
                      });
                    }}
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
                onPress={() =>
                  setModals(prev => ({ ...prev, vaccination: true }))
                }
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={vaccinationColumns}
              data={dataState.vaccinationData}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditType('vaccination');
                      setEditData(row.raw);
                      setModals(prev => ({ ...prev, vaccination: true }));
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
                      closeMenu();
                      setDeleteModal({
                        visible: true,
                        type: 'vaccination',
                        recordId: row.raw.vaccinationScheduleId,
                      });
                    }}
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
              data={dataState.mortalityData}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditType('mortality');
                      setEditData(row.raw);
                      console.log('Edit Mortality:', row.raw);

                      setModals(prev => ({ ...prev, mortality: true }));
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
                      closeMenu();
                      setDeleteModal({
                        visible: true,
                        type: 'mortality',
                        recordId: row.raw.flockHealthId,
                      });
                    }}
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
              data={dataState.hospitalityData}
              showPagination={false}
            />
          </View>
        )}
        <AddModal
          visible={modals.egg}
          title={editData ? 'Edit Egg Production' : 'Add Egg Production'}
          type="Egg production"
          unitItems={masterData.units}
          // flockItems={[]} // hide flock
          hideFlockField={true}
          initialData={
            editData
              ? {
                  ...editData,
                  date: new Date(editData.date), // ensure Date object for picker
                  intactEggs: editData.intactEggs,
                  brokenEggs: editData.brokenEggs,
                  flockId,
                  unitId: editData.unitId,
                }
              : { flockId }
          }
          isEdit={!!editData}
          onClose={() => {
            setModals(prev => ({ ...prev, egg: false }));
            setEditData(null);
            setEditType(null);
          }}
          onSave={async data => {
            if (editData) {
              // Update logic
              await handleAddEditEggProduction({ ...data, id: editData.id });
            } else {
              await handleAddEditEggProduction({ ...data, flockId });
            }
            setModals(prev => ({ ...prev, egg: false }));
            setEditData(null);
            setEditType(null);
          }}
        />
        <AddModal
          visible={modals.feed}
          title={editData ? 'Edit Feed Consumption' : 'Add Feed Consumption'}
          type="Feed Consumption"
          flockItems={[{ label: flock?.ref, value: flockId }]}
          feedItems={dataState.feedMasterData.feeds}
          hideFlockField={true}
          initialData={editData}
          isEdit={!!editData}
          onClose={() => {
            setModals(prev => ({ ...prev, feed: false }));
            setEditData(null);
            setEditType(null);
          }}
          onSave={handleAddEditFeedConsumption}
        />
        <AddModal
          visible={modals.vaccination}
          title={
            editData ? 'Edit Vaccination Schedule' : 'Add Vaccination Schedule'
          }
          type="vaccination Schedule"
          vaccineItems={dataState.vaccineItems}
          flockItems={[{ label: flock?.ref, value: flockId }]}
          hideFlockField={true}
          initialData={
            editData
              ? {
                  ...editData,
                  scheduledDate: new Date(editData.scheduledDate),
                  vaccineId: editData.vaccineId,
                  flockId,
                }
              : { flockId }
          }
          isEdit={!!editData}
          onClose={() => {
            setModals(prev => ({ ...prev, vaccination: false }));
            setEditData(null);
            setEditType(null);
          }}
          onSave={handleAddOrEditVaccination}
        />

        <ItemEntryModal
          visible={modals.mortality}
          onClose={() => setModals(prev => ({ ...prev, mortality: false }))}
          type="mortality"
          initialData={{
            quantity: editData?.quantity,
            expireDate: editData?.date,
          }}
          onSave={handleMortality}
        />

        <ItemEntryModal
          visible={modals.hospitality}
          onClose={() => setModals(prev => ({ ...prev, hospitality: false }))}
          type="hospitality"
          onSave={handleHospitality}
        />
        
        <ConfirmationModal
          type="delete"
          visible={deleteModal.visible}
          onClose={() => setDeleteModal({ visible: false })}
          onConfirm={() => {
            if (!deleteModal.recordId || !deleteModal.type) return;

            switch (deleteModal.type) {
              case 'egg':
                handleDeleteEggProduction(deleteModal.recordId);
                break;
              case 'feed':
                handleDeleteFeedConsumption(deleteModal.recordId);
                break;
              case 'vaccination':
                handleDeleteVaccinationSchedule(deleteModal.recordId);
                break;
              case 'mortality':
                handleDeleteHealthRecord(deleteModal.recordId);
                break;
            }
            setDeleteModal({ visible: false });
          }}
          title="Are you sure you want to delete this record?"
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
    padding: 8,
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
