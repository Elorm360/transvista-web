# Waitlist Duplicate Handling Fix

## Steps
- [x] Step 1: Replace thrown `DuplicateWaitlistEntry` in `app/actions/waitlist.ts` with a structured return
- [x] Step 1: Add `duplicate: false` to the success return in `app/actions/waitlist.ts`
- [x] Step 1: Update `classifySupabaseError` `23505` case to return a clear message instead of `"duplicate"`
- [x] Step 2: Update success handling in `WaitlistForm.tsx` to handle `result.duplicate`
- [x] Step 2: Simplify the `catch` block (remove string-matching duplicate logic)
- [x] Step 3: Reset the form on the duplicate response as well
- [x] Follow-up: Run TypeScript check / lint

# iOS Safari Stabilization

## Steps
- [x] Remove `Reveal` wrapper from the interactive waitlist form container in `Waitlist.tsx`
- [x] Keep `Reveal.tsx` intact for ordinary content

# iPhone 7 Stabilization (Steps 1–3)

## Steps
- [x] Step 1: Remove `MagneticButton` from Join Waitlist in `HeroActions.tsx` (keep it a plain link)
- [x] Step 2: Disable HeroVisual parallax on touch devices (`(hover: none), (pointer: coarse)`)
- [x] Step 3: Keep Waitlist outside `Reveal` (verify only)
- [x] TypeScript check passes
- [ ] Deploy to Vercel (commit + push)
- [ ] Send `app/globals.css` and `app/layout.tsx` to the user for inspection (contents shared in chat)
- [ ] Get the iPhone 7 exact iOS version from the user
