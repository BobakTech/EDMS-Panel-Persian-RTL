import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    CSSProperties,
    PointerEvent as ReactPointerEvent,
    UIEvent as ReactUIEvent,
} from "react";

import { Feather } from "../../web/icons";

import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "../../web/ui";

import {
    radius,
    semanticColors,
    shadows,
    spacing,
    typography,
} from "../../theme";

import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import { createDefaultWorkspaceFilters } from "./project.filters";

import type {
    ProjectFilterOption,
    WorkspaceFilters,
} from "./project.types";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ProjectColumnKey =
    | "projectName"
    | "projectCode"
    | "contractNumber";

type ProjectSortKey =
    | "row"
    | ProjectColumnKey;

type ProjectSortDirection =
    | "asc"
    | "desc";

type ProjectColumnWidths =
    Record<ProjectColumnKey, number>;

interface WorkspaceFilterMenuProps {
    projects: ProjectFilterOption[];
    fileTypes: string[];
    value: WorkspaceFilters;
    onApply: (filters: WorkspaceFilters) => void;
    onReset: () => void;
    compact?: boolean;
}

/**
 * ============================================================================
 * Constants
 * ============================================================================
 */

const PROJECT_RENDER_CHUNK = 200;

const DEFAULT_PROJECT_COLUMN_WIDTHS: ProjectColumnWidths = {
    projectName: 320,
    projectCode: 180,
    contractNumber: 180,
};

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export function WorkspaceFilterMenu({
    projects,
    fileTypes,
    value,
    onApply,
    onReset,
    compact = false,
}: WorkspaceFilterMenuProps) {
    const { direction, t, theme } = useSettings();

    const colors = theme.colors;
    const { isRtl } = getDirectionalLayout(direction);

    const projectTableRef =
        useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] =
        useState(false);

    const [draft, setDraft] =
        useState(value);

    const [projectSearch, setProjectSearch] =
        useState("");

    const [fileTypeSearch, setFileTypeSearch] =
        useState("");

    const [
        projectColumnWidths,
        setProjectColumnWidths,
    ] = useState<ProjectColumnWidths>(
        DEFAULT_PROJECT_COLUMN_WIDTHS
    );

    const [
        projectSortKey,
        setProjectSortKey,
    ] = useState<ProjectSortKey>("row");

    const [
        projectSortDirection,
        setProjectSortDirection,
    ] = useState<ProjectSortDirection>("asc");

    const [
        renderedProjectCount,
        setRenderedProjectCount,
    ] = useState(PROJECT_RENDER_CHUNK);

    const activeFilterCount =
        Number(Boolean(value.projectId)) +
        Number(Boolean(value.fileType));

    const draftFilterCount =
        Number(Boolean(draft.projectId)) +
        Number(Boolean(draft.fileType));

    const hasFilters =
        activeFilterCount > 0;

    /**
     * ============================================================================
     * Full Project Search
     * ----------------------------------------------------------------------------
     * Search always runs against the complete project collection received from
     * the API. Incremental rendering is applied only after filtering/sorting.
     * ============================================================================
     */

    const filteredProjects = useMemo(() => {
        const query =
            projectSearch.trim().toLowerCase();

        if (!query) {
            return projects;
        }

        return projects.filter((project) =>
            [
                project.projectName,
                project.projectCode,
                project.contractNumber,
            ].some((field) =>
                field
                    .toLowerCase()
                    .includes(query)
            )
        );
    }, [
        projectSearch,
        projects,
    ]);

    /**
     * Maintains the original API order for Row sorting.
     */
    const projectOriginalIndex = useMemo(() => {
        const indexes =
            new Map<string, number>();

        projects.forEach((project, index) => {
            indexes.set(project.id, index);
        });

        return indexes;
    }, [projects]);

    /**
     * ============================================================================
     * Project Sorting
     * ----------------------------------------------------------------------------
     * Sorting runs against the full searched result set before incremental
     * rendering, so hidden/not-yet-rendered projects are included correctly.
     * ============================================================================
     */

    const sortedProjects = useMemo(() => {
        const sorted =
            [...filteredProjects];

        sorted.sort((left, right) => {
            let comparison = 0;

            if (projectSortKey === "row") {
                comparison =
                    (projectOriginalIndex.get(left.id) ?? 0) -
                    (projectOriginalIndex.get(right.id) ?? 0);
            } else {
                comparison =
                    left[projectSortKey].localeCompare(
                        right[projectSortKey],
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base",
                        }
                    );
            }

            return projectSortDirection === "asc"
                ? comparison
                : -comparison;
        });

        return sorted;
    }, [
        filteredProjects,
        projectOriginalIndex,
        projectSortDirection,
        projectSortKey,
    ]);

    /**
     * ============================================================================
     * Incremental Project Rendering
     * ----------------------------------------------------------------------------
     * Only a chunk is rendered into the DOM. More rows are appended when the
     * user approaches the bottom of the project table.
     * ============================================================================
     */

    const renderedProjects = useMemo(
        () =>
            sortedProjects.slice(
                0,
                renderedProjectCount
            ),
        [
            renderedProjectCount,
            sortedProjects,
        ]
    );

    const hasMoreProjects =
        renderedProjects.length <
        sortedProjects.length;

    useEffect(() => {
        setRenderedProjectCount(
            PROJECT_RENDER_CHUNK
        );

        const tableElement =
            projectTableRef.current;

        if (tableElement) {
            tableElement.scrollTop = 0;
        }
    }, [
        projectSearch,
        projectSortDirection,
        projectSortKey,
        projects,
    ]);

    /**
     * ============================================================================
     * File Types
     * ============================================================================
     */

    const visibleFileTypes = useMemo(() => {
        const query =
            fileTypeSearch.trim().toLowerCase();

        if (!query) {
            return fileTypes;
        }

        return fileTypes.filter((fileType) =>
            fileType
                .toLowerCase()
                .includes(query)
        );
    }, [
        fileTypeSearch,
        fileTypes,
    ]);

    const selectedProject = useMemo(
        () =>
            projects.find(
                (project) =>
                    project.id ===
                    draft.projectId
            ) ?? null,
        [
            draft.projectId,
            projects,
        ]
    );

    /**
     * ============================================================================
     * Menu Actions
     * ============================================================================
     */

    function openMenu() {
        setDraft(value);
        setProjectSearch("");
        setFileTypeSearch("");
        setRenderedProjectCount(
            PROJECT_RENDER_CHUNK
        );
        setIsOpen(true);
    }

    function closeMenu() {
        setDraft(value);
        setProjectSearch("");
        setFileTypeSearch("");
        setIsOpen(false);
    }

    function resetFilters() {
        setDraft(
            createDefaultWorkspaceFilters()
        );

        setProjectSearch("");
        setFileTypeSearch("");

        onReset();

        setIsOpen(false);
    }

    function applyFilters() {
        onApply(draft);
        setIsOpen(false);
    }

    /**
     * ============================================================================
     * Sort Handling
     * ============================================================================
     */

    function handleProjectSort(
        key: ProjectSortKey
    ) {
        if (projectSortKey === key) {
            setProjectSortDirection(
                (current) =>
                    current === "asc"
                        ? "desc"
                        : "asc"
            );

            return;
        }

        setProjectSortKey(key);
        setProjectSortDirection("asc");
    }

    function getSortIcon(
        key: ProjectSortKey
    ) {
        if (projectSortKey !== key) {
            return "chevron-down";
        }

        return projectSortDirection === "asc"
            ? "chevron-up"
            : "chevron-down";
    }

    /**
     * ============================================================================
     * Infinite Scroll
     * ============================================================================
     */

    function handleProjectTableScroll(
        event: ReactUIEvent<HTMLDivElement>
    ) {
        if (!hasMoreProjects) {
            return;
        }

        const element =
            event.currentTarget;

        const remaining =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight;

        if (remaining > 72) {
            return;
        }

        setRenderedProjectCount(
            (current) =>
                Math.min(
                    current +
                    PROJECT_RENDER_CHUNK,
                    sortedProjects.length
                )
        );
    }

    /**
     * ============================================================================
     * Column Resizing
     * ----------------------------------------------------------------------------
     * Live drag updates CSS variables directly. React state updates once after
     * pointer-up, avoiding expensive table rerenders during pointer movement.
     * ============================================================================
     */

    function handleProjectColumnResize(
        column: ProjectColumnKey,
        event:
            ReactPointerEvent<HTMLDivElement>
    ) {
        event.preventDefault();
        event.stopPropagation();

        const currentTableElement =
            projectTableRef.current;

        if (!currentTableElement) {
            return;
        }

        const tableElement: HTMLDivElement =
            currentTableElement;

        const startX =
            event.clientX;

        const startWidth =
            projectColumnWidths[column];

        const directionMultiplier =
            direction === "rtl"
                ? -1
                : 1;

        let nextWidth =
            startWidth;

        function handlePointerMove(
            moveEvent: PointerEvent
        ) {
            const deltaX =
                (
                    moveEvent.clientX -
                    startX
                ) *
                directionMultiplier;

            nextWidth = Math.max(
                100,
                startWidth + deltaX
            );

            tableElement.style.setProperty(
                `--${column}-width`,
                `${nextWidth}px`
            );
        }

        function handlePointerUp() {
            window.removeEventListener(
                "pointermove",
                handlePointerMove
            );

            window.removeEventListener(
                "pointerup",
                handlePointerUp
            );

            document.body.style.cursor = "";
            document.body.style.userSelect = "";

            setProjectColumnWidths(
                (current) => ({
                    ...current,
                    [column]: nextWidth,
                })
            );
        }

        document.body.style.cursor =
            "col-resize";

        document.body.style.userSelect =
            "none";

        window.addEventListener(
            "pointermove",
            handlePointerMove
        );

        window.addEventListener(
            "pointerup",
            handlePointerUp
        );
    }

    /**
     * ============================================================================
     * Shared Render Helpers
     * ============================================================================
     */

    function searchField(
        searchValue: string,
        onChange:
            (nextValue: string) => void,
        placeholder: string
    ) {
        return (
            <View
                style={[
                    styles.searchBox,
                    {
                        borderColor:
                            colors.border,

                        backgroundColor:
                            colors.background,
                    },
                ]}
            >
                <Feather
                    name="search"
                    size={15}
                    color={
                        semanticColors.muted
                    }
                />

                <TextInput
                    value={searchValue}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={
                        semanticColors.muted
                    }
                    style={[
                        styles.input,
                        {
                            color:
                                colors.text,

                            textAlign:
                                isRtl
                                    ? "right"
                                    : "left",
                        },
                    ]}
                />
            </View>
        );
    }

    function actionButton(
        label: string,
        icon: string,
        onPress: () => void,
        primary = false
    ) {
        const foreground =
            primary
                ? colors.surface
                : colors.text;

        const background =
            primary
                ? colors.primary
                : colors.background;

        const border =
            primary
                ? colors.primary
                : colors.border;

        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor:
                            background,

                        borderColor:
                            border,
                    },
                    pressed &&
                    styles.pressed,
                ]}
            >
                <Feather
                    name={icon}
                    size={15}
                    color={foreground}
                />

                <Text
                    style={[
                        styles.buttonText,
                        {
                            color:
                                foreground,
                        },
                    ]}
                >
                    {label}
                </Text>
            </Pressable>
        );
    }

    /**
     * ============================================================================
     * Project Column Definitions
     * ============================================================================
     */

    const projectColumns: Array<{
        key: ProjectColumnKey;
        label: string;
        isLtrValue: boolean;
    }> = [
            {
                key: "projectName",
                label: t("projectName"),
                isLtrValue: false,
            },
            {
                key: "projectCode",
                label: t("projectCode"),
                isLtrValue: true,
            },
            {
                key: "contractNumber",
                label: t("contractNumber"),
                isLtrValue: true,
            },
        ];

    const projectTableVariables = {
        borderColor:
            colors.border,

        "--projectName-width":
            `${projectColumnWidths.projectName}px`,

        "--projectCode-width":
            `${projectColumnWidths.projectCode}px`,

        "--contractNumber-width":
            `${projectColumnWidths.contractNumber}px`,
    } as CSSProperties;

    /**
     * ============================================================================
     * Render
     * ============================================================================
     */

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("filters")}
                onPress={openMenu}
                style={({ pressed }) => [
                    styles.trigger,
                    compact &&
                    styles.compactTrigger,
                    {
                        backgroundColor:
                            hasFilters
                                ? colors.primary
                                : colors.background,

                        borderColor:
                            hasFilters
                                ? colors.primary
                                : colors.border,
                    },
                    pressed &&
                    styles.pressed,
                ]}
            >
                <Feather
                    name="filter"
                    size={16}
                    color={
                        hasFilters
                            ? colors.surface
                            : colors.text
                    }
                />

                {!compact && (
                    <Text
                        style={[
                            styles.triggerText,
                            {
                                color:
                                    hasFilters
                                        ? colors.surface
                                        : colors.text,
                            },
                        ]}
                    >
                        {t("filters")}
                    </Text>
                )}

                {hasFilters && (
                    <View
                        style={[
                            styles.activeBadge,
                            isRtl
                                ? {
                                    left: -7,
                                    right: undefined,
                                }
                                : {
                                    right: -7,
                                    left: undefined,
                                },
                        ]}
                    >
                        <Text
                            style={
                                styles.activeBadgeText
                            }
                        >
                            {activeFilterCount}
                        </Text>
                    </View>
                )}
            </Pressable>

            <Modal
                transparent
                visible={isOpen}
                animationType="fade"
            >
                <View style={styles.modal}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                            t("closeFilters")
                        }
                        onPress={closeMenu}
                        style={styles.backdrop}
                    />

                    <View
                        style={[
                            styles.panel,
                            {
                                direction,
                                backgroundColor:
                                    colors.surface,

                                borderColor:
                                    colors.border,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.heading
                            }
                        >
                            <View
                                style={
                                    styles.headingText
                                }
                            >
                                <View
                                    style={
                                        styles.titleRow
                                    }
                                >
                                    <Feather
                                        name="filter"
                                        size={18}
                                        color={
                                            colors.primary
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.title,
                                            {
                                                color:
                                                    colors.text,
                                            },
                                        ]}
                                    >
                                        {t("filters")}
                                    </Text>

                                    {draftFilterCount > 0 && (
                                        <View
                                            style={[
                                                styles.draftCountBadge,
                                                {
                                                    backgroundColor:
                                                        `color-mix(in srgb, ${colors.primary} 14%, ${colors.surface})`,

                                                    borderColor:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.draftCountBadgeText,
                                                    {
                                                        color:
                                                            colors.primary,
                                                    },
                                                ]}
                                            >
                                                {draftFilterCount}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text
                                    style={[
                                        styles.headingHint,
                                        {
                                            color:
                                                semanticColors.muted,
                                        },
                                    ]}
                                >
                                    {isRtl
                                        ? "فیلترهای موردنظر را انتخاب و سپس اعمال کنید."
                                        : "Choose the filters you need, then apply them."}
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    t("closeFilters")
                                }
                                onPress={closeMenu}
                                style={({ pressed }) => [
                                    styles.closeButton,
                                    {
                                        backgroundColor:
                                            colors.background,

                                        borderColor:
                                            colors.border,
                                    },
                                    pressed &&
                                    styles.pressed,
                                ]}
                            >
                                <Feather
                                    name="x"
                                    size={17}
                                    color={
                                        colors.text
                                    }
                                />
                            </Pressable>
                        </View>

                        {(selectedProject ||
                            draft.fileType) && (
                                <View
                                    style={
                                        styles.selectionSummary
                                    }
                                >
                                    {selectedProject && (
                                        <View
                                            style={[
                                                styles.summaryChip,
                                                {
                                                    backgroundColor:
                                                        `color-mix(in srgb, ${colors.primary} 10%, ${colors.background})`,

                                                    borderColor:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.summaryChipText,
                                                    {
                                                        color:
                                                            colors.text,
                                                    },
                                                ]}
                                            >
                                                {
                                                    selectedProject.projectName
                                                }
                                            </Text>

                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={
                                                    t("reset")
                                                }
                                                onPress={() =>
                                                    setDraft(
                                                        (current) => ({
                                                            ...current,
                                                            projectId:
                                                                null,
                                                        })
                                                    )
                                                }
                                                style={
                                                    styles.summaryChipClear
                                                }
                                            >
                                                <Feather
                                                    name="x"
                                                    size={13}
                                                    color={
                                                        colors.primary
                                                    }
                                                />
                                            </Pressable>
                                        </View>
                                    )}

                                    {draft.fileType && (
                                        <View
                                            style={[
                                                styles.summaryChip,
                                                {
                                                    backgroundColor:
                                                        `color-mix(in srgb, ${colors.primary} 10%, ${colors.background})`,

                                                    borderColor:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.summaryChipText,
                                                    {
                                                        color:
                                                            colors.text,
                                                    },
                                                ]}
                                            >
                                                {draft.fileType.toUpperCase()}
                                            </Text>

                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={
                                                    t("reset")
                                                }
                                                onPress={() =>
                                                    setDraft(
                                                        (current) => ({
                                                            ...current,
                                                            fileType:
                                                                null,
                                                        })
                                                    )
                                                }
                                                style={
                                                    styles.summaryChipClear
                                                }
                                            >
                                                <Feather
                                                    name="x"
                                                    size={13}
                                                    color={
                                                        colors.primary
                                                    }
                                                />
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            )}

                        <View
                            style={[
                                styles.section,
                                styles.projectSection,
                                {
                                    backgroundColor:
                                        `color-mix(in srgb, ${colors.background} 76%, ${colors.surface})`,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View
                                style={
                                    styles.sectionHeading
                                }
                            >
                                <View
                                    style={
                                        styles.sectionTitleRow
                                    }
                                >
                                    <Feather
                                        name="folder"
                                        size={15}
                                        color={
                                            colors.primary
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.label,
                                            {
                                                color:
                                                    colors.text,
                                            },
                                        ]}
                                    >
                                        {t(
                                            "projectFilter"
                                        )}
                                    </Text>
                                </View>

                                {draft.projectId && (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            t("reset")
                                        }
                                        onPress={() =>
                                            setDraft(
                                                (current) => ({
                                                    ...current,
                                                    projectId:
                                                        null,
                                                })
                                            )
                                        }
                                        style={({
                                            pressed,
                                        }) => [
                                                styles.sectionClearButton,
                                                pressed &&
                                                styles.pressed,
                                            ]}
                                    >
                                        <Text
                                            style={[
                                                styles.sectionClearText,
                                                {
                                                    color:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            {t("reset")}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            {searchField(
                                projectSearch,
                                setProjectSearch,
                                t(
                                    "searchProjects"
                                )
                            )}

                            <View
                                ref={
                                    projectTableRef
                                }
                                className="workspace-filter-table-scrollbar"
                                onScroll={
                                    handleProjectTableScroll
                                }
                                style={[
                                    styles.table,
                                    projectTableVariables,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.tableRow,
                                        styles.tableHeader,
                                        {
                                            backgroundColor:
                                                colors.background,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.headerCellContainer,
                                            styles.rowNumberColumn,
                                            styles.verticalDivider,
                                            {
                                                borderColor:
                                                    colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={
                                                1
                                            }
                                            style={[
                                                styles.headerCellText,
                                                {
                                                    color:
                                                        colors.text,

                                                    textAlign:
                                                        direction ===
                                                            "rtl"
                                                            ? "right"
                                                            : "left",
                                                },
                                            ]}
                                        >
                                            {t("row")}
                                        </Text>

                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                `${t("row")} sort`
                                            }
                                            onPress={() =>
                                                handleProjectSort(
                                                    "row"
                                                )
                                            }
                                            style={
                                                styles.sortButton
                                            }
                                        >
                                            <Feather
                                                name={getSortIcon(
                                                    "row"
                                                )}
                                                size={
                                                    13
                                                }
                                                color={
                                                    projectSortKey ===
                                                        "row"
                                                        ? colors.primary
                                                        : semanticColors.muted
                                                }
                                            />
                                        </Pressable>
                                    </View>

                                    {projectColumns.map(
                                        (
                                            column,
                                            columnIndex
                                        ) => (
                                            <View
                                                key={
                                                    column.key
                                                }
                                                style={[
                                                    styles.headerCellContainer,
                                                    columnIndex <
                                                    projectColumns.length -
                                                    1 &&
                                                    styles.verticalDivider,
                                                    {
                                                        width:
                                                            `var(--${column.key}-width)`,

                                                        minWidth:
                                                            `var(--${column.key}-width)`,

                                                        maxWidth:
                                                            `var(--${column.key}-width)`,

                                                        borderColor:
                                                            colors.border,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    numberOfLines={
                                                        1
                                                    }
                                                    title={
                                                        column.label
                                                    }
                                                    style={[
                                                        styles.headerCellText,
                                                        {
                                                            color:
                                                                colors.text,

                                                            direction,

                                                            textAlign:
                                                                direction ===
                                                                    "rtl"
                                                                    ? "right"
                                                                    : "left",
                                                        },
                                                    ]}
                                                >
                                                    {
                                                        column.label
                                                    }
                                                </Text>

                                                <Pressable
                                                    accessibilityRole="button"
                                                    accessibilityLabel={
                                                        `${column.label} sort`
                                                    }
                                                    onPress={() =>
                                                        handleProjectSort(
                                                            column.key
                                                        )
                                                    }
                                                    style={
                                                        styles.sortButton
                                                    }
                                                >
                                                    <Feather
                                                        name={getSortIcon(
                                                            column.key
                                                        )}
                                                        size={
                                                            13
                                                        }
                                                        color={
                                                            projectSortKey ===
                                                                column.key
                                                                ? colors.primary
                                                                : semanticColors.muted
                                                        }
                                                    />
                                                </Pressable>

                                                <View
                                                    role="separator"
                                                    aria-orientation="vertical"
                                                    onPointerDown={(
                                                        event:
                                                            ReactPointerEvent<HTMLDivElement>
                                                    ) =>
                                                        handleProjectColumnResize(
                                                            column.key,
                                                            event
                                                        )
                                                    }
                                                    style={[
                                                        styles.columnResizeHandle,
                                                        direction ===
                                                            "rtl"
                                                            ? styles.columnResizeHandleRtl
                                                            : styles.columnResizeHandleLtr,
                                                    ]}
                                                />
                                            </View>
                                        )
                                    )}
                                </View>

                                {renderedProjects.map(
                                    (
                                        project,
                                        index
                                    ) => {
                                        const isSelected =
                                            draft.projectId ===
                                            project.id;

                                        const projectCells: Array<{
                                            key: ProjectColumnKey;
                                            value: string;
                                            isLtrValue: boolean;
                                        }> = [
                                                {
                                                    key: "projectName",
                                                    value:
                                                        project.projectName,
                                                    isLtrValue:
                                                        false,
                                                },
                                                {
                                                    key: "projectCode",
                                                    value:
                                                        project.projectCode,
                                                    isLtrValue:
                                                        true,
                                                },
                                                {
                                                    key: "contractNumber",
                                                    value:
                                                        project.contractNumber,
                                                    isLtrValue:
                                                        true,
                                                },
                                            ];

                                        const originalRow =
                                            (
                                                projectOriginalIndex.get(
                                                    project.id
                                                ) ?? 0
                                            ) + 1;

                                        return (
                                            <Pressable
                                                key={
                                                    project.id
                                                }
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected:
                                                        isSelected,
                                                }}
                                                onPress={() =>
                                                    setDraft(
                                                        (
                                                            current
                                                        ) => ({
                                                            ...current,
                                                            projectId:
                                                                isSelected
                                                                    ? null
                                                                    : project.id,
                                                        })
                                                    )
                                                }
                                                style={({
                                                    pressed,
                                                }) => [
                                                        styles.tableRow,
                                                        isSelected &&
                                                        styles.selectedTableRow,
                                                        {
                                                            backgroundColor:
                                                                isSelected
                                                                    ? semanticColors.selectedSurface
                                                                    : "transparent",

                                                            borderLeftColor:
                                                                isSelected
                                                                    ? colors.primary
                                                                    : "transparent",
                                                        },
                                                        pressed &&
                                                        styles.pressedRow,
                                                    ]}
                                            >
                                                <View
                                                    style={[
                                                        styles.cellContainer,
                                                        styles.rowCell,
                                                        styles.rowNumberColumn,
                                                        styles.verticalDivider,
                                                        {
                                                            borderColor:
                                                                colors.border,
                                                        },
                                                    ]}
                                                >
                                                    {isSelected ? (
                                                        <View
                                                            style={[
                                                                styles.selectedMark,
                                                                {
                                                                    backgroundColor:
                                                                        colors.primary,
                                                                },
                                                            ]}
                                                        >
                                                            <Feather
                                                                name="check"
                                                                size={
                                                                    12
                                                                }
                                                                color={
                                                                    colors.surface
                                                                }
                                                            />
                                                        </View>
                                                    ) : (
                                                        <Text
                                                            style={[
                                                                styles.rowNumber,
                                                                {
                                                                    color:
                                                                        colors.text,
                                                                },
                                                            ]}
                                                        >
                                                            {
                                                                originalRow
                                                            }
                                                        </Text>
                                                    )}
                                                </View>

                                                {projectCells.map(
                                                    (
                                                        cell,
                                                        cellIndex
                                                    ) => (
                                                        <View
                                                            key={
                                                                cell.key
                                                            }
                                                            style={[
                                                                styles.cellContainer,
                                                                cellIndex <
                                                                projectCells.length -
                                                                1 &&
                                                                styles.verticalDivider,
                                                                {
                                                                    width:
                                                                        `var(--${cell.key}-width)`,

                                                                    minWidth:
                                                                        `var(--${cell.key}-width)`,

                                                                    maxWidth:
                                                                        `var(--${cell.key}-width)`,

                                                                    borderColor:
                                                                        colors.border,
                                                                },
                                                            ]}
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                title={
                                                                    cell.value
                                                                }
                                                                style={[
                                                                    styles.cellText,
                                                                    cell.isLtrValue &&
                                                                    styles.ltrValueCell,
                                                                    {
                                                                        color:
                                                                            colors.text,
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    cell.value
                                                                }
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </Pressable>
                                        );
                                    }
                                )}

                                {hasMoreProjects && (
                                    <View
                                        style={[
                                            styles.loadMoreHint,
                                            {
                                                borderTopColor:
                                                    colors.border,

                                                backgroundColor:
                                                    colors.background,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.loadMoreHintText,
                                                {
                                                    color:
                                                        semanticColors.muted,
                                                },
                                            ]}
                                        >
                                            {isRtl
                                                ? `${renderedProjects.length} از ${sortedProjects.length} پروژه نمایش داده شده؛ برای بارگذاری بیشتر اسکرول کنید.`
                                                : `${renderedProjects.length} of ${sortedProjects.length} projects shown; scroll for more.`}
                                        </Text>
                                    </View>
                                )}

                                {sortedProjects.length ===
                                    0 && (
                                        <Text
                                            style={[
                                                styles.empty,
                                                {
                                                    color:
                                                        semanticColors.muted,
                                                },
                                            ]}
                                        >
                                            {t(
                                                "noProjectsFound"
                                            )}
                                        </Text>
                                    )}
                            </View>
                        </View>

                        <View
                            style={[
                                styles.section,
                                {
                                    backgroundColor:
                                        `color-mix(in srgb, ${colors.background} 76%, ${colors.surface})`,

                                    borderColor:
                                        colors.border,
                                },
                            ]}
                        >
                            <View
                                style={
                                    styles.sectionHeading
                                }
                            >
                                <View
                                    style={
                                        styles.sectionTitleRow
                                    }
                                >
                                    <Feather
                                        name="file"
                                        size={15}
                                        color={
                                            colors.primary
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.label,
                                            {
                                                color:
                                                    colors.text,
                                            },
                                        ]}
                                    >
                                        {t(
                                            "fileTypeFilter"
                                        )}
                                    </Text>
                                </View>

                                {draft.fileType && (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            t("reset")
                                        }
                                        onPress={() =>
                                            setDraft(
                                                (current) => ({
                                                    ...current,
                                                    fileType:
                                                        null,
                                                })
                                            )
                                        }
                                        style={({
                                            pressed,
                                        }) => [
                                                styles.sectionClearButton,
                                                pressed &&
                                                styles.pressed,
                                            ]}
                                    >
                                        <Text
                                            style={[
                                                styles.sectionClearText,
                                                {
                                                    color:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            {t("reset")}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>

                            {searchField(
                                fileTypeSearch,
                                setFileTypeSearch,
                                t(
                                    "searchFileTypes"
                                )
                            )}

                            <View
                                style={
                                    styles.fileTypes
                                }
                            >
                                {visibleFileTypes.map(
                                    (fileType) => {
                                        const isSelected =
                                            draft.fileType ===
                                            fileType;

                                        return (
                                            <Pressable
                                                key={
                                                    fileType
                                                }
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected:
                                                        isSelected,
                                                }}
                                                onPress={() =>
                                                    setDraft(
                                                        (
                                                            current
                                                        ) => ({
                                                            ...current,
                                                            fileType:
                                                                isSelected
                                                                    ? null
                                                                    : fileType,
                                                        })
                                                    )
                                                }
                                                style={({
                                                    pressed,
                                                }) => [
                                                        styles.fileType,
                                                        {
                                                            backgroundColor:
                                                                isSelected
                                                                    ? colors.primary
                                                                    : colors.background,

                                                            borderColor:
                                                                isSelected
                                                                    ? colors.primary
                                                                    : colors.border,
                                                        },
                                                        pressed &&
                                                        styles.pressed,
                                                    ]}
                                            >
                                                {isSelected && (
                                                    <Feather
                                                        name="check"
                                                        size={
                                                            13
                                                        }
                                                        color={
                                                            colors.surface
                                                        }
                                                    />
                                                )}

                                                <Text
                                                    style={[
                                                        styles.fileTypeText,
                                                        {
                                                            color:
                                                                isSelected
                                                                    ? colors.surface
                                                                    : colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {fileType.toUpperCase()}
                                                </Text>
                                            </Pressable>
                                        );
                                    }
                                )}

                                {visibleFileTypes.length ===
                                    0 && (
                                        <Text
                                            style={[
                                                styles.emptyFileTypes,
                                                {
                                                    color:
                                                        semanticColors.muted,
                                                },
                                            ]}
                                        >
                                            {direction ===
                                                "rtl"
                                                ? "نوع فایلی پیدا نشد."
                                                : "No file types found."}
                                        </Text>
                                    )}
                            </View>
                        </View>

                        <View
                            style={[
                                styles.actions,
                                {
                                    borderTopColor:
                                        colors.border,
                                },
                            ]}
                        >
                            {actionButton(
                                t("reset"),
                                "rotate-ccw",
                                resetFilters
                            )}

                            {actionButton(
                                t("apply"),
                                "check",
                                applyFilters,
                                true
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    trigger: {
        position: "relative",

        minHeight: 42,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,

        gap: spacing.xs,

        boxShadow:
            "0 8px 18px rgba(15, 23, 42, 0.16), inset 0 1px rgba(255,255,255,0.22)",
    },

    compactTrigger: {
        width: 42,
        paddingHorizontal: 0,
    },

    triggerText: {
        fontSize:
            typography.fontSize.sm,

        fontWeight:
            typography.fontWeight.semibold,
    },

    activeBadge: {
        position: "absolute",
        top: -7,
        right: -7,

        minWidth: 20,
        height: 20,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: 5,

        borderWidth: 2,
        borderColor:
            semanticColors.onAccent,

        borderRadius: radius.pill,

        backgroundColor:
            semanticColors.error,

        boxShadow:
            "0 4px 9px rgba(15,23,42,0.24)",
    },

    activeBadgeText: {
        color:
            semanticColors.onAccent,

        fontSize: 10,

        fontWeight:
            typography.fontWeight.bold,
    },

    pressed: {
        opacity: 0.88,
        transform:
            "translateY(1px)",
    },

    pressedRow: {
        opacity: 0.86,
    },

    modal: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.md,
    },

    backdrop: {
        position: "absolute",
        inset: 0,

        backgroundColor:
            semanticColors.glassBackdrop,

        backdropFilter:
            "blur(6px)",
    },

    /**
     * Compact by default while remaining user-resizable.
     */
    panel: {
        width: "min(760px, 92vw)",
        height: "min(620px, 82vh)",

        minWidth: 560,
        minHeight: 420,

        maxWidth: "96vw",
        maxHeight: "92vh",

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.xl,

        gap: spacing.sm,

        overflow: "hidden",
        resize: "both",

        display: "flex",
        flexDirection: "column",

        boxShadow:
            "0 30px 72px rgba(15,23,42,0.34), 0 10px 22px rgba(15,23,42,0.18), inset 0 1px rgba(255,255,255,0.32)",

        ...shadows.sm,
    },

    heading: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent:
            "space-between",

        gap: spacing.sm,
    },

    headingText: {
        flex: 1,
        minWidth: 0,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.xs,
    },

    title: {
        fontSize:
            typography.fontSize.lg,

        fontWeight:
            typography.fontWeight.bold,
    },

    headingHint: {
        marginTop: 2,

        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.regular,
    },

    draftCountBadge: {
        minWidth: 22,
        height: 22,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: 6,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    draftCountBadgeText: {
        fontSize: 11,

        fontWeight:
            typography.fontWeight.bold,
    },

    closeButton: {
        width: 32,
        height: 32,

        alignItems: "center",
        justifyContent: "center",

        flexShrink: 0,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    selectionSummary: {
        flexDirection: "row",
        flexWrap: "wrap",

        gap: spacing.xs,
    },

    summaryChip: {
        maxWidth: 280,
        minHeight: 28,

        flexDirection: "row",
        alignItems: "center",

        paddingLeft: spacing.sm,
        paddingRight: 4,

        borderWidth: 1,
        borderRadius: radius.pill,

        gap: 4,
    },

    summaryChipText: {
        flexShrink: 1,

        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.semibold,
    },

    summaryChipClear: {
        width: 22,
        height: 22,

        alignItems: "center",
        justifyContent: "center",

        borderRadius: radius.pill,
    },

    section: {
        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,

        gap: spacing.xs,

        flexShrink: 0,
    },

    sectionHeading: {
        minHeight: 26,

        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",

        gap: spacing.sm,
    },

    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.xs,
    },

    label: {
        fontSize:
            typography.fontSize.sm,

        fontWeight:
            typography.fontWeight.semibold,
    },

    sectionClearButton: {
        paddingHorizontal:
            spacing.xs,

        paddingVertical: 2,

        borderRadius: radius.sm,
    },

    sectionClearText: {
        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.semibold,
    },

    projectSection: {
        flex: 1,
        minHeight: 190,
        overflow: "hidden",
    },

    searchBox: {
        minHeight: 34,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal:
            spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        gap: spacing.xs,
    },

    input: {
        flex: 1,
        minWidth: 0,

        backgroundColor:
            "transparent",

        fontSize:
            typography.fontSize.sm,
    },

    /**
     * ============================================================================
     * Project Table
     * ============================================================================
     */

    table: {
        width: "100%",

        minHeight: 120,
        flex: 1,

        borderWidth: 1,
        borderRadius: radius.md,

        overflow: "auto",
    },

    tableRow: {
        minWidth: "max-content",
        minHeight: 34,

        flexDirection: "row",
        alignItems: "stretch",

        borderBottomWidth: 1,
        borderBottomColor:
            "rgba(148,163,184,0.16)",

        borderLeftWidth: 3,
    },

    selectedTableRow: {
        fontWeight:
            typography.fontWeight.semibold,
    },

    tableHeader: {
        position: "sticky",
        top: 0,
        zIndex: 3,

        minHeight: 36,

        borderLeftColor:
            "transparent",
    },

    headerCellContainer: {
        position: "relative",

        flex: 0,
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",

        overflow: "hidden",
    },

    cellContainer: {
        flex: 0,
        minHeight: 34,

        flexDirection: "row",
        alignItems: "center",

        overflow: "hidden",
    },

    verticalDivider: {
        borderRightWidth: 1,
    },

    headerCellText: {
        flex: 1,
        minWidth: 0,

        paddingHorizontal:
            spacing.xs,

        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.bold,
    },

    cellText: {
        width: "100%",
        minWidth: 0,

        paddingHorizontal:
            spacing.xs,

        fontSize:
            typography.fontSize.xs,

        textAlign: "start",
    },

    ltrValueCell: {
        direction: "ltr",
        textAlign: "left",
    },

    rowNumberColumn: {
        flex: 0,

        width: 64,
        minWidth: 64,
        maxWidth: 64,
    },

    rowCell: {
        alignItems: "center",
        justifyContent: "center",
    },

    rowNumber: {
        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.medium,
    },

    selectedMark: {
        width: 20,
        height: 20,

        alignItems: "center",
        justifyContent: "center",

        borderRadius: radius.pill,
    },

    sortButton: {
        width: 24,
        height: 24,

        flexShrink: 0,

        alignItems: "center",
        justifyContent: "center",

        borderRadius: radius.pill,
    },

    columnResizeHandle: {
        position: "absolute",

        top: 0,
        bottom: 0,

        width: 9,

        cursor: "col-resize",
        zIndex: 5,

        touchAction: "none",
    },

    columnResizeHandleRtl: {
        left: -4,
    },

    columnResizeHandleLtr: {
        right: -4,
    },

    loadMoreHint: {
        minHeight: 28,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal:
            spacing.sm,

        paddingVertical: 4,

        borderTopWidth: 1,
    },

    loadMoreHintText: {
        fontSize:
            typography.fontSize.xs,

        textAlign: "center",
    },

    empty: {
        padding: spacing.sm,

        fontSize:
            typography.fontSize.sm,

        textAlign: "center",
    },

    /**
     * ============================================================================
     * File Types
     * ============================================================================
     */

    fileTypes: {
        minHeight: 48,

        flexDirection: "row",
        flexWrap: "wrap",
        alignContent:
            "flex-start",

        gap: spacing.xs,
    },

    fileType: {
        minHeight: 30,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal:
            spacing.sm,

        paddingVertical: 3,

        borderWidth: 1,
        borderRadius: radius.pill,

        gap: 5,
    },

    fileTypeText: {
        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.semibold,
    },

    emptyFileTypes: {
        width: "100%",

        padding: spacing.sm,

        fontSize:
            typography.fontSize.sm,

        textAlign: "center",
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",

        paddingTop: spacing.sm,

        borderTopWidth: 1,

        gap: spacing.sm,
    },

    button: {
        minWidth: 96,
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal:
            spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,

        gap: spacing.xs,

        boxShadow:
            "0 7px 14px rgba(15,23,42,0.16), inset 0 1px rgba(255,255,255,0.22)",
    },

    buttonText: {
        fontSize:
            typography.fontSize.sm,

        fontWeight:
            typography.fontWeight.bold,
    },
});
