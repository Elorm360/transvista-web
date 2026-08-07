# Waitlist Mobile Stability — Steps 1–6

## Steps
- [x] Step 1: Remove Reveal from the Waitlist section (verified no wrapping Reveal)
- [x] Step 2: Remove MagneticButton from Join Waitlist CTA (verified plain Link)
- [x] Step 3: Change global `scroll-behavior: smooth` → `auto` in `app/globals.css`
- [x] Step 4: Add `id="waitlist-form"`, `autoComplete="on"` to form; add `autoComplete="name"` to full name field
- [x] Step 5: Review Reveal — confirm it removes transforms after reveal; not used around forms/buttons
- [x] Step 6: Neutralize Hero scroll animation on screens < 768px and touch devices
- [x] Add `scroll-mt-6` to waitlist section for anchor offset
- [x] Build — `npm run build` succeeded (BUILD_ID generated)
- [x] TypeScript — `npx tsc --noEmit` passed
- [ ] Deploy to Vercel and test on iPhone 7 / newer iPhone / Safari
- [ ] Test sequence: Open → Join Waitlist → Full Name (10-20 chars) → Email → Country → Interest → Submit
