# Company Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-buildable Nuxt company website with bilingual SSR pages, technology-themed motion, a protected admin application, and MySQL-backed content, branding, footer registration information, media, and contact messages.

**Architecture:** One Nuxt application contains the public SSR site, `/admin` application, and Nitro REST API. Prisma owns MySQL persistence, server services isolate public content from administration, and uploads live in a persistent directory outside generated build output.

**Tech Stack:** Nuxt with Vue 3 and TypeScript, Nitro, Tailwind CSS, Element Plus, `@nuxtjs/i18n`, `@nuxt/image`, Prisma, MySQL 8, Zod, Argon2, Marked, sanitize-html, Sharp, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-30-company-website-design.md`

## Global Constraints

- Use `/zh` and `/en` public URLs; saved language preference takes precedence over `Accept-Language`, with Chinese fallback.
- Use MySQL 8 through Prisma; do not substitute SQLite.
- Store bilingual database values as `{ "zh": "…", "en": "…" }` and fall back from English to Chinese for missing optional content.
- Public queries return only `PUBLISHED` records whose `publishedAt` is null or not in the future.
- Element Plus is limited to the admin; the public site uses custom Vue components and Tailwind CSS.
- Use Canvas 2D, CSS, and IntersectionObserver for motion; honor `prefers-reduced-motion` and pause hidden-page animation.
- Support configurable light/dark logos, favicon, copyright, ICP registration, public-security registration, and custom footer links.
- Use Argon2 password hashes, random server-side sessions, `HttpOnly`/`SameSite=Lax` cookies, Origin checks, validation, rate limits, and sanitized Markdown.
- Keep uploads below 5 MiB in persistent `storage/uploads`; never commit real environment secrets.
- The repository starts without tests. Do not add test scaffolding; verify every task with executable commands and real browser/API/MySQL interactions.
- The directory is not initially a Git repository. Do not initialize, add, or commit unless the user explicitly requests it.
- Before writing client-side HTML/CSS/JavaScript in Tasks 7–11, invoke `modern-web-guidance:modern-web-guidance` and follow its current guidance.

---

## File Map

- `package.json`, `nuxt.config.ts`, `tsconfig.json`, `compose.yaml`, `.env.example`: application, dependencies, scripts, and local MySQL.
- `prisma/schema.prisma`, `prisma/seed.ts`, `scripts/create-admin.ts`: persistence and controlled initialization.
- `shared/types/content.ts`, `shared/schemas/content.ts`: bilingual DTOs and write-validation contracts.
- `server/utils/`: Prisma, sessions, errors, rate limiting, Markdown, uploads, and localization helpers.
- `server/services/`: public content and dashboard aggregation with no route-specific code.
- `server/api/`: public reads/contact and protected administration endpoints.
- `app/layouts/`, `app/middleware/`, `app/composables/`: public/admin shells, auth guards, shared browser state, and motion lifecycle.
- `app/components/site/`: public navigation, footer, sections, cards, forms, and animation primitives.
- `app/components/admin/`: settings forms, localized inputs, content editors, and media controls.
- `app/pages/`: locale-prefixed public routes and unprefixed `/admin` routes.
- `app/assets/css/main.css`, `i18n/locales/{zh,en}.json`: visual tokens and interface strings.
- `storage/uploads/`: runtime media only, excluded from source control when Git is introduced.

### Task 1: Bootstrap Nuxt and MySQL

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `app/app.vue`, `app/assets/css/main.css`, `compose.yaml`, `.env.example`, `.gitignore`

**Interfaces:**
- Produces: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, and a MySQL 8 service reachable by `DATABASE_URL`.

- [ ] **Step 1: Create the package manifest and install the selected stack**

Run:

```bash
pnpm init
pnpm add nuxt vue vue-router @nuxtjs/i18n @nuxt/image @element-plus/nuxt element-plus tailwindcss @tailwindcss/vite @prisma/client zod marked sanitize-html argon2 sharp file-type svgo
pnpm add -D typescript @types/node @types/sanitize-html prisma eslint @nuxt/eslint nuxi tsx vue-tsc
```

Set these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "typecheck": "nuxt typecheck",
    "lint": "eslint .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "admin:create": "tsx scripts/create-admin.ts"
  }
}
```

- [ ] **Step 2: Add the Nuxt entry and styling pipeline**

Create `nuxt.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/i18n', '@element-plus/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true, typeCheck: true },
  compatibilityDate: '2026-10-30'
})
```

Create `app/app.vue` with `<template><NuxtLayout><NuxtPage /></NuxtLayout></template>` and initialize `app/assets/css/main.css` with `@import "tailwindcss";`. Extend `./.nuxt/tsconfig.json` from `tsconfig.json`.

- [ ] **Step 3: Define local MySQL and non-secret configuration**

Create `compose.yaml`:

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: nexora
      MYSQL_USER: nexora
      MYSQL_PASSWORD: nexora_local_password
      MYSQL_ROOT_PASSWORD: nexora_local_root
    ports:
      - "3306:3306"
    volumes:
      - nexora_mysql:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-pnexora_local_root"]
      interval: 5s
      timeout: 5s
      retries: 20
volumes:
  nexora_mysql:
```

Create `.env.example` with `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `UPLOAD_DIR`, and `PUBLIC_SITE_URL`. Use local-only sample values, require at least 16 characters for the initial admin password, and set `UPLOAD_DIR=./storage/uploads`. Add `.env`, `node_modules`, `.nuxt`, `.output`, and `storage/uploads/*` to `.gitignore`, with `!storage/uploads/.gitkeep`.

- [ ] **Step 4: Start infrastructure and verify the baseline**

Run:

```bash
docker compose up -d mysql
docker compose ps
pnpm typecheck
pnpm build
```

Expected: MySQL becomes healthy, strict type checking exits 0, and Nuxt writes a production Node build to `.output`.

### Task 2: Add the Data Model and Demo Content

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `scripts/create-admin.ts`, `server/utils/prisma.ts`, `storage/uploads/.gitkeep`
- Modify: `package.json`

**Interfaces:**
- Produces: `prisma` singleton; seeded site/navigation/home/solution/case/news records; `pnpm admin:create`.

- [ ] **Step 1: Define the complete Prisma schema**

Use MySQL as the datasource and these model contracts:

```prisma
enum PublishStatus {
  DRAFT
  PUBLISHED
}

model AdminUser {
  id           String         @id @default(cuid())
  email        String         @unique
  name         String
  passwordHash String
  sessions     AdminSession[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model AdminSession {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model SiteSetting {
  id            Int      @id @default(1)
  logoLightUrl  String?
  logoDarkUrl   String?
  faviconUrl    String?
  siteName      Json
  contactEmail  String?
  phone         String?
  address       Json?
  socialLinks   Json?
  seo           Json
  footer        Json
  updatedAt     DateTime @updatedAt
}

model NavigationItem {
  id        String  @id @default(cuid())
  label     Json
  url       String
  sortOrder Int     @default(0)
  visible   Boolean @default(true)
}

model HomeSection {
  id        String  @id @default(cuid())
  type      String  @unique
  content   Json
  sortOrder Int     @default(0)
  visible   Boolean @default(true)
}

model Solution {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       Json
  summary     Json
  content     Json
  features    Json?
  icon        String?
  coverUrl    String?
  sortOrder   Int           @default(0)
  status      PublishStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model CaseStudy {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       Json
  summary     Json
  content     Json
  clientName  String?
  industry    String?
  results     Json?
  coverUrl    String?
  sortOrder   Int           @default(0)
  status      PublishStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model NewsPost {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       Json
  summary     Json
  content     Json
  seo         Json?
  coverUrl    String?
  status      PublishStatus @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model MediaAsset {
  id           String   @id @default(cuid())
  url          String   @unique
  storageName  String   @unique
  originalName String
  mimeType     String
  size         Int
  width        Int?
  height       Int?
  createdAt    DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  company   String?
  message   String   @db.Text
  locale    String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

Add indexes on every public content model for `(status, publishedAt)` and on `ContactMessage.createdAt`; only content slugs are unique, never localized JSON titles.

- [ ] **Step 2: Create the Prisma singleton**

Create `server/utils/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 3: Seed editable demo data without creating a default administrator**

In `prisma/seed.ts`, upsert `SiteSetting` id 1 with “NEXORA / 诺川科技”, default SEO, empty logo fields, and footer containing copyright plus empty registration fields. Seed navigation and all eight home section types, at least three solutions, three cases, and three news posts with complete Chinese and English values. Use `PUBLISHED` for demo content and fixed slugs such as `ai-platform`, `data-intelligence`, and `cloud-native`. Seed exactly one additional draft news post with slug `draft-preview` so public filtering can be verified.

- [ ] **Step 4: Implement controlled administrator creation**

`scripts/create-admin.ts` reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`, rejects passwords shorter than 16 characters, hashes with `argon2.hash`, and upserts by normalized lowercase email. Print the created email but never the password or hash.

- [ ] **Step 5: Migrate and verify real persistence**

Run:

```bash
cp .env.example .env
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
pnpm admin:create
docker compose exec mysql mysql -unexora -pnexora_local_password nexora -e "SELECT type,visible FROM HomeSection; SELECT slug,status FROM NewsPost;"
```

Expected: eight home rows, four news rows including `draft-preview`, and successful administrator creation. Keep `.env` out of all file reads and source control.

### Task 3: Expose Validated Public Content APIs

**Files:**
- Create: `shared/types/content.ts`, `server/utils/content.ts`, `server/utils/http.ts`, `server/utils/markdown.ts`, `server/services/content-service.ts`
- Create: `server/api/site.get.ts`, `server/api/navigation.get.ts`, `server/api/home.get.ts`, `server/api/solutions/index.get.ts`, `server/api/solutions/[slug].get.ts`, `server/api/cases/index.get.ts`, `server/api/cases/[slug].get.ts`, `server/api/news/index.get.ts`, `server/api/news/[slug].get.ts`

**Interfaces:**
- Produces: `getSiteContent()`, `getHomeContent()`, `listPublished(kind, query)`, `getPublishedBySlug(kind, slug)`; public JSON endpoints; sanitized `contentHtml` on detail responses.

- [ ] **Step 1: Define shared DTOs and locale fallback**

Create:

```ts
export type Locale = 'zh' | 'en'
export type LocalizedText = Record<Locale, string>

export function localize(value: unknown, locale: Locale): string {
  if (!value || typeof value !== 'object') return ''
  const text = value as Partial<Record<Locale, unknown>>
  const selected = text[locale] ?? text.zh
  return typeof selected === 'string' ? selected : ''
}
```

Add DTOs for settings, navigation, home sections, cards, pagination, and details. Keep Prisma model types out of browser components.

- [ ] **Step 2: Centralize publication filtering and errors**

Export `publishedWhere()` with `status: 'PUBLISHED'` and an `OR` for null/past `publishedAt`. Export `notFound()` using `createError({ statusCode: 404, statusMessage: 'Content not found' })`. `server/utils/http.ts` maps known Zod errors to 422 and unexpected errors to a generic 500 response without stack traces.

- [ ] **Step 3: Sanitize Markdown on the server**

`renderMarkdown(value: string)` runs Marked and then sanitize-html with a whitelist for headings, paragraphs, lists, links, emphasis, code, tables, and images. Allow links only with `http`, `https`, and `mailto`; add `rel="noopener noreferrer"` to links. Never return raw Markdown through `v-html`.

- [ ] **Step 4: Implement services and thin route handlers**

`content-service.ts` reads site settings, visible ordered navigation/home sections, paginated published collections, and published slug details. Limit `pageSize` to 1–24 and default to 9. Collection responses have `{ items, page, pageSize, total }`. Detail responses add sanitized `contentHtml`; missing or draft records throw 404.

- [ ] **Step 5: Verify filtering and response shape**

Run `pnpm dev` and request:

```bash
curl -i http://localhost:3000/api/site
curl -i "http://localhost:3000/api/news?page=1&pageSize=2"
curl -i http://localhost:3000/api/news/draft-preview
curl -i http://localhost:3000/api/news/not-found
curl -i http://localhost:3000/api/solutions/ai-platform
```

Expected: settings and navigation contain no password/session fields, news pagination reports `total: 3` because the draft is excluded, both `draft-preview` and `not-found` return 404, and the seeded solution returns 200 with sanitized `contentHtml`.

### Task 4: Implement Administrator Authentication and Security

**Files:**
- Create: `server/utils/auth.ts`, `server/utils/rate-limit.ts`, `server/middleware/admin-security.ts`
- Create: `server/api/admin/auth/login.post.ts`, `server/api/admin/auth/logout.post.ts`, `server/api/admin/auth/me.get.ts`, `server/api/admin/auth/password.put.ts`
- Create: `server/api/admin/dashboard.get.ts`

**Interfaces:**
- Produces: `requireAdmin(event): Promise<AdminUser>`, `createSession(event,userId)`, `destroySession(event)`, `rateLimit(key,limit,windowMs)`.

- [ ] **Step 1: Implement random database-backed sessions**

Generate 32 random bytes for the raw token, HMAC-SHA256 it with `SESSION_SECRET`, and store only the digest. Set cookie `nexora_admin` with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, seven-day max age, and `secure` in production. `requireAdmin` joins a non-expired session to its user or throws 401. Logout deletes the session and expires the cookie.

- [ ] **Step 2: Add bounded rate limiting and Origin enforcement**

Implement an in-memory Map keyed by IP and route, periodically removing expired entries. Limit login to 5 attempts per 15 minutes and contact to 5 per hour. For `/api/admin` mutations, reject cross-origin `Origin` values; except for login, require `requireAdmin` for every admin endpoint.

- [ ] **Step 3: Implement login, session inspection, and password change**

Login validates email/password, normalizes email, uses Argon2 verification, and returns the same 401 message for unknown email and bad password. Password change requires the current password and a new password of at least 16 characters, updates the hash, and deletes all other sessions. Dashboard returns published/draft counts, unread count, and the five latest messages.

- [ ] **Step 4: Verify cookies and access control with real requests**

Run:

```bash
curl -i http://localhost:3000/api/admin/auth/me
curl -i -c /tmp/nexora-cookies.txt -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"wrong-password"}' http://localhost:3000/api/admin/auth/login
curl -i -c /tmp/nexora-cookies.txt -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"the-local-admin-password"}' http://localhost:3000/api/admin/auth/login
curl -i -b /tmp/nexora-cookies.txt http://localhost:3000/api/admin/dashboard
curl -i -b /tmp/nexora-cookies.txt -H "Origin: https://attacker.invalid" -X POST http://localhost:3000/api/admin/auth/logout
```

Expected: 401 before login, identical failed-login behavior, 200 with valid local credentials, protected dashboard data, and 403 for the cross-origin mutation.

### Task 5: Build Settings and Content Management APIs

**Files:**
- Create: `shared/schemas/content.ts`, `server/utils/admin-content.ts`
- Create: `server/api/admin/settings.get.ts`, `server/api/admin/settings.put.ts`
- Create: `server/api/admin/navigation/index.get.ts`, `server/api/admin/navigation/index.post.ts`, `server/api/admin/navigation/[id].put.ts`, `server/api/admin/navigation/[id].delete.ts`
- Create: `server/api/admin/home/index.get.ts`, `server/api/admin/home/[id].put.ts`
- Create matching `index.get.ts`, `index.post.ts`, `[id].put.ts`, and `[id].delete.ts` under `server/api/admin/solutions/`, `server/api/admin/cases/`, and `server/api/admin/news/`
- Create: `server/api/admin/markdown-preview.post.ts`

**Interfaces:**
- Consumes: `requireAdmin` and Prisma models.
- Produces: validated settings/navigation/home updates, full solution/case/news CRUD, and protected sanitized Markdown previews.

- [ ] **Step 1: Define all write schemas**

Use Zod schemas with `localizedText` requiring Chinese and allowing English fallback, `slug` matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, URLs limited to relative `/` paths or `https`, and `sortOrder` as an integer from 0 to 9999. Settings schema includes bilingual site names, SEO, contact fields, footer copyright, ICP/public-security numbers and links, and at most 12 custom footer links. Home schema is discriminated by the eight fixed section types.

- [ ] **Step 2: Implement settings and home transactions**

Settings read creates the singleton from safe defaults if absent; update uses `upsert` id 1. Home updates allow content/order/visibility but not changing the section type. Reordering multiple navigation items uses `prisma.$transaction` so concurrent partial writes cannot persist.

- [ ] **Step 3: Implement collection CRUD without leaking drafts publicly**

Admin lists support drafts and published records, newest first, with optional status filtering. Create defaults to DRAFT. Update uses the resource id and validates every supplied field. When status changes to PUBLISHED and `publishedAt` is null, set the current time. Delete removes only the content row and returns 204; missing ids return 404. The Markdown preview endpoint accepts `{ content: string }` with a 100,000-character limit and returns `{ contentHtml: renderMarkdown(content) }` only to an authenticated administrator.

- [ ] **Step 4: Verify persistence and draft isolation**

Use authenticated curl requests to update the ICP number, create a draft solution, publish it, and request its public URL. Query MySQL after updating:

```bash
docker compose exec mysql mysql -unexora -pnexora_local_password nexora -e "SELECT JSON_EXTRACT(footer,'$.icpNumber') FROM SiteSetting WHERE id=1; SELECT slug,status FROM Solution;"
```

Expected: the footer value survives the API round trip and MySQL restart, draft content is absent publicly, and published content appears without an application restart.

### Task 6: Add Media Upload and Contact Messages

**Files:**
- Create: `server/utils/uploads.ts`, `server/api/media/[name].get.ts`
- Create: `server/api/admin/media/index.get.ts`, `server/api/admin/media/upload.post.ts`, `server/api/admin/media/[id].delete.ts`
- Create: `server/api/contact.post.ts`, `server/api/admin/messages/index.get.ts`, `server/api/admin/messages/[id].put.ts`

**Interfaces:**
- Produces: `saveImageUpload(event): Promise<MediaAsset>`, safe `/media/:name` delivery, public contact submission, protected media/message management.

- [ ] **Step 1: Validate and persist images**

Read multipart data with a 5 MiB limit. Detect JPEG, PNG, WebP, and GIF from bytes; for SVG require text XML, parse with SVGO plugins that remove scripts, event attributes, foreign objects, and external references, then save the sanitized result. Generate random storage names, obtain dimensions with Sharp for raster images, and create `MediaAsset` only after the file write succeeds. Serve only a basename matching `/^[a-zA-Z0-9-]+\.[a-z0-9]+$/` from `UPLOAD_DIR`, with correct MIME, immutable caching, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:`.

- [ ] **Step 2: Prevent deletion of referenced assets**

Before deleting, search settings, home content, solutions, cases, and news for the asset URL. Return 409 if referenced. Otherwise delete the database row and file, removing an orphan file if the first file deletion attempt fails.

- [ ] **Step 3: Implement contact submission and administration**

Public schema requires name (1–80), valid email, message (10–2000), locale `zh|en`, optional phone/company, and an empty honeypot `website`. Successful bot submissions return generic success without inserting. Admin list supports read/unread filters and pagination; update accepts only `isRead`.

- [ ] **Step 4: Verify upload, traversal defense, and message flow**

Upload a small valid PNG and a renamed text file using authenticated curl. Request `/media/../.env`, submit a valid contact message, and inspect it through the admin endpoint.

Expected: PNG returns a `/media/...` URL and MySQL row, disguised text returns 415, traversal returns 400/404 without file contents, valid contact returns 201, and admin can mark it read.

### Task 7: Build the Localized Public Shell and SEO

**Files:**
- Modify: `nuxt.config.ts`, `app/app.vue`
- Create: `i18n/locales/zh.json`, `i18n/locales/en.json`, `app/layouts/default.vue`, `app/layouts/admin.vue`
- Create: `app/composables/useSiteContent.ts`, `app/composables/useSeo.ts`
- Create: `app/components/site/SiteHeader.vue`, `SiteFooter.vue`, `LanguageSwitch.vue`, `MobileMenu.vue`
- Create: `app/pages/index.vue`, `app/pages/[locale]/index.vue`, `app/error.vue`, `server/routes/sitemap.xml.get.ts`, `public/robots.txt`

**Interfaces:**
- Produces: locale-prefixed shell, shared site settings state, canonical/hreflang/OG tags, sitemap and robots output.

- [ ] **Step 1: Configure locale routing and preference persistence**

Configure `@nuxtjs/i18n` for `zh` and `en`, default `zh`, `prefix` strategy, browser-language detection, and a persistent `nexora_locale` cookie. Exclude `/admin` and `/api` from locale generation. Root `/` redirects using saved cookie then `Accept-Language`; direct `/zh` and `/en` requests remain stable and never redirect in a loop.

- [ ] **Step 2: Implement shared site state and navigation**

`useSiteContent()` uses `useAsyncData('site-content', ...)` to fetch `/api/site` and `/api/navigation` once per SSR request and share the result. Header displays configured logo or bilingual site-name fallback, visible ordered navigation, language switch, and accessible mobile dialog. Footer renders only configured contact/social/registration values and uses `https://beian.miit.gov.cn/` for ICP when no custom URL is supplied.

- [ ] **Step 3: Add metadata and machine-readable routes**

`useSeo` accepts localized title, description, path, and image, then outputs canonical, `zh`/`en` alternates, Open Graph, Twitter card, and correct html `lang`. Sitemap includes only public published detail URLs and uses `PUBLIC_SITE_URL`. Robots references the sitemap and disallows `/admin` and `/api/admin`.

- [ ] **Step 4: Verify actual SSR output**

Run the dev server and inspect `/`, `/zh`, and `/en` with browser language set first to English and then Chinese. Use curl to confirm `/en` HTML contains `lang="en"`, English navigation, canonical `/en`, and `hreflang="zh"`, while `/admin` has no locale prefix.

### Task 8: Implement the Technology-Themed Homepage and Motion

**Files:**
- Create: `app/composables/useReducedMotion.ts`, `useReveal.ts`, `useCountUp.ts`
- Create: `app/components/site/HeroCanvas.vue`, `HeroSection.vue`, `SectionHeading.vue`, `CapabilityGrid.vue`, `MetricsBand.vue`, `SolutionCard.vue`, `CaseCard.vue`, `NewsCard.vue`, `HomeContact.vue`
- Modify: `app/pages/[locale]/index.vue`, `app/assets/css/main.css`

**Interfaces:**
- Consumes: public home/site/collection DTOs.
- Produces: reusable motion composables and homepage sections driven entirely by `HomeSection` data.

- [ ] **Step 1: Establish visual tokens and accessible motion defaults**

Define navy/cyan/violet design tokens, readable font stacks, container widths, focus rings, card surfaces, and mobile breakpoints in `main.css`. Under `@media (prefers-reduced-motion: reduce)`, disable nonessential transitions/animations and ensure reveal elements remain visible.

- [ ] **Step 2: Implement lifecycle-safe reveal and counters**

`useReveal` adds an `is-visible` class through IntersectionObserver and disconnects on unmount. `useCountUp` starts only when visible, uses `requestAnimationFrame`, cancels on unmount, and immediately shows the final value when reduced motion is requested.

- [ ] **Step 3: Implement the Canvas hero**

`HeroCanvas` sizes with ResizeObserver, caps device pixel ratio at 1.5, uses fewer particles below 768px, connects nearby points with low-alpha cyan lines, and responds gently to pointer position. Pause when `document.hidden` or reduced motion is active; cancel animation and disconnect observers on unmount. Canvas is decorative with `aria-hidden="true"` and never blocks pointer input.

- [ ] **Step 4: Render all homepage modules from CMS data**

Homepage loads visible ordered sections and the first three published solutions/cases/news. Hero contains bilingual headline, summary, primary/secondary actions, and Canvas. Remaining components render capabilities, metrics, selected cards, about, and contact. Missing optional sections render nothing without hydration errors.

- [ ] **Step 5: Verify desktop, mobile, and reduced motion**

In the real browser, inspect 1440px, 768px, and 390px widths; scroll every section; test keyboard navigation and mobile menu; toggle reduced motion; confirm no horizontal overflow, no console errors, visible content without animation, and Canvas cleanup after navigating away.

### Task 9: Add Public Collections, Details, and Contact

**Files:**
- Create: `app/pages/[locale]/solutions/index.vue`, `app/pages/[locale]/solutions/[slug].vue`
- Create: `app/pages/[locale]/cases/index.vue`, `app/pages/[locale]/cases/[slug].vue`
- Create: `app/pages/[locale]/news/index.vue`, `app/pages/[locale]/news/[slug].vue`
- Create: `app/pages/[locale]/about.vue`, `app/pages/[locale]/contact.vue`
- Create: `app/components/site/ContentGrid.vue`, `PaginationBar.vue`, `MarkdownContent.vue`, `ContactForm.vue`

**Interfaces:**
- Produces: complete public navigation flow, pagination, sanitized detail rendering, and contact persistence.

- [ ] **Step 1: Implement reusable paginated collections**

Each collection uses `useAsyncData` keyed by locale/page/resource, fetches the corresponding API, and renders cards plus accessible previous/next pagination. Invalid pages return an empty state without crashing. Cards link to the same locale’s detail path.

- [ ] **Step 2: Implement detail pages and safe Markdown**

Slug pages fetch details server-side, throw `createError({ statusCode: 404 })` on missing/draft content, and call `useSeo` with localized fields. `MarkdownContent` renders only server-sanitized `contentHtml`; apply typographic styles without allowing script/style injection.

- [ ] **Step 3: Implement about and contact pages**

About uses site settings and the CMS about section. Contact displays configured details and a labeled form with name/email/phone/company/message plus honeypot. Disable duplicate submission, preserve fields on errors, show localized success/failure, and reset only after success.

- [ ] **Step 4: Verify public flows end to end**

Open solution/case/news cards from both languages, visit `/en/news/draft-preview` for a 404, exercise pagination, submit a real message, and confirm it appears through the admin messages API. View page source to ensure detail content and metadata are present in SSR HTML.

### Task 10: Build the Admin Shell and Site Configuration UI

**Files:**
- Create: `app/middleware/admin-auth.ts`, `app/composables/useAdminSession.ts`
- Create: `app/pages/admin/login.vue`, `app/pages/admin/index.vue`, `app/pages/admin/settings.vue`, `app/pages/admin/navigation.vue`, `app/pages/admin/home.vue`, `app/pages/admin/account.vue`
- Create: `app/components/admin/AdminSidebar.vue`, `LocalizedInput.vue`, `ImageField.vue`, `SiteSettingsForm.vue`, `FooterSettingsForm.vue`, `NavigationEditor.vue`, `HomeSectionEditor.vue`

**Interfaces:**
- Consumes: protected auth/settings/navigation/home/dashboard APIs.
- Produces: usable protected administration with bilingual site, footer registration, navigation, and homepage editing.

- [ ] **Step 1: Implement session-aware admin layout**

Login uses the admin endpoint and redirects to `/admin` on success. `admin-auth` middleware calls `/api/admin/auth/me`, redirects unauthenticated users to login, and keeps login accessible to authenticated users without loops. Admin layout provides responsive sidebar, dashboard link, content sections, account, and logout; it does not mount public Canvas or animation code.

- [ ] **Step 2: Build reusable bilingual form controls**

`LocalizedInput` exposes separate Chinese and English fields with labels and validation messages. `ImageField` accepts an existing URL and an upload action, displays preview/remove controls, and never relies on client-only extension checks. Forms preserve unsaved values after failed requests and show success only after a confirmed API response.

- [ ] **Step 3: Build settings and footer forms**

Load settings and bind logos, favicon, bilingual site name, contact/address/social/SEO fields. Footer form includes bilingual copyright, ICP number/link, public-security number/link, and sortable custom links. Save through PUT and update shared site state so public refresh immediately reflects changes.

- [ ] **Step 4: Build navigation, homepage, dashboard, and account screens**

Navigation supports add/edit/delete/reorder/visibility. Home presents each fixed section with the correct bilingual structured fields and visibility/order controls. Dashboard displays real counts and latest messages. Account verifies current password and requires a new password of at least 16 characters.

- [ ] **Step 5: Verify branding and registration information in the browser**

Log in, change the bilingual site name, upload a logo, add ICP and public-security values, reorder navigation, hide one home section, and save. Open `/zh` and `/en` in a second tab and confirm all changes, empty optional fields hidden, draft admin route protection, logout, and mobile admin usability.

### Task 11: Build Content, Media, and Message Administration

**Files:**
- Create: `app/pages/admin/solutions/index.vue`, `app/pages/admin/solutions/[id].vue`
- Create: `app/pages/admin/cases/index.vue`, `app/pages/admin/cases/[id].vue`
- Create: `app/pages/admin/news/index.vue`, `app/pages/admin/news/[id].vue`
- Create: `app/pages/admin/media.vue`, `app/pages/admin/messages.vue`
- Create: `app/components/admin/ContentList.vue`, `ContentEditor.vue`, `MarkdownEditor.vue`, `MediaLibrary.vue`, `MessageList.vue`

**Interfaces:**
- Produces: complete CRUD, publishing, media selection, and message workflows backed by Tasks 5–6.

- [ ] **Step 1: Implement reusable content lists**

List records with localized title, slug, status, publish time, update time, edit, and delete. Filter by status and require an Element Plus confirmation dialog before deletion. Display API errors and never remove a row locally until the server confirms deletion.

- [ ] **Step 2: Implement solution, case, and news editors**

Editors support new and existing ids, bilingual required/optional fields, unique slug, order, cover, and draft/published status. Solutions expose feature lists; cases expose client/industry/results; news exposes Markdown and SEO. Markdown preview uses only sanitized server output. Save then navigate to the persisted record; publish state and timestamps follow server responses.

- [ ] **Step 3: Implement media and message screens**

Media supports upload progress, image preview, URL copy, and delete with 409 referenced-file feedback. Messages supports read/unread filters, detail dialog, and read-state toggle. All tables have loading, empty, and failure states.

- [ ] **Step 4: Verify content publication end to end**

Create one draft and one published item in each content type, verify only published items on the public site, edit slugs and bilingual text, upload/select a cover, and delete a draft. Confirm referenced media cannot be deleted, a submitted contact message can be marked read, and browser refresh preserves all changes.

### Task 12: Final Hardening and Delivery Verification

**Files:**
- Modify only files implicated by failures discovered in this task.
- Remove temporary request files, generated logs, and unneeded build artifacts created during verification; keep source migrations, lockfile, and plan/spec documents.

**Interfaces:**
- Produces: a verified production build and reproducible startup instructions in the final handoff, not an additional documentation file.

- [ ] **Step 1: Run the complete static and production checks**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm prisma validate
pnpm db:deploy
pnpm build
```

Expected: every command exits 0 against the final source. Fix only failures within the requested system; do not hide errors by disabling TypeScript or lint rules.

- [ ] **Step 2: Run the production server and repeat critical flows**

Start `.output/server/index.mjs` with the local environment, then verify SSR `/zh` and `/en`, a published detail, a draft 404, sitemap, robots, admin login, settings update, content publish, media upload, and contact submission. Confirm data remains after restarting the application and MySQL.

- [ ] **Step 3: Audit security and accessibility behavior**

Verify unauthenticated admin API/page denial, cross-origin mutation rejection, bad upload rejection, path traversal denial, dangerous Markdown removal, rate-limit responses, cookie attributes, keyboard navigation, visible focus, labels, reduced motion, and no production stack traces.

- [ ] **Step 4: Inspect final workspace and report residual constraints**

List created files and ensure no `.env`, uploaded secrets, cookie jars, temporary curl payloads, or logs are delivered. Report exact startup commands, local administrator creation command, MySQL requirement, verified flows, and any environment-dependent checks that could not be run. Do not claim completion if any required build or end-to-end flow remains failing.
