/**
 * ============================================================================
 * Dashboard
 * ----------------------------------------------------------------------------
 * Displays a frontend-only dashboard overview based on workspace items.
 * ============================================================================
 */

import {
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import type { TranslationKey } from "../../locales";

import type { WorkspaceItem } from "../workspace";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface DashboardProps {
    workspaceItems: WorkspaceItem[];
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

type Translate = (key: TranslationKey) => string;

function getDashboardItemTypeLabel(item: WorkspaceItem, t: Translate) {
    return item.type === "folder" ? t("folder") : t("file");
}

function getDashboardStatusLabel(item: WorkspaceItem, t: Translate) {
    if (item.status === "active") {
        return t("active");
    }

    if (item.status === "archived") {
        return t("archived");
    }

    return t("trash");
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Dashboard({
    workspaceItems,
}: DashboardProps) {
    const { t, theme } = useSettings();
    const colors = theme.colors;

    const { width } = useWindowDimensions();

    /**
     * Dashboard uses CSS viewport width, so phone screens need tighter spacing.
     */
    const isPhoneDashboard = width < 430;
    const isCompactDashboard = width < 920;

    const dashboardPadding = isPhoneDashboard
        ? spacing.sm
        : isCompactDashboard
            ? spacing.lg
            : spacing.xl;

    const activeItems = workspaceItems.filter((item) => item.status === "active");
    const folders = workspaceItems.filter((item) => item.type === "folder");
    const archivedItems = workspaceItems.filter((item) => item.status === "archived");
    const trashedItems = workspaceItems.filter((item) => item.status === "trashed");

    const recentItems = [...workspaceItems]
        .sort(
            (firstItem, secondItem) =>
                new Date(secondItem.updatedAt).getTime() -
                new Date(firstItem.updatedAt).getTime()
        )
        .slice(0, 4);

    const summaryCards = [
        {
            label: t("activeItems"),
            value: activeItems.length,
            description: t("activeItemsDescription"),
        },
        {
            label: t("folders"),
            value: folders.length,
            description: t("foldersDescription"),
        },
        {
            label: t("archive"),
            value: archivedItems.length,
            description: t("archivedItemsDescription"),
        },
        {
            label: t("trash"),
            value: trashedItems.length,
            description: t("trashedItemsDescription"),
        },
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    padding: dashboardPadding,
                    backgroundColor: colors.background,
                },
            ]}
        >
            <View
                style={[
                    styles.content,
                    {
                        padding: dashboardPadding,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {t("dashboard")}
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {t("dashboardSubtitle")}
                    </Text>
                </View>

                <View style={styles.summaryGrid}>
                    {summaryCards.map((card) => (
                        <View
                            key={card.label}
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.summaryLabel,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {card.label}
                            </Text>

                            <Text
                                style={[
                                    styles.summaryValue,
                                    {
                                        color: colors.primary,
                                    },
                                ]}
                            >
                                {card.value}
                            </Text>

                            <Text
                                style={[
                                    styles.summaryDescription,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {card.description}
                            </Text>
                        </View>
                    ))}
                </View>

                <View
                    style={[
                        styles.activityCard,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {t("recentActivity")}
                    </Text>

                    <View style={styles.activityList}>
                        {recentItems.map((item) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.activityItem,
                                    {
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <View style={styles.activityText}>
                                    <Text
                                        style={[
                                            styles.activityTitle,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {item.name}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.activityDescription,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {getDashboardItemTypeLabel(item, t)} · {getDashboardStatusLabel(item, t)}
                                    </Text>
                                </View>

                                <Text
                                    style={[
                                        styles.activityStatus,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    {getDashboardStatusLabel(item, t)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
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
        minWidth: 0,
        minHeight: 0,
    },

    content: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.sm,
    },

    header: {
        marginBottom: spacing.xl,
    },

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    subtitle: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    summaryGrid: {
        flexDirection: "row-reverse",
        flexWrap: "wrap",

        gap: spacing.lg,
    },

    summaryCard: {
        minWidth: 0,
        flexBasis: 180,
        flexGrow: 1,

        padding: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,
    },

    summaryLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    summaryValue: {
        marginTop: spacing.sm,

        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    summaryDescription: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",

        opacity: 0.64,
    },

    activityCard: {
        marginTop: spacing.xl,
        padding: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,
    },

    sectionTitle: {
        marginBottom: spacing.md,

        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    activityList: {
        gap: spacing.sm,
    },

    activityItem: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",

        gap: spacing.md,

        paddingVertical: spacing.sm,

        borderBottomWidth: 1,
    },

    activityText: {
        flex: 1,
        minWidth: 0,
    },

    activityTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    activityDescription: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",

        opacity: 0.6,
    },

    activityStatus: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "left",
    },
});
