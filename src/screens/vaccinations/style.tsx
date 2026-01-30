import { StyleSheet } from "react-native";
import Theme from "../../theme/Theme";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    tipCardContainer: { marginTop: 20 },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Theme.colors.white,
        width: "100%",
    },
    topRowTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: Theme.colors.textPrimary,
        flex: 1,
        textAlign: "center",
    },
    friendIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Theme.colors.borderColor,
        overflow: "hidden",
    },
    friendIcon: { width: 30, height: 30, resizeMode: "contain" },
    dotsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
    },
    dotsMenu: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: Theme.colors.white,
        borderRadius: 10,
        padding: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dotsMenuItemCustom: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    menuItemRowCustom: { flexDirection: "row", alignItems: "center" },
    circleIcon: {
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuIconCustom: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },
    dotsMenuText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 6,
        gap: 10,
    },

    /* ===== SEARCH ===== */
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Theme.colors.success,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 42,
        flex: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    searchIcon: {
        width: 22,
        height: 22,
        tintColor: Theme.colors.success,
    },
    clearIcon: {
        width: 18,
        height: 18,
        marginRight: 6,
        tintColor: Theme.colors.success,
    },

    /* ===== DROPDOWN ===== */
    dropdownWrapper: {
        width: 120,
    },
    dropdown: {
        borderColor: Theme.colors.success,
        borderRadius: 10,
        height: 42,
        minHeight: 42,
        justifyContent: "center",
        paddingVertical: 0,
    },
    dropdownContainer: {
        borderColor: Theme.colors.borderColor,
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 14,
        color: Theme.colors.success,
    },
});
export default styles

export const vsstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    tipCardContainer: { marginTop: 30 },
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
    dotsIcon: {
        width: 22, height: 22, tintColor: Theme.colors.black,
        borderColor: Theme.colors.borderColor,
        marginRight: 20
    },
    // ===== SEARCH + DROPDOWN ROW =====
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
        paddingVertical: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Theme.colors.success,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginRight: 10,
        backgroundColor: Theme.colors.white,
    },
    searchIcon: { width: 18, height: 18, tintColor: Theme.colors.success, marginRight: 6 },
    searchInput: { flex: 1, fontSize: 14, color: Theme.colors.black },
    clearIcon: {
        width: 18,
        height: 18,
        marginRight: 6,
        tintColor: Theme.colors.success,
    },
    dropdownWrapper: { width: 120, zIndex: 2000 },
    dropdown: {
        borderColor: Theme.colors.success, height: 40,
        minHeight: 40,
    },
    dropdownContainer: { borderColor: Theme.colors.success },
    dropdownText: { color: Theme.colors.black },

    // ===== DOTS MENU =====
    dotsOverlay: {
        position: "absolute",
        top: 50,
        right: 20,
        left: 0,
        bottom: 0,
        zIndex: 3000,
    },
    dotsMenu: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 160,
        backgroundColor: Theme.colors.white,
        borderRadius: 6,
        shadowColor: Theme.colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        paddingVertical: 6,
        zIndex: 3000,
    },
    circleIcon: {
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuIconCustom: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },
    dotsMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    dotsMenuText: {
        fontSize: 14,
        color: Theme.colors.black,
    },

});

export const stockstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        justifyContent: "center",
        position: "relative",
    },
    tipCardContainer: { marginTop: 30 },

    title: {
        fontSize: 18,
        fontWeight: "700",
        color: Theme.colors.black,
        textAlign: "center",
    },
    dotsIconContainer: {
        position: "absolute",
        right: 0,
        padding: 8,
    },
    dotsIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    dotsOverlay: {
        position: "absolute",
        top: 60,
        right: 20,
        width: "100%",
        height: "100%",
        zIndex: 10,
    },
    dotsMenu: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 160,
        backgroundColor: Theme.colors.white,
        borderRadius: 8,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },
    dotsMenuItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    circleIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    menuIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
    },
    menuText: {
        fontSize: 14,
        fontWeight: "600",
        color: Theme.colors.textPrimary,
    },
});

