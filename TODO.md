# TODO — Fix mobile Safari / older iPhone freezes

## Steps
- [x] 1. HeroVisual: disable parallax + scale on touch/coarse-pointer devices
- [x] 2. HeroVisual: remove backdrop-blur-sm from floating cards (use solid opaque backgrounds)
- [x] 3. Navbar: replace backdrop-blur-xl with solid opaque backgrounds
- [x] 4. MagneticButton: only enable magnetic effect on hover-capable (fine pointer) devices
- [x] 5. Reveal: add IntersectionObserver fallback so content is never left hidden
- [x] 6. ExperienceCard: remove backdrop-blur-sm from category pill
- [x] 7. Run `npm run build` to verify no errors
- [ ] 8. Commit and push to trigger redeploy
