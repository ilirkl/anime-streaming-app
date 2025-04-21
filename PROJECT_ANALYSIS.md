# Project Analysis: Anime Streaming App

This document provides a high-level overview of the codebase structure and key functionalities based on an analysis of the file structure and code definitions.

## Project Overview

This is a Next.js application designed for streaming or browsing anime. It utilizes TypeScript for development, Supabase for backend services and database management, and Tailwind CSS for styling.

## Key Technologies

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Backend/Database:** Supabase
-   **Styling:** Tailwind CSS (likely using shadcn/ui components based on `src/components/ui`)

## Directory Structure & Functionality

-   **`src/app/` (Routing & Pages):**
    -   Defines application routes using the Next.js App Router.
    -   Contains pages for core features: Home, About, Privacy, Terms.
    -   **Authentication (`/auth`, `/login`, `/register`):** Handles user sign-up, login, password recovery, etc.
    -   **Anime Browsing (`/browse`, `/genres`, `/search`):** Features for discovering anime (latest, trending, by genre, search).
    -   **Anime Details (`/anime/[animeName]`, `/anime/[id]`):** Displays information about specific anime titles.
    -   **Watching (`/watch/[animeName]/[seasonNum]/[episodeNum]`):** The interface for watching anime episodes.
    -   **User Profile (`/user`):** User-specific sections like watchlist, watch history, and settings.
    -   **Admin (`/admin`):** Administrative interface for managing anime content (add/update).
    -   **API Routes (`/api`):** Backend endpoints for specific actions (e.g., admin tasks, auth confirmation).

-   **`src/components/` (UI Components):**
    -   Houses reusable React components.
    -   Organized by feature (admin, anime, auth, dashboard, genres, layout, search, theme, user).
    -   Includes a `ui` subdirectory with base components (likely shadcn/ui).
    -   Contains core UI elements, forms, layout structures (`AppLayout`, `BottomNavbar`), theme handling, and feature-specific components.

-   **`src/lib/` (Core Logic & Utilities):**
    -   **`anime-server.ts`:** Central class (`AnimeServer`) for fetching anime-related data (details, genres, episodes, search, user lists) from the backend.
    -   **`client.ts` & `server.ts`:** Functions for creating Supabase client instances (client-side and server-side). `server.ts` also handles user data retrieval.
    -   **`populate-db.ts`:** Scripts likely used to populate the database, potentially fetching data from an external source like Jikan (MyAnimeList).
    -   **`middleware.ts`:** Contains Next.js middleware, probably for session management.
    -   **`utils.ts`:** General utility functions (e.g., `cn` for classnames, `slugify`).
    -   **`context7.ts`:** Functions related to Context7 integration (purpose seems related to component context/documentation, not full codebase indexing).
    -   **Custom Hooks (`src/hooks/`):** Reusable hooks for user data, UI interactions, and theme management.

-   **`supabase/` (Database):**
    -   Contains Supabase project configuration (`config.toml`).
    -   Includes database migration files (`migrations/`) defining the schema (e.g., anime tables).

-   **Configuration Files:** Standard project configuration files for Next.js (`next.config.js`), TypeScript (`tsconfig.json`), ESLint (`eslint.config.mjs`), PostCSS (`postcss.config.mjs`), Tailwind CSS (`tailwind.config.js`), and Node.js packages (`package.json`).

## Summary

The project is a well-organized Next.js application for anime streaming/browsing. It leverages modern web technologies and follows common patterns for structuring Next.js applications with Supabase and Tailwind CSS. The separation of concerns between routing/pages (`src/app`), UI components (`src/components`), and core logic/utilities (`src/lib`) is evident.
