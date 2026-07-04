# FlashStudy AI

AI-powered flashcard SaaS built with Next.js 14, Clerk, Firebase Firestore, OpenAI, and Stripe.

## Features

- Clerk authentication with protected routes and API endpoints
- AI flashcard generation from study text via OpenAI
- **Enforced subscription tiers** with billing-period usage tracking
- Firestore-backed flashcard collection storage via Firebase Admin SDK
- Stripe checkout + webhook-driven subscription sync
- Polished UI, TypeScript, validation, unit tests, Playwright E2E, and CI

## Subscription Tiers

| Plan | Price | Flashcard Limit |
| --- | --- | --- |
| **Free Trial** | $0 for 7 days | 2 generations per day |
| **Basic** | $4.99 / month | 100 flashcards per billing period |
| **Standard** | $7.99 / month | Unlimited |
| **Premium** | $9.99 / month | Unlimited |

New users automatically receive a 7-day free trial with up to 2 flashcard generations per day. After the trial ends, a paid subscription is required. Paid plan usage limits apply once subscribed.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Clerk
- **Database:** Firebase Firestore (Admin SDK on server routes)
- **AI:** OpenAI
- **Payments:** Stripe
- **UI:** Material UI
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Arlikhozhaev/FlashStudy-AI.git
cd FlashStudy-AI
npm install --legacy-peer-deps
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FIREBASE_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |

Optional:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | Stripe price ID for Basic |
| `NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID` | Stripe price ID for Standard |
| `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for Premium |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests (auto-starts dev server) |
| `npm run test:e2e:ui` | Run Playwright with interactive UI |
| `npm run typecheck` | Run TypeScript checks |

### E2E tests locally

Playwright will automatically start `npm run dev` on port 3000 (or reuse an existing server).

1. Ensure `.env.local` is configured with your real Clerk/Stripe/Firebase/OpenAI keys.
2. Run:

```bash
npm run test:e2e
```

If you prefer to start the server yourself, run `npm run dev` in one terminal, then `npm run test:e2e` in another.

## Deploy on Vercel

1. Import the GitHub repository into [Vercel](https://vercel.com/new).
2. Set the install command to `npm ci --legacy-peer-deps`.
3. Add all environment variables from `.env.example`.
4. Deploy the app.
5. In Stripe, create a webhook endpoint pointing to:
   `https://your-domain.vercel.app/api/webhooks/stripe`
6. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel.
8. Redeploy after env updates.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

```text
app/                 Next.js routes and API handlers
components/          Shared UI components
lib/                 Plans, subscriptions, env, Firebase, Stripe, OpenAI
types/               Shared TypeScript types
e2e/                 Playwright end-to-end tests
__tests__/           Unit tests
firestore.rules      Firestore security rules
```

## Security Notes

- Secrets must live in environment variables, never in source code.
- Protected routes are enforced in `middleware.ts`.
- API routes require Clerk authentication.
- Firestore client access is denied; all reads/writes go through server routes.
- Stripe webhooks verify signatures before updating subscription state.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`
4. Open a pull request

## License

Private project. All rights reserved.
