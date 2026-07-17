# RENU PRESS — Premium Printing Website + Admin

**Business:** RENU PRESS · Saharsa, Bihar  
**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Prisma · SQLite  

Live demo for client review. Full catalogue, quotes, tracking, and admin CMS.

---

## Live demo (client)

| | |
|--|--|
| **Website** | *(deploy URL after Vercel/GitHub Pages setup)* |
| **Admin** | `/admin` on the same domain |

### Demo logins

| Role | Email | Password |
|------|--------|----------|
| **Admin** | `admin@renupress.in` | `Renu@Admin2026` |
| Customer | `customer@example.com` | `Customer@123` |

> Change passwords before production.

---

## Run locally

```bash
git clone https://github.com/ankitkumarec/renu-press.git
cd renu-press
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open **http://localhost:3000**

---

## Deploy free live (Vercel — recommended)

1. Push this repo to GitHub  
2. Go to [vercel.com](https://vercel.com) → **Import** this repo  
3. Environment variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | `file:./dev.db` *(or PostgreSQL URL for production)* |
| `JWT_SECRET` | long random string |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL e.g. `https://renu-press.vercel.app` |

4. Build command: `prisma generate && prisma db push && tsx prisma/seed.ts && next build`  
   Or use the `vercel-build` script below.

5. Deploy → share the URL with the client.

### Build script (package.json)

```bash
npm run vercel-build
```

---

## Features for demo

- Premium colourful public website (hero, stats, services, portfolio, team, quotes)
- 70+ printing services (seeded)
- Quick quote + contact forms → admin leads
- Order tracking API
- **Admin CMS:** site settings (phone, WhatsApp, GST, maps, hero, SEO)
- Founder: **Nitish Kumar (नितीश कुमार)** on homepage leadership
- Customer login / signup foundation

---

## Folder

```
src/app/(site)   Public website
src/app/admin    Admin panel
src/app/api      APIs
prisma/          Schema + seed
```

---

## Contact (demo defaults — edit in Admin → Site settings)

Editable from admin: phone, WhatsApp, email, address, GST, hours, Google Maps.
