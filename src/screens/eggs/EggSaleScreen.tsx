import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';
import DataCard from '../../components/customCards/DataCard';

const EggSaleScreen = () => {
  // Example Egg Sale data
  const eggSales = [
    {
      date: '01/4/2026',
      customerName: 'John Doe',
      gram: 250,
      price: 500,
      quantity: 10,
    },
    {
      date: '01/9/2026',
      customerName: 'Jane Smith',
      gram: 300,
      price: 600,
      quantity: 12,
    },
  ];

  return (
    <View style={styles.container}>
   <ScrollView horizontal>
  <View style={{ paddingHorizontal: 12, marginTop: 60 }}>
    {/* Header Row */}
    <DataCard
      isHeader
      showEggSale
      labels={{
        eggSaleDate: 'Date',
        eggSaleCustomerName: 'Customer',
        eggSaleGram: 'Gram',
        eggSalePrice: 'Price',
        eggSaleQuantity: 'Quantity',
      }}
    />

    {/* Data Rows */}
    {eggSales.map((sale, index) => (
      <DataCard
        key={index}
        showEggSale
        eggSaleDate={sale.date}
        eggSaleCustomerName={sale.customerName}
        eggSaleGram={sale.gram}
        eggSalePrice={sale.price}
        eggSaleQuantity={sale.quantity}
      />
    ))}
  </View>
</ScrollView>

    </View>
  );
};

export default EggSaleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 20,
  },
});
