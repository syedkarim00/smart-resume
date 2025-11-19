# Smart Resume Copilot

Smart Resume Copilot is a Next.js (App Router) experience that lets job seekers upload or paste their resume, add a job link or description, and instantly generate tailored resumes, LinkedIn headlines, and recruiter email templates. The project also includes Stripe-powered billing with a free tier and a $29/mo pro subscription plus deployment guidance for Cloudflare Pages/Workers.

## Features

- ✍️ **Resume rewrite workbench** – upload a file or paste text, provide a job link/description, add focus areas, and call the GPT-powered `/api/rewrite` endpoint for tailored output.
- 💼 **LinkedIn headline optimizer** – dedicated flow for brainstorming keyword-rich headline options.
- 📧 **Recruiter email templates** – prompt-driven outreach generator with tone controls and CTA guidance.
- 💳 **Stripe billing** – free tier messaging plus checkout and billing portal links via `/api/stripe`.
- ☁️ **Cloudflare-ready** – `wrangler.toml`, standalone Next.js output, and documented environment variables for GPT + Stripe.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on <http://localhost:3000>. Update environment variables in a `.env.local` file (documented below) before calling the GPT or Stripe APIs.

## Environment variables

Create `.env.local` for local development and set the same variables in Cloudflare (Dashboard → Workers & Pages → Settings → Variables).

| Name | Description |
| --- | --- |
| `GPT_API_KEY` | Secret key for the GPT model you want to use. Required for `/api/rewrite`. |
| `GPT_API_URL` | Optional override of the chat completions endpoint. Defaults to `https://api.openai.com/v1/chat/completions`. |
| `GPT_MODEL` | Optional model name (defaults to `gpt-4o-mini`). |
| `STRIPE_SECRET_KEY` | Stripe secret key used server-side in `/api/stripe`. |
| `STRIPE_PRO_PRICE_ID` | Price ID for the $29/mo subscription (falls back to `STRIPE_PRICE_ID`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key for loading Stripe.js on the client. |
| `NEXT_PUBLIC_STRIPE_TEST_CUSTOMER_ID` | Optional helper for testing the billing portal from the UI. |
| `NEXT_PUBLIC_APP_URL` | Base URL used for Stripe redirect defaults (e.g., `https://smart-resume.pages.dev`). |

## GPT rewrite API

The `app/api/rewrite/route.ts` handler accepts JSON payloads with a `mode`:

- `resume`: `{ resumeText: string, jobDescription?: string, jobLink?: string, focusAreas?: string[], tone?: string }`
- `headline`: `{ background: string, targetRole?: string, priorities?: string[] }`
- `email`: `{ scenario: string, tone?: string, callToAction?: string }`

Each mode constructs a specialized prompt (see `lib/prompts.ts`, `lib/headline.ts`, and `lib/emailTemplates.ts`) before calling the GPT API. The response returns `{ result: string }` or `{ error: string }`.

## Stripe billing API

`app/api/stripe/route.ts` creates Stripe Checkout sessions (intent `checkout`) or Billing Portal sessions (intent `portal`). Configure `STRIPE_SECRET_KEY` plus a price ID, and update `NEXT_PUBLIC_APP_URL` for redirect URLs. The client-side `SubscriptionPanel` component posts to this endpoint and redirects using the returned URL.

## Cloudflare deployment

1. Install Wrangler: `npm install -g wrangler` (or use `npx wrangler`).
2. Build for Pages: `npx wrangler pages deploy . --project-name smart-resume` (runs `npx @cloudflare/next-on-pages` per `wrangler.toml`).
3. Add environment variables/secrets:
   ```bash
   wrangler secret put GPT_API_KEY
   wrangler secret put STRIPE_SECRET_KEY
   wrangler secret put STRIPE_PRO_PRICE_ID
   wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   wrangler secret put NEXT_PUBLIC_APP_URL
   ```
4. (Optional) Use Cloudflare KV or D1 for usage tracking or plan enforcement.

`next.config.ts` is set to `output: "standalone"`, which Next-on-Pages uses to emit a Cloudflare-compatible bundle.

## Project structure

```
app/
  api/
    rewrite/route.ts    # GPT prompt handler
    stripe/route.ts     # Stripe checkout + billing portal
  layout.tsx            # Global metadata/fonts
  page.tsx              # Marketing hero + modules
components/
  ResumeWorkbench.tsx   # Resume/job/link inputs + AI responses
  SubscriptionPanel.tsx # Free vs. Pro plans and Stripe actions
lib/
  prompts.ts            # Resume prompt builder
  headline.ts           # LinkedIn optimizer prompt + defaults
  emailTemplates.ts     # Recruiter outreach prompt helpers
wrangler.toml           # Cloudflare Pages config
```

## Usage tips

- Use the upload control to import `.txt`, `.md`, `.doc`, `.docx`, `.rtf`, or `.pdf` files; the contents are read in-browser and sent to the API.
- Switch between modules without losing work – each section persists its state while the page is loaded.
- Customize tone/focus areas to steer GPT results toward metrics, leadership signals, or outreach style.
- Extend `/api/rewrite` with new `mode` branches for additional career workflows.

## Testing & linting

```
npm run lint
```

Add frameworks like Playwright or Vitest if you need automated UI or API coverage.
