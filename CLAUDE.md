# CLAUDE.md - Project Guidelines

## Project: LarDia
Smart eSocial assistant for Brazilian domestic employers.

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS v4
- **Backend/Auth/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel
- **Testing:** Vitest

## Language Rules
- **Code:** English (variables, functions, comments, git commits)
- **UI text:** Portuguese (Brazilian) only
- **No i18n** for now - PT-BR hardcoded

## Architecture
- `src/lib/calc/` - Calculation engine (payroll, taxes, vacation, 13th, termination)
- `src/lib/calc/tax-tables.ts` - Versioned tax tables (INSS, FGTS, IRRF rates)
- `src/lib/supabase/` - Supabase client setup (browser + server)
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (shadcn/ui based)

## Calculation Engine Rules
- **100% accuracy is mandatory** - this is the core value proposition
- All calculations use progressive rates (INSS is NOT flat rate)
- Always divide by 30 for daily rate (commercial month)
- Always divide by 220 for hourly rate (full-time)
- Tax tables are versioned and never hardcoded in calculation logic
- Every calculation must have unit tests
- Round to 2 decimal places using Math.round(value * 100) / 100

## Key Business Logic
- INSS employee: progressive brackets (7.5%, 9%, 12%, 14%)
- INSS employer: 8% CP Patronal + 0.8% GILRAT
- FGTS: 8% monthly + 3.2% anticipation
- IRRF: progressive brackets after INSS deduction
- DAE = INSS employee + INSS employer + GILRAT + FGTS monthly + FGTS anticipation
- Absences: salary / 30 * absence days
- DSR: lost rest days when employee has absences in the week

## Testing
- Run tests: `npx vitest run`
- Watch mode: `npx vitest`
- Every calculation module needs comprehensive tests
- Test edge cases: proportional months, mid-month changes, ceiling values

## Git Conventions
- Commit messages in English, imperative mood
- Branch naming: `feature/xxx`, `fix/xxx`
