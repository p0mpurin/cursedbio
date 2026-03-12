# CursedBio

A social-bio platform that merges **Neocities** (raw HTML/CSS/JS freedom), **SpaceHey** (profiles, friends, comments), and **Gunz/FakeCrime** (drag-and-drop flashy bio pages with animations, audio, 3D).

**First version** includes: drag-and-drop editor, public bio at `/{username}`, URL claiming (3 free changes per account), Discord profile block with badges + live status (Lanyard), Supabase persistence, and Clerk auth.

---

## Quick Start

```bash
npm install
cp .env.example .env   # optional; edit with your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Clerk runs in **keyless mode** without API keys. Configure Clerk and Supabase for full features (see below).

---

## Stack

- **Next.js 15** (App Router)
- **Clerk** (auth; email/password + Discord)
- **Supabase** (PostgreSQL; profiles, pages, save/load)
- **@dnd-kit** (drag-and-drop editor)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in what you need:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | For production auth | [Clerk](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | For production auth | Clerk |
| `NEXT_PUBLIC_SUPABASE_URL` | For save/load | [Supabase](https://supabase.com) project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For save/load + URL claiming | Service role key (keep secret) |
| `NEXT_PUBLIC_APP_URL` | For redirects | e.g. `https://yourdomain.com` or `http://localhost:3000` |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | For Discord profile block | [Discord Developer Portal](https://discord.com/developers/applications) |
| `DISCORD_REDIRECT_URI` | Discord OAuth | Usually same as `NEXT_PUBLIC_APP_URL` |

---

## Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of `src/lib/db/schema.sql`.
3. If you already had `profiles` before URL claiming, run once:
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_changes_used SMALLINT DEFAULT 0;
   ```
4. Add Supabase keys to `.env` (see above).

---

## Clerk

Works in **keyless mode** in dev (no env vars). For production and Discord login:

1. Create an app at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env`.

---

## Discord Profile Block & Lanyard

- Connect Discord in the **Dashboard** to show avatar, username, and badges on your bio.
- **Live status** (online / idle / dnd / offline) and **custom status** come from [Lanyard](https://api.lanyard.rest). Join the [Lanyard Discord server](https://discord.gg/lanyard) once so your status is tracked.

---

## URL Claiming

- Users get **3 free URL changes** per account (stored in `profiles.username_changes_used`).
- Claim or change your page URL from **Dashboard → Your page**. First claim can happen from the dashboard without saving from the editor first.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   ├── editor/           # Drag-and-drop bio editor
│   ├── profile/
│   ├── [username]/       # Public bio at /:username
│   └── api/
│       ├── pages/        # GET/POST layout (save/load)
│       ├── claim-url/    # Claim/change page URL
│       ├── discord/      # Discord profile data
│       └── auth/discord/ # Discord OAuth
├── components/editor/    # BioCanvas, PropertiesPanel, etc.
└── lib/
    ├── db/               # Supabase client, schema.sql, types
    └── editor/           # Templates, example layout
public/
└── discord-status/       # Status icons (online, idle, dnd, offline)
```

---

## Deploy (e.g. Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com); use **Next.js** preset.
3. Add all env vars from `.env.example` in **Project → Settings → Environment Variables** (no need to commit `.env`).
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://cursedbio.vercel.app`).
5. In Clerk, add your production URL to **Allowed redirect URLs**. In Discord, set the OAuth2 redirect to `https://yourdomain.com/api/auth/discord/callback`.

---

## Before Pushing to GitHub

- [ ] Do **not** commit `.env` (it’s in `.gitignore`).
- [ ] Ensure `.env.example` has no real secrets (only placeholders).
- [ ] Run `npm run build` and `npm run lint` locally.
- [ ] Optionally add a `LICENSE` file (e.g. MIT).

---

## License

MIT
