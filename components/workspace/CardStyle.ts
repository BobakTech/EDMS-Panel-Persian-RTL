import { StyleSheet } from "../../web/ui";
import { radius, spacing, typography } from "../../theme";

export const cardStyles = StyleSheet.create({
    /**
     * ============================================================================
     * Selection / Pin Cluster
     * ============================================================================
     */

    cardActionCluster: {
        position: "absolute",
        top: spacing.sm,
        zIndex: 2,

        flexDirection: "row",
        alignItems: "center",

        gap: 6,
    },

    listCardActionCluster: {
        top: 11,
    },

    selectionButton: {
        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,

        transition:
            "transform 150ms ease, background-color 150ms ease, border-color 150ms ease, box-shadow 180ms ease",

        willChange:
            "transform, background-color, border-color, box-shadow",
    },

    pinnedIndicator: {
        width: 26,
        height: 26,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,

        transition:
            "transform 150ms ease, background-color 150ms ease, border-color 150ms ease",
    },

    pressedButton: {
        opacity: 0.82,
    },

    /**
     * ============================================================================
     * Card Content
     * ============================================================================
     */

    contentButton: {
        width: "100%",
        minWidth: 0,
        height: "100%",

        paddingHorizontal: spacing.md,
        paddingTop: 40,
        paddingBottom: 10,

        justifyContent: "flex-start",

        gap: 5,
    },

    listContentButton: {
        width: "100%",
        height: 52,
        minHeight: 0,

        flexDirection: "row",
        alignItems: "center",

        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: spacing.md,

        gap: spacing.sm,
    },

    ltrListContentButton: {
        paddingHorizontal: spacing.md,
    },

    iconMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",

        width: "100%",
        paddingHorizontal: 0,

        gap: 6,
    },

    listIconMetaRow: {
        width: "auto",
        flexShrink: 0,

        paddingHorizontal: 0,

        alignItems: "center",
        justifyContent: "flex-start",

        gap: spacing.sm,
    },

    ltrListIconMetaRow: {
        paddingHorizontal: 0,
    },

    itemIcon: {
        width: 28,
        height: 28,

        alignItems: "center",
        justifyContent: "center",
    },

    typePill: {
        maxWidth: 84,

        marginTop: 0,

        paddingHorizontal: 8,
        paddingVertical: 2,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    typePillText: {
        fontSize: typography.fontSize.xs,
        fontWeight:
            typography.fontWeight.semibold,

        textAlign: "center",
    },

    textArea: {
        flex: 1,

        width: "100%",
        minWidth: 0,

        alignItems: "flex-start",
        justifyContent: "flex-start",

        direction: "rtl",

        gap: 3,
    },

    listTextArea: {
        flex: 1,

        width: "auto",
        minWidth: 0,

        alignItems: "flex-start",
        justifyContent: "center",

        gap: 1,
    },

    name: {
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",

        fontSize:
            typography.fontSize.md,

        fontWeight:
            typography.fontWeight.bold,
    },

    listName: {
        width: "100%",
        minWidth: 0,

        fontWeight: 500,

        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    meta: {
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",

        marginTop: "auto",

        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.semibold,

        textAlign: "right",

        opacity: 0.56,
    },

    ltrListMeta: {
        width: "100%",

        marginTop: 0,
        paddingTop: 0,

        borderTopWidth: 0,

        opacity: 0.56,
    },
});
