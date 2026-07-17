# RENU PRESS — Enterprise AI Support Gateway

Node.js **API Gateway** that owns all business logic.  
**AI (Ollama Qwen2.5-VL) never accesses the database, prices, invoices, or inventory.**

```
Customer → React Chat → Express Gateway → Business Rules
         → Memory / Product KB slice → Ollama (Qwen2.5-VL)
         → Validate JSON → ERP (Prisma/PostgreSQL)
         → Customer (reply only)
```

## Stack

| Layer | Tech |
|--------|------|
| Gateway | Node.js + Express |
| Realtime | Socket.io |
| DB | PostgreSQL (shared Prisma schema) |
| Local AI | Ollama · `qwen2.5vl:7b` |
| OCR | PaddleOCR (optional Python script) |
| Storage | Cloudinary (optional) |

## Quick start

### 1. Install gateway deps

```bash
cd server
npm install
```

### 2. Environment (root `.env` or `server/.env`)

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPPORT_GATEWAY_PORT=4001
CORS_ORIGINS=http://localhost:3000

# Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:7b

# Optional Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend (Next.js)
NEXT_PUBLIC_SUPPORT_API_URL=http://localhost:4001
NEXT_PUBLIC_SUPPORT_SOCKET_URL=http://localhost:4001
```

### 3. Ollama + model

```bash
# Install Ollama from https://ollama.com
ollama pull qwen2.5vl:7b
ollama serve
```

### 4. Optional PaddleOCR

```bash
pip install paddlepaddle paddleocr
# Script: server/scripts/paddle_ocr.py
```

### 5. Run gateway

```bash
npm run dev
# → http://localhost:4001/health
```

### 6. Next.js frontend

```bash
# project root
set NEXT_PUBLIC_SUPPORT_API_URL=http://localhost:4001
npm run dev
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Gateway + Ollama status |
| POST | `/api/support/session` | Create/resume session |
| POST | `/api/support/chat` | Message (rules → AI → ERP) |
| POST | `/api/support/upload` | File (scan → OCR → VL → ERP) |
| WS | `/socket.io` | Realtime agent messages |

### Chat body

```json
{ "sessionId": "rp_...", "message": "I need a flex banner" }
```

### AI JSON contract (internal)

```json
{
  "reply": "Customer-facing text only shown in UI",
  "intent": "Banner Printing",
  "lead_score": 91,
  "priority": "High",
  "next_question": "What size?",
  "recommended_products": ["Flex Banner"],
  "analysis": {}
}
```

Customer **only** sees `reply`. Node uses the rest for CRM/ERP.

## Business rules (enforced in Node)

- No direct AI → database
- No prices / discounts / delivery guarantees from model
- Restricted prompts blocked
- Outbound reply scrubbed of identity leaks & invented ₹ amounts
- Lead creation + admin alerts only via services

## Fallback

If Ollama is offline, the **rules engine** still returns the same JSON shape so production never hard-fails.
