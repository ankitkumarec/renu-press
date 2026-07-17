# Client demo — ready to share

## GitHub (code)

**Repo (public):** https://github.com/ankitkumarec/renu-press  

Client can open the repo, or you import it to Vercel for a **live URL**.

---

## WhatsApp / email message (copy)

```
Namaste,

RENU PRESS website + admin panel ka demo ready hai.

🔗 Code (GitHub):
https://github.com/ankitkumarec/renu-press

🌐 Live site:
(apna Vercel URL yahan paste karein — steps neeche)

🔐 Admin login:
URL: [LIVE_URL]/admin
Email: admin@renupress.in
Password: Renu@Admin2026

Please check homepage, services, quote form, and admin settings.
Feedback welcome.
```

---

## Free live site (2 minutes) — Vercel

1. Open https://vercel.com → Login with **GitHub**
2. **Add New Project** → Import **`ankitkumarec/renu-press`**
3. Environment Variables:

| Name | Value |
|------|--------|
| `JWT_SECRET` | `renu-press-demo-secret-change-later` |
| `NEXT_PUBLIC_APP_URL` | leave blank first, then set to your `https://….vercel.app` after first deploy |
| `DATABASE_URL` | use Neon (below) **or** for quick try: `file:./dev.db` (may not persist on Vercel) |

4. **Build Command:**  
   `npm run vercel-build`
5. Deploy → copy **https://renu-press-xxx.vercel.app**

### Database that works on free Vercel (recommended)

1. https://neon.tech → free project → copy **connection string**  
2. Vercel env:  
   `DATABASE_URL` = `postgresql://...`  
3. In repo `prisma/schema.prisma` change:

```prisma
provider = "postgresql"
```

4. Redeploy  

*(Local demo already works with SQLite on your PC: http://localhost:3000)*

---

## Demo logins

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@renupress.in | Renu@Admin2026 |
| Customer | customer@example.com | Customer@123 |

---

## Local demo (agar live abhi nahi)

Aapke PC pe already chal raha hai:

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin  

Client ko dikhane ke liye temporary: **ngrok** / **Cloudflare Tunnel** se port 3000 share kar sakte ho.
