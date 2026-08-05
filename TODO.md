# TransVista Landing Page — Premium Minimal Redesign

## Objective
Tighten, simplify, and elevate the landing page to a warm, premium, modern aesthetic that reads as human-crafted (not generic AI). Visual/layout refinement only — all content, copy, waitlist logic, and admin functionality stay intact.

## Direction (Approved)
- **Mood**: Warm premium minimalism (warm off-white canvas, warm-slate ink, sunlit amber single accent)
- **Density**: Reduce all vertical padding/section heights/title sizes
- **Sections**: Keep all, tighten & de-clutter (remove duplicated CTAs, trailing links)
- **Animations**: Lightweight — custom IntersectionObserver `Reveal`, sticky nav, hero parallax, magnetic CTA, hover lift
- **Typography**: `Fraunces` serif display + `Plus Jakarta Sans` body

## Steps
- [x] 1. Add `Fraunces` display font in `app/layout.tsx`, wire `--font-heading`
- [x] 2. Refine warm palette + typographic scale in `app/globals.css`
- [x] 3. Tighten spacing/radius tokens in `constants/design.ts`
- [x] 4. Reduce default section padding in `components/ui/Section.tsx`
- [x] 5. Tighten `SectionHeader.tsx` (serif heading, smaller, tighter margins)
- [x] 6. Create `components/motion/Reveal.tsx` (IntersectionObserver scroll reveal)
- [x] 7. Sticky navbar elevation in `Navbar.tsx`
- [x] 8. Hero: tighten sizes, parallax image, magnetic CTA
- [x] 9. WhyTransVista: slim 3-up value strip
- [x] 10. Experiences: tighter cards
- [x] 11. ExploreByExperience: tighten cards + CTA reveal
- [x] 12. HowItWorks: compact 3-step row
- [x] 13. Ecosystem: tight 4-pillar row + warm bg
- [x] 14. Waitlist: elegant split panel (copy left, short form right)
- [x] 15. Footer: tighter, calmer
- [x] 16. Verify type check passes (tsc --noEmit clean)

## Social Icons (Step 2)
- [x] 1. Add real social URLs to `constants/config/brand.ts` (LinkedIn, Facebook, Instagram, TikTok)
- [x] 2. Update `content/footer.ts` social platform list to include TikTok
- [x] 3. Replace text-based "Stay Connected" column with `react-icons/si` social icons in `components/layout/Footer.tsx`
- [x] 4. Verify lint passes

## Admin: Delete Member + Welcome Email Logo
- [x] 1. Create `app/actions/community.ts` server action `deleteMember` with admin auth check
- [x] 2. Add per-row action menu + confirmation dialog + detail view to `components/admin/CommunityTable.tsx`
- [x] 3. Update `emails/welcome.tsx` logo `src` to production URL
- [x] 4. Verify type check + lint pass
