import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Theme from '../../theme/Theme';

const EggProductionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Egg Production</Text>

   
    </View>
  );
};

export default EggProductionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
     marginTop:80,
     padding:12,
 
  },
});
