# EDMS AI Context

This is the working context for future AI/Codex development of EDMS. Read it with `docs/PMIS_Overview.md` before making changes. That document is authoritative for PMIS and backend facts.

## 1. Confirmed decisions and current scope

- EDMS is an Electronic Document Management System web application.
- React.js and TypeScript are the definitive frontend technologies.
- The UI supports responsive desktop and mobile browsers.
- The frontend must integrate with the existing PMIS backend/API while remaining architecturally separate from the legacy PMIS implementation.
- Do not infer backend contracts or redesign PMIS from frontend requirements.

Current frontend work covers workspace and folder navigation, file browsing and actions, search, responsive shell behavior, inline preview, expanded preview pages, and an extensible renderer architecture.

Implemented foundations include the workspace, image preview, full preview page, dashboard, archive, trash, settings, and responsive desktop/mobile-browser UI. Workspace data is currently frontend/mock state; production backend integration is not established in this repository context.

Current priorities:

1. Improve document-preview UX.
2. Let standalone preview content expand naturally and use browser scrolling.
3. Add renderers only after requirements and browser-compatible approaches are confirmed.

## Milestones

### Overall Milestones

- Completed: workspace, responsive shell, core file/folder flows, and image-preview foundations.
- Current: standalone full-screen document preview.
- Next: PDF preview support.
- Planned: Office and text renderers, followed by PMIS integration as contracts are confirmed.

### Current Milestone

Complete and refine the standalone full-screen document preview page, including responsive layout, natural browser scrolling, consistent preview behavior, and clean integration with the existing renderer boundary.

### Next Milestone

Add PDF preview support to the existing preview architecture for the inline and full-screen preview surfaces. The renderer approach remains TBD until browser requirements and available project constraints are confirmed.

## 2. Frontend architecture

Current component structure:

```text
AppLayout
|-- Sidebar
|-- Toolbar
|-- Dashboard
|-- Settings
|-- Workspace
|   |-- WorkspaceItemCard
|   `-- WorkspaceDocumentPreviewPanel
`-- DocumentPreviewPage
```

Key ownership:

- `components/layout/AppLayout.tsx`: application shell, page switching, shared workspace data, preview-page selection, and global layout.
- `components/layout/Workspace.tsx`: folder navigation, item rendering, workspace interactions, and inline-preview selection.
- `components/workspace/WorkspaceDocumentPreviewPanel.tsx`: inline preview, renderer detection, preview state, and expanded-preview action.
- `components/layout/DocumentPreviewPage.tsx`: expanded preview, back navigation, rendering area, and file metadata.
- `settings/SettingsContext.tsx`: theme and language settings.
- `theme/`: shared design tokens.
- `components/project/` and `components/workspace/`: domain types, helpers, and service boundaries.

State currently uses React hooks. Page selection uses application state rather than an established routing library. `AppLayout` owns shared workspace and page state. Inspect the current implementation before changing these boundaries.

## 3. Document preview and layout rules

Keep the two preview surfaces separate:

- `WorkspaceDocumentPreviewPanel` is the inline workspace preview.
- `DocumentPreviewPage` is the expanded standalone preview.

Do not merge them. Shared renderer logic may be extracted when it reduces duplication without coupling the presentation surfaces.

Images are the only confirmed renderer currently supported. PDF, Office, and text renderers are planned; exact formats, libraries, conversion services, and browser fallbacks are TBD.

Layout requirements:

- Prefer natural document flow and browser scrolling.
- Do not hide overflow when it prevents preview content from expanding.
- Avoid unnecessary fixed heights and viewport constraints.
- Preserve responsive desktop and mobile-browser behavior.

## 4. PMIS integration context

Confirmed by `docs/PMIS_Overview.md`:

- PMIS is a long-running legacy project information management system.
- Its established technologies include PHP across multiple legacy and current versions, MySQL 5.7, Apache on Windows, ADODB, and JavaScript.
- Compatibility with older PHP environments matters.
- Performance and memory usage must be considered.
- Practical, legacy-compatible solutions take priority over unverified architectural changes.
- Existing-system constraints must be examined before major changes are proposed.

Integration rules:

- Treat PMIS as an external legacy backend from the EDMS frontend's perspective.
- Keep PMIS-specific transport, payload mapping, and compatibility logic behind explicit frontend service/adaptor boundaries.
- Do not put legacy backend implementation details in UI components.
- Validate API behavior against the real PMIS system or authoritative documentation before implementation.
- Ask before changes involving backend behavior, API contracts, authentication, database structure, or major architecture.

## 5. Engineering constraints

- Prefer small, focused changes that preserve existing behavior.
- Reuse existing types, helpers, services, component boundaries, and design tokens.
- Avoid large state updates, unnecessary rerenders, and avoidable memory use, especially for large files and previews.
- Do not replace the current state flow or remove helpers without inspecting their consumers.
- Use PascalCase for components and camelCase for functions.
- Add comments only for intent, constraints, or non-obvious architecture.
- Run `npx tsc --noEmit` after TypeScript changes and use the repository's current scripts for local development.
- Do not commit private API URLs, credentials, tokens, or server configuration.

## Git milestone workflow

- Develop each implementation milestone on its own short-lived branch, normally created from the current `main` before milestone code is modified. Do not implement milestones directly on `main` unless explicitly requested.
- Use concise semantic names such as `feat/fullscreen-preview`, `feat/pdf-preview`, or `refactor/preview-layout`.
- Do not switch branches with uncommitted changes unless those changes are safely handled first.
- After a milestone is completed, reviewed, committed, and merged or otherwise confirmed integrated, its branch may be removed.
- Never delete `main`, force-delete a branch without explicit confirmation, or automatically remove an unmerged branch.
- Keep milestone commits semantic: use a concise title followed by a short descriptive paragraph.

## 6. Functional direction

Current frontend capabilities:

- File and folder browsing and folder navigation.
- Workspace actions and search filtering.
- Inline and expanded file preview.
- Archive and trash UI flows.

Planned capabilities, subject to confirmed requirements and backend contracts:

- PMIS-backed document and folder operations.
- Authentication and permissions.
- Approval and document-lifecycle workflows.
- Versioning and metadata management.
- Audit and external-system integration.

## 7. Open decisions and TBD items

The following are not established by the current project context and must not be invented:

- PMIS API URLs, endpoints, request/response schemas, and error conventions.
- Authentication and authorization mechanisms.
- EDMS persistence model and database schema.
- Backend classes and internal architecture.
- Upload, download, preview, and file-storage contracts.
- Production deployment and environment configuration.
- Libraries or services for PDF, Office, and text rendering.
- Final routing and broader frontend state-management choices.

When work depends on one of these items, inspect the implementation or authoritative documentation first. If it remains unclear and affects architecture or external behavior, ask for direction rather than assuming.
