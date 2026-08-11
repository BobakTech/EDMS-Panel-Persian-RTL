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

## AI decision prioritization

- Before acting on any new request, suggestion, or proposed change, classify it with a brief reason: **Do now** when it supports the current milestone, removes a blocker, or prevents rework; **Do later** when valuable but unnecessary for the current milestone and suitable for future planning; or **Not necessary** when it adds little value, duplicates capability, or creates unjustified complexity.
- Consider the current milestone, project goals, technical impact, and maintenance cost. Avoid unjustified scope expansion and prioritize completing the current milestone over unrelated improvements.

## Token efficiency

- Minimize token use: be concise and do not repeat known context, instructions, unchanged code/documentation, file contents, command output, or explanations.
- Inspect only files and dependencies needed for the task; prefer targeted searches, diffs, commands, and focused edits over repository-wide review.
- Keep status reports and summaries brief. Use additional context only when correctness, safety, debugging, or dependency understanding requires it.
- Token efficiency must never reduce code completeness, correctness, required testing, or preservation of project rules.

## README maintenance

- Update `README.md` when significant changes to setup, architecture, development workflow, commands, milestones, or usage make it inaccurate or incomplete; skip minor internal changes that do not affect users or developers.
- Keep it concise and aligned with the repository. Do not duplicate detailed AI context; keep project-specific AI rules in `docs/AI_CONTEXT.md`.

## Local chat history

- The existing root `.chat-history.md` is the local chat-history (LCH) file. Keep it local and Git-ignored; never stage or commit it.
- Store exact user/Codex messages verbatim. Never summarize, paraphrase, merge, reconstruct, or invent message content.
- Separate history into clear chat sections and keep messages chronological within each section. Put entries that cannot be classified confidently under `Unclassified`.
- Record each message's actual system timestamp with timezone offset and region when available, for example `2026-08-10 14:52:00 +03:30 (Asia/Tehran)`. Never invent unavailable timestamp or timezone data.
- Append future relevant EDMS development conversations using the same structure.

## Git milestone workflow

- Develop each implementation milestone on its own short-lived branch, normally created from the current `main` before milestone code is modified. Do not implement milestones directly on `main` unless explicitly requested.
- Name milestone branches `<username>/<operation>/<subject>` using concise lowercase kebab-case segments, for example `bobaktech/feature/standalone-preview`.
- Do not switch branches with uncommitted changes unless those changes are safely handled first.
- Remove stale milestone branches when they are no longer needed, but only when merged, abandoned, or explicitly confirmed unnecessary.
- Never delete `main` or force-delete unmerged work without confirmation.
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
