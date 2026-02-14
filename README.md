# Lardia

Smart eSocial assistant for Brazilian domestic employers. Calculate payroll, taxes, vacation, and 13th salary with 100% accuracy.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend (PostgreSQL + Auth)
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vitest](https://vitest.dev/) - Testing

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Environment Variables (Vercel)

In addition to `.env.example` vars, set these in Vercel:

- `ESOCIAL_PROXY_URL` - URL of the eSocial proxy server (Sao Paulo)
- `ESOCIAL_PROXY_API_KEY` - API key for proxy authentication

## Testing

```bash
npm test        # run tests
npm run test:ui # watch mode
```

## License

Private - All rights reserved.
