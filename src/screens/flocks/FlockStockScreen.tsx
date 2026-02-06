import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import DataCard from '../../components/customCards/DataCard';
import Theme from '../../theme/Theme';
import { getFlockStock, FlockStock } from '../../services/FlockService';
import { CustomConstants } from '../../constants/CustomConstants';

import { useBusinessUnit } from '../../context/BusinessContext';

const FlockStockScreen = () => {
 
  const [flockStock, setFlockStock] = useState<FlockStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { businessUnitId } = useBusinessUnit();

  const fetchFlockStock = async () => {
     if (!businessUnitId) {
      console.warn('Business Unit ID is not set');
      return;
    }
    try {
      setLoading(true);
      const data = await getFlockStock(businessUnitId);
      setFlockStock(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flock stock');
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    fetchFlockStock();
  }, []);

  const handlePdfPress = () => {
    console.log('PDF button pressed!');
  };

  return (
   
      <View style={styles.container}>

      

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.buttonPrimary} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        ) : flockStock.length === 0 ? (
          <Text style={{ textAlign: 'center' }}>No flock stock available</Text>
        ) : (
          <ScrollView
            horizontal
            contentContainerStyle={styles.scrollContent}
            showsHorizontalScrollIndicator={false}
          >
            <View>
              {/* HEADER */}
              <DataCard showFlock isHeader />

              {/* ROWS */}
              {flockStock.map(flock => (
                <DataCard
                  key={flock.flockId}
                  showFlock
                  flockName={flock.flock}
                  totalPurchased={flock.totalPurchased}
                  totalMortality={flock.totalMortality}
                  totalHospitality={flock.totalHospitality}
                  totalSale={flock.totalSale}
                  availableStock={flock.availableStock}
                  status={flock.isEnded ? 'Active' : 'Active'}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
  );
};

export default FlockStockScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingTop: 40,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 8,
    marginTop: 7,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
});
