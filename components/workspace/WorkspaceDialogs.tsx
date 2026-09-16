import type { ReactNode } from "react";
import { Feather } from "../../web/icons";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "../../web/ui";
import { radius, semanticColors, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import type { WorkspaceItem } from "./workspace.types";
import Tooltip from "../common/Tooltip";

interface WorkspaceDialogFrameProps {
    visible: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
}

function WorkspaceDialogFrame({
    visible,
    title,
    description,
    onClose,
    children,
}: WorkspaceDialogFrameProps) {
    const { direction, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            direction,
                        },
                    ]}
                >
                    <Text style={[styles.modalTitle, { color: colors.text, textAlign }]}>
                        {title}
                    </Text>

                    {description !== undefined && (
                        <Text
                            style={[
                                styles.modalDescription,
                                { color: colors.text, textAlign },
                            ]}
                        >
                            {description}
                        </Text>
                    )}

                    {children}
                </View>
            </View>
        </Modal>
    );
}

interface WorkspaceDeleteDialogProps {
    visible: boolean;
    onMoveToTrash: () => void;
    onArchive: () => void;
    onCancel: () => void;
}

export function WorkspaceDeleteDialog({
    visible,
    onMoveToTrash,
    onArchive,
    onCancel,
}: WorkspaceDeleteDialogProps) {
    const { t, theme } = useSettings();
    const colors = theme.colors;

    return (
        <WorkspaceDialogFrame
            visible={visible}
            title={t("selectedItemActionsTitle")}
            description={t("selectedItemActionsDescription")}
            onClose={onCancel}
        >
            <View style={styles.modalActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("moveToTrash")}
                    onPress={onMoveToTrash}
                    style={[
                        styles.modalDangerButton,
                        { backgroundColor: semanticColors.destructive },
                    ]}
                >
                    <Text style={[styles.modalDangerButtonText, { color: colors.surface }]}>
                        {t("moveToTrash")}
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("archiveItem")}
                    onPress={onArchive}
                    style={styles.modalTextButton}
                >
                    <Text style={[styles.modalTextButtonText, { color: colors.primary }]}>
                        {t("archive")}
                    </Text>
                </Pressable>

                <View style={styles.modalActionSpacer} />

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cancel")}
                    onPress={onCancel}
                    style={styles.modalTextButton}
                >
                    <Text style={[styles.modalTextButtonText, { color: colors.text }]}>
                        {t("cancel")}
                    </Text>
                </Pressable>
            </View>
        </WorkspaceDialogFrame>
    );
}

interface WorkspaceRenameDialogProps {
    visible: boolean;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function WorkspaceRenameDialog({
    visible,
    value,
    onChange,
    onSave,
    onCancel,
}: WorkspaceRenameDialogProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    return (
        <WorkspaceDialogFrame
            visible={visible}
            title={t("renameItem")}
            onClose={onCancel}
        >
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={t("newNamePlaceholder")}
                placeholderTextColor={colors.text}
                style={[
                    styles.renameInput,
                    {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        textAlign,
                    },
                ]}
            />

            <View style={styles.modalActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("saveNewName")}
                    onPress={onSave}
                    style={[
                        styles.modalPrimaryButton,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    <Text style={[styles.modalPrimaryButtonText, { color: colors.surface }]}>
                        {t("save")}
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cancelRename")}
                    onPress={onCancel}
                    style={styles.modalTextButton}
                >
                    <Text style={[styles.modalTextButtonText, { color: colors.text }]}>
                        {t("cancel")}
                    </Text>
                </Pressable>
            </View>
        </WorkspaceDialogFrame>
    );
}

interface WorkspaceMoveDialogProps {
    visible: boolean;
    value: string;
    isOpen: boolean;
    destinationFolders: WorkspaceItem[];
    outsideFolderDestinationId: string;
    isOutsideFolderVisible: boolean;
    canSave: boolean;
    isDestinationDisabled: (destinationId: string) => boolean;
    onFocus: () => void;
    onChange: (query: string) => void;
    onToggle: () => void;
    onSelectOutsideFolder: () => void;
    onSelectDestination: (destinationId: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function WorkspaceMoveDialog({
    visible,
    value,
    isOpen,
    destinationFolders,
    outsideFolderDestinationId,
    isOutsideFolderVisible,
    canSave,
    isDestinationDisabled,
    onFocus,
    onChange,
    onToggle,
    onSelectOutsideFolder,
    onSelectDestination,
    onSave,
    onCancel,
}: WorkspaceMoveDialogProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { isRtl, textAlign } = getDirectionalLayout(direction);

    return (
        <WorkspaceDialogFrame
            visible={visible}
            title={t("moveItem")}
            description={t("moveItemDescription")}
            onClose={onCancel}
        >
            <View style={styles.destinationCombo}>
                <View
                    style={[
                        styles.destinationComboControl,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <TextInput
                        value={value}
                        onFocus={() => {
                            onFocus();
                            if (!isOpen) onToggle();
                        }}
                        onChangeText={onChange}
                        placeholder={`${t("selectDestination")}...`}
                        placeholderTextColor={colors.text}
                        style={[
                            styles.destinationComboInput,
                            {
                                color: colors.text,
                                backgroundColor: "transparent",
                                textAlign,
                                direction,
                            },
                        ]}
                    />

                    <Tooltip
                        label={isOpen ? t("closeDestinationList") : t("openDestinationList")}
                        wrapperStyle={[
                            styles.destinationComboIconWrapper,
                            isRtl ? { left: 6 } : { right: 6 },
                        ]}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                isOpen
                                    ? t("closeDestinationList")
                                    : t("openDestinationList")
                            }
                            accessibilityState={{ expanded: isOpen }}
                            onPress={onToggle}
                            style={({ pressed }) => [
                                styles.destinationComboIcon,
                                {
                                    backgroundColor: `color-mix(in srgb, ${colors.text} 7%, transparent)`,
                                },
                                pressed && styles.destinationComboIconPressed,
                            ]}
                        >
                            <Feather
                                name={isOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={colors.text}
                            />
                        </Pressable>
                    </Tooltip>
                </View>

                {isOpen && (
                    <View
                        style={[
                            styles.destinationDropdown,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {isOutsideFolderVisible && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("moveOutsideFolder")}
                                disabled={isDestinationDisabled(outsideFolderDestinationId)}
                                onPress={onSelectOutsideFolder}
                                style={[
                                    styles.destinationOption,
                                    isDestinationDisabled(outsideFolderDestinationId) &&
                                    styles.destinationOptionCurrentLocation,
                                    {
                                        backgroundColor: isDestinationDisabled(
                                            outsideFolderDestinationId
                                        )
                                            ? colors.background
                                            : colors.surface,
                                    },
                                ]}
                            >
                                <View style={styles.destinationOptionContent}>
                                    <Text
                                        style={[
                                            styles.destinationOptionText,
                                            { color: colors.text, textAlign },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {t("outsideFolder")}
                                    </Text>

                                    {isDestinationDisabled(outsideFolderDestinationId) && (
                                        <View style={styles.currentLocationIndicator}>
                                            <Feather
                                                name="folder"
                                                size={13}
                                                color={colors.primary}
                                            />

                                            <Text
                                                style={[
                                                    styles.currentLocationText,
                                                    { color: colors.primary },
                                                ]}
                                            >
                                                {t("currentLocation")}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        )}

                        {destinationFolders.map((folder) => {
                            const isCurrentDestination = isDestinationDisabled(folder.id);

                            return (
                                <Pressable
                                    key={folder.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${t("selectFolder")} ${folder.name}`}
                                    disabled={isCurrentDestination}
                                    onPress={() => onSelectDestination(folder.id)}
                                    style={[
                                        styles.destinationOption,
                                        isCurrentDestination &&
                                        styles.destinationOptionCurrentLocation,
                                        {
                                            backgroundColor: isCurrentDestination
                                                ? colors.background
                                                : colors.surface,
                                        },
                                    ]}
                                >
                                    <View style={styles.destinationOptionContent}>
                                        <Text
                                            style={[
                                                styles.destinationOptionText,
                                                { color: colors.text, textAlign },
                                            ]}
                                            numberOfLines={1}
                                            dir="auto"
                                        >
                                            {folder.name}
                                        </Text>

                                        {isCurrentDestination && (
                                            <View style={styles.currentLocationIndicator}>
                                                <Feather
                                                    name="folder"
                                                    size={13}
                                                    color={colors.primary}
                                                />

                                                <Text
                                                    style={[
                                                        styles.currentLocationText,
                                                        { color: colors.primary },
                                                    ]}
                                                >
                                                    {t("currentLocation")}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}

                        {!isOutsideFolderVisible &&
                            destinationFolders.length === 0 && (
                                <Text
                                    style={[
                                        styles.destinationEmptyText,
                                        { color: colors.text, textAlign },
                                    ]}
                                >
                                    {t("noDestinationFound")}
                                </Text>
                            )}
                    </View>
                )}
            </View>

            <View style={styles.modalActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("saveMove")}
                    disabled={!canSave}
                    onPress={onSave}
                    style={[
                        styles.modalPrimaryButton,
                        {
                            backgroundColor: canSave
                                ? colors.primary
                                : colors.border,
                            opacity: canSave ? 1 : 0.76,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.modalPrimaryButtonText,
                            { color: colors.surface },
                        ]}
                    >
                        {t("moveItem")}
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cancelMove")}
                    onPress={onCancel}
                    style={styles.modalTextButton}
                >
                    <Text
                        style={[
                            styles.modalTextButtonText,
                            { color: colors.text },
                        ]}
                    >
                        {t("cancel")}
                    </Text>
                </Pressable>
            </View>
        </WorkspaceDialogFrame>
    );
}

interface WorkspacePermanentDeleteDialogProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function WorkspacePermanentDeleteDialog({
    visible,
    onConfirm,
    onCancel,
}: WorkspacePermanentDeleteDialogProps) {
    const { t, theme } = useSettings();
    const colors = theme.colors;

    return (
        <WorkspaceDialogFrame
            visible={visible}
            title={t("permanentlyDeleteItem")}
            description={t("permanentlyDeleteDescription")}
            onClose={onCancel}
        >
            <View style={styles.modalActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("confirmPermanentDelete")}
                    onPress={onConfirm}
                    style={[
                        styles.modalDangerButton,
                        { backgroundColor: semanticColors.destructive },
                    ]}
                >
                    <Text
                        style={[
                            styles.modalDangerButtonText,
                            { color: colors.surface },
                        ]}
                    >
                        {t("permanentlyDeleteItem")}
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("cancelPermanentDelete")}
                    onPress={onCancel}
                    style={styles.modalTextButton}
                >
                    <Text
                        style={[
                            styles.modalTextButtonText,
                            { color: colors.text },
                        ]}
                    >
                        {t("cancel")}
                    </Text>
                </Pressable>
            </View>
        </WorkspaceDialogFrame>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: semanticColors.backdropSubtle,
    },

    modalCard: {
        width: "100%",
        maxWidth: 460,
        padding: spacing.lg,
        borderWidth: 1,
        borderRadius: radius.xl,
        ...shadows.md,
    },

    modalTitle: {
        marginBottom: spacing.sm,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "start",
    },

    modalDescription: {
        marginBottom: spacing.lg,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "start",
        opacity: 0.72,
    },

    modalActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },

    modalActionSpacer: {
        flex: 1,
    },

    modalDangerButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },

    modalDangerButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    modalPrimaryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },

    modalPrimaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    modalTextButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },

    modalTextButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    renameInput: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: "start",
        outline: "none",
    },

    destinationCombo: {
        position: "relative",
        marginBottom: spacing.lg,
    },

    destinationComboControl: {
        position: "relative",
        width: "100%",
        minHeight: 38,
        borderWidth: 1,
        borderRadius: radius.md,
        overflow: "visible",
    },

    destinationComboInput: {
        width: "100%",
        height: 36,
        minHeight: 36,
        paddingHorizontal: 40,
        paddingVertical: 6,
        borderWidth: 0,
        borderRadius: radius.md,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "start",
        outline: "none",
        boxShadow: "none",
        appearance: "none",
        WebkitAppearance: "none",
    },

    destinationComboIconWrapper: {
        position: "absolute",
        top: 4,
        zIndex: 3,
    },

    destinationComboIcon: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        cursor: "pointer",
        opacity: 0.82,
    },

    destinationComboIconPressed: {
        opacity: 1,
    },

    destinationDropdown: {
        marginTop: spacing.xs,
        maxHeight: 220,
        borderWidth: 1,
        borderRadius: radius.md,
        overflowY: "auto",
        overflowX: "hidden",
    },

    destinationOption: {
        minHeight: 36,
        paddingHorizontal: spacing.md,
        paddingVertical: 7,
        justifyContent: "center",
    },

    destinationOptionCurrentLocation: {
        opacity: 0.86,
    },

    destinationOptionContent: {
        width: "100%",
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
    },

    destinationOptionText: {
        flex: 1,
        minWidth: 0,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "start",
    },

    currentLocationIndicator: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 0,
        gap: 5,
    },

    currentLocationText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        whiteSpace: "nowrap",
    },

    destinationEmptyText: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "start",
        opacity: 0.72,
    },
});