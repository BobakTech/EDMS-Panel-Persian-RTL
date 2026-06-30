/**
 * ============================================================================
 * App Layout
 * ----------------------------------------------------------------------------
 * Defines the primary layout of the application.
 * ============================================================================
 */

import { StyleSheet, View } from "react-native";

import { spacing } from "../../theme";

import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";

import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AppLayout() {
    return (
        <View style={styles.container}>
            <Sidebar />

            <View style={styles.main}>
                <Toolbar />
                <Workspace />
            </View>
        </View>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row-reverse",
    },

    main: {
        flex: 1,

        marginRight: spacing.lg,
    },
});