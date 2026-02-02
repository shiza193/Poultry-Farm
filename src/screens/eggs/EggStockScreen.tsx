import React from 'react';
import { View, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';
import PdfButton from '../../components/customButtons/PdfButton';

const EggStockScreen = () => {
  const handlePdfPress = () => {
    console.log('PDF button pressed!');
  };

  // ✅ TABLE DATA
  const eggStockData = [
    {
      unit: 'Eggs',
      totalProduced: 12000,
      totalSold: 8500,
      availableStock: 3500,
    },
  ];

  // ✅ TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'unit',
      title: 'UNIT',
      width: 120,
      isTitle: true,
    },
    {
      key: 'totalProduced',
      title: 'PRODUCED',
      width: 150,
    },
    {
      key: 'totalSold',
      title: 'SOLD',
      width: 120,
    },
    {
      key: 'availableStock',
      title: 'STOCK',
      width: 150,
    },
  ];

  return (
    <View style={styles.container}>
      {/* PDF BUTTON */}
      <View style={styles.buttonContainer}>
        <PdfButton title="Download Excel Report" onPress={handlePdfPress} />
      </View>

      {/* TABLE */}
      <View style={{ paddingHorizontal: 12 }}>
        <DataCard
          columns={columns}
          data={eggStockData}
          itemsPerPage={10}
        />
      </View>
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
});
