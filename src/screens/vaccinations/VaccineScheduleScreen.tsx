import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import { CustomConstants } from "../../constants/CustomConstants";

const VaccineScheduleScreen = () => {
    const activeScreen = CustomConstants.VACCINE_SCHEDULE_SCREEN;
    return (
        <View style={styles.container}>
            <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
                <Text style={styles.title}>Coming soon</Text>
            </SidebarWrapper>
        </View>
    );
};
export default VaccineScheduleScreen;

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
