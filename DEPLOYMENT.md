# 速采云 (SuCai Cloud) — Production Deployment Guide

This document covers deploying the Next.js 15 application to **Vercel** with **Supabase** (PostgreSQL + Storage) and **Resend** (email).

---

## Prerequisites

- [Supabase](https://supabase.com) project (PostgreSQL + Storage)
- [Resend](https://resend.com) account with verified sending domain
- [Vercel](https://vercel.com) account
- Custom domain (e.g. `sucaicloud.com`)

---

## 1. Environment variables

Run locally before deploy:

```bash
npm run check:env
```

All warnings should be resolved for production.

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `DATABASE_URL` | Yes | Server | Supabase **Direct** connection (port 5432) for Prisma |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Supabase project URL (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server only** | Service role key — never expose to client |
| `RESEND_API_KEY` | Yes | Server | Resend API key |
| `FROM_EMAIL` | Yes | Server | Verified sender, e.g. `SuCai Cloud <notifications@sucaicloud.com>` |
| `ADMIN_EMAIL` | Yes | Server | Recipient for inquiry notifications |
| `ADMIN_USERNAME` | Yes | Server | Admin login username |
| `ADMIN_PASSWORD` | Yes | Server | Strong password (not `admin` / `change-me`) |
| `ADMIN_SESSION_SECRET` | Recommended | Server | Random secret for session token (production) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public | Canonical base URL (default: `https://sucaicloud.com`) |
| `UPSTASH_REDIS_REST_URL` | Recommended | Server | Upstash Redis REST URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Server | Upstash Redis REST token (server only) |

Copy `.env.example` to `.env` and fill in values.

---

## 1.1 Rate limiting (Upstash Redis)

Public inquiry submissions (`POST /api/inquiries`) are limited to **5 requests per minute per IP** when Upstash is configured.

### Setup

1. Create a free database at [Upstash Console](https://console.upstash.com/).
2. Open the database → **REST API** tab.
3. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**.
4. Add both to Vercel → **Project Settings** → **Environment Variables** (Production + Preview).
5. Redeploy the project.

### Behavior

| Environment | Upstash configured | Result |
|-------------|-------------------|--------|
| Production | Yes | Rate limit enforced; excess requests return HTTP 429 |
| Production | No | Requests allowed (site stays online) |
| Development | No | `console.warn` once; requests allowed |

Exceeded limit response:

```json
{ "error": "Too many requests. Please try again later." }
```

---

## 2. Supabase — Database

### 2.1 Connection string

1. Supabase Dashboard → **Project Settings** → **Database**
2. Copy **Connection string** → **URI** → **Direct connection** (port `5432`)
3. Set `DATABASE_URL` in Vercel and local `.env`

### 2.2 Schema & seed

```bash
npm run db:push
npm run db:seed
```

This creates categories, brands, products, settings, and the default `general` settings row.

### 2.3 Verify

```bash
npm run db:studio
```

Confirm tables: `categories`, `brands`, `products`, `product_images`, `inquiries`, `settings`.

---

## 3. Supabase — Storage

### 3.1 Initialize bucket

```bash
npm run db:storage
```

Creates public bucket **`product-images`** with:

- Max file size: 5 MB
- Allowed types: JPEG, PNG, WEBP

Or create manually in Supabase Dashboard → **Storage** → **New bucket**:

- Name: `product-images`
- Public: **Yes**

### 3.2 Upload product images

Admin → **Products** → edit a product → **上传图片**.

Images are stored at:

```
{SUPABASE_URL}/storage/v1/object/public/product-images/{productId}/{uuid}.ext
```

---

## 4. Resend — Email notifications

### 4.1 API key

1. [Resend Dashboard](https://resend.com/api-keys) → Create API key
2. Set `RESEND_API_KEY` in Vercel

### 4.2 Domain verification

1. Resend → **Domains** → Add `sucaicloud.com`
2. Add DNS records (SPF, DKIM) as instructed
3. Set `FROM_EMAIL` to an address on the verified domain

**Testing only:** use `onboarding@resend.dev` as `FROM_EMAIL` (limited to your Resend account email).

### 4.3 Admin recipient

Set `ADMIN_EMAIL` to the inbox that should receive inquiry alerts.

Inquiry emails are sent automatically after successful DB write (product inquiry + contact form). Admin can **重新发送通知** from Inquiries page.

---

## 5. Vercel deployment

### 5.1 Import project

1. Push code to GitHub
2. Vercel → **Add New Project** → import repository
3. Framework preset: **Next.js**

### 5.2 Build settings

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` |
| **Node.js Version** | 20.x or 22.x |

`postinstall` runs `prisma generate` automatically.

### 5.3 Environment variables

Add all variables from Section 1 in Vercel → **Settings** → **Environment Variables**.

Apply to **Production**, **Preview**, and **Development** as needed.

**Never** add `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` as `NEXT_PUBLIC_*`.

### 5.4 Deploy

```bash
git push origin main
```

Or trigger deploy from Vercel dashboard.

### 5.5 Custom domain

1. Vercel → **Settings** → **Domains**
2. Add `sucaicloud.com` and `www.sucaicloud.com`
3. Configure DNS at your registrar (A/CNAME per Vercel instructions)
4. Set `NEXT_PUBLIC_SITE_URL=https://sucaicloud.com` after domain is live

---

## 6. Post-deploy checklist

### Infrastructure

- [ ] `npm run check:env` passes with no missing variables
- [ ] Supabase database reachable from Vercel
- [ ] `product-images` bucket exists and is public
- [ ] Resend domain verified; test email delivered

### Frontend

- [ ] Homepage loads (`/`, `/en`, `/id`)
- [ ] Product center (`/products`) shows DB products
- [ ] Product detail pages render images or placeholder
- [ ] Contact form submits successfully
- [ ] Product inquiry dialog submits successfully

### Admin

- [ ] `/admin/login` — strong credentials work
- [ ] Dashboard stats load from API
- [ ] Products / Categories / Brands CRUD works
- [ ] Image upload / delete works
- [ ] Inquiries list shows submissions
- [ ] **重新发送通知** sends email

### SEO

- [ ] `https://sucaicloud.com/robots.txt` — allows `/`, disallows `/admin`
- [ ] `https://sucaicloud.com/sitemap.xml` — includes products, about, contact
- [ ] View page source — `og:` and `twitter:` meta tags on key pages
- [ ] JSON-LD present on homepage

### Security

- [ ] `/admin` not indexed (robots + `noindex` metadata)
- [ ] `/api/admin/*` returns 401 without session cookie
- [ ] No secrets in browser Network tab or page source

---

## 7. Useful commands

```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # ESLint
npm run check:env    # Environment variable audit
npm run db:push      # Sync Prisma schema
npm run db:seed      # Seed data
npm run db:storage   # Create Storage bucket
```

---

## 8. Troubleshooting

| Issue | Check |
|-------|-------|
| Build fails on Prisma | `DATABASE_URL` set; run `prisma generate` |
| Products empty on site | Run `db:seed`; verify Supabase connection |
| Image upload 503 | `SUPABASE_SERVICE_ROLE_KEY`, run `db:storage` |
| No inquiry emails | `RESEND_API_KEY`, `FROM_EMAIL`, domain verification |
| Admin login fails | `ADMIN_USERNAME` / `ADMIN_PASSWORD` in Vercel env |
| Session lost on deploy | Set `ADMIN_SESSION_SECRET` in production |

---

## 9. Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — **server-only**
- Admin session uses HTTP-only cookie; use HTTPS in production (`secure: true`)
- Change default admin credentials before go-live
- Configure Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) to rate-limit `POST /api/inquiries` (5/min/IP)
