# EDMS Panel - Persian RTL Frontend Demo

A frontend-only Enterprise Document Management System panel built with Expo, React Native, React Native Web, and TypeScript.

This project is designed as a Persian RTL admin-style document management panel demo. It focuses on clean UI structure, responsive shell behavior, workspace flows, dashboard visibility, and frontend interaction quality.

## Current Status

This repository currently contains the frontend demo only.

Backend integration is intentionally not included in this public repository. API URLs and private panel details should stay outside GitHub.

## Tech Stack

- Expo
- React Native
- React Native Web
- TypeScript
- Persian RTL-first interface
- Light and dark theme support

## Main Features

- Dashboard overview page
- Responsive desktop and mobile shell
- Desktop sidebar navigation
- Mobile drawer navigation
- Mobile toolbar with project info and account menu
- Dark mode as demo default
- Workspace / My Documents page
- Folder browsing
- File and folder cards
- Search filtering
- Upload demo flow
- New folder modal
- Rename flow
- Move item flow
- Archive page
- Trash page
- Restore from trash
- Permanent delete confirmation
- Undo-style feedback for key actions
- Inline and full-screen image/PDF previews
- Original-file open/download and previous/next preview navigation
- Mock workspace data for frontend demonstration

## Demo Pages

- Dashboard
- My Documents
- Archive
- Trash
- Settings

## Getting Started

Install dependencies:

    npm install

Run the web demo:

    npm run web

Run Expo:

    npm start

Run Android:

    npm run android

Run iOS:

    npm run ios

## Environment

The project can load local environment variables from:

    .env.local

Do not commit private API URLs, tokens, backend credentials, or server configuration files.

## Project Notes

This project is currently optimized for frontend presentation and demo review.

The current demo uses mock workspace data until backend integration is connected.

## Repository Scope

Included:

- Frontend UI
- Responsive panel shell
- Theme system
- Workspace interactions
- Mock data
- Demo dashboard
- TypeScript source code

Not included:

- PHP backend source
- Database schema
- Private API endpoints
- Production credentials
- Server configuration

## Author

Built by Bobak Tadjalli (BobakTech) as a Persian RTL EDMS frontend panel demo.
