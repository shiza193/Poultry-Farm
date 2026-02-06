import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, } from "react-native";
import Theme from "../../theme/Theme";
import CommonTable from "./Table";

type DetailItem = {
    label: string;
    value: string;
};

type Props = {
    visible: boolean;
    title: string;
    onClose: () => void;

    leftDetails: DetailItem[];
    rightDetails: DetailItem[];

    tableColumns: any[];
    tableData: any[];
};

const ReusableDetailsModal = ({
    visible,
    title,
    onClose,
    leftDetails,
    rightDetails,
    tableColumns,
    tableData,
}: Props) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Top Details */}
                        <View style={styles.detailsRow}>
                            <View style={styles.column}>
                                {leftDetails.map((item, i) => (
                                    <View key={i} style={styles.detailItem}>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.column}>
                                {rightDetails.map((item, i) => (
                                    <View key={i} style={styles.detailItem}>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Voucher Entries Table */}
                        <CommonTable
                            title="Voucher Entries"
                            columns={tableColumns}
                            data={tableData}
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ReusableDetailsModal;
 const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "94%",
        maxHeight: "92%",
        backgroundColor: Theme.colors.background,
        borderRadius: 14,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Theme.colors.black,
    },
    close: {
        fontSize: 22,
        fontWeight: "bold",
    },
    detailsRow: {
        flexDirection: "row",
        marginVertical: 18,
    },
    column: {
        flex: 1,
    },
    detailItem: {
        marginBottom: 12,
    },
    label: {
        color: Theme.colors.success,
        fontWeight: "600",
    },
    value: {
        color: Theme.colors.black,
    },
});