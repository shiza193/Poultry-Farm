import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DataCard from '../../components/customCards/DataCard';
import Theme from '../../theme/Theme';
import ConfirmationModal from '../../components/customPopups/ConfirmationModal';
import {
  getFlockHealthRecords,
  deleteFlockHealthRecord,
  FlockHealthRecord,
} from '../../services/FlockService';
import { CustomConstants } from '../../constants/CustomConstants';

import { useBusinessUnit } from '../../context/BusinessContext';

const FlocksMortalityScreen: React.FC = () => {
  const [healthRecords, setHealthRecords] = useState<FlockHealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedRecordName, setSelectedRecordName] = useState<string>('');

  const { businessUnitId } = useBusinessUnit();

  // Fetch API data
  useEffect(() => {
    const fetchHealthRecords = async () => {
       if (!businessUnitId) {
      console.warn('Business Unit ID is not set');
      return;
    }
      setLoading(true);
      try {
        const response = await getFlockHealthRecords(businessUnitId, 1);
        setHealthRecords(response.data.data);
      } catch (err) {
        console.error('Error fetching health records:', err);
        setHealthRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, []);

  
  // Open modal before delete
  const handleDeletePress = (id: string, name: string) => {
    setSelectedRecordId(id);
    setSelectedRecordName(name);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecordId) return;

    try {
      setLoading(true);
      // Call API to delete
      await deleteFlockHealthRecord(selectedRecordId);

      // Remove from local state
      setHealthRecords(prev =>
        prev.filter(record => record.flockHealthId !== selectedRecordId),
      );

      setSelectedRecordId(null);
      setSelectedRecordName('');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete flock health record.');
      console.error('Delete error:', err);
    } finally {
      setModalVisible(false);
      setLoading(false);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setSelectedRecordId(null);
    setSelectedRecordName('');
    setModalVisible(false);
  };

  const handleEdit = (id: string) => {
    console.log('Edit flock health record:', id);
  };

  return (
    
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.dropdownSmall}>
            <Text style={styles.dropdownTextSmall}>Select flock</Text>
            <Image
              source={Theme.icons.dropdown}
              style={styles.dropdownIconSmall}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Theme.colors.primaryYellow}
            style={{ marginTop: 40 }}
          />
        ) : healthRecords.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Image
              source={Theme.icons.nodata}
              style={{
                width: 290,
                height: 290,
                resizeMode: 'contain',
                marginBottom: 12,
              }}
            />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View>
              <DataCard
                isHeader
                labels={{
                  name: 'Flock',
                  phone: 'Date',
                  email: 'Quantity',
                  actions: 'Action',
                }}
                showAddress={false}
                showStatus={false}
              />

              <FlatList
                data={healthRecords}
                keyExtractor={item => item.flockHealthId}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <DataCard
                    name={item.flock}
                    phone={new Date(item.date).toLocaleDateString()}
                    email={item.quantity.toString()}
                    showAddress={false}
                    showStatus={false}
                    onEdit={() => handleEdit(item.flockHealthId)}
                    onDelete={() =>
                      handleDeletePress(item.flockHealthId, item.flock)
                    }
                  />
                )}
              />
            </View>
          </ScrollView>
        )}

        <ConfirmationModal
          type="delete"
          visible={modalVisible}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={`Are you sure you want to delete flock "${selectedRecordName}"?`}
        />
      </SafeAreaView>
  );
};

export default FlocksMortalityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 7,
    marginBottom: 10,
  },
  dropdownSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: Theme.colors.dropdowncolor,
    borderWidth: 1,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 39,
    width: 160,
  },
  dropdownTextSmall: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  dropdownIconSmall: {
    width: 12,
    height: 12,
    tintColor: Theme.colors.grey,
  },
});
