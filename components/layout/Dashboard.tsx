/**
 * ============================================================================
 * Dashboard
 * ----------------------------------------------------------------------------
 * Displays a frontend-only dashboard overview based on workspace items.
 * ============================================================================
 */

import { StyleSheet, Text, View } from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

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
 * Component
 * ============================================================================
 */

export default function Dashboard({
    workspaceItems,
}: DashboardProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

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
            label: "Active Items",
            value: activeItems.length,
            description: "Files and folders in workspace",
        },
        {
            label: "Folders",
            value: folders.length,
            description: "Organized document groups",
        },
        {
            label: "Archived",
            value: archivedItems.length,
            description: "Stored for later review",
        },
        {
            label: "Trash",
            value: trashedItems.length,
            description: "Waiting for restore or delete",
        },
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <View
                style={[
                    styles.content,
                    {
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
                        Dashboard
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        نمای کلی وضعیت اسناد، پوشه‌ها و فعالیت‌های اخیر
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
                        Recent Activity
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
                                <View>
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
                                        {item.type === "folder" ? "Folder" : "File"} · {item.status}
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
                                    {item.type === "folder" ? "Folder" : "File"}
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

        padding: spacing.xl,
    },

    content: {
        flex: 1,

        padding: spacing.xl,

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
        width: 220,

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

        paddingVertical: spacing.sm,

        borderBottomWidth: 1,
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
    },
});
