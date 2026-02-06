import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image } from "react-native";
import  Theme  from "../../theme/Theme";

interface Column {
    key: string;
    label: string;
    width?: number;
    render?: (value: any, row?: any) => React.ReactNode;
}
interface CommonTableProps {
    title: string;
    buttonText?: string;
    onAddPress?: () => void;
    columns: Column[];
    data: any[];
    onEditPress?: (row: any) => void;
    onDeletePress?: (row: any) => void;
}
const CommonTable: React.FC<CommonTableProps> = ({
    title,
    buttonText = "Add New Record",
    onAddPress,
    columns,
    data,
    onEditPress,
    onDeletePress,
}) => {
    return (
        <View style={styles.container}>

            <View style={styles.headerRow}>
                <Text style={styles.title}>{title}</Text>
                {onAddPress && (
                    <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                        <Text style={styles.addButtonText}>+ {buttonText}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.table}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                        <View style={styles.tableHead}>
                            {columns.map((col) => (
                                <Text key={col.key} style={[styles.headText, { width: col.width || 120 }]}  >
                                    {col.label}
                                </Text>
                            ))}
                            {(onEditPress || onDeletePress) && (
                                <Text style={[styles.headText, { width: 90 }]}>Action</Text>
                            )}
                        </View>
                        <FlatList
                            data={data}
                            scrollEnabled={false}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.row}>
                                    {columns.map((col) => {
                                        const content = col.render
                                            ? col.render(item[col.key], item)
                                            : item[col.key];
                                        return (
                                            <View key={col.key} style={{ width: col.width || 120 }}   >
                                                {typeof content === "string" ||
                                                    typeof content === "number" ? (
                                                    <Text style={styles.rowText}>
                                                        {content || "—"}
                                                    </Text>
                                                ) : (content)}
                                            </View>
                                        );
                                    })}

                                    {(onEditPress || onDeletePress) && (
                                        <View style={[styles.actionCell, { width: 90 }]}>
                                            {onEditPress && (
                                                <TouchableOpacity onPress={() => onEditPress(item)} hitSlop={12}>
                                                    <Image
                                                        source={Theme.icons.edit}
                                                        style={{ width: 18, height: 18, tintColor: Theme.colors.blue }}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            {onDeletePress && (
                                                <TouchableOpacity onPress={() => onDeletePress(item)} hitSlop={12}>
                                                    <Image
                                                        source={Theme.icons.delete}
                                                        style={{ width: 18, height: 18, tintColor: "red" }}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default CommonTable;

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: Theme.colors.black,
    },
    addButton: {
        backgroundColor: Theme.colors.blue,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    addButtonText: {
        color: Theme.colors.white,
        fontWeight: "normal",
        fontSize: 13,
    },
    table: {
        backgroundColor: Theme.colors.white,
        borderRadius: 14,
        overflow: "hidden",
    },
    tableHead: {
        flexDirection: "row",
        backgroundColor: Theme.colors.haedercolor,
        paddingVertical: 12,
        paddingHorizontal: 16,
        columnGap: 12,
    },
    headText: {
        fontSize: 12,
        fontWeight: "600",
        color: Theme.colors.success,
        textTransform: "uppercase",
    },
    row: {
        flexDirection: "row",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.borderColor,
        columnGap: 15,
        alignItems: "center",
    },
    rowText: {
        fontSize: 14,
        color: Theme.colors.black,
    },
    actionCell: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    editText: {
        color: Theme.colors.blue,
        fontWeight: "600",
    },
    deleteText: {
        color: "red",
        fontWeight: "600",
    },
});
