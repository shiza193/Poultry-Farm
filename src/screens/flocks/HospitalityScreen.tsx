import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import DataCard from '../../components/customCards/DataCard';
import Theme from '../../theme/Theme';
import { CustomConstants } from '../../constants/CustomConstants';
import {
  getHospitalityByFilter,
  HospitalityRecord,
} from '../../services/FlockService';
import { useBusinessUnit } from '../../context/BusinessContext';

const HospitalityScreen = () => {

  const [hospitalityData, setHospitalityData] = useState<HospitalityRecord[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { businessUnitId } = useBusinessUnit();

  const fetchHospitalityData = async () => {
     if (!businessUnitId) {
      console.warn('Business Unit ID is not set');
      return;
    }
    try {
      setLoading(true);
      const data = await getHospitalityByFilter({
        businessUnitId,
        pageNumber: 1,
        pageSize: 50,
      });
      setHospitalityData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospitality data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalityData();
  }, []);

  

  // Optional: format date to DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
  


      <View style={styles.container}>
        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Image source={Theme.icons.search} style={styles.searchIcon} />
            <TextInput
              placeholder="Search..."
              style={styles.searchInput}
              placeholderTextColor={Theme.colors.grey}
            />
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => console.log('New Record')}
          >
            <Text style={styles.newButtonText}> + New Hospitality</Text>
          </TouchableOpacity>

        
        </View>

        {/* Table */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.buttonPrimary} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : hospitalityData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Image source={Theme.icons.nodata} style={styles.noDataImage} />
          </View>
        ) : (
          <ScrollView horizontal style={styles.tableWrapper}>
            <View>
              {/* Header */}
              <DataCard
                isHeader
                showHospitality
                labels={{
                  flock: 'FLOCK',
                  hospDate: 'Date',
                  hospQuantity: 'Quantity',
                  hospDiagnosis: 'Diagnosis',
                  hospMedication: 'Medication',
                  hospTreatmentDays: 'Treatment Days',
                  hospVetName: 'Vet Name',
                  hospActions: 'Actions',
                }}
              />

              {/* Data Rows */}
              {hospitalityData.map(item => (
                <DataCard
                  key={item.hospitalityId}
                  showHospitality
                  flockValue={item.flock}
                  hospDateValue={item.date ? formatDate(item.date) : ''}
                  hospQuantityValue={item.quantity}
                  hospDiagnosisValue={item.diagnosis}
                  hospMedicationValue={item.medication}
                  hospTreatmentDaysValue={item.treatmentDays}
                  hospVetNameValue={item.vetName}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
  );
};

export default HospitalityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.screenBackground,
    padding: 10,
  },

  tipCardContainer: {
    marginTop: 36,
  },

  searchRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 380,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
    paddingLeft: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    width: 20,
    height: 20,
    tintColor: Theme.colors.grey,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newButtonText: {
    color: Theme.colors.black,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  tableWrapper: {
    flex: 1,
  },

  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
