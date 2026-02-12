import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Theme from '../../theme/Theme';

interface Farm {
    id: number;
    name: string;
    isAdded?: boolean;
    userRoleId?: number | null;
}

interface Role {
    label: string;
    id: string;
}
interface Props {
    visible: boolean;
    farms: Farm[];
    roleItems: Role[];

    getUserRoles: () => Promise<any[]>;
    onClose: () => void;
    onSave: (data: any) => void;
}
const AssignFarmRoleModal: React.FC<Props> = ({
    visible,
    farms,
    roleItems,
    onClose,
    onSave,
}) => {
    const [selected, setSelected] = useState<any>({});
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        if (!visible || !farms || farms.length === 0) return;

        // Reset selected for every modal open
        const preSelected: any = {};
        farms.forEach((farm) => {
            preSelected[farm.id] = {
                checked: farm.isAdded ?? false,
                roleId: farm.userRoleId ?? null,
            };
        });
        setSelected(preSelected);
        // Reset dropdown opens
        setOpenDropdowns({});
    }, [farms, visible]);
    const toggleFarm = (farmId: number) => {
        setSelected((prev: any) => ({
            ...prev,
            [farmId]: {
                checked: !prev?.[farmId]?.checked,
                roleId: prev?.[farmId]?.roleId ?? null,
            },
        }));
    };

    const setRole = (farmId: number, roleId: number) => {
        setSelected((prev: any) => ({
            ...prev,
            [farmId]: {
                ...prev[farmId],
                roleId,
            },
        }));
    };

    const toggleDropdown = (farmId: number) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [farmId]: !prev[farmId],
        }));
    };
    const isSaveDisabled = !Object.values(selected).some(
        (item: any) => item.checked && item.roleId
    );
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Assign poultry farm and role</Text>
                    </View>

                    {/* TABLE HEADER */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.colFarm}>POULTRY FARM</Text>
                        <Text style={styles.colRole}>ROLE</Text>
                    </View>
                    {/* ROWS */}
                    {farms.map((farm, index) => (
                        <View
                            key={farm.id}
                            style={[
                                styles.row,
                                { zIndex: farms.length - index },
                            ]}
                        >
                            {/* CHECKBOX */}
                            <TouchableOpacity
                                style={[
                                    styles.checkbox,
                                    selected?.[farm.id]?.checked && {
                                        backgroundColor: Theme.colors.buttonPrimary,
                                    },
                                ]}
                                onPress={() => toggleFarm(farm.id)}
                            >
                                {selected?.[farm.id]?.checked && (
                                    <Text style={styles.tick}>✓</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.farmText}>{farm.name}</Text>
                            {/* DROPDOWN */}
                            <View style={styles.roleCol}>
                                <DropDownPicker
                                    open={openDropdowns[farm.id] || false}
                                    value={selected?.[farm.id]?.roleId}
                                    items={roleItems || []}
                                    placeholder="User Role"
                                    setOpen={() => toggleDropdown(farm.id)}
                                    setValue={cb =>
                                        setRole(farm.id, cb(selected?.[farm.id]?.roleId))
                                    }
                                    listMode="SCROLLVIEW"
                                    dropDownDirection="BOTTOM"
                                    style={[
                                        styles.dropdown,
                                        !selected?.[farm.id]?.checked && { opacity: 0.5 }, 
                                    ]}
                                    dropDownContainerStyle={styles.dropdownBox}
                                    textStyle={{ fontSize: 12 }}
                                    disabled={!selected?.[farm.id]?.checked}
                                />
                            </View>
                        </View>
                    ))}

                    {/* FOOTER */}
                    <View style={styles.footer}>

                        {/* DISCARD BUTTON */}
                        <TouchableOpacity
                            style={styles.discardBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.discardText}>Discard</Text>
                        </TouchableOpacity>

                        {/* SAVE BUTTON */}
                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                isSaveDisabled && { backgroundColor: Theme.colors.buttonDisabled },
                            ]}
                            onPress={() => onSave(selected)}
                            disabled={isSaveDisabled}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AssignFarmRoleModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '92%',
        backgroundColor: Theme.colors.white,
        borderRadius: 14,
        padding: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    close: {
        fontSize: 18,
        fontWeight: '700',
    },
    tableHeader: {
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: '#2F855A',
        padding: 10,
        borderRadius: 8,
    },
    colFarm: {
        flex: 1,
        color: Theme.colors.white,
        fontWeight: '700',
    },
    colRole: {
        width: 110,
        color: Theme.colors.white,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.borderLight,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Theme.colors.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    tick: {
        color: Theme.colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
    farmText: {
        fontSize: 14,
        flex: 1,
    },
    roleCol: {
        width: 110,
    },
    dropdown: {
        height: 32,
        borderRadius: 6,
        borderWidth: 0,
    },
    dropdownBox: {
        borderRadius: 6,
        borderColor: Theme.colors.borderColor,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 14,
    },
    saveBtn: {
        backgroundColor: Theme.colors.buttonPrimary,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveText: {
        color: Theme.colors.white,
        fontWeight: '700',
    },
    discardBtn: {
        borderWidth: 1,
        borderColor: Theme.colors.buttonPrimary,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 10,
    },

    discardText: {
        color: Theme.colors.buttonPrimary,
        fontWeight: '700',
    },
});
