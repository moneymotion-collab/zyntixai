# FITAI — Fitness CRM

Unified Next.js dashboard for fitness coaches: clients, appointments, AI messages, and analytics.

Previously split across `fitness-saas` and `fitai-next-app`; everything now lives in this single app.

## Run locally

```bash
npm install
npm run dev
```

If `npm install` fails or `next` is not found (corrupt `node_modules`), run **`schone-installatie.cmd`** in this folder (double-click). That does a clean reinstall.

After merge, remove old duplicate folders with **`verwijder-oude-mappen.cmd`** (optional; only when you no longer need backups).

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to login. Any email/password works (demo auth via `sessionStorage`).

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/dashboard` | Main overview |
| `/clients` | Client list |
| `/appointments` | Schedule |
| `/ai-messages` | Automated messages |
| `/analytics` | Revenue chart |
| `/settings` | Settings (placeholder) |

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Lucide icons
- Mock data in `lib/fake-data.ts`
