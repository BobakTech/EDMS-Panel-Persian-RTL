/**
 * ============================================================================
 * App Layout
 * ----------------------------------------------------------------------------
 * Defines the responsive application shell, page routing, and workspace state.
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "../../web/ui";

import { Feather } from "../../web/icons";

import { DEFAULT_START_PAGE } from "../../constants/app";

import { semanticColors, shadows, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

import Dashboard from "./Dashboard";
import SettingsPage from "./SettingsPage";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";
import type { WorkspaceActionRequest } from "./Workspace";
import { createWorkspacePresentation } from "../workspace/workspace.presentation.controller";
import DocumentPreviewPage from "./DocumentPreviewPage";

import {
    getProjects,
    createDefaultWorkspaceFilters,
    type ProjectFilterOption,
    type WorkspaceFilters,
} from "../project";

import {
    getWorkspaceFileExtension,
    getWorkspaceFileSizeLabel,
    getWorkspaceItems,
    getWorkspaceCategoryDefinitions,
    insertWorkspaceFiles,
    insertWorkspaceFolder,
    removeWorkspaceItem,
    updateWorkspaceItem,
    type WorkspaceActionType,
    type WorkspaceItem,
    type WorkspaceItemUpdate,
    type WorkspacePageType,
    type WorkspacePickedFile,
    type WorkspaceCategoryDefinition,
    type WorkspaceSortField,
    type WorkspaceSortOrder,
} from "../workspace";

import type { DroppedWorkspaceFile } from "../workspace/WorkspaceEmptyState";

import {
    filterWorkspaceByCategory,
    getWorkspaceCategories,
} from "../workspace/workspace.categories";

import AppToast, { type AppToastMessage } from "../common/AppToast";
import { Card } from "../workspace/Card";
import type { CardActionDispatcher } from "../workspace/card.actions";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ContentPageType = "dashboard" | WorkspacePageType;
type AppPageType = ContentPageType | "settings";

/** Temporary presentation-only fixtures; these never become WorkspaceItem records. */
const PRESENTATION_TEST_CARDS = [
    new Card({ id: "__card_test_select__", name: "Test — Selectable", type: "file", level: 1, extension: "TEST", footer: "Selection only", capabilities: [{ id: "select" }] }),
    new Card({ id: "__card_test_navigate__", name: "Test — Navigation", type: "folder", level: 1, footer: "Navigation dispatch", capabilities: [{ id: "open" }], navigation: { target: "test-navigation", params: { source: "workspace" } } }),
    new Card({ id: "__card_test_preview__", name: "Test — Preview", type: "file", level: 1, extension: "TEST", footer: "Preview dispatch", capabilities: [{ id: "open" }, { id: "preview" }], navigation: { target: "test-preview" } }),
    new Card({ id: "__card_test_disabled__", name: "Test — Disabled", type: "file", level: 1, extension: "TEST", footer: "No actions", disabled: true, capabilities: [] }),
];

/** Frontend-only folder fixture; never submitted to PMIS or counted by the API. */
const TEST_FOLDER_ID = "__presentation_test_folder__";
const TEST_FOLDER: WorkspaceItem = {
    id: TEST_FOLDER_ID, type: "folder", name: "Presentation Test Folder",
    description: "Temporary frontend-only folder for interaction testing",
    updatedAt: "2026-10-12T00:00:00.000Z", status: "active",
    parentFolderId: null, childrenCount: 0,
};


/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AppLayout() {
    const { direction, theme, t } = useSettings();
    const colors = theme.colors;
    const { isRtl } = getDirectionalLayout(direction);

    const hasCompletedInitialWorkspaceLoad = useRef(false);

    /**
     * Keep the application shell synchronized with the visible viewport.
     * Also handles browser device-emulation and visual viewport changes.
     */
    const getViewportWidth = () => {
        const layoutWidth = document.documentElement.clientWidth || window.innerWidth;
        const visualWidth = window.visualViewport?.width ?? layoutWidth;

        return Math.min(layoutWidth, visualWidth);
    };

    const [width, setWidth] = useState(getViewportWidth);

    useEffect(() => {
        const updateViewportWidth = () => {
            setWidth(getViewportWidth());
        };

        window.addEventListener("resize", updateViewportWidth);
        window.visualViewport?.addEventListener("resize", updateViewportWidth);

        updateViewportWidth();

        return () => {
            window.removeEventListener("resize", updateViewportWidth);
            window.visualViewport?.removeEventListener("resize", updateViewportWidth);
        };
    }, []);

    /** Mobile breakpoints use CSS viewport width. */
    const isMobileShell = width < 760;
    const isPhoneShell = width < 430;

    const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);
    // Local move overlay survives API refreshes during this session, but not a browser reload.
    const [testFolderMoves, setTestFolderMoves] = useState<Record<string, string | null>>({});


    const [
        workspaceCategoryDefinitions,
        setWorkspaceCategoryDefinitions,
    ] = useState<WorkspaceCategoryDefinition[]>([]);

    useEffect(() => {
        let isActive = true;


        getWorkspaceCategoryDefinitions()
            .then((definitions) => {
                if (isActive) {
                    setWorkspaceCategoryDefinitions(definitions);
                }
            })
            .catch((error) => {
                console.error(
                    "Failed to load workspace category definitions:",
                    error
                );
            });

        return () => {
            isActive = false;
        };
    }, []);

    const [workspaceTotal, setWorkspaceTotal] = useState(0);
    const [workspaceCurrentPage, setWorkspaceCurrentPage] = useState(1);
    const [workspacePageSize, setWorkspacePageSize] = useState(25);
    const [workspaceSortField, setWorkspaceSortField] = useState<WorkspaceSortField>("file_name");
    const [workspaceSortOrder, setWorkspaceSortOrder] = useState<WorkspaceSortOrder>(0);
    const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
    const [workspaceLoadingOperation, setWorkspaceLoadingOperation] = useState<"initial" | "navigation" | "search" | "sort" | "pagination" | "refresh" | null>(null);
    const [workspaceApplyingAction, setWorkspaceApplyingAction] =
        useState<"search" | "sort" | null>(null);
    const [workspaceError, setWorkspaceError] = useState<string | null>(null);

    const [activeWorkspaceAction, setActiveWorkspaceAction] =
        useState<WorkspaceActionType | null>(null);

    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState("");

    const [activeWorkspaceCategory, setActiveWorkspaceCategory] = useState("all");

    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    /**
     * ============================================================================
     * Full Preview Selection State
     * ----------------------------------------------------------------------------
     * Stores the selected workspace item id while switching from the workspace
     * layout to the standalone document preview page.
     * ============================================================================
     */
    const [previewPageItemId, setPreviewPageItemId] = useState<string | null>(null);

    /**
     * ============================================================================
     * Initial Page State
     * ----------------------------------------------------------------------------
     * Opens the panel on Dashboard by default.
     * ============================================================================
     */
    const [activeWorkspacePage, setActiveWorkspacePage] =
        useState<ContentPageType>(DEFAULT_START_PAGE);

    const [isProjectInfoLoading, setIsProjectInfoLoading] = useState(true);
    const [projectInfoError, setProjectInfoError] = useState<string | null>(null);
    const [workspaceFilters, setWorkspaceFilters] = useState<WorkspaceFilters>(
        createDefaultWorkspaceFilters
    );

    const [projectFilterOptions, setProjectFilterOptions] =
        useState<ProjectFilterOption[]>([]);

    const projectLookup = useMemo(
        () => new Map(projectFilterOptions.map((project) => [project.id, project])),
        [projectFilterOptions]
    );

    const enrichWorkspaceItemsWithProjects = useCallback(
        (items: WorkspaceItem[]) =>
            items.map((item) => {
                if (!item.projectId) return item;

                const project = projectLookup.get(item.projectId);
                if (!project) return item;

                return {
                    ...item,
                    projectCode: project.projectCode || undefined,
                    contractNumber: project.contractNumber || undefined,
                };
            }),
        [projectLookup]
    );

    const enrichedWorkspaceItems = useMemo(() => {
        const items = enrichWorkspaceItemsWithProjects(workspaceItems).map((item) =>
            Object.prototype.hasOwnProperty.call(testFolderMoves, item.id)
                ? { ...item, parentFolderId: testFolderMoves[item.id] }
                : item
        );
        // This fixture is UI data only and is never sent to the backend.
        return [TEST_FOLDER, ...items.filter((item) => item.id !== TEST_FOLDER_ID)];
    }, [workspaceItems, enrichWorkspaceItemsWithProjects, testFolderMoves]);

    /**
     * Shared notification queue.
     * Retains at most four notifications; each notification has a unique ID.
     */
    const [appToasts, setAppToasts] = useState<AppToastMessage[]>([]);
    const nextToastId = useRef(0);

    /**
     * Adds a notification and removes the oldest one when the queue exceeds four.
     * A monotonically increasing ID prevents collisions during rapid updates.
     */
    const showAppToast = useCallback((notification: Omit<AppToastMessage, "id">) => {
        const id = ++nextToastId.current;

        setAppToasts((current) => [
            ...current,
            { ...notification, id },
        ].slice(-4));

        return id;
    }, []);

    /**
     * Removes a specific notification without affecting other active timers.
     */
    const [selectedTestCardIds, setSelectedTestCardIds] = useState<string[]>([]);
    const [visitedCardIds, setVisitedCardIds] = useState<string[]>([]);
    const handlePresentationCardAction: CardActionDispatcher = ({ card, request }) => {
        if (!PRESENTATION_TEST_CARDS.some((fixture) => fixture.id === card.id) || !card.can(request.actionId)) return;
        if (request.actionId === "select") {
            setSelectedTestCardIds((ids) => ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id]);
            return;
        }
        if (request.actionId === "open") {
            setVisitedCardIds([card.id]);
            const isPreview = request.navigation?.target === "test-preview";
            showAppToast({ type: "info", message: isRtl ? (isPreview ? "عملیات پیش‌نمایش آزمایشی اجرا شد." : "عملیات پیمایش آزمایشی اجرا شد.") : (isPreview ? "Test preview action dispatched (no PMIS file opened)." : "Test navigation action dispatched (no PMIS route opened).") });
        }
    };

    const dismissAppToast = useCallback((id: number) => {
        setAppToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const activeWorkspaceFolderId =
        activeWorkspacePage === "workspace" ? currentFolderId : null;

    const isWorkspacePage =
        activeWorkspacePage === "workspace" ||
        activeWorkspacePage === "archive" ||
        activeWorkspacePage === "trash";

    const fileTypeOptions = Array.from(
        new Set(
            enrichedWorkspaceItems
                .filter((item) => item.type === "file")
                .map((item) =>
                    (
                        item.extension ??
                        getWorkspaceFileExtension(item.name)
                    )
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
        )
    ).sort();

    const filteredWorkspaceItems = enrichedWorkspaceItems.filter((item) => {
        const matchesProject =
            workspaceFilters.projectIds.length === 0 ||
            (item.projectId !== undefined && workspaceFilters.projectIds.includes(item.projectId));

        const matchesFileType =
            workspaceFilters.fileTypes.length === 0 ||
            item.type === "folder" ||
            workspaceFilters.fileTypes.some(
                (fileType) => item.extension?.toLowerCase() === fileType.toLowerCase()
            );

        return matchesProject && matchesFileType;
    });

    const activeProjectId =
        workspaceFilters.projectIds.length === 1 ? workspaceFilters.projectIds[0] :
            workspaceItems.find((item) => item.id === currentFolderId)?.projectId;

    const projectConnectionProps = {
        isProjectInfoLoading,
        projectInfoError,
    };
    const workspaceFilterProps = {
        projects: projectFilterOptions,
        fileTypes: fileTypeOptions,
        filters: workspaceFilters,
        onApplyFilters: handleApplyWorkspaceFilters,
        onResetFilters: handleResetWorkspaceFilters,
    };

    const workspaceCategoryItems = enrichedWorkspaceItems.filter((item) => {
        if (activeWorkspacePage === "workspace") {
            return item.status === "active";
        }

        if (activeWorkspacePage === "archive") {
            return item.status === "archived";
        }

        if (activeWorkspacePage === "trash") {
            return item.status === "trashed";
        }

        return false;
    });

    const workspaceCategories = getWorkspaceCategories(
        workspaceCategoryItems,
        workspaceCategoryDefinitions,
    );

    /** PMIS-to-presentation adapter. The Workspace renderer receives only generic Cards. */
    const [workspaceViewMode, setWorkspaceViewMode] = useState<"grid" | "list">("grid");
    const [selectedWorkspaceCardIdsByLocation, setSelectedWorkspaceCardIdsByLocation] = useState<Record<string, string[]>>({});
    const workspaceSelectionKey = `${activeWorkspacePage}:${currentFolderId ?? "root"}`;
    const selectedWorkspaceCardIds = selectedWorkspaceCardIdsByLocation[workspaceSelectionKey] ?? [];
    const workspacePresentation = createWorkspacePresentation({
        id: activeWorkspacePage,
        environment: activeWorkspacePage,
        level: currentFolderId ? 1 : 0,
        cards: [
            ...(activeWorkspacePage === "workspace" && currentFolderId === null && !workspaceSearchQuery.trim() && activeWorkspaceCategory === "all" ? PRESENTATION_TEST_CARDS : []),
            ...filteredWorkspaceItems.filter((item) => {
                if (item.status !== (activeWorkspacePage === "archive" ? "archived" : activeWorkspacePage === "trash" ? "trashed" : "active")) return false;
                if (activeWorkspacePage === "workspace" && (item.parentFolderId ?? null) !== currentFolderId) return false;
                if (activeWorkspaceCategory !== "all" && item.categoryId !== activeWorkspaceCategory) return false;
                return true;
            }).map((item) => new Card({
                id: item.id, name: item.name, type: item.type,
                level: currentFolderId ? 1 : 0, parentId: item.parentFolderId,
                icon: item.type === "folder" ? "folder" : "file-text",
                extension: item.extension, footer: item.sizeLabel || item.updatedAt,
                childrenCount: item.childrenCount,
                capabilities: [
                    { id: "open", label: t("openItem") }, { id: "select", label: t("selectItems") },
                    ...(item.type === "file" ? [{ id: "preview", label: t("documentPreview"), icon: "eye" }] : []),
                    { id: "archive", label: t("archive"), icon: "archive" },
                    { id: "trash", label: t("moveToTrash"), icon: "trash-2" },
                ],
                properties: { isPinned: !!item.isPinned },
            })),
        ],
        display: { mode: workspaceViewMode, selectedCardIds: [...selectedWorkspaceCardIds, ...selectedTestCardIds], visitedCardIds },
        navigation: {
            currentId: currentFolderId, parentId: null, canGoBack: currentFolderId !== null,
            breadcrumbs: [{ id: "root", label: t(activeWorkspacePage === "workspace" ? "workspace" : activeWorkspacePage === "archive" ? "archive" : "trash"), targetId: null },
                ...(currentFolderId ? [{ id: currentFolderId, label: enrichedWorkspaceItems.find((item) => item.id === currentFolderId)?.name ?? currentFolderId, targetId: currentFolderId }] : [])],
        },
        pagination: { page: workspaceCurrentPage, pageSize: workspacePageSize, totalItems: workspaceTotal },
        actions: [],
        title: t(activeWorkspacePage === "workspace" ? "workspace" : activeWorkspacePage === "archive" ? "archive" : "trash"),
        loading: isWorkspaceLoading,
        loadingOperation: workspaceLoadingOperation,
        loadingPreferences: { mode: "both", skeletonCount: 8, disableInteractions: true },
        error: workspaceError,
    });

    function handleWorkspacePresentationAction(request: WorkspaceActionRequest) {
        const { actionId, cardId, targetId, value } = request;
        if (actionId === "set-view-mode" && (value === "grid" || value === "list")) { setWorkspaceViewMode(value); return; }
        if (actionId === "set-page" && typeof value === "number") { setWorkspaceCurrentPage(value); return; }
        if (actionId === "set-page-size" && typeof value === "number") { setWorkspaceCurrentPage(1); setWorkspacePageSize(value); return; }
        if (actionId === "navigate-back") { setCurrentFolderId(null); return; }
        if (actionId === "navigate") { setCurrentFolderId(targetId === "root" ? null : targetId ?? null); return; }
        if (actionId === "bulk-archive" || actionId === "bulk-trash") {
            const operation = actionId === "bulk-archive" ? "archive" : "trash";
            const selectedIds = [...new Set([...selectedWorkspaceCardIds, ...selectedTestCardIds])];
            const eligibleIds = selectedIds.filter((id) => workspacePresentation.cards.some((card) => card.id === id && card.can(operation)) && enrichedWorkspaceItems.some((item) => item.id === id));
            eligibleIds.forEach((id) => { if (operation === "archive") handleArchiveWorkspaceItem(id); else handleMoveWorkspaceItemToTrash(id); });
            if (eligibleIds.length) setSelectedWorkspaceCardIdsByLocation((current) => ({ ...current, [workspaceSelectionKey]: (current[workspaceSelectionKey] ?? []).filter((id) => !eligibleIds.includes(id)) }));
            return;
        }
        if (actionId === "clear-selection") {
            setSelectedWorkspaceCardIdsByLocation((current) => ({ ...current, [workspaceSelectionKey]: [] }));
            setSelectedTestCardIds([]);
            return;
        }
        if (!cardId) return;
        const card = workspacePresentation.cards.find((candidate) => candidate.id === cardId);
        if (!card?.can(actionId)) return;
        if (PRESENTATION_TEST_CARDS.some((fixture) => fixture.id === cardId)) {
            handlePresentationCardAction({ card, request: { cardId, actionId, navigation: card.navigation } });
            return;
        }
        const item = enrichedWorkspaceItems.find((candidate) => candidate.id === cardId);
        if (!item) return;
        if (actionId === "select") { setSelectedWorkspaceCardIdsByLocation((current) => { const ids = current[workspaceSelectionKey] ?? []; return { ...current, [workspaceSelectionKey]: ids.includes(cardId) ? ids.filter((id) => id !== cardId) : [...ids, cardId] }; }); return; }
        if (actionId === "open") { setVisitedCardIds([cardId]); if (item.type === "folder") setCurrentFolderId(item.id); else handleOpenPreviewPage(item); return; }
        if (actionId === "preview") { setVisitedCardIds([cardId]); handleOpenPreviewPage(item); return; }
        if (actionId === "archive") { handleArchiveWorkspaceItem(item.id); return; }
        if (actionId === "trash") { handleMoveWorkspaceItemToTrash(item.id); return; }
    }

    const toolbarProps = {
        activeAction: activeWorkspaceAction,
        searchQuery: workspaceSearchQuery,
        canCreateWorkspaceItems: activeWorkspacePage === "workspace",
        isWorkspaceLoading,
        isSearchApplying: workspaceApplyingAction === "search",
        ...projectConnectionProps,
        ...workspaceFilterProps,
        isMobileMenuOpen,
        onPressMobileMenu: handleToggleMobileMenu,

        onChangeSearchQuery: (value: string) => {
            setWorkspaceCurrentPage(1);
            setWorkspaceApplyingAction("search");
            setWorkspaceSearchQuery(value);
        },

        onPressCreateFolder: handlePressCreateFolder,
        onDismissAction: handleDismissWorkspaceAction,
        onCreateFolder: handleCreateFolder,
        onCreateFile: handleCreateFile,
    };

    const previewPageItem =
        previewPageItemId
            ? filteredWorkspaceItems.find((item) => item.id === previewPageItemId) ?? null
            : null;

    const previewPageItems = filteredWorkspaceItems.filter((item) => {
        const matchesPage =
            (activeWorkspacePage === "workspace" && item.status === "active") ||
            (activeWorkspacePage === "archive" && item.status === "archived") ||
            (activeWorkspacePage === "trash" && item.status === "trashed");

        if (item.type !== "file" || !matchesPage) {
            return false;
        }

        if (
            activeWorkspacePage === "workspace" &&
            (item.parentFolderId ?? null) !== currentFolderId
        ) {
            return false;
        }

        const normalizedSearchQuery = workspaceSearchQuery.trim().toLowerCase();
        return (
            !normalizedSearchQuery ||
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        );
    });

    const previewPageItemIndex = previewPageItem
        ? previewPageItems.findIndex((item) => item.id === previewPageItem.id)
        : -1;
    const previousPreviewPageItem =
        previewPageItemIndex > 0 ? previewPageItems[previewPageItemIndex - 1] : null;
    const nextPreviewPageItem =
        previewPageItemIndex >= 0 && previewPageItemIndex < previewPageItems.length - 1
            ? previewPageItems[previewPageItemIndex + 1]
            : null;

    /**
     * ============================================================================
     * Web-service Connection Check
     * ----------------------------------------------------------------------------
     * Checks only whether the configured project web service responds.
     * ============================================================================
     */

    useEffect(() => {
        let isMounted = true;

        async function loadProjects() {
            try {
                setIsProjectInfoLoading(true);
                setProjectInfoError(null);

                const projects = await getProjects();

                if (isMounted) {
                    setProjectFilterOptions(projects);
                }
            } catch {
                if (isMounted) {
                    setProjectFilterOptions([]);
                    setProjectInfoError("Project service unavailable.");
                }
            } finally {
                if (isMounted) {
                    setIsProjectInfoLoading(false);
                }
            }
        }

        loadProjects();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isCurrentRequest = true;

        // Loading is driven by actual data requests; no artificial delays for synchronous work.
        setIsWorkspaceLoading(true);
        setWorkspaceLoadingOperation(!hasCompletedInitialWorkspaceLoad.current ? "initial" : workspaceApplyingAction === "search" ? "search" : workspaceApplyingAction === "sort" ? "sort" : "refresh");

        setWorkspaceError(null);

        const timer = setTimeout(() => {
            getWorkspaceItems({
                from: (workspaceCurrentPage - 1) * workspacePageSize,
                cnt: workspacePageSize,
                search: workspaceSearchQuery.trim() || undefined,
                sort: workspaceSortField,
                order: workspaceSortOrder,
            })
                .then((result) => {
                    if (!isCurrentRequest) return;

                    setWorkspaceItems(result.items);
                    setWorkspaceTotal(result.total);
                })
                .catch((error) => {
                    if (!isCurrentRequest) return;

                    console.error("Failed to load workspace items:", error);

                    if (!hasCompletedInitialWorkspaceLoad.current) {
                        setWorkspaceError(isRtl ? "سرویس فضای کاری در دسترس نیست." : "Workspace service unavailable.");
                    } else {
                        showAppToast({
                            type: "error",
                            message: direction === "rtl"
                                ? "به‌روزرسانی اسناد انجام نشد. لطفاً دوباره تلاش کنید."
                                : "Could not refresh documents. Please try again.",
                        });
                    }
                })
                .finally(() => {
                    if (isCurrentRequest) {
                        hasCompletedInitialWorkspaceLoad.current = true;
                        setIsWorkspaceLoading(false);
                        setWorkspaceLoadingOperation(null);
                        setWorkspaceApplyingAction(null);
                    }
                });
        }, 300);

        return () => {
            isCurrentRequest = false;
            clearTimeout(timer);
        };
    }, [
        workspaceCurrentPage,
        workspacePageSize,
        workspaceSearchQuery,
        workspaceSortField,
        workspaceSortOrder,
    ]);

    /**
     * ============================================================================
     * Workspace Actions
     * ============================================================================
     */

    function handlePressUpload() {
        setActiveWorkspaceAction("upload");
    }

    function handlePressCreateFolder() {
        setActiveWorkspaceAction("new-folder");
    }

    function handleDismissWorkspaceAction() {
        setActiveWorkspaceAction(null);
    }

    function handleChangeWorkspacePage(page: AppPageType) {
        if (page === "settings") {
            setIsSettingsOpen(true);
            setActiveWorkspaceAction(null);
            setIsMobileMenuOpen(false);
            return;
        }

        setActiveWorkspacePage(page);
        setIsSettingsOpen(false);
        setActiveWorkspaceAction(null);
        setIsMobileMenuOpen(false);
        setPreviewPageItemId(null);

        if (page !== "workspace") {
            setCurrentFolderId(null);
        }
    }

    function handleToggleMobileMenu() {
        setIsMobileMenuOpen((currentValue) => !currentValue);
    }

    function handleCloseMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    function handleApplyWorkspaceFilters(filters: WorkspaceFilters) {
        setWorkspaceFilters(filters);
    }

    function handleResetWorkspaceFilters() {
        setWorkspaceFilters(createDefaultWorkspaceFilters());
    }

    function handleCreateFolder(folderName: string) {
        const trimmedFolderName = folderName.trim();

        if (!trimmedFolderName) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const newWorkspaceFolder: WorkspaceItem = {
                id: `folder-${Date.now()}`,
                projectId: activeProjectId,
                type: "folder",
                name: trimmedFolderName,
                description: "پوشه ایجاد شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: activeWorkspaceFolderId,
                childrenCount: 0,
            };

            return insertWorkspaceFolder(currentItems, newWorkspaceFolder);
        });

        setActiveWorkspaceAction(null);
    }

    function handleCreateFile(file: WorkspacePickedFile) {
        const trimmedFileName = file.name.trim();

        if (!trimmedFileName) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const newWorkspaceFile: WorkspaceItem = {
                id: `file-${Date.now()}`,
                projectId: activeProjectId,
                type: "file",
                name: trimmedFileName,
                description: "فایل انتخاب شده از دستگاه",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId:
                    activeWorkspacePage === "workspace"
                        ? activeWorkspaceFolderId
                        : null,
                extension: getWorkspaceFileExtension(trimmedFileName),
                sizeLabel: getWorkspaceFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            };

            return insertWorkspaceFiles(currentItems, [newWorkspaceFile]);
        });

        setActiveWorkspaceAction(null);
    }

    function handleDropWorkspaceFiles(files: DroppedWorkspaceFile[]) {
        if (activeWorkspacePage !== "workspace" || files.length === 0) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const createdAt = Date.now();

            const droppedFiles: WorkspaceItem[] = files.map((file, index) => ({
                id: `file-${createdAt}-${index}`,
                projectId: activeProjectId,
                type: "file",
                name: file.name,
                description: "فایل رها شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: currentFolderId,
                extension: getWorkspaceFileExtension(file.name),
                sizeLabel: getWorkspaceFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            }));

            return insertWorkspaceFiles(currentItems, droppedFiles);
        });
    }

    function handleArchiveWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                status: "archived",
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleMoveWorkspaceItemToTrash(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                status: "trashed",
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    /**
     * Restores an item's previous state after a reversible workspace operation.
     * Preserves its original status, folder, and metadata while updating the
     * modification timestamp.
     */
    function handleRestoreWorkspaceItem(restoredItem: WorkspaceItem) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, restoredItem.id, (currentItem) => ({
                ...currentItem,
                ...restoredItem,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleRenameWorkspaceItem(itemId: string, newName: string) {
        const trimmedNewName = newName.trim();

        if (!trimmedNewName) {
            return;
        }

        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                name: trimmedNewName,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleUpdateWorkspaceItem(
        itemId: string,
        updates: WorkspaceItemUpdate
    ) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                ...updates,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleDeleteWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            removeWorkspaceItem(currentItems, itemId)
        );
    }

    function handleMoveWorkspaceItem(
        itemId: string,
        destinationFolderId: string | null
    ) {
        // The fixture is a local destination; moves involving it must not call PMIS.
        const sourceItem = enrichedWorkspaceItems.find((item) => item.id === itemId);
        if (!sourceItem || itemId === TEST_FOLDER_ID) return;
        if (destinationFolderId === TEST_FOLDER_ID || sourceItem.parentFolderId === TEST_FOLDER_ID ||
            Object.prototype.hasOwnProperty.call(testFolderMoves, itemId)) {
            setTestFolderMoves((current) => ({ ...current, [itemId]: destinationFolderId }));
            return;
        }
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                parentFolderId: destinationFolderId,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleTogglePinnedWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                isPinned: !item.isPinned,
            }))
        );
    }

    /**
     * ============================================================================
     * Full Preview Navigation
     * ----------------------------------------------------------------------------
     * Switches the workspace view into the standalone document preview layout for
     * the selected file.
     * ============================================================================
     */
    function handleOpenPreviewPage(item: WorkspaceItem) {
        if (item.type !== "file") {
            return;
        }

        setPreviewPageItemId(item.id);
        setActiveWorkspaceAction(null);
        setIsMobileMenuOpen(false);
    }

    /**
     * Closes the full document preview page.
     */
    function handleClosePreviewPage() {
        setPreviewPageItemId(null);
    }

    return (
        <View
            style={[
                styles.container,
                isMobileShell && styles.mobileContainer,
                {
                    backgroundColor: colors.background,
                    direction,
                },
            ]}
        >
            {!isMobileShell && (
                <Sidebar
                    activePage={isSettingsOpen ? "settings" : activeWorkspacePage}
                    {...projectConnectionProps}
                    onChangePage={handleChangeWorkspacePage}
                />
            )}

            <View
                style={[
                    styles.main,
                    isMobileShell && styles.mobileMain,
                    isPhoneShell && styles.phoneMain,
                ]}
            >
                <Toolbar
                    {...toolbarProps}
                    variant={isMobileShell ? "mobile-header" : "desktop"}
                />

                <Modal
                    transparent
                    visible={isMobileShell && isMobileMenuOpen}
                    animationType="fade"
                    onRequestClose={handleCloseMobileMenu}
                >
                    <View style={styles.mobileDrawerModal}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بستن منوی موبایل"
                            onPress={handleCloseMobileMenu}
                            style={styles.mobileDrawerBackdrop}
                        />

                        <View
                            style={[
                                styles.mobileDrawerShell,
                                {
                                    right: isRtl ? 0 : undefined,
                                    left: isRtl ? undefined : 0,
                                    animation:
                                        isRtl
                                            ? "edms-drawer-in-rtl 180ms ease-out"
                                            : "edms-drawer-in-ltr 180ms ease-out",
                                },
                            ]}
                        >
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="بستن منوی موبایل"
                                onPress={handleCloseMobileMenu}
                                style={[
                                    styles.mobileDrawerCloseButton,
                                    isRtl ? { left: -48 } : { right: -48 },
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Feather name="x" size={20} color={colors.text} />
                            </Pressable>

                            <View
                                style={[
                                    styles.mobileDrawer,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <View style={styles.toolbarLayer}>
                                    <Toolbar
                                        {...toolbarProps}
                                        variant="mobile-menu"
                                    />
                                </View>

                                <Sidebar
                                    variant="drawer"
                                    showBrand={false}
                                    activePage={isSettingsOpen ? "settings" : activeWorkspacePage}
                                    {...projectConnectionProps}
                                    onChangePage={handleChangeWorkspacePage}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.pageSlot}>
                    {previewPageItem ? (
                        <DocumentPreviewPage
                            item={previewPageItem}
                            categoryDefinitions={workspaceCategoryDefinitions}
                            onBack={handleClosePreviewPage}
                            onUpdateItem={handleUpdateWorkspaceItem}
                            onPrevious={
                                previousPreviewPageItem
                                    ? () => setPreviewPageItemId(previousPreviewPageItem.id)
                                    : undefined
                            }
                            onNext={
                                nextPreviewPageItem
                                    ? () => setPreviewPageItemId(nextPreviewPageItem.id)
                                    : undefined
                            }
                        />
                    ) : isWorkspacePage ? (
                        <Workspace presentation={workspacePresentation} onAction={handleWorkspacePresentationAction} />
                    ) : (
                        <ScrollView
                            style={styles.pageScroller}
                            contentContainerStyle={styles.pageScrollerContent}
                            showsVerticalScrollIndicator
                            showsHorizontalScrollIndicator={false}
                        >
                            <Dashboard workspaceItems={filteredWorkspaceItems} isLoading={isWorkspaceLoading} />
                        </ScrollView>
                    )}
                </View>

                {isSettingsOpen && (
                    <SettingsPage onClose={() => setIsSettingsOpen(false)} />
                )}
            </View>

            <AppToast
                toasts={appToasts}
                onDismiss={dismissAppToast}
            />
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
        minHeight: "100vh",

        flexDirection: "row",
        direction: "rtl",

        overflow: "visible",
    },

    mobileContainer: {
        flexDirection: "column",
    },

    main: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,

        padding: spacing.lg,

        gap: spacing.md,

        // Allow natural content expansion and browser scrolling.
        overflow: "visible",
    },

    mobileMain: {
        padding: spacing.sm,
    },

    /**
     * ============================================================================
     * Toolbar Layer
     * ----------------------------------------------------------------------------
     * Keeps floating toolbar panels above the workspace content.
     * ============================================================================
     */

    toolbarLayer: {
        position: "relative",
        zIndex: 20,
        elevation: 20,
    },

    pageSlot: {
        flexGrow: 1,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,

        position: "relative",
        zIndex: 1,

        overflow: "visible",
    },

    pageScroller: {
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        overflowY: "visible",
    },

    pageScrollerContent: {
        flexGrow: 1,
    },

    mobileDrawerModal: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        alignItems: "flex-end",
    },

    mobileDrawerBackdrop: {
        ...StyleSheet.absoluteFill,

        backgroundColor: semanticColors.backdrop,
    },

    mobileDrawerShell: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "88%",
        maxWidth: 360,
        zIndex: 1,
    },

    mobileDrawer: {
        width: "100%",
        height: "100%",

        padding: spacing.lg,

        borderLeftWidth: 1,
        gap: spacing.lg,

        ...shadows.lg,
    },

    mobileDrawerCloseButton: {
        position: "absolute",
        top: spacing.sm,
        zIndex: 2,

        width: 40,
        height: 40,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: 8,
        cursor: "pointer",
    },

    phoneMain: {
        padding: spacing.xs,
        gap: spacing.sm,
    },
});
