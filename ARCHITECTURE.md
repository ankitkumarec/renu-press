# RENU PRESS — Enterprise AI Support Architecture

This is **not** a standalone chatbot.  
It is the official **RENU PRESS Support Team** platform: customer messenger + Node business core + optional local vision LLM.

## Topology

```
Customer
   │
   ▼
React / Next.js Support Messenger  (src/components/support/*)
   │
   │  NEXT_PUBLIC_SUPPORT_API_URL  (optional)
   ▼
┌──────────────────────────────────────────────────────────┐
│  API Gateway  (server/)  Node.js + Express + Socket.io   │
│                                                          │
│  • Auth / rate limit / validation                        │
│  • Business Rules Engine  (price, delivery, identity)    │
│  • Conversation memory (PostgreSQL via Prisma)           │
│  • Product knowledge slice (never full ERP dump)         │
│  • Lead / CRM / admin alerts                             │
│  • Cloudinary upload (optional)                          │
│  • PaddleOCR hook (optional)                             │
│  • Ollama Qwen2.5-VL  (never DB credentials)             │
└──────────────────────────────────────────────────────────┘
   │                    │                    │
   ▼                    ▼                    ▼
PostgreSQL          Ollama              PaddleOCR
(+ Prisma ERP)      qwen2.5vl:7b        (optional)
```

## Hard rules

| Rule | Enforcement |
|------|-------------|
| AI never queries DB | Only `server/src/services/*` use Prisma |
| AI never prices / invoices / inventory | `businessRules.ts` inbound + outbound |
| Customer only sees `reply` | Gateway strips ERP JSON from UI contract |
| Identity = Support Team | Forbidden “I am AI/bot” strings scrubbed |

## Paths

| Mode | How |
|------|-----|
| **Vercel / simple** | Next.js `/api/support/*` (existing rule-based + prepress stack) |
| **Enterprise local** | Express gateway on `:4001` + Ollama + optional OCR/Cloudinary |

## AI JSON contract

Model (or rules fallback) must return:

```json
{
  "reply": "Customer-facing only",
  "intent": "Banner Printing",
  "lead_score": 91,
  "priority": "High",
  "next_question": "What size?",
  "recommended_products": ["Flex Banner"],
  "analysis": { "image_quality": "Good" }
}
```

## Run enterprise stack

```bash
# Terminal 1 — Ollama
ollama pull qwen2.5vl:7b
ollama serve

# Terminal 2 — Gateway
cd server && npm install && npm run dev

# Terminal 3 — Next.js
# .env: NEXT_PUBLIC_SUPPORT_API_URL=http://localhost:4001
npm run dev
```

See `server/README.md` for env vars and API details.

## Related modules (Next monorepo)

- Support UI: `src/components/support/`
- Pre-press inspector: `src/lib/prepress/inspector.ts`
- Product recommender: `src/lib/support/recommend.ts`
- ERP Support / Artwork: `/erp/support`, `/erp/artwork`
