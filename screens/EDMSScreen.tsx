/**
 * ============================================================================
 * Screen: EDMSScreen
 * ----------------------------------------------------------------------------
 * Root screen of the Enterprise Document Management System (EDMS).
 * This screen will gradually evolve into the complete desktop interface.
 * ============================================================================
 */

import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function EDMSScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text>EDMS</Text>
        </SafeAreaView>
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
        justifyContent: "center",
        alignItems: "center",
    },
});