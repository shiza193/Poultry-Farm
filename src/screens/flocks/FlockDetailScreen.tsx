import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Circle } from 'react-native-progress';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import { useRoute } from '@react-navigation/native';
import Theme from '../../theme/Theme';
import { formatDisplayDate } from '../../utils/validation';

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
  updateFlockHealth,
  UpdateFlockHealthPayload,
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
  icon?: any;
  label: string;
  value?: number;
  total?: number;
};

type InlineRowProps = {
  stats: StatItem[];
};

type EggsProductionCardProps = {
  eggs: number;
  productionPercentage: number;
};

type RecordType = 'egg' | 'feed' | 'vaccination' | 'mortality' | 'hospitality';

type EditState = {
  type: RecordType | null;
  data: any | null;
};

type DeleteState = {
  visible: boolean;
  type: RecordType | null;
  recordId: string | null;
};

type TabType =
  | 'Egg Production'
  | 'Feed Consumption'
  | 'Vaccination Schedule'
  | 'Mortality'
  | 'Hospitality';

const FlockDetailScreen = () => {
  const { businessUnitId } = useBusinessUnit();
  const route = useRoute<any>();
  const flock = route.params?.flock;
  // 1 Active picker state
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);
  // 2 Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  // 2 Global Loading
  const [loading, setLoading] = useState(false);
  // 3 Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('Egg Production');
  // 4 Modal Control
  const [activeModal, setActiveModal] = useState<RecordType | null>(null);
  // 5 Edit State
  const [editState, setEditState] = useState<EditState>({
    type: null, //bataega ke kis type ka record edit ho raha hai (jaise egg, feed, vaccination)
    data: null, // data us record ka actual data store karega.
  });
  // 6 Delete Modal State
  const [deleteState, setDeleteState] = useState<DeleteState>({
    visible: false,
    type: null,
    recordId: null,
  });
  // 7 Main Data State (ALL DATA HERE)
  const [dataState, setDataState] = useState({
    summary: null as any,
    flockDetail: null as any,

    tables: {
      egg: [] as any[],
      feed: [] as any[],
      vaccination: [] as any[],
      mortality: [] as any[],
      hospitality: [] as any[],
      feedConsumptionData: [] as any[],
    },

    master: {
      units: [] as any[],
      feeds: [] as any[],
      vaccines: [] as any[],
      flockTypes: [] as any[],
      suppliers: [] as any[],
    },
  });

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
      width: 160,
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
              tables: {
                ...prev.tables,
                vaccination: prev.tables.vaccination.map(item =>
                  item.vaccinationScheduleId === row.vaccinationScheduleId
                    ? { ...item, isVaccinated: newStatus }
                    : item,
                ),
              },
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
                tables: {
                  ...prev.tables,
                  vaccination: prev.tables.vaccination.map(item =>
                    item.vaccinationScheduleId === row.vaccinationScheduleId
                      ? { ...item, isVaccinated: newStatus } // mark new status
                      : item,
                  ),
                },
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
    if (businessUnitId) {
      fetchInitialData();
    }
  }, [flockId, dateRange.from, dateRange.to, businessUnitId]);

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
  }, [activeTab, flockId]);

  const fetchInitialData = async () => {
    if (!flockId || !businessUnitId) return;

    try {
      setLoading(true);

      const summaryResponse = await getFlockSummary(
        businessUnitId,
        dateRange.from?.toISOString(),
        dateRange.to?.toISOString(),
        flockId,
      );

      const flockDetailResponse = await getFlockDetail(flockId);

      // State update karo
      setDataState(prev => ({
        ...prev,
        summary: summaryResponse.data || summaryResponse,
        flockDetail: flockDetailResponse,
      }));
    } catch (error) {
      console.error(error);
      showErrorToast('Failed to fetch flock data');
    } finally {
      setLoading(false);
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
        date: formatDisplayDate(item.date),
        totalEggs: item.totalEggs,
        intactEggs: item.totalEggs - item.brokenEggs,
        brokenEggs: item.brokenEggs,
        raw: item,
      }));
      setDataState(prev => ({
        ...prev,
        tables: {
          ...prev.tables,
          egg: formattedData,
        },
      }));
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
        tables: {
          ...prev.tables,
          feed: formattedFeedData,
        },
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
       scheduledDate: formatDisplayDate(item.scheduledDate),
        quantity: item.quantity,
        isVaccinated: item.isVaccinated,
        raw: item,
      }));

      setDataState(prev => ({
        ...prev,
        tables: {
          ...prev.tables,
          vaccination: formattedVaccineData,
        },
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
         expireDate: formatDisplayDate(item.date),
        mortalityQuantity: item.quantity,
        raw: item,
      }));

      setDataState(prev => ({
        ...prev,
        tables: {
          ...prev.tables,
          mortality: formattedMortalityData,
        },
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
        tables: {
          ...prev.tables,
          hospitality: formattedHospitalityData,
        },
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

      if (editState.data) {
        //  UPDATE PAYLOAD
        const updatePayload = {
          eggProductionId: editState.data.eggProductionId,
          ref: editState.data.ref,
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

        await updateEggProduction(
          editState.data.eggProductionId,
          updatePayload,
        );

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
      setEditState({ type: null, data: null });
    }
  };

  const handleAddEditFeedConsumption = async (data: any) => {
    if (!businessUnitId || !flockId) return;

    try {
      setLoading(true);

      // Determine if we are editing or adding
      const isEdit = editState.data && editState.data.feedRecordConsumptionId;

      if (isEdit) {
        // --- UPDATE existing record ---
        const recordId = String(editState.data.feedRecordConsumptionId);
        const updatePayload = {
          feedRecordConsumptionId: recordId,
          businessUnitId: String(businessUnitId),
          flockId: String(flockId),
          date:
            data.date instanceof Date
              ? data.date.toISOString().split('T')[0]
              : new Date(data.date).toISOString().split('T')[0],
          feedId: Number(data.feedId),
          quantity: Number(
            data.bag ?? data.quantity ?? editState.data.quantity ?? 1,
          ),
        };

        const updatedRecord = await updateFeedConsumption(updatePayload);

        // Update table immediately
        setDataState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            feed: prev.tables.feed.map(item =>
              item.raw.feedRecordConsumptionId ===
              updatedRecord.data.feedRecordConsumptionId
                ? {
                    ref: updatedRecord.data.ref,
                    date: new Date(updatedRecord.data.date).toLocaleDateString(
                      'en-GB',
                    ),
                    feed: updatedRecord.data.feed,
                    feedId: updatedRecord.data.feedId,
                    totalQuantity: updatedRecord.data.totalQuantity,
                    quantity: updatedRecord.data.quantity,
                    raw: updatedRecord.data,
                  }
                : item,
            ),
          },
        }));

        showSuccessToast('Feed consumption updated successfully');
      } else {
        // --- ADD new record ---
        const payload: AddFeedConsumptionPayload = {
          businessUnitId: String(businessUnitId),
          flockId,
          feedId: Number(data.feedId),
          quantity: Number(data.bag),
          price: Number(data.bag),
          date: data.date instanceof Date ? data.date.toISOString() : data.date,
        };

        const newRecord = await addFeedConsumption(payload);

        // Append new record to table immediately
        setDataState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            feed: [
              ...(prev.tables.feed || []),
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
          },
        }));

        showSuccessToast('Feed consumption added successfully');
      }
    } catch (err: any) {
      showErrorToast(
        err?.response?.data?.message || 'Failed to save feed consumption',
      );
    } finally {
      setLoading(false);
      setEditState({ type: null, data: null });
    }
  };

  const handleAddOrEditVaccination = async (data: any) => {
    if (!dataState.flockDetail?.businessUnitId) return;

    try {
      const payload = {
        businessUnitId: dataState.flockDetail.businessUnitId,
        flockId,
        vaccineId: data.vaccineId,
        scheduledDate: data.scheduledDate?.toISOString().split('T')[0] || null,
        quantity: Number(data.quantity),
      };

      if (
        dataState.flockDetail &&
        dataState.flockDetail.vaccinationScheduleId
      ) {
        // EDIT existing vaccination
        const updatedRecord = await updateVaccinationSchedule(
          dataState.flockDetail.vaccinationScheduleId, // ID as first argument
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
      setActiveModal(null);
      setEditState({ type: null, data: null });
    }
  };
  const handleMortality = async (data: any) => {
    if (!flockId) return;

    try {
      setLoading(true);

      const payload: UpdateFlockHealthPayload = {
        flockHealthId: editState.data?.flockHealthId ?? '', // existing ID for update
        flockId: String(flockId),
        quantity: Number(data.quantity),
        date: data.expireDate
          ? data.expireDate instanceof Date
            ? data.expireDate.toISOString().split('T')[0]
            : data.expireDate
          : new Date().toISOString().split('T')[0],
        flockHealthStatusId: 1, // Mortality
      };

      if (editState.data && editState.data.flockHealthId) {
        // Update existing record
        await updateFlockHealth(payload);
        showSuccessToast('Mortality record updated successfully');

        // Update local state immediately
        setDataState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            mortality: prev.tables.mortality.map(item =>
              item.flockHealthId === payload.flockHealthId
                ? { ...item, ...payload }
                : item,
            ),
          },
        }));
      } else {
        // Add new record
        const newRecord = await addFlockHealthRecord(payload);
        showSuccessToast('Mortality added successfully');

        // Add new record to local state
        setDataState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            mortality: [
              ...prev.tables.mortality,
              {
                ...payload,
                expireDate: payload.date,
                mortalityQuantity: payload.quantity,
                flockHealthId: newRecord.data.flockHealthId,
                raw: newRecord.data, // optional: keep raw data for edit/delete
              },
            ],
          },
        }));
      }

      // Close modal
      setActiveModal(null);
      setEditState({ type: null, data: null });
    } catch (err: any) {
      console.error('Mortality API error:', err);
      showErrorToast(
        err?.response?.data?.message || 'Failed to save mortality record',
      );
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

      setActiveModal(null);
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
      setDataState(prev => ({
        ...prev,
        master: {
          ...prev.master,
          units: dropdownData,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch units', error);
    }
  };

  const fetchFlockTypes = async () => {
    try {
      const types = await getFlockTypes();
      setDataState(prev => ({
        ...prev,
        master: { ...prev.master, flockTypes: types || [] },
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!dataState.flockDetail?.businessUnitId) return;
      const supplierList = await getSuppliers(
        dataState.flockDetail.businessUnitId,
      );
      setDataState(prev => ({
        ...prev,
        master: { ...prev.master, suppliers: supplierList || [] },
      }));
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
        master: {
          ...prev.master,
          feeds: mappedFeeds,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    }
  };

  const fetchVaccines = async () => {
    try {
      const data = await getVaccines();
      setDataState(prev => ({
        ...prev,
        master: {
          ...prev.master,
          vaccines: data || [],
        },
      }));
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
        tables: {
          ...prev.tables,
          feed: prev.tables.feed.filter(
            item =>
              item.raw.feedRecordConsumptionId !== feedRecordConsumptionId,
          ),
        },
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
        tables: {
          ...prev.tables,
          egg: prev.tables.egg.filter(
            item => item.raw.eggProductionId !== eggProductionId,
          ),
        },
      }));

      showSuccessToast('Egg production record deleted successfully');
    } catch (err: any) {
      console.error('Delete Egg Production Error:', err);
      showErrorToast('Failed to delete egg production record');
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
          tables: {
            ...prev.tables,
            vaccination: prev.tables.vaccination.filter(
              item => item.vaccinationScheduleId !== scheduleId,
            ),
          },
        }));

        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    } catch (err: any) {
      console.error('Delete Vaccination Error:', err);
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
        // Remove from local state (mortality table inside tables)
        setDataState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            mortality: prev.tables.mortality.filter(
              item => item.raw.flockHealthId !== recordId,
            ),
          },
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

  const InlineRow: React.FC<InlineRowProps> = ({ stats }) => (
    <View style={styles.inlineRow}>
      {stats.map((stat: any, idx: any) => (
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

  const EggsProductionCard: React.FC<EggsProductionCardProps> = ({
    eggs = 0,
    productionPercentage = 0,
  }) => {
    const isAboveHundred = productionPercentage > 100;

    const progress =
      productionPercentage > 0 ? Math.min(productionPercentage / 100, 1) : 0;

    const circleColor = isAboveHundred
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
                {productionPercentage}%
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
            <View style={[styles.statusRow, { marginRight: 14 }]}>
              <View
                style={[
                  styles.statusBox,
                  { backgroundColor: Theme.colors.lightblue },
                ]}
              />
              <Text style={styles.statusText}>&gt; 100%</Text>
            </View>

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

        <View style={styles.centerWrapper}>
          <View style={styles.verticalSeparator} />
          <View style={styles.centerBlock}>
            <Image source={Theme.icons.dash1} style={styles.eggIcon} />
          </View>
        </View>

        <View style={styles.rightBlock}>
          <Text style={styles.eggsLabel}>Total Eggs</Text>
          <Text style={styles.eggsValue}>{eggs}</Text>
        </View>
      </View>
    );
  };

  const onTabPress = (
    tab:
      | 'Egg Production'
      | 'Feed Consumption'
      | 'Vaccination Schedule'
      | 'Mortality'
      | 'Hospitality',
  ) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackArrow
        title={flock ? `${flock.ref} (${flock.breed})` : 'Flock Detail'}
        showBack
      />
      <LoadingOverlay visible={loading} text="Fetching data..." />
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
                ? dateRange.from ?? new Date()
                : dateRange.to ?? new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                // Safely update from/to based on activePicker
                setDateRange(prev => ({
                  ...prev,
                  [activePicker]: selectedDate,
                }));
              }
              // Close picker on any action
              setActivePicker(null);
            }}
          />
        )}

        {/* ===================== BIRD STATS ===================== */}
        <SectionDivider title="Bird Stats" />
        <InlineRow
          stats={[
            {
              icon: Theme.icons.hen,
              label: 'Total Birds',
              value: dataState.summary?.totalBirds ?? 0,
              total: dataState.summary?.totalRemainingBirds ?? 0,
            },
            {
              icon: Theme.icons.motality,
              label: 'Mortality',
              value: dataState.summary?.totalMortalityBirds ?? 0,
            },
            {
              icon: Theme.icons.hospital,
              label: 'Hospitalized',
              value: dataState.summary?.totalHospitalizedBirds ?? 0,
            },
          ]}
        />

        {/* ===================== SALE STATS ===================== */}
        <SectionDivider title="Sale Stats" />
        <InlineRow
          stats={[
            {
              icon: Theme.icons.trend,
              label: 'Bird Slae',
              value: dataState.summary?.totalBirdsSale ?? 0,
            },
            {
              icon: Theme.icons.trend,
              label: 'Egg Sale',
              value: dataState.summary?.totalEggSale ?? 0,
            },
            {
              icon: Theme.icons.trend,
              label: 'Other Sale',
              value: dataState.summary?.totalOtherSale ?? 0,
            },
          ]}
        />

        {/* ===================== FEED STATS ===================== */}
        <SectionDivider title="Feed Stats" />
        <InlineRow
          stats={[
            {
              icon: Theme.icons.feedGreen,
              label: 'Avalibale ',
              value: dataState.summary?.totalAvailableFeed ?? 0,
            },
            {
              icon: Theme.icons.feedGreen,
              label: 'Puechased ',
              value: dataState.summary?.totalPurchasedFeed ?? 0,
            },
            {
              icon: Theme.icons.feedGreen,
              label: 'Consumed',
              value: dataState.summary?.totalFeedConsumed ?? 0,
            },
          ]}
        />

        {/* ===================== VACCINE STATS ===================== */}
        <SectionDivider title="Vaccine Stats" />
        <InlineRow
          stats={[
            {
              icon: Theme.icons.injection,
              label: 'Scheduled ',
              value: dataState.summary?.totalVaccineSchedule ?? 0,
            },
            {
              icon: Theme.icons.injection,
              label: 'Available',
              value: dataState.summary?.totalAvailableVaccine ?? 0,
            },
            {
              icon: Theme.icons.injection,
              label: 'Purchased',
              value: dataState.summary?.totalPurchasedVaccine ?? 0,
            },
          ]}
        />

        {/* ===================== EGG PRODUCTION CARD ===================== */}
        <EggsProductionCard
          eggs={dataState.summary?.totalEggsProduced ?? 0}
          productionPercentage={dataState.summary?.productionPercentage ?? 0}
        />

        {/* ===================== FLOCK DETAIL ===================== */}
        {dataState.flockDetail && (
          <ExpandableCard
            isDataLoading={
              dataState.master.flockTypes.length === 0 ||
              dataState.master.suppliers.length === 0
            }
            onOpen={async () => {
              if (dataState.master.flockTypes.length === 0) {
                await fetchFlockTypes();
              }
              if (dataState.master.suppliers.length === 0) {
                await fetchSuppliers();
              }
            }}
            title="Flock Information"
            customLabels={{
              flockTypeId: 'Flock Type',
              supplierId: 'Supplier',
            }}
            flockTypes={dataState.master.flockTypes}
            suppliers={dataState.master.suppliers}
            initialData={{
              quantity: dataState.flockDetail?.quantity?.toString() ?? '',
              breed: dataState.flockDetail?.breed ?? '',
              flockTypeId: dataState.flockDetail?.flockTypeId ?? null,
              arrivalDate: dataState.flockDetail?.arrivalDate ?? '',
              gender: dataState.flockDetail?.isHen ? 'Hen' : 'Rooster',
              supplierId: dataState.flockDetail?.supplierId ?? null,
              averageWeight: dataState.flockDetail?.weight?.toString() ?? '',
              price: dataState.flockDetail?.price?.toString() ?? '',
              dateOfBirth: dataState.flockDetail?.dateOfBirth ?? '',
            }}
            onSave={async formData => {
              try {
                setLoading(true);

                const payload = {
                  businessUnitId: dataState.flockDetail?.businessUnitId ?? null,
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

                const updatedFlock = await getFlockDetail(flockId);

                setDataState(prev => ({
                  ...prev,
                  flockDetail: updatedFlock,
                }));
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
              onPress={() => onTabPress(tab as TabType)} // cast string → TabType
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
                onPress={async () => {
                  if (dataState.master.units.length === 0) {
                    await fetchUnits();
                  }
                  setActiveModal('egg');
                }}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={eggProductionColumns}
              data={dataState.tables.egg}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={async () => {
                      if (dataState.master.units.length === 0) {
                        await fetchUnits();
                      }

                      setEditState({
                        type: 'egg',
                        data: row.raw,
                      });

                      setActiveModal('egg');
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
                      setDeleteState({
                        visible: true,
                        type: 'egg',
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
                onPress={async () => {
                  if (dataState.master.feeds.length === 0) {
                    await fetchFeeds();
                  }

                  // Modal open karo
                  setActiveModal('feed');
                }}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={feedColumns}
              data={dataState.tables.feed}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={async () => {
                      if (dataState.master.feeds.length === 0) {
                        await fetchFeeds();
                      }

                      setEditState({
                        type: 'feed',
                        data: row.raw,
                      });

                      setActiveModal('feed');
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

                      setDeleteState({
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
                onPress={async () => {
                  if (dataState.master.vaccines.length === 0) {
                    await fetchVaccines(); // fetch and populate dataState.master.vaccines
                  }
                  setActiveModal('vaccination');
                }}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={vaccinationColumns}
              data={dataState.tables.vaccination} // use tables.vaccination
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={async () => {
                      // Ensure vaccines loaded
                      if (dataState.master.vaccines.length === 0) {
                        await fetchVaccines();
                      }

                      setEditState({
                        type: 'vaccination',
                        data: row.raw,
                      });

                      setActiveModal('vaccination');
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
                      setDeleteState({
                        visible: true,
                        type: 'vaccination',
                        recordId: row.vaccinationScheduleId, // use the correct field
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
                onPress={() => {
                  setEditState({ type: null, data: null });
                  setActiveModal('mortality');
                }}
              >
                <Text style={styles.newButtonText}>+ New</Text>
              </TouchableOpacity>
            </View>

            <DataCard
              columns={mortalityColumns}
              data={dataState.tables.mortality}
              showPagination={false}
              renderRowMenu={(row, closeMenu) => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setEditState({
                        type: 'mortality',
                        data: row.raw,
                      });

                      setActiveModal('mortality');
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

                      setDeleteState({
                        visible: true,
                        type: 'mortality',
                        recordId: row.flockHealthId,
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
                onPress={() => setActiveModal('hospitality')}
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
              data={dataState.tables.hospitality}
              showPagination={false}
            />
          </View>
        )}

        {/* ========================= EGG MODAL ========================= */}
        <AddModal
          visible={activeModal === 'egg'}
          title={editState.data ? 'Edit Egg Production' : 'Add Egg Production'}
          type="Egg production"
          unitItems={dataState.master.units}
          hideFlockField={true}
          initialData={
            editState.data
              ? {
                  ...editState.data,
                  date: new Date(editState.data.date),
                  flockId,
                }
              : { flockId }
          }
          isEdit={!!editState.data}
          onClose={() => {
            setActiveModal(null);
            setEditState({ type: null, data: null });
          }}
          onSave={async data => {
            if (editState.data) {
              await handleAddEditEggProduction({
                ...data,
                id: editState.data.id,
              });
            } else {
              await handleAddEditEggProduction({
                ...data,
                flockId,
              });
            }

            setActiveModal(null);
            setEditState({ type: null, data: null });
          }}
        />

        {/* ========================= FEED MODAL ========================= */}
        <AddModal
          visible={activeModal === 'feed'}
          title={
            editState.data ? 'Edit Feed Consumption' : 'Add Feed Consumption'
          }
          type="Feed Consumption"
          flockItems={[{ label: flock?.ref, value: flockId }]}
          feedItems={dataState.master.feeds}
          hideFlockField={true}
          initialData={editState.data}
          isEdit={!!editState.data}
          onClose={() => {
            setActiveModal(null);
            setEditState({ type: null, data: null });
          }}
          onSave={handleAddEditFeedConsumption}
        />

        {/* ========================= VACCINATION MODAL ========================= */}
        <AddModal
          visible={activeModal === 'vaccination'}
          title={
            editState.data
              ? 'Edit Vaccination Schedule'
              : 'Add Vaccination Schedule'
          }
          type="vaccination Schedule"
          vaccineItems={dataState.master.vaccines}
          flockItems={[{ label: flock?.ref, value: flockId }]}
          hideFlockField={true}
          initialData={
            editState.data
              ? {
                  ...editState.data,
                  scheduledDate: new Date(editState.data.scheduledDate),
                  flockId,
                }
              : { flockId }
          }
          isEdit={!!editState.data}
          onClose={() => {
            setActiveModal(null);
            setEditState({ type: null, data: null });
          }}
          onSave={handleAddOrEditVaccination}
        />

        {/* ========================= MORTALITY MODAL ========================= */}
        <ItemEntryModal
          visible={activeModal === 'mortality'}
          maxQuantity={dataState.summary?.totalRemainingBirds ?? 0}
          type="mortality"
          initialData={editState.data}
          onClose={() => setActiveModal(null)}
          onSave={handleMortality}
        />

        {/* ========================= HOSPITALITY MODAL ========================= */}
        <ItemEntryModal
          visible={activeModal === 'hospitality'}
          type="hospitality"
          onClose={() => setActiveModal(null)}
          onSave={handleHospitality}
        />

        {/* ========================= DELETE CONFIRMATION ========================= */}
        <ConfirmationModal
          type="delete"
          visible={deleteState.visible}
          onClose={() =>
            setDeleteState({ visible: false, type: null, recordId: null })
          }
          onConfirm={() => {
            if (!deleteState.recordId || !deleteState.type) return;

            switch (deleteState.type) {
              case 'egg':
                handleDeleteEggProduction(deleteState.recordId);
                break;
              case 'feed':
                handleDeleteFeedConsumption(deleteState.recordId);
                break;
              case 'vaccination':
                handleDeleteVaccinationSchedule(deleteState.recordId);
                break;
              case 'mortality':
                handleDeleteHealthRecord(deleteState.recordId);
                break;
            }

            setDeleteState({ visible: false, type: null, recordId: null });
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
