import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import DataCard, { TableColumn } from "../../components/customCards/DataCard";
import Theme from "../../theme/Theme";
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
import SearchBar from "../../components/common/SearchBar";
import { Dropdown } from "react-native-element-dropdown";
import { formatDisplayDate } from "../../utils/validation";
import { normalizeDataFormat } from "../../utils/NormalizeDataFormat";

interface Flock {
    flockId: string;
    flockRef: string;
    breed: string;
    remainingQuantity: number;
}
interface Props {
    openAddModal: boolean;
    onCloseAddModal: () => void;
    onOpenAddModal: () => void;
}

const VaccineScheduleScreen: React.FC<Props> = ({
    openAddModal,
    onCloseAddModal,
    onOpenAddModal,
}) => {
    const { businessUnitId } = useBusinessUnit();
    const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterdataState, setFilterDataState] = useState({
        searchKey: "",
        flockId: null as string | null,
        flockItems: [] as { label: string; value: string }[],
        vaccineItems: [] as { label: string; value: number }[],
        editScheduleRecord: null as VaccinationSchedule | null,
        delteModal: false,
        selectedScheduleId: null as string | null,
    });
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    // ===== FETCH SCHEDULES =====
    const fetchSchedules = async (page = currentPage) => {
        if (!businessUnitId) return;
        setLoading(true);
        try {
            const payload: VaccinationSchedulePayload = {
                businessUnitId,
                searchKey: filterdataState.searchKey || null,
                flockId: filterdataState.flockId || null,
                pageNumber: page,
                pageSize: pageSize,
            };
            const res = await getVaccinationSchedule(payload);
            if (res.status === "Success") {
                // Normalize list in case backend changes format
                const scheduleList = normalizeDataFormat(res.data.list, 'array', 'Vaccination Schedule');
                setSchedules(scheduleList);
                setCurrentPage(page);
                setTotalCount(res.data.totalCount);
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchSchedules();
        }, [businessUnitId])
    );
    // ===== FETCH FLOCKS =====
    const fetchFlocks = async () => {
        if (!businessUnitId) return;
        try {
            const flocks: Flock[] = await getFlocks(businessUnitId);
            const normalizedFlocks: Flock[] = normalizeDataFormat(flocks, 'array', 'Flocks');
            const dropdownData = normalizedFlocks.map((f: Flock) => ({
                label: f.flockRef,
                value: f.flockId,
            }));
            setFilterDataState(prev => ({
                ...prev,
                flockItems: dropdownData,
            }));
        } catch (error) {
            console.error("Failed to fetch flocks:", error);
        }
    };
    const fetchVaccines = async () => {
        const vaccines = await getVaccines();
        const normalizedVaccines = normalizeDataFormat(vaccines, 'array', 'Vaccines');
        setFilterDataState(prev => ({
            ...prev,
            vaccineItems: normalizedVaccines,
        }));
    };
    useEffect(() => {
        fetchFlocks();
        fetchVaccines();
    }, [businessUnitId]);
    useEffect(() => {
        fetchSchedules();
    }, [filterdataState.searchKey, filterdataState.flockId]);
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
            console.log(" Final Payload:", payload);

            const res = await addVaccinationSchedule(payload);

            if (res.status === "Success") {
                setSchedules(prev => [...prev, res.data]);
                setTotalCount(prev => prev + 1);
                setCurrentPage(1);
                showSuccessToast("Vaccination Schedule added successfully");
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
        if (!filterdataState.editScheduleRecord || !businessUnitId) return;
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
                filterdataState.editScheduleRecord!.vaccinationScheduleId,
                payload
            );
            if (res.status === 'Success') {
                setSchedules(prev =>
                    prev.map(v => v.vaccinationScheduleId === payload.vaccineId ? res.data : v)
                );
                showSuccessToast("Schedule updated successfully");
                fetchSchedules();
            } else {
                showErrorToast("Failed to update schedule");
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
        { key: "flockRef", title: "FLOCK", width: 150 },
        { key: "vaccine", title: " NAME" },
        {
            key: "scheduledDate",
            title: "DATE",
            render: (val: string) => <Text>{formatDisplayDate(val)}</Text>
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
                    <View style={{ flex: 1 }}>
                        <SearchBar
                            placeholder="Search Ref,Flock vaccine..."
                            onSearch={(value) => setFilterDataState({ ...filterdataState, searchKey: value })}
                        />
                    </View>
                    <View style={vsstyles.dropdownWrapper}>
                        <Dropdown
                            style={vsstyles.inlineDropdown}
                            containerStyle={vsstyles.inlineDropdownContainer}
                            selectedTextStyle={vsstyles.dropdownText}
                            data={
                                filterdataState.flockItems.length > 0
                                    ? filterdataState.flockItems
                                    : [{ label: "No result found", value: null, disabled: true }]
                            }
                            labelField="label"
                            valueField="value"
                            placeholder={loading ? 'Loading...' : ' Flock'}
                            value={filterdataState.flockId}
                            onChange={(item) =>
                                setFilterDataState(prev => ({
                                    ...prev,
                                    flockId: item.value
                                }))
                            } />
                    </View>
                </View>
                {(filterdataState.flockId) && (
                    <View style={vsstyles.resetRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setFilterDataState(prev => ({
                                    ...prev,
                                    flockId: null,
                                }));
                            }}
                        >
                            <Text style={vsstyles.resetText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* ===== DATA TABLE ===== */}
                <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 16 }}>
                    <DataCard
                        columns={columns}
                        data={tableData}
                        loading={loading}
                        itemsPerPage={pageSize}
                        currentPage={currentPage}
                        totalRecords={totalCount}
                        onPageChange={page => {
                            setCurrentPage(page);
                            fetchSchedules(page);
                        }}
                        renderRowMenu={(row, closeMenu) => (
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setFilterDataState(prev => ({
                                            ...prev,
                                            editScheduleRecord: row,
                                        }));
                                        onOpenAddModal();
                                    }}
                                    style={{ marginBottom: 8 }}
                                >
                                    <Text style={{ color: Theme.colors.textPrimary, fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Edit</Text>
                                </TouchableOpacity>
                                <View style={vsstyles.menuSeparator} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setFilterDataState(prev => ({
                                            ...prev,
                                            selectedScheduleId: row.vaccinationScheduleId,
                                            delteModal: true,
                                        }));
                                        closeMenu();
                                    }}
                                    style={{ marginTop: 8 }}
                                >
                                    <Text style={{ color: 'red', fontWeight: '600', fontSize: 16, marginLeft: 20 }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </View>
            <AddModal
                visible={openAddModal}
                type="vaccination Schedule"
                title={filterdataState.editScheduleRecord ? "Edit Vaccine Schedule" : "Add Vaccine Schedule"}
                onClose={() => {
                    setFilterDataState(prev => ({ ...prev, editScheduleRecord: null }));
                    onCloseAddModal();
                }}
                onSave={(data) => {
                    if (filterdataState.editScheduleRecord) {
                        handleEditSchedule(data);
                    } else {
                        handleAddSchedule(data);
                    }
                    setFilterDataState(prev => ({ ...prev, editScheduleRecord: null }));
                    onCloseAddModal();
                }}
                vaccineItems={filterdataState.vaccineItems}
                flockItems={filterdataState.flockItems}
                initialData={filterdataState.editScheduleRecord}
            />
            <ConfirmationModal
                visible={filterdataState.delteModal}
                type="delete"
                title="Are you sure you want to delete this schedule?"
                onClose={() =>
                    setFilterDataState(prev => ({
                        ...prev,
                        delteModal: false,
                    }))
                }
                onConfirm={async () => {
                    if (!filterdataState.selectedScheduleId) return;
                    try {
                        const res = await deleteVaccinationSchedule(filterdataState.selectedScheduleId);
                        if (res.status === "Success") {
                            showSuccessToast("Schedule deleted successfully");
                            setSchedules(prev =>
                                prev.filter(s => s.vaccinationScheduleId !== filterdataState.selectedScheduleId)
                            );
                            setTotalCount(prev => prev - 1)
                        } else {
                            showErrorToast(res.message || "Failed to delete schedule");
                        }
                    } catch (error: any) {
                        showErrorToast(error?.message || "Something went wrong");
                    } finally {
                        setFilterDataState(prev => ({
                            ...prev,
                            delteModal: false,
                            selectedScheduleId: null,
                        }));
                    }
                }}
            />
        </View>
    );
};
export default VaccineScheduleScreen;
