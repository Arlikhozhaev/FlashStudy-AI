# FlashStudy AI

AI-powered flashcard SaaS built with Next.js 14, Clerk, Firebase Firestore, OpenAI, and Stripe.

## Features

- Clerk authentication with protected routes and API endpoints
- AI flashcard generation from study text via OpenAI
- Firestore-backed flashcard collection storage
- Stripe subscription checkout with webhook endpoint
- TypeScript, input validation, shared UI components, and CI

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Clerk
- **Database:** Firebase Firestore (Admin SDK on server routes)
- **AI:** OpenAI
- **Payments:** Stripe
- **UI:** Material UI

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Arlikhozhaev/FlashStudy-AI.git
cd FlashStudy-AI
npm install --legacy-peer-deps
```

### 2. Configure environment variables

Copy the example file and fill in your credentials:

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
| `FIREBASE_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |

Optional:

| Variable | Description |
| --- | --- |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_*_PRICE_ID` | Stripe price IDs for each plan |

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
| `npm run typecheck` | Run TypeScript checks |

## Project Structure

```text
app/                 Next.js routes and API handlers
components/          Shared UI components
lib/                 Env, Firebase, OpenAI, Stripe, validation
types/               Shared TypeScript types
utils/               Client utilities
__tests__/           Unit tests
firestore.rules      Firestore security rules template
```

## Security Notes

- Secrets must live in environment variables, never in source code.
- Protected routes are enforced in `middleware.ts`.
- API routes require Clerk authentication.
- Deploy `firestore.rules` and tighten access before production launch.
- Configure the Stripe webhook endpoint at `/api/webhooks/stripe`.

## Deployment

Deploy to Vercel or any Node.js host that supports Next.js 14.

1. Add all environment variables in your hosting provider.
2. Connect Stripe webhook events to `/api/webhooks/stripe`.
3. Deploy Firestore security rules from `firestore.rules`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run lint`, `npm run test`, and `npm run build`
4. Open a pull request

## License

Private project. All rights reserved.
