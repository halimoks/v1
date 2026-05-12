# SeedRadar — Email Deliverability Tester

A real-time email deliverability testing dashboard. Connect Gmail seed accounts via IMAP and instantly see whether your test emails land in **Inbox** or **Spam**.

![SeedRadar Dashboard](https://placehold.co/900x500/0a0a0f/00d4ff?text=SeedRadar+Dashboard)

---

## Features

- **Real-time IMAP checking** — fetches Inbox + Spam for every seed account
- **Carousel UI** — swipe or click through each account's results
- **Global filter** — search across all accounts by subject, sender IP, from name/email
- **Status indicators** — live Online/Offline per account in the sidebar
- **Deliverability score** — inbox rate percentage per account
- **Zero database** — serverless-friendly, stateless API routes
- **Dark mode** — professional terminal-style UI

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/seedradar.git
cd seedradar
npm install
```

### 2. Configure seed accounts

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
SEED_ACCOUNTS=[
  {
    "id": "s1",
    "label": "Gmail Seed 1",
    "email": "yourseed1@gmail.com",
    "password": "abcd efgh ijkl mnop",
    "host": "imap.gmail.com",
    "port": 993
  },
  {
    "id": "s2",
    "label": "Gmail Seed 2",
    "email": "yourseed2@gmail.com",
    "password": "xxxx xxxx xxxx xxxx",
    "host": "imap.gmail.com",
    "port": 993
  }
]
```

> **Important:** Use Gmail [App Passwords](https://myaccount.google.com/apppasswords), NOT your real Gmail password. You must have 2FA enabled on the Google account.

### 3. Enable IMAP in Gmail

For each seed account:
1. Go to **Gmail Settings** → **See all settings** → **Forwarding and POP/IMAP**
2. Enable **IMAP Access**
3. Save changes

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### Option A: GitHub + Vercel (recommended)

1. Push your repo to GitHub (`.env.local` is gitignored — never committed)
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add environment variable in Vercel dashboard:
   - **Key:** `SEED_ACCOUNTS`
   - **Value:** the JSON array (minified, no line breaks)
4. Deploy!

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel env add SEED_ACCOUNTS
vercel --prod
```

> **Note:** Vercel Hobby plan has a 10s function timeout. Upgrade to Pro for the full 60s timeout configured in `vercel.json`. With many seed accounts, consider checking accounts individually using `GET /api/check?accountId=s1`.

---

## API Reference

### `GET /api/check`

Checks all seed accounts via IMAP and returns results.

**Query params:**
- `accountId` (optional) — check a single account by ID

**Response:**
```json
{
  "results": [
    {
      "accountId": "s1",
      "email": "seed1@gmail.com",
      "label": "Gmail Seed 1",
      "status": "online",
      "emails": [
        {
          "uid": 12345,
          "subject": "Your test campaign",
          "from": "sender@yourdomain.com",
          "fromName": "Marketing Team",
          "senderIp": "203.0.113.42",
          "date": "2024-01-15T10:30:00.000Z",
          "location": "inbox",
          "snippet": ""
        }
      ],
      "lastChecked": "2024-01-15T10:31:00.000Z"
    }
  ],
  "checkedAt": "2024-01-15T10:31:00.000Z"
}
```

### `GET /api/accounts`

Returns all configured accounts (no sensitive data — passwords never exposed).

---

## Adding Non-Gmail Accounts

Update `SEED_ACCOUNTS` with different IMAP settings:

```json
{
  "id": "outlook1",
  "label": "Outlook Seed",
  "email": "seed@outlook.com",
  "password": "your-password",
  "host": "outlook.office365.com",
  "port": 993
}
```

> Note: Non-Gmail accounts may use `Junk` instead of `[Gmail]/Spam`. The IMAP fetcher tries both automatically.

---

## Project Structure

```
seedradar/
├── app/
│   ├── api/
│   │   ├── check/route.ts      ← IMAP check endpoint
│   │   └── accounts/route.ts   ← Safe account listing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx            ← Main carousel layout
│   ├── Sidebar.tsx              ← Fixed account list
│   ├── AccountSlide.tsx         ← Per-account carousel slide
│   └── EmailCard.tsx            ← Individual email display
├── lib/
│   ├── accounts.ts              ← Env parsing + masking
│   └── imap.ts                  ← ImapFlow connection logic
├── types/
│   └── index.ts                 ← TypeScript interfaces
├── .env.example
├── vercel.json
└── next.config.js
```

---

## Security Notes

- All IMAP credentials live **only** in environment variables — never in code or client bundles
- The `/api/accounts` endpoint strips passwords before responding
- IMAP connections are server-side only (Next.js API routes / Server Components)
- `imapflow` is listed in `serverComponentsExternalPackages` — never bundled client-side

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `offline` — "No app password configured" | Add `password` field to `SEED_ACCOUNTS` env var |
| `offline` — "IMAP connection timed out" | Check Gmail IMAP is enabled; verify app password |
| `offline` — auth error | Regenerate Gmail App Password; ensure 2FA is on |
| Spam folder shows 0 emails | Some Gmail accounts use `[Gmail]/Spam` — already handled |
| Vercel timeout | Upgrade to Pro plan or check one account at a time via `?accountId=` |

---

## License

MIT
