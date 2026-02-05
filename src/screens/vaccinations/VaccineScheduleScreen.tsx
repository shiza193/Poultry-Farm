import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
import DropDownPicker from "react-native-dropdown-picker";
import {
    getVaccinationSchedule, VaccinationSchedule,
    VaccinationSchedulePayload, updateVaccinationStatus, getVaccines,
    addVaccinationSchedule, deleteVaccinationSchedule,
    updateVaccinationSchedule
} from "../../services/VaccinationService";
import { vsstyles } from "./style";
import { getFlocks } from "../../services/FlockService";
import { useBusinessUnit } from "../../context/BusinessContext";
import { showErrorToast, showSuccessToast } from "../../utils/AppToast";
import AddModal from "../../components/customPopups/AddModal";
import ConfirmationModal from "../../components/customPopups/ConfirmationModal";
import { useFocusEffect } from "@react-navigation/native";

interface Flock {
    flockId: string;
    flockRef: string;
    breed: string;
    remainingQuantity: number;
}
interface Props {
    openAddModal: boolean;
    onCloseAddModal: () => void;
    setGlobalLoading: (val: boolean) => void;
    onOpenAddModal: () => void;
}

const VaccineScheduleScreen: React.FC<Props> = ({
    openAddModal,
    onCloseAddModal,
    setGlobalLoading,
    onOpenAddModal,
}) => {
    const { businessUnitId } = useBusinessUnit();
    const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [tempSearch, setTempSearch] = useState<string>(""); const [flockOpen, setFlockOpen] = useState<boolean>(false);
    const [selectedFlock, setSelectedFlock] = useState<string | null>(null);
    const [flockItems, setFlockItems] = useState<{ label: string; value: string }[]>([]);
    const [vaccineItems, setVaccineItems] = useState<{ label: string; value: number }[]>([]);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [editingSchedule, setEditingSchedule] = useState<VaccinationSchedule | null>(null);

    // ===== FETCH SCHEDULES =====
    const fetchSchedules = async (pageNumber = 1, pageSize = 10) => {
        if (!businessUnitId) return;
        setGlobalLoading(true);
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
            setGlobalLoading(false);
        }
    };

    // 🔹 useFocusEffect ensures refresh on tab focus
    useFocusEffect(
        useCallback(() => {
            fetchSchedules();
            setSelectedFlock(null);
        }, [searchText, selectedFlock, businessUnitId])
    );

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
    const handleAddSchedule = async (data: any) => {
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
    const handleEditSchedule = async (data: any) => {
        if (!editingSchedule || !businessUnitId) return;
        const payload = {
            businessUnitId, 
            vaccineId: data.vaccineId,
            flockId: data.flockId,
            quantity: Number(data.quantity),
            scheduledDate: data.scheduledDate
                ? data.scheduledDate.toISOString().split("T")[0]
                : null,
        };
        try {
            const res = await updateVaccinationSchedule(
                editingSchedule.vaccinationScheduleId,
                payload
            );

            if (res.status === "Success") {
                showSuccessToast("Schedule updated successfully");
                fetchSchedules();        
            } else {
                showErrorToast( "Failed to update schedule");
            }
        } catch (error: any) {
            showErrorToast(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    };
    // ===== NEW DATA CARD COLUMNS =====
    const columns: TableColumn[] = [
        {
            key: "ref", title: "REF", isTitle: true, showDots: true,
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
                                ? Theme.colors.success
                                : Theme.colors.borderColor,
                            backgroundColor: row.isVaccinated
                                ? Theme.colors.success
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
        vaccineId: item.vaccineId,
        flockId: item.flockId,
        ref: item.ref,
        flockRef: item.flockRef,
        vaccine: item.vaccine,
        scheduledDate: item.scheduledDate,
        quantity: item.quantity,
        isVaccinated: item.isVaccinated,
    }));

    return (
        <View style={vsstyles.container}>
            <View style={vsstyles.container}>
                {/* ===== SEARCH + FLOCK DROPDOWN ===== */}
                <View style={vsstyles.filterRow}>
                    <View style={vsstyles.searchContainer}>
                        <TextInput
                            placeholder="Search vaccine..."
                            placeholderTextColor={Theme.colors.textSecondary}
                            value={tempSearch}
                            onChangeText={setTempSearch}
                            style={vsstyles.searchInput}
                        />

                        {/*  CLEAR ICON */}
                        {tempSearch.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    setTempSearch("");
                                    setSearchText("");
                                }}
                            >
                                <Image
                                    source={Theme.icons.close1}
                                    style={vsstyles.clearIcon}
                                />
                            </TouchableOpacity>
                        )}

                        {/* SEARCH ICON */}
                        <TouchableOpacity
                            onPress={() => setSearchText(tempSearch)}
                        >
                            <Image
                                source={Theme.icons.search}
                                style={vsstyles.searchIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={vsstyles.dropdownWrapper}>
                        <DropDownPicker
                            open={flockOpen}
                            value={selectedFlock}
                            items={flockItems}
                            setOpen={setFlockOpen}
                            setValue={setSelectedFlock}
                            setItems={setFlockItems}
                            placeholder=" Flock"
                            style={vsstyles.dropdown}
                            dropDownContainerStyle={vsstyles.dropdownContainer}
                            textStyle={vsstyles.dropdownText}
                        />
                    </View>
                </View>
                {(selectedFlock || searchText) && (
                    <View style={vsstyles.resetRow}>
                        <TouchableOpacity onPress={() => {
                            setSelectedFlock(null);
                        }}>
                            <Text style={vsstyles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* ===== DATA TABLE ===== */}
                <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 16 }}>
                    <DataCard
                        columns={columns}
                        data={tableData}
                        itemsPerPage={5}
                        renderRowMenu={(row, closeMenu) => (
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingSchedule(row);
                                        onOpenAddModal();
                                    }}
                                >
                                    <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600' }}>
                                        Edit
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        // Open delete confirmation
                                        setSelectedScheduleId(row.vaccinationScheduleId);
                                        setConfirmationVisible(true);
                                        closeMenu();
                                    }}
                                    style={{ marginTop: 8 }}
                                >
                                    <Text style={{ color: 'red', fontWeight: '600' }}>Delete </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>

            </View>

            <AddModal
                visible={openAddModal}
                type="vaccination Schedule"
                title={editingSchedule ? "Edit Vaccine Schedule" : "Add Vaccine Schedule"}
                onClose={() => {
                    setEditingSchedule(null);
                    onCloseAddModal();
                }}
                onSave={(data) => {
                    if (editingSchedule) {
                        handleEditSchedule(data);
                    } else {
                        handleAddSchedule(data);
                    }
                    setEditingSchedule(null);
                    onCloseAddModal();
                }}
                vaccineItems={vaccineItems}
                flockItems={flockItems}
                initialData={editingSchedule}
            />

            <ConfirmationModal
                visible={confirmationVisible}
                type="delete"
                title="Are you sure you want to delete this schedule?"
                onClose={() => setConfirmationVisible(false)}
                onConfirm={async () => {
                    if (!selectedScheduleId) return;
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
        </View>
    );
};

export default VaccineScheduleScreen;
