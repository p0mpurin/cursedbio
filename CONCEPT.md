# CursedBio – Project Concept

## Vision

A social-bio platform that combines three influences:

1. **Neocities-style**: Full raw HTML/CSS/JS freedom. Users can inject custom scripts, embed widgets, and style pages without restrictions.
2. **SpaceHey-style**: Social features such as profiles, friends, comments, and discovery.
3. **Gunz/FakeCrime-style**: A visual, drag-and-drop editor for flashy bio pages, with support for animations, audio, 3D, and interactive effects.

## Core Features

| Layer | Features |
|-------|----------|
| **Page builder** | Drag-and-drop canvas, absolute-positioned elements, JSON layout storage |
| **Element types** | Text, image, audio, video, embed (YouTube, etc.), shapes |
| **Neocities mode** | `custom_css` and `custom_js` columns for raw injection on published pages |
| **Social** | Profiles, friend requests, comments on pages, explore feed |
| **Auth** | Clerk (email/password + social logins) with keyless dev mode |

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Auth**: Clerk (SignedIn/SignedOut, UserButton, SignIn/SignUp modals)
- **Database**: Supabase (PostgreSQL) – profiles, pages, friends, comments
- **Editor**: @dnd-kit for drag-and-drop on a fixed canvas
- **Layout format**: JSON (PageLayout type) with `canvas` + `elements[]`

## Architecture Notes

### Middleware

- Uses `middleware.ts` (Next.js convention; some docs use `proxy.ts`; functionally the same pattern).
- `clerkMiddleware()` from `@clerk/nextjs/server` handles auth.

### Auth Components

- Current Clerk SDK exports `SignedIn` and `SignedOut` (not `Show`). Use these for conditional UI.
- `ClerkProvider` wraps the app. Keyless mode works without env vars for development.

### JSON Layout

- `PageLayout`: `{ version, canvas: { width, height, backgroundColor }, elements[] }`
- Each `PageElement`: `{ id, type, x, y, width, height, zIndex, props, animations? }`
- Example: `src/lib/editor/example-layout.json`

### API Routes

- `POST /api/pages` – save layout (auth required)
- `GET /api/pages` – load current user’s page
- `POST /api/comments` – add comment
- `GET /api/comments?pageId=...` – list comments
- `GET /api/example-layout` – demo layout for editor

### Editor Flow

1. Load layout from API or example.
2. Add elements via sidebar (text, image, audio, embed).
3. Drag elements to reposition; selection for delete.
4. Save sends layout to `/api/pages`.

### Bio View

- Route: `/b/[username]`
- Loads page by `username` (via profile slug).
- Renders `BioCanvas` in view mode; supports `custom_css` and `custom_js` injection.

## Premium & Monetization Ideas

| Feature | Free | Pro |
|---------|------|-----|
| Elements per page | 20 | Unlimited |
| Custom domain | No | Yes |
| Remove branding | No | Yes |
| Custom CSS/JS | No | Yes |
| Friends limit | 50 | Unlimited |
| Themes | 3 basic | Full library |
| Analytics | No | Yes |
| 3D/WebGL blocks | No | Yes |
| Tip jar | No | Yes (Stripe) |
| Featured on Explore | No | Yes (paid slot) |

## Extensions

- **Animations**: Use layout `animations[]` to drive CSS keyframes or Framer Motion.
- **3D**: Integrate Three.js / React Three Fiber for 3D elements.
- **Audio**: Support background music and per-element sounds.
- **Templates**: Pre-built layouts (Y2K, vaporwave, glitch).
- **Export**: Download layout as JSON; import for backup/restore.
