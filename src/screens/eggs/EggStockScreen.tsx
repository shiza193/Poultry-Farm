import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard from '../../components/customCards/DataCard';
import PdfButton from '../../components/customButtons/PdfButton';

const EggStockScreen = () => {

     const handlePdfPress = () => {
    console.log('PDF button pressed!');
  };

  return (
    <View style={styles.container}>

 <View style={styles.buttonContainer}>
        <PdfButton title="Download  Excle Report" onPress={handlePdfPress} />
      </View>
      {/* ===== Scrollable Table ===== */}
      <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
        <View>
          {/* ===== Header ===== */}
          <DataCard
            isHeader
            showEggStock
            labels={{
              unit: 'Unit',
              totalProduced: 'Total Produced',
              totalSold: 'Total Sold',
              eggAvailableStock: 'Available Stock',
            }}
          />

          {/* ===== Row ===== */}
          <DataCard
            showEggStock
            unitValue="Eggs"
            totalProducedValue={12000}
            totalSoldValue={8500}
            eggAvailableStockValue={3500}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EggStockScreen;

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
  marginTop: -12,      
},
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 80,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 12, 
  },
});
