# EDMS AI Context

Repository:
EDMS-Panel-Persian-RTL

Purpose:
AI onboarding document for Claude Code Agent.

This file explains the current project architecture, development rules, completed milestones, and future direction.

---

# 1. Project Overview

## Project Name

EDMS

Electronic Document Management System.

---

## Purpose

EDMS is an enterprise document management platform.

The current frontend focuses on:

- Workspace management.
- Folder navigation.
- File browsing.
- Document preview.
- File rendering architecture.
- Responsive user experience.

---

## Main Goals

The project goals are:

- Provide a professional document management interface.
- Support file and folder workflows.
- Build scalable document preview architecture.
- Maintain compatibility with existing EDMS behavior.
- Prepare the frontend for future document lifecycle workflows.

---

## Current Development Phase

Current phase:
Frontend workspace and preview architecture development.

Completed:

- Workspace foundation.
- Document preview foundation.
- Image preview rendering.
- Full document preview page.
- Preview architecture cleanup.

---

## Current Priorities

Current priorities:

1. Improve preview UX.
2. Allow standalone preview pages to naturally expand.
3. Allow browser scrollbar when content exceeds viewport.
4. Add additional document renderers.

Renderer roadmap:

- Image renderer.
- PDF renderer.
- Office renderer.
- Text renderer.

---

# 2. Technology Stack

## Frontend

Framework:
React Native + Expo Web

Language:
TypeScript

UI target:
- Web.
- Responsive desktop.
- Mobile compatibility.

---

## Mobile

Technology:
Expo

Platforms:
- Web.
- Android.
- iOS.

---

## Backend

Technology:
[To be determined based on existing EDMS backend]

Platform:
[To be determined]

API:
RESTful API for document management operations

---

## Database

Technology:
[To be determined based on existing EDMS database]

Schema:
Document entities, folder structures, user permissions, audit logs

---

## Development Environment

OS:
Windows

Terminal:
Git Bash (recommended), PowerShell, or CMD

Example project path:
D:\Projects\edms

---

## Development Commands

Type checking:
```bash
npx tsc --noEmit
```

Run web:
```bash
npm run web
```

Run Android:
```bash
npm run android
```

Run iOS:
```bash
npm run ios
```

Start development server:
```bash
npm start
```

---

# 3. Architecture Overview

Application Structure

Main flow:

AppLayout
 |
 +-- Sidebar
 |
 +-- Toolbar
 |
 +-- Workspace
 |      |
 |      +-- WorkspaceItemCard
 |      |
 |      +-- WorkspaceDocumentPreviewPanel
 |
 +-- DocumentPreviewPage
 |
 +-- Dashboard
 |
 +-- Settings

Important Components

AppLayout

Location:
components/layout/AppLayout.tsx

Responsibilities:
Main application shell.
Page switching.
Workspace state.
Preview navigation.
Global layout control.

Important state:
workspaceItems.
activeWorkspacePage.
previewPageItemId.
previewItem.

Workspace

Location:
components/layout/Workspace.tsx

Responsibilities:
Folder navigation.
File rendering.
Workspace actions.
Opening previews.

WorkspaceDocumentPreviewPanel

Location:
components/workspace/WorkspaceDocumentPreviewPanel.tsx

Responsibilities:
Inline preview.
Renderer detection.
Preview state display.
Opening full preview.

Current supported renderer:
Images.

Future:
PDF.
Office.
Text.

DocumentPreviewPage

Location:
components/layout/DocumentPreviewPage.tsx

Responsibilities:
Full page document preview.
Larger preview area.
Back navigation.
File metadata.

Data Flow

Current flow:

WorkspaceItem
      |
      v
Workspace
      |
      +--> Inline Preview
      |
      +--> Full Preview Page
      |
      v
AppLayout

---

# 4. Coding Rules and Conventions

Naming

Components:
PascalCase

Example:
DocumentPreviewPage
WorkspaceDocumentPreviewPanel

Functions:
camelCase

Example:
handleOpenPreviewPage
handleClosePreviewPage

File Organization

Layout components:
components/layout

Workspace components:
components/workspace

Shared utilities:
theme
settings
project

Comments

Use structured comments for architecture.

Example:
/**
 * ============================================================================
 * Section Title
 * ----------------------------------------------------------------------------
 * Description
 * ============================================================================
 */

Comments should explain:
Why something exists.
Architecture decisions.
Future intent.

Do not add comments for obvious code.

Performance Rules

Avoid:
Large unnecessary state changes.
Breaking component boundaries.
Removing existing optimizations.

Prefer:
Small focused changes.
Existing helpers.
Existing patterns.

---

# 5. Existing Project Rules

Compatibility

Do not:
Rewrite architecture without discussion.
Replace existing state flow.
Remove existing helpers.

Preview Architecture Rule

Keep these separate:

WorkspaceDocumentPreviewPanel:
Purpose:
Inline preview.

DocumentPreviewPage:
Purpose:
Expanded standalone preview.

Do not merge them.

Layout Rule

Avoid hiding overflow when it prevents natural browser scrolling.

Preferred:
Content grows naturally.
Browser scrollbar appears when needed.

Avoid:
Artificial fixed heights.
Blocking overflow.

---

# 6. Database Knowledge

[To be filled based on existing EDMS database schema]

Key tables/documents:
- Documents
- Folders
- Users
- Permissions
- Audit logs

Relationships:
Documents belong to folders, folders can be nested, users have permissions on documents/folders

---

# 7. Backend Details

Framework:
[To be determined based on existing EDMS backend - possibly .NET, Node.js, or Java]

Classes:
[To be determined based on existing EDMS backend]

APIs:
Document management endpoints:
- GET /api/documents - List documents
- GET /api/documents/{id} - Get document details
- POST /api/documents - Upload document
- PUT /api/documents/{id} - Update document
- DELETE /api/documents/{id} - Delete document
- GET /api/documents/{id}/preview - Get document preview
- GET /api/folders - List folders
- POST /api/folders - Create folder

---

# 8. Frontend Details

UI Framework
React Native + Expo Web.

State Management
Current approach:
React hooks.

Main ownership:
AppLayout.

Routing
Current routing uses application state.

Example:
activeWorkspacePage
previewPageItemId

---

# 9. EDMS Functional Requirements

Current:
File browsing.
Folder navigation.
Workspace actions.
File preview.

Future:
Permissions.
Approval workflows.
Document lifecycle.
Search/filter.
Versioning.
Metadata management.
Integration with external systems.

---

# 10. Current Progress

Completed Commits

Document preview foundation:
196c361 feat(workspace): added document preview foundation

Image preview:
2cbc240 feat(workspace): rendered image previews

Full preview page:
1851270 feat(preview): added full document preview page

Comment cleanup:
4bcd090 docs(preview): refined preview architecture comments

Recent Files
components/layout/AppLayout.tsx
components/layout/Workspace.tsx
components/layout/DocumentPreviewPage.tsx
components/workspace/WorkspaceDocumentPreviewPanel.tsx

Pending Work

Next milestone:
Preview scrolling UX.

Problem:
Parent layout containers currently restrict expansion.

Goal:
Allow preview pages to expand and activate browser scrolling.

---

# 11. AI Assistant Instructions

Before modifying code:
Inspect existing implementation.
Understand ownership.
Check related components.
Avoid assumptions.

Before risky changes ask first:
Database changes.
API changes.
Authentication changes.
Major refactors.

Always:
Prefer small milestones.
Preserve compatibility.
Explain impact.
Keep commits focused.

---

# 12. Future Roadmap

Preview System
Improve:
Full page experience.
Browser scrolling.
Renderer architecture.

Renderers
Add:
PDF.
Office.
Text.

Backend Integration
Connect to existing EDMS backend APIs for:
Document upload/retrieval
Folder management
User authentication and permissions
Audit logging
Version control