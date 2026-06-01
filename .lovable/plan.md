# SAB Scripting by Nalyy — Build Plan

A full-stack CMS web app with premium dark/purple design, backed by Lovable Cloud (database + auth + storage + server functions).

## Phase 1 — Foundations
- Enable Lovable Cloud (Postgres + Auth + Storage).
- Design system in `src/styles.css`: deep black background, premium purple primary, glow/gradient/glass tokens, smooth animations.
- Root layout with shared **Navbar** (Home, Scripts, Sources, Store, Reviews, Discord, Profile when logged in, Admin Dashboard when admin) and **Footer**. Discord button always visible (https://discord.gg/pmshPYywDD as default, configurable in settings).
- Global search bar in navbar.

## Phase 2 — Database (migrations)
Tables (all with RLS + GRANTs):
- `profiles` (id, username, avatar_url, bio, created_at)
- `user_roles` (user_id, role enum: user/admin) + `has_role()` SECURITY DEFINER fn
- `admin_codes` (code, created_by, used_by, used_at, revoked)
- `scripts` (name, slug, description, features[], screenshots[], youtube_url, discord_url, tags[], status, source_code, is_premium, payment_method, sellauth_url, paypal_url, ltc_address, verified_by_nalyy, badges[], views, created_at, updated_at)
- `sources` (name, slug, description, screenshots[], discord_url, tags[], status, source_code, access_method enum: free/sellauth/paypal/ltc/discord, sellauth_url, paypal_url, ltc_address, discord_redirect_url, views, created_at, updated_at)
- `reviews` (user_id, script_id, rating 1–5, text, created_at)
- `likes` (user_id, script_id)
- `favorites` (user_id, script_id)
- `store_products` (name, description, price, payment_method, sellauth_url, paypal_url, ltc_address, image)
- `site_settings` (singleton: discord_url, webhook_url, ltc_default, etc.)
- Storage bucket `media` for screenshots/avatars.

Triggers: auto-create profile + default `user` role on signup. `updated_at` trigger on scripts/sources fires a Discord webhook server fn.

## Phase 3 — Auth
- Email/password + Google (via Lovable broker).
- `/login`, `/register`, `/profile` (edit avatar, bio, change password).
- `_authenticated` layout guard, `_admin` nested guard using `has_role`.
- Admin elevation: `/redeem-admin` page — user submits secret code → server fn validates against `admin_codes`, marks used, inserts `admin` role.

## Phase 4 — Public pages
- **Home** `/`: hero, popular scripts (by likes), latest scripts, latest sources, site stats (counts), recent reviews (each shows linked script), Discord CTA.
- **Scripts** `/scripts`: grid with filters (status, premium/free) + search.
- **Script detail** `/scripts/$slug`: title, developer, description, features, screenshots carousel, YouTube embed, tags, Discord button, likes, views (incremented via server fn), reviews list + form. Source code shown if free; blurred + **Buy Now** if premium (redirects to configured payment method).
- **Sources** `/sources`: two tabs (Free / Paid based on access_method).
- **Source detail** `/sources/$slug`: details + access-method-specific CTA (View Source / Buy Now / PayPal / LTC address + copy / Join Discord). Code viewer with syntax highlighting (Shiki or prism-react-renderer), copy/expand/fullscreen buttons; blurred unless free or access granted.
- **Store** `/store`: premium products with Buy Now per payment method.
- **Reviews** `/reviews`: all reviews with linked scripts, average rating, total.
- Badges: VERIFIED BY NALYY, PREMIUM, NEW (<7d), UPDATED (<3d), HOT (high views/likes).

## Phase 5 — Admin Dashboard `/_authenticated/_admin/admin`
Sections (sidebar): Dashboard (stats), Scripts (CRUD), Sources (CRUD), Reviews (moderate), Users (list + role toggle), Store (CRUD), Settings (Discord URL, webhook URL, default LTC), Admin Codes (generate/revoke/list).
- Rich forms with all fields listed in spec, screenshot uploads to storage, tag chips, status selectors, premium toggle, payment-method conditional fields.
- Publishing inserts into DB → instantly visible on public pages (no hardcoding).

## Phase 6 — Server functions
- `incrementViews`, `toggleLike`, `toggleFavorite`, `submitReview`, `redeemAdminCode`, `generateAdminCode`, `revokeAdminCode`, `sendDiscordWebhook` (called on insert/update of scripts/sources via DB trigger calling `pg_net` OR server fn invoked after admin mutation — simpler: call from admin mutation handler).
- All admin mutations gated by `requireSupabaseAuth` + `has_role` check.

## Phase 7 — Polish
- Animated gradient hero, purple glow on hover, glass cards, framer-motion transitions.
- Mobile nav drawer.
- SEO meta per route, sitemap.xml, robots.txt.

## Technical notes
- TanStack Start + TanStack Query for all reads.
- Shadcn components restyled via tokens (no ad-hoc colors in components).
- Syntax highlighting: `shiki` (works on edge) or `prism-react-renderer`.
- Discord webhook sent server-side via fetch from server fn after admin create/update.
- This is large — I'll build it iteratively, starting with Cloud + schema + design system + auth + scripts CRUD, then sources/store/admin in follow-up turns within this session.

Approve to start building.