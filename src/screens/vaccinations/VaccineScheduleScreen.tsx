import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
} from "react-native";
import SidebarWrapper from "../../components/customButtons/SidebarWrapper";
import { CustomConstants } from "../../constants/CustomConstants";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import DropDownPicker from "react-native-dropdown-picker";
import LoadingOverlay from "../../components/loading/LoadingOverlay";
import {
    getVaccinationSchedule, VaccinationSchedule,
    VaccinationSchedulePayload, updateVaccinationStatus, getVaccines,
     addVaccinationSchedule,deleteVaccinationSchedule
} from "../../services/VaccinationService";
import { vsstyles } from "./style";
import { getFlocks } from "../../services/FlockService";
import ScreenTipCard from "../../components/customCards/ScreenTipCard";
import { useBusinessUnit } from "../../context/BusinessContext";
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import AddModal from "../../components/customPopups/AddModal";
import ConfirmationModal from "../../components/customPopups/ConfirmationModal";

interface Flock {
    flockId: string;
    flockRef: string;
    breed: string;
    remainingQuantity: number;
}

const VaccineScheduleScreen = () => {
    const activeScreen = CustomConstants.VACCINE_SCHEDULE_SCREEN;
    const { businessUnitId } = useBusinessUnit();

    const [loading, setLoading] = useState<boolean>(true);
    const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [flockOpen, setFlockOpen] = useState<boolean>(false);
    const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
    const [flockItems, setFlockItems] = useState<{ label: string; value: string }[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isDotsMenuVisible, setIsDotsMenuVisible] = useState(false);
    const [vaccineItems, setVaccineItems] = useState<{ label: string; value: number }[]>([]);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    // ===== FETCH SCHEDULES =====
    const fetchSchedules = async (pageNumber = 1, pageSize = 10) => {
        if (!businessUnitId) return;
        setLoading(true);
        try {
            const payload: VaccinationSchedulePayload = {
                searchKey: searchText || null,
                businessUnitId,
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
    }, [searchText, selectedFlock, businessUnitId]);

    // ===== FETCH FLOCKS =====
    const fetchFlocks = async () => {
        if (!businessUnitId) return;
        try {
            const flocks: Flock[] = await getFlocks(businessUnitId);
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
    }, [businessUnitId]);
    useEffect(() => {
        const fetchVaccines = async () => {
            const data = await getVaccines();
            setVaccineItems(data);
        };
        fetchVaccines();
    }, []);
    const handleSaveSchedule = async (data: any) => {
        if (!businessUnitId) {
            showErrorToast("Business Unit not found");
            return;
        }
        try {
            const payload = {
                businessUnitId,
                vaccineId: data.vaccineId,
                flockId: data.flockId,
                quantity: Number(data.quantity),
                scheduledDate: data.scheduledDate
                    ? data.scheduledDate.toISOString().split("T")[0]
                    : null,
            };
            console.log("📦 Final Payload:", payload);

            const res = await addVaccinationSchedule(payload);

            if (res.status === "Success") {
                showSuccessToast(res.message || "Vaccination Schedule added successfully");
                setShowModal(false);
                fetchSchedules();
            } else {
                const backendMsg =
                    res?.message ||
                    (res?.errors?.createDto ? res.errors.createDto.join(", ") : null) ||
                    "Failed to add schedule";
                showErrorToast(backendMsg);
            }
        } catch (error: any) {
            const backendMsg = error?.response?.data?.message || error?.message || "Something went wrong while adding schedule";
            showErrorToast(backendMsg);
        }
    };

    // ===== NEW DATA CARD COLUMNS =====
    const columns: TableColumn[] = [
        {
            key: "ref", title: "REF", isTitle: true, showDots: true,
            onDotsPress: (row) => {
                setSelectedScheduleId(row.vaccinationScheduleId);
                setConfirmationVisible(true);
            },
        },
        { key: "flockRef", title: "FLOCK" },
        { key: "vaccine", title: " NAME" },
        {
            key: "scheduledDate",
            title: "DATE",
            render: (val: string) => {
                const dateObj = new Date(val);
                const formatted = dateObj.toLocaleDateString("en-GB");
                return <Text>{formatted}</Text>;
            }
        },
        { key: "quantity", title: "QUANTITY" },
        {
            key: "isVaccinated",
            title: "DONE",
            width: 70,
            render: (val: boolean, row: any) => (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={async () => {
                        const newStatus = !row.isVaccinated;
                        setSchedules(prev =>
                            prev.map(item =>
                                item.vaccinationScheduleId === row.vaccinationScheduleId
                                    ? { ...item, isVaccinated: newStatus }
                                    : item
                            )
                        );

                        const success = await updateVaccinationStatus(
                            row.vaccinationScheduleId,
                            newStatus
                        );
                        if (success) {
                            showSuccessToast(
                                `Vaccination marked as ${newStatus ? "completed" : "incomplete"}`
                            );
                        } else {
                            // rollback
                            setSchedules(prev =>
                                prev.map(item =>
                                    item.vaccinationScheduleId === row.vaccinationScheduleId
                                        ? { ...item, isVaccinated: !newStatus }
                                        : item
                                )
                            );
                            showErrorToast("Failed to update vaccination status");
                        }
                    }}
                >
                    <View
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: row.isVaccinated
                                ? Theme.colors.buttonPrimary
                                : Theme.colors.borderColor,
                            backgroundColor: row.isVaccinated
                                ? Theme.colors.buttonPrimary
                                : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {row.isVaccinated && (
                            <Text style={{ color: Theme.colors.white, fontSize: 16, fontWeight: "bold" }}>
                                ✔
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            ),
        }
    ];
    const tableData = schedules.map(item => ({
        vaccinationScheduleId: item.vaccinationScheduleId,
        ref: item.ref,
        flockRef: item.flockRef,
        vaccine: item.vaccine,
        scheduledDate: item.scheduledDate,
        quantity: item.quantity,
        isVaccinated: item.isVaccinated,
    }));

    return (
        <SidebarWrapper activeScreen={activeScreen} setActiveScreen={() => { }}>
            <View style={vsstyles.container}>
                <LoadingOverlay visible={loading} text="Loading schedules..." />

                {/* ===== TOP ROW ===== */}
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
                                onPress={() => setShowModal(true)}                            >
                               
                                <Text style={vsstyles.dotsMenuText}> + New schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}

                {/* ===== DATA TABLE ===== */}
                <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 16 }}>
                    <DataCard columns={columns} data={tableData} />
                </View>
            </View>

            <AddModal
                visible={showModal}
                type="vaccination Schedule"
                title={"Add Vaccine Schedule"}
                onClose={() => setShowModal(false)}
                onSave={handleSaveSchedule}
                vaccineItems={vaccineItems}
                flockItems={flockItems}
            />
            <ConfirmationModal
                visible={confirmationVisible}
                type="delete" // ya custom type agar chahiye
                title="Are you sure you want to delete this schedule?"
                onClose={() => setConfirmationVisible(false)}
                onConfirm={async () => {
                    if (!selectedScheduleId) return;
                    // 🔹 call backend delete function
                    try {
                        const res = await deleteVaccinationSchedule(selectedScheduleId);
                        if (res.status === "Success") {
                            showSuccessToast("Schedule deleted successfully");
                            fetchSchedules();
                        } else {
                            showErrorToast(res.message || "Failed to delete schedule");
                        }
                    } catch (error: any) {
                        showErrorToast(error?.message || "Something went wrong");
                    } finally {
                        setConfirmationVisible(false);
                        setSelectedScheduleId(null);
                    }
                }}
            />
        </SidebarWrapper>
    );
};

export default VaccineScheduleScreen;
