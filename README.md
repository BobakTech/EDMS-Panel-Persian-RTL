# EDMS Panel

A responsive Enterprise Document Management System frontend built with React, Vite, and TypeScript.

The project provides a modern document-management interface with responsive desktop and mobile layouts, RTL/LTR support, workspace navigation, document operations, previews, and API-backed data workflows.

## Table of Contents

- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Main Features](#main-features)
- [Pages](#pages)
- [Getting Started](#getting-started)
- [Architecture Notes](#architecture-notes)
- [Repository Scope](#repository-scope)
- [Author](#author)

## Current Status

The EDMS frontend is under active development and is connected to external application services for document and workspace data.

Core workspace data operations now support server-side pagination, search, and sorting so they operate on the full logical dataset rather than only the currently displayed page.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Lucide React
- Responsive desktop and mobile interface
- RTL and LTR layout support
- Persian and English interface languages
- Light and dark theme support

## Main Features

- Dashboard overview page
- Responsive desktop and mobile application shell
- Desktop sidebar navigation
- Mobile drawer navigation
- Mobile toolbar with project information and account menu
- Persian RTL and English LTR interfaces
- Light and dark themes
- Workspace / My Documents page
- Folder browsing
- File and folder cards with grid and list layouts
- Category navigation
- Server-side workspace pagination
- Full-dataset server-side search
- Server-side sorting by filename, date, and size
- Configurable page size
- File and folder detail panels
- File upload interface
- New folder interface
- Rename flow
- Move item flow
- Archive page
- Trash page
- Restore actions
- Permanent delete confirmation
- Undo-style feedback for key actions
- Inline and full-screen document previews
- Image and PDF preview support
- Original-file open/download controls
- Previous/next preview navigation
- Responsive Settings interface

## Pages

- Dashboard
- My Documents / Workspace
- Archive
- Trash
- Settings

## Getting Started

### Requirements

- Node.js with npm
- Git for cloning and source-control workflows

### Install

Clone the repository and enter the project directory:

    git clone <repository-url>
    cd edms

Install the project dependencies:

    npm install

### Development

Start the Vite development server:

    npm run dev

Vite will print the local development URL in the terminal. Open that address in your browser.

### Production Build

Run the production build:

    npm run build

This command first runs the TypeScript compiler in type-checking mode (`tsc --noEmit`) to verify the source code without generating JavaScript files. If the type check succeeds, Vite creates an optimized production build: application modules are bundled, production assets are generated and optimized, and the final deployable files are written to the `dist` directory. If TypeScript validation or the Vite build fails, the command exits with an error and the production build should not be considered ready.

### Preview the Production Build

To inspect the generated production build locally:

    npm run preview

Unlike `npm run dev`, which runs the development server with fast refresh while editing source files, `npm run preview` serves the already-built files from `dist` so the production output can be checked locally before deployment.

> Some EDMS features depend on external application services. The interface can start locally with the commands above, but API-backed data requires the corresponding services to be available and correctly configured.

## Architecture Notes

The frontend is kept separate from the services that provide document and workspace data. API access is isolated behind the frontend service layer so UI components remain focused on presentation and interaction behavior.

Search, sorting, pagination, counts, and similar full-dataset operations are designed to use service-provided data rather than being limited to the items currently rendered in the interface.

The interface supports both RTL and LTR layouts and is designed to remain responsive across desktop and mobile browser sizes.

## Repository Scope

Included:

- React frontend application
- Responsive application shell
- RTL/LTR layout support
- Persian and English localization
- Theme system
- Workspace UI and interactions
- API integration layer
- Dashboard UI
- Archive and Trash interfaces
- Settings interface
- TypeScript source code

Not included:

- External service source code
- Private API infrastructure
- Production credentials
- Server configuration

## Author

Built by Bobak Tadjalli (BobakTech) for the EDMS frontend project.
