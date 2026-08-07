# Waitlist Duplicate Handling Fix

## Steps
- [x] Step 1: Replace thrown `DuplicateWaitlistEntry` in `app/actions/waitlist.ts` with a structured return
- [x] Step 1: Add `duplicate: false` to the success return in `app/actions/waitlist.ts`
- [x] Step 1: Update `classifySupabaseError` `23505` case to return a clear message instead of `"duplicate"`
- [x] Step 2: Update success handling in `WaitlistForm.tsx` to handle `result.duplicate`
- [x] Step 2: Simplify the `catch` block (remove string-matching duplicate logic)
- [x] Step 3: Reset the form on the duplicate response as well
- [x] Follow-up: Run TypeScript check / lint

# iOS Safari Waitlist Fix

## Steps
- [x] Remove `Reveal` wrapper from the interactive waitlist form container in `Waitlist.tsx`
- [x] Keep `Reveal.tsx` intact for ordinary content
- [ ] Commit and push to `origin/main` for Vercel auto-deploy
