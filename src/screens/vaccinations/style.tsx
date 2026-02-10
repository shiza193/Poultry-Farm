import { StyleSheet } from "react-native";
import Theme from "../../theme/Theme";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 6,
        gap: 10,
    },
    /* ===== DROPDOWN ===== */
    dropdownWrapper: {
        width: 120,
    },
    dropdown: {
        borderColor: Theme.colors.success,
        borderRadius: 10,
        height: 40,
        minHeight: 40,
        justifyContent: "center",
        paddingVertical: 0,
    },
    dropdownContainer: {
        borderColor: Theme.colors.borderColor,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    resetRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        marginTop: 4,
        marginBottom: 4,
    },
    resetText: {
        color: Theme.colors.error,
        fontSize: 13,
        marginRight: 5,
        fontWeight: "500",
    },
});
export default styles

export const vsstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    // ===== TOP ROW =====
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
    sidebarIcon: { width: 24, height: 24, tintColor: Theme.colors.black },
    topRowTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: Theme.colors.black,
    },
    // ===== SEARCH + DROPDOWN ROW =====
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        paddingVertical: 8,
        gap: 10,
    },
    dropdownWrapper: { width: 120, zIndex: 2000 },
    dropdown: {
        borderColor: Theme.colors.success, height: 40,
        minHeight: 40,
    },
    dropdownContainer: { borderColor: Theme.colors.success },
    dropdownText: { color: Theme.colors.black },
    resetRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        marginTop: 4,
    },
    resetText: {
        fontSize: 13,
        fontWeight: "500",
        color: Theme.colors.error,
    },
});

export const stockstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
});

