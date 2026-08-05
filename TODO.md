# TODO — Fix mobile Safari / older iPhone freezes

## Steps
- [x] 1. HeroVisual: disable parallax + scale on touch/coarse-pointer devices
- [x] 2. HeroVisual: remove backdrop-blur-sm from floating cards (use solid opaque backgrounds)
- [x] 3. Navbar: replace backdrop-blur-xl with solid opaque backgrounds
- [x] 4. MagneticButton: only enable magnetic effect on hover-capable (fine pointer) devices
- [x] 5. Reveal: add IntersectionObserver fallback so content is never left hidden
- [x] 6. ExperienceCard: remove backdrop-blur-sm from category pill
- [x] 7. Run `npm run build` to verify no errors
- [x] 8. Commit and push to trigger redeploy

# TODO — Fix waitlist form scroll-jump on typing

## Root cause
The `Reveal` wrapper around the waitlist section permanently applied
`will-change-transform` + a transform (`translate-x-0 translate-y-0`) on the
revealed state. This compositing layer caused iOS Safari to re-anchor the
scroll position whenever the form subtree re-rendered (every keystroke),
jumping the page back to the waitlist.

## Fix
- [x] Only apply the transform + `will-change-transform` in the hidden state.
      Once visible, the wrapper returns to a plain, un-transformed element so
      typing in the form never triggers a scroll jump.
- [x] Run `npm run build` to verify (passed cleanly).
