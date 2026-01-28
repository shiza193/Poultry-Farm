import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    StyleSheet,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import { CustomConstants } from "../../constants/CustomConstants";
import DataCard from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import DropDownPicker from "react-native-dropdown-picker";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import { getVaccinationSchedule, VaccinationSchedule, VaccinationSchedulePayload } from "../../services/VaccinationService";
import { vsstyles } from "./style";
import { getFlocks, } from "../../services/FlockService";
import ScreenTipCard from "../../components/customCards/ScreenTipCard";
interface Flock {
    flockId: string;
    flockRef: string;
    breed: string;
    remainingQuantity: number;
}
const VaccineScheduleScreen = () => {
    const activeScreen = CustomConstants.VACCINE_SCHEDULE_SCREEN;

    const [loading, setLoading] = useState<boolean>(true);
    const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [flockOpen, setFlockOpen] = useState<boolean>(false);
    const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
    const [flockItems, setFlockItems] = useState<{ label: string; value: string }[]>([]);
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);

    const headerLabels = {
        ref: "REF",
        flockRef: "FLOCK",
        vaccine: "VACCINATION NAME",
        scheduledDate: "SCHEDULED DATE",
        quantity: "QUANTITY",
        isVaccinated: "DONE",
    };
    const fetchSchedules = async (pageNumber = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const payload: VaccinationSchedulePayload = {
                searchKey: searchText || null,
                businessUnitId: "157cc479-dc81-4845-826c-5fb991bd3d47",
                flockId: selectedFlock || null,
                pageNumber,
                pageSize,
            };
            const res = await getVaccinationSchedule(payload);
            if (res.status === "Success") {
                setSchedules(res.data.list);
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSchedules();
    }, [searchText, selectedFlock]);
    const fetchFlocks = async () => {
        try {
            // API call
            const flocks: Flock[] = await getFlocks("157cc479-dc81-4845-826c-5fb991bd3d47");
            const dropdownData = flocks.map((f: Flock) => ({
                label: f.flockRef,
                value: f.flockId,
            }));

            setFlockItems(dropdownData);
        } catch (error) {
            console.error("Failed to fetch flocks:", error);
        }
    };
    useEffect(() => {
        fetchFlocks();
    }, []);

    return (
        <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
            <View style={vsstyles.container}>
                <LoadingOverlay visible={loading} text="Loading schedules..." />

                {/* ===== TOP ROW: SIDEBAR ICON + SCREEN NAME + DOTS ===== */}
                <View style={vsstyles.topRow}>
                    <Text style={vsstyles.topRowTitle}>Vaccination Schedule</Text>

                    <TouchableOpacity onPress={() => setIsDotsMenuVisible(!isDotsMenuVisible)}>
                        <Image source={Theme.icons.dots} style={vsstyles.dotsIcon} />
                    </TouchableOpacity>
                </View>
                <View style={vsstyles.tipCardContainer}>
                    <ScreenTipCard screen={CustomConstants.VACCINE_SCHEDULE_SCREEN} />
                </View>
                {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
                <View style={vsstyles.filterRow}>
                    <View style={vsstyles.searchContainer}>
                        <Image source={Theme.icons.search} style={vsstyles.searchIcon} />
                        <TextInput
                            placeholder="Search vaccine..."
                            value={searchText}
                            onChangeText={setSearchText}
                            style={vsstyles.searchInput}
                        />
                    </View>

                    <View style={vsstyles.dropdownWrapper}>
                        <DropDownPicker
                            open={flockOpen}
                            value={selectedFlock}
                            items={flockItems}
                            setOpen={setFlockOpen}
                            setValue={setSelectedFlock}
                            setItems={setFlockItems}
                            placeholder="Select Flock"
                            style={vsstyles.dropdown}
                            dropDownContainerStyle={vsstyles.dropdownContainer}
                            textStyle={vsstyles.dropdownText}
                        />
                    </View>
                </View>

                {/* ===== DOTS MENU MODAL ===== */}
                {isDotsMenuVisible && (
                    <TouchableOpacity
                        style={vsstyles.dotsOverlay}
                        activeOpacity={1}
                        onPress={() => setIsDotsMenuVisible(false)}
                    >
                        <View style={vsstyles.dotsMenu}>
                            <TouchableOpacity
                                style={vsstyles.dotsMenuItem}
                                onPress={() => Alert.alert("Add new vaccination")}
                            >
                                {/* Plus icon ke peeche light circle */}
                                <View style={[vsstyles.circleIcon, { backgroundColor: "#D7F4E2" }]}>
                                    <Image source={Theme.icons.plus} style={vsstyles.menuIconCustom} />
                                </View>
                                <Text style={vsstyles.dotsMenuText}>New schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                {/* ===== DATA TABLE WITH HORIZONTAL SCROLL ===== */}
                <ScrollView style={{ width: "100%", paddingHorizontal: 18 }}>
                    <ScrollView style={{ flex: 1, marginTop: 10 }}>
                        <DataCard isHeader labels={headerLabels} showVaccinationSchedule={true} />
                        {schedules.map((item) => (
                            <DataCard
                                key={item.vaccinationScheduleId}
                                showVaccinationSchedule={true}
                                refValue={item.ref}
                                vaccineflockValue={item.flockRef}
                                vaccinationNameValue={item.vaccine}
                                scheduledDateValue={item.scheduledDate.split("T")[0]}
                                vaccinationQuantityValue={item.quantity}
                                doneValue={item.isVaccinated}
                            />
                        ))}
                    </ScrollView>
                </ScrollView>
            </View>
        </SidebarWrapper>
    );
};

export default VaccineScheduleScreen;
