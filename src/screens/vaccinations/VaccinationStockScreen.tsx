import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomConstants } from "../../constants/CustomConstants";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";

const VaccinationStockScreen = () => {
 const activeScreen = CustomConstants.VACCINATION_STOCK_SCREEEN;
    return (
        <View style={styles.container}>
            <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
      <Text style={styles.title}>Comming soon</Text>
      </SidebarWrapper>
      </View>
  );
};

export default VaccinationStockScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
});
