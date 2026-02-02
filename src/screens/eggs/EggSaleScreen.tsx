import React from 'react';
import { View, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard, { TableColumn } from '../../components/customCards/DataCard';

const EggSaleScreen = () => {
  const eggSales = [
    {
      date: '01/04/2026',
      customerName: 'John Doe',
      gram: 250,
      price: 500,
      quantity: 10,
    },
    {
      date: '01/09/2026',
      customerName: 'Jane Smith',
      gram: 300,
      price: 600,
      quantity: 12,
    },
  ];

  // ✅ TABLE COLUMNS
  const columns: TableColumn[] = [
    {
      key: 'date',
      title: 'DATE',
      width: 120,
      isTitle: true,
    },
    {
      key: 'customerName',
      title: 'CUSTOMER',
      width: 160,
    },
    {
      key: 'gram',
      title: 'GRAM',
      width: 100,
    },
    {
      key: 'price',
      title: 'PRICE',
      width: 100,
      render: (value) => `Rs ${value}`,
    },
    {
      key: 'quantity',
      title: 'QUANTITY',
      width: 80,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 12, marginTop: 60 }}>
        <DataCard
          columns={columns}
          data={eggSales}
          itemsPerPage={10}
        />
      </View>
    </View>
  );
};

export default EggSaleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
});
