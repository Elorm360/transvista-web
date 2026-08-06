# TODO — Fix Waitlist "Couldn't complete your request" error

## Root Cause
The generic error shown is the catch-all in `WaitlistForm.tsx`. The `joinWaitlist` server action throws when the Supabase `leads` table select/insert fails (table missing, RLS blocks, or schema mismatch). Email failures are already gracefully handled and are NOT the cause.

## Steps
- [x] **Step 1:** Create `supabase/migrations/0001_create_leads_table.sql` with the `leads` table, RLS policies, and unique email index.
- [x] **Step 2:** Improve `app/actions/waitlist.ts` to log the actual Supabase error code/message and return more specific messages for common failures (table missing / permission denied).
- [x] **Step 3:** Run the migration in the Supabase SQL Editor — the `leads` table, RLS policies, and unique email index were created successfully ("Success. No rows returned").
- [ ] **Step 4:** Verify form submission works; if it still fails, read the server logs for the specific error code.

## Followup
- [ ] Run `npm run dev` (or `npm run build`) to verify no compile errors.
