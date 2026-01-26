import { StyleSheet } from "react-native";
import Theme from "../../theme/Theme";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
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
        borderColor: Theme.colors.borderLight,
        overflow: "hidden",
    },
    friendIcon: { width: 30, height: 30, resizeMode: "contain" },
    dotsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
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
        marginBottom: 10,
        gap: 10,
        zIndex: 1000,
    },

    /* ===== SEARCH ===== */
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: Theme.colors.white,
        height: 45,
        position: "relative", 
        zIndex: 10,
    },
    searchIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },

    /* ===== DROPDOWN ===== */
    dropdownWrapper: {
        width: 150,
        zIndex: 2000,
    },
    dropdown: {
        borderColor: Theme.colors.borderLight,
        borderRadius: 10,
        height: 45,
    },
    dropdownContainer: {
        borderColor: Theme.colors.borderLight,
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
});

export default styles