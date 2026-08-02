# Sprint 8 — Phase 1: Architecture First

## Objective

Build the foundation for the Experiences section correctly — modular structure, centralized content, reusable card, responsive layout. No images, no animations yet.

## Steps

- [x] Plan approval
- [x] Create TODO.md
- [x] **Step 1: Create `content/experiences.ts`**
  - [x] `experiencesContent` with badge, title, description, and 3 items (each with `id`)
- [x] **Step 2: Create `ExperienceCard.tsx`**
  - [x] Typed props (`title`, `category`, `location`)
  - [x] `aspect-[4/3] rounded-2xl bg-slate-200` image placeholder
  - [x] Category, title, location, "Explore →" CTA
- [x] **Step 3: Create `Experiences.tsx`**
  - [x] Reuse `Section`, `Container`, `SectionHeader`
  - [x] Responsive grid `mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3`
- [x] **Step 4: Create `index.ts` barrel export**
  - [x] `export { Experiences } from "./Experiences";`
- [x] **Step 5: Update `app/page.tsx`**
  - [x] Add `<Experiences />` below `<WhyTransVista />`
- [x] **Step 6: Update TODO.md** (this file)
- [x] **Step 7: Verify build**
  - [x] Run `npm run build` to ensure no errors

# Sprint 8 — Phase 2: Experience Card Polish

## Objective

Refine the Experiences section to feel premium — intentional placeholder, editorial typography, calm hover interactions, future-ready data.

## Steps

- [x] Plan approval
- [x] **Step 1: Add `slug` field to `content/experiences.ts`**
  - [x] Add `slug` to `Experience` interface and each item for future routing
- [x] **Step 2: Refine `ExperienceCard.tsx`**
  - [x] Intentional photography placeholder ("Original Photography / Coming Soon")
  - [x] Editorial typography — uppercase category, prominent title, muted location
  - [x] "Explore →" editorial link with subtle arrow micro-interaction
  - [x] Gentle hover elevation (`hover:-translate-y-1`, `hover:shadow-xl`)
- [x] **Step 3: Improve grid spacing in `Experiences.tsx`**
  - [x] `gap-8` → `gap-10`
- [x] **Step 4: Update TODO.md**
- [x] **Step 5: Verify build**
  - [x] Run `npm run build`

# Sprint 9 — Phase 1: Explore by Experience (Architecture)

## Objective

Build the information architecture for the Explore by Experience section — six travel-style categories, centralized content, reusable card, responsive grid. No icons, animations, or real images yet.

## Steps

- [x] Plan approval
- [x] Create TODO.md
- [x] **Step 1: Create `content/explore-by-experience.ts`**
  - [x] `exploreByExperienceContent` with badge, title, description, and 6 categories (each with `id`, `slug`, `title`, `subtitle`)
- [x] **Step 2: Create `ExperienceCategoryCard.tsx`**
  - [x] Typed props (`title`, `subtitle`)
  - [x] Neutral photography placeholder (consistent with Experiences)
  - [x] Title, subtitle, "Discover →" editorial link with subtle arrow micro-interaction
  - [x] Calm hover elevation (`hover:-translate-y-1`, `hover:shadow-xl`)
- [x] **Step 3: Create `ExploreByExperience.tsx`**
  - [x] Reuse `Section`, `Container`, `SectionHeader`
  - [x] Responsive grid `mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3`
- [x] **Step 4: Create `index.ts` barrel export**
  - [x] `export { ExploreByExperience } from "./ExploreByExperience";`
- [x] **Step 5: Update `app/page.tsx`**
  - [x] Add `<ExploreByExperience />` below `<Experiences />`
- [x] **Step 6: Update TODO.md** (this file)
- [x] **Step 7: Verify build**
  - [x] Run `npm run build`

# Sprint 9 — Phase 2: Explore by Experience Polish

## Objective

Make the Explore Ghana by Experience section feel premium and reinforce Discovery — refined copy, contextual conversion CTA, sibling consistency with Experience cards.

## Steps

- [x] Plan approval
- [x] **Step 1: Refine section copy in `content/explore-by-experience.ts`**
  - [x] Updated description to "Whether you're drawn to culture, nature, beaches, food, or adventure..."
  - [x] Added `cta` block (title, description, action) to content
- [x] **Step 2: Category cards already polished in Phase 1**
  - [x] Subtle hover interactions (`hover:-translate-y-1`, `hover:shadow-xl`, arrow slide)
  - [x] Visual consistency with Experience cards (rounded corners, white bg, soft border, editorial typography)
- [x] **Step 3: Add contextual "Not sure where to begin?" CTA**
  - [x] Rendered below the grid with copy from content
  - [x] Reuses `WaitlistButton`
- [x] **Step 4: Review spacing between homepage sections**
  - [x] Confirmed `Section` component (`py-20 lg:py-28`) provides consistent vertical spacing
- [x] **Step 5: Update TODO.md**
- [x] **Step 6: Verify build**
  - [x] Run `npm run build`

# Sprint 10 — How TransVista Works

## Objective

Build a simplicity-focused section that reassures visitors after the earlier inspirational sections — three clear steps (Discover, Plan, Explore) with icon support. Emotional job: Simplicity.

## Steps

- [x] Plan approval
- [x] **Step 1: Add step icons to `lib/icons.tsx`**
  - [x] `stepIcons` mapping — Compass (Discover), Route (Plan), Mountain (Explore) at `h-8 w-8`
- [x] **Step 2: Create `content/how-it-works.ts`**
  - [x] Badge "How It Works", title "Travel planning, simplified.", benefits-focused description
  - [x] 3 steps (Discover, Plan, Explore) with title, description, icon key
- [x] **Step 3: Create `HowItWorksStep.tsx`**
  - [x] Distinct from Experience cards — no image placeholder, icon at top in soft circular blue bg, more whitespace
  - [x] Soft border, slight hover elevation
- [x] **Step 4: Create `HowItWorks.tsx`**
  - [x] Reuse `Section`, `Container`, `SectionHeader`
  - [x] Responsive grid `mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3`
- [x] **Step 5: Create `index.ts` barrel export**
  - [x] `export { HowItWorks } from "./HowItWorks";`
- [x] **Step 6: Update `app/page.tsx`**
  - [x] Add `<HowItWorks />` below `<ExploreByExperience />`
- [x] **Step 7: Update TODO.md**
- [x] **Step 8: Verify build**
  - [x] Run `npm run build`

# Sprint 13 — Phase 1: Waitlist CTA

## Objective

Build the conversion climax of the homepage — a single-job section that convinces visitors to join the waitlist. Emotional job: Commitment. Business question: "What's my next step?"

## Steps

- [x] Plan approval
- [x] **Step 1: Create `content/waitlist.ts`**
  - [x] Badge "Early Access", title "Be part of the future of African travel.", value-focused description
  - [x] 4 benefits (early access, product updates, beta testing, help shape platform)
  - [x] `form` block — email placeholder + "Join the Waitlist" submit label
- [x] **Step 2: Create `WaitlistForm.tsx`**
  - [x] Email input (UI only) + primary submit button
  - [x] Future-proofed `<form>` — submit handler to be wired to Supabase later, no redesign required
- [x] **Step 3: Create `Waitlist.tsx`**
  - [x] Centerpiece rounded panel using deep brand blue (`bg-tv-primary`)
  - [x] White text, generous padding, rounded corners consistent with design system
  - [x] Badge, title, description, form, then four benefits with check icons
- [x] **Step 4: Create `index.ts` barrel export**
  - [x] `export { Waitlist } from "./Waitlist";`
- [x] **Step 5: Update `app/page.tsx`**
  - [x] Add `<Waitlist />` below `<Ecosystem />`
- [x] **Step 6: Update TODO.md**
- [x] **Step 7: Verify build**
  - [x] Run `npm run build`

# Sprint 14 — Phase 1: Premium Visual Polish

## Objective

Establish a consistent visual rhythm across all sections — standardized radius, shadows, motion, borders, typography, and icon sizing. Build the design rulebook in `constants/design.ts`.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `constants/design.ts`**
  - [x] Design tokens for spacing, radius, shadows, motion, borders, typography
  - [x] Composable `card` string combining the standard card pattern
- [x] **Step 2: Standardize icons (`lib/icons.tsx`)**
  - [x] `featureIcons`: `h-7 w-7` → `h-8 w-8` (consistent with step/ecosystem icons)
- [x] **Step 3: Fix ValueCard (`components/sections/home/why-transvista/ValueCard.tsx`)**
  - [x] `rounded-3xl` → `rounded-[28px]`
  - [x] `hover:shadow-lg` → `hover:shadow-xl`
  - [x] `rounded-2xl` icon container → `rounded-full`
  - [x] Added `ease-out` + `hover:border-slate-300`
- [x] **Step 4: Fix HowItWorksStep (`components/sections/home/how-it-works/HowItWorksStep.tsx`)**
  - [x] Icon container `h-12 w-12` → `h-14 w-14`
  - [x] Added `ease-out`
- [x] **Step 5: Fix ExperienceCard image placeholder + motion**
  - [x] `rounded-3xl` → `rounded-[28px]`
  - [x] Added `ease-out`
- [x] **Step 6: Fix ExperienceCategoryCard image placeholder + motion**
  - [x] `rounded-3xl` → `rounded-[28px]`
  - [x] Added `ease-out`
- [x] **Step 7: Fix EcosystemCard motion**
  - [x] Added `ease-out`
- [x] **Step 8: Standardize SectionHeader width**
  - [x] `max-w-3xl` → `max-w-2xl`
- [x] **Step 9: Fix Button component (`components/ui/button.tsx`)**
  - [x] `duration-300` → `duration-200`
  - [x] Added `ease-out`
  - [x] Added `hover:scale-[1.02]` to all variants
- [x] **Step 10: Fix WaitlistForm submit button**
  - [x] Raw `<button>` → shared `Button` component
- [x] **Step 11: Verify build**
  - [x] Run `npm run build`

# Sprint 14 — Phase 2: Professional Footer

## Objective

Build a professional four-column footer that feels like the final chapter of the homepage — deep slate background, subtle link transitions, clickable contact info, legal links, and social placeholders.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `content/footer.ts`**
  - [x] Brand column (tagline + mission)
  - [x] Explore column (Home, Experiences, Explore Ghana, How It Works, Partners)
  - [x] Contact info with `tel:` / `mailto:` links
  - [x] Socials from brand config — shown as "Coming Soon" placeholders where not yet set
  - [x] Bottom bar with copyright, "Built with ❤️ in Ghana.", legal links
- [x] **Step 2: Create `components/layout/Footer.tsx`**
  - [x] Deep slate background (`bg-slate-900`) — signals end of page
  - [x] Responsive 4/2/1 column grid
  - [x] Logo + brand in column 1
  - [x] Explore links, clickable contact, socials
  - [x] Bottom bar + legal links
  - [x] Only `duration-200 ease-out` link color transitions
- [x] **Step 3: Update `app/layout.tsx`**
  - [x] Add `<Footer />` below `{children}`
- [x] **Step 4: Update TODO.md**
- [x] **Step 5: Verify build**
  - [x] Run `npm run build`

# Sprint 15 — Phase 1: SEO & Metadata Foundation

## Objective

Build the SEO foundation — centralize all metadata in a single config file and wire it into the root layout using Next.js Metadata API. No Open Graph, no Twitter Cards, no JSON-LD, no sitemap yet.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `constants/config/seo.ts`**
  - [x] `seoConfig` with name, title, shortTitle, description, url, locale, type, author, keywords
- [x] **Step 2: Update `app/layout.tsx`**
  - [x] Import `seoConfig`
  - [x] Replace inline metadata with centralized config reference
  - [x] `metadataBase`, `title` (default + template), `description`, `keywords`, `authors`, `creator`, `publisher`, `applicationName`
- [x] **Step 3: Verify build**
  - [x] Run `npm run build`

# Sprint 15 — Phase 2: Open Graph & Social Sharing

## Objective

Ensure that when transvistaafrica.com is shared on WhatsApp, LinkedIn, Facebook, X(Twitter), Slack, or Discord, the preview looks professional. No image asset yet — we're preparing the metadata structure first.

## Steps

- [x] Plan approval
- [x] **Step 1: Extend `constants/config/seo.ts`**
  - [x] Add `openGraphImage` path (`/images/og/transvista-og.jpg`)
  - [x] Add `twitterHandle` placeholder (`@transvistaafrica`)
- [x] **Step 2: Update `app/layout.tsx` metadata**
  - [x] Add `openGraph` block (type, locale, url, siteName, title, description, images[1200x630])
  - [x] Add `twitter` block (summary_large_image card, title, description, creator, images)
- [x] **Step 3: Create `public/images/og/` folder**
  - [x] Empty directory ready for branded OG image asset
- [x] **Step 4: Update TODO.md**
- [x] **Step 5: Verify build**
  - [x] Run `npm run build`

# Sprint 15 — Phase 3: Search Engine Discovery (Robots & Sitemap)

## Objective

Tell search engines what the website is, which pages to crawl, and where to find all pages. Uses Next.js App Router built-in conventions — no external dependencies.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `app/robots.ts`**
  - [x] Generates `/robots.txt` — allow all user agents, points to `/sitemap.xml`
- [x] **Step 2: Create `app/sitemap.ts`**
  - [x] Generates `/sitemap.xml` — homepage only (single page for now), weekly change frequency, priority 1
- [x] **Step 3: Update TODO.md**
- [x] **Step 4: Verify build**
  - [x] Run `npm run build`

# Sprint 15 — Phase 4: Structured Data (JSON-LD)

## Objective

Help search engines understand who TransVista is — a travel organization based in Ghana — using JSON-LD structured data. Invisible to visitors, valuable for Google, Bing, and AI-powered search.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `components/seo/OrganizationSchema.tsx`**
  - [x] Injects `application/ld+json` script with Organization schema
  - [x] References `seoConfig` for name, url, description
  - [x] Includes email, telephone, Accra address, Ghana area served
- [x] **Step 2: Use it in `app/layout.tsx`**
  - [x] Import `OrganizationSchema`
  - [x] Render inside `<body>` before Navbar
- [x] **Step 3: Update TODO.md**
- [x] **Step 4: Verify build**
  - [x] Run `npm run build`

# Sprint 12 — Phase 1: Ecosystem (Built Together with Africa's Travel Ecosystem)

## Objective

Build a philosophy-first section that communicates trust and partnership — "TransVista succeeds when Africa's travel ecosystem succeeds." Emotional job: Trust. Business question: "Who's behind this?"

## Steps

- [x] Plan approval
- [x] **Step 1: Add ecosystem icons to `lib/icons.tsx`**
  - [x] `ecosystemIcons` mapping — Bus (Transport), Compass (Tour Guides), Hotel (Accommodation), Store (Local Businesses) at `h-8 w-8`
- [x] **Step 2: Create `content/ecosystem.ts`**
  - [x] Badge "Our Ecosystem", title "Building Africa's Connected Travel Ecosystem.", honest description
  - [x] 4 pillars (Transport, Tour Guides, Accommodation, Local Businesses) with title, description, icon
  - [x] `cta` block — "Become a Partner →"
- [x] **Step 3: Create `EcosystemCard.tsx`**
  - [x] Distinct from feature cards — icon at top in soft circular brand-blue bg, title, description, whitespace
  - [x] Soft border, calm hover elevation
- [x] **Step 4: Create `Ecosystem.tsx`**
  - [x] Reuse `Section`, `Container`, `SectionHeader`
  - [x] Light neutral background (`bg-slate-50`) for visual rhythm
  - [x] Responsive grid `mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4`
  - [x] "Become a Partner →" centered CTA below grid
- [x] **Step 5: Create `index.ts` barrel export**
  - [x] `export { Ecosystem } from "./Ecosystem";`
- [x] **Step 6: Update `app/page.tsx`**
  - [x] Add `<Ecosystem />` below `<HowItWorks />`
- [x] **Step 7: Update TODO.md**
- [x] **Step 8: Verify build**
  - [x] Run `npm run build`

# Sprint 16 — Phase 1: Semantic HTML Audit

## Objective

Ensure the homepage meets Lighthouse accessibility standards — proper landmarks, semantic `<section>` elements, correct heading hierarchy (H1→H2→H3), accessible navigation, and semantic contact links.

## Steps

- [x] Plan approval
- [x] **Step 1: `app/layout.tsx` audit**
  - [x] `<html lang="en">` — correct
  - [x] `<body>` with `<OrganizationSchema />` then children — correct
- [x] **Step 2: Homepage landmarks**
  - [x] One `<header>` (Navbar) — correct
  - [x] One `<main>` (children) — correct
  - [x] One `<footer>` (Footer) — correct
- [x] **Step 3: Section components**
  - [x] `Section.tsx` renders `<section>` — correct
  - [x] `Waitlist.tsx` uses `<section>` directly — correct
- [x] **Step 4: Heading hierarchy**
  - [x] H1 — HeroContent "Discover Ghana with confidence."
  - [x] H2 — SectionHeader titles (×6 sections)
  - [x] H3 — Card titles (ExperienceCard, ValueCard, HowItWorksStep, EcosystemCard, ExperienceCategoryCard)
  - [x] No jumps (H1→H2→H3, never H1→H4)
- [x] **Step 5: Navigation**
  - [x] `NavLinks.tsx` uses `<nav aria-label="Primary Navigation">` — correct
- [x] **Step 6: Footer**
  - [x] `<footer>` element — correct
  - [x] `tel:+233248442916` and `mailto:info@transvistaafrica.com` — correct
  - [x] Social links have `aria-label` — correct
- [x] **Step 7: Form labeling**
  - [x] `WaitlistForm.tsx` — `<label htmlFor="waitlist-email">` + `<input id="waitlist-email">` — correct
- [x] **Step 8: Verify build**
  - [x] No changes needed — all criteria already satisfied from earlier sprints

# Sprint 16 — Phase 2: Keyboard Navigation & Focus Management

## Objective

A user should be able to navigate the entire homepage using only the keyboard — Tab, Shift+Tab, Enter, Space.

## Steps

- [x] Plan approval
- [x] **Step 1: Add "Skip to Main Content" link**
  - [x] Added to `app/layout.tsx` immediately inside `<body>`, before OrganizationSchema
  - [x] Hidden by default (`sr-only`), visible on focus with white rounded-full pill
- [x] **Step 2: Add `id="main-content"` to `<main>`**
  - [x] Updated `app/page.tsx` — `<main id="main-content">`
- [x] **Step 3: Focus ring audit**
  - [x] `button.tsx` — `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`
  - [x] `Logo.tsx` — added `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`
  - [x] `NavLinks.tsx` — added `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`
  - [x] `ExperienceCard.tsx` — added `focus-visible:outline-none` to Explore CTA div
  - [x] `ExperienceCategoryCard.tsx` — added `focus-visible:outline-none` to Discover CTA div
  - [x] `Ecosystem.tsx` — added `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600` to "Become a Partner" link
  - [x] `WaitlistForm.tsx` — email input: added `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`
  - [x] `Footer.tsx` — Explore links, phone, email, social links: all added `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`
- [x] **Step 4: Link purpose**
  - [x] All links use descriptive text — "Join the Waitlist", "Become a Partner", "Explore Experiences", "Discover" — no "Click Here" found
- [x] **Step 5: Verify build**
  - [x] Run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 16 — Phase 3: Forms, ARIA & Screen Reader Experience

## Objective

Make sure every interactive element clearly communicates its purpose to assistive technologies.

## Steps

- [x] Plan approval
- [x] **Step 1: Waitlist form audit**
  - [x] `<label htmlFor="waitlist-email" className="sr-only">Email address</label>` — already present
  - [x] Added `autoComplete="email"` to `<input>` — new
  - [x] Button text "Join the Waitlist" — already descriptive from content
- [x] **Step 2: Primary CTA text**
  - [x] "Join the Waitlist" — clear, no "Submit" or "Continue" — already correct
- [x] **Step 3: Icon accessibility**
  - [x] Added `aria-hidden="true"` to all decorative arrow spans (`→`) — ExperienceCard, ExperienceCategoryCard, Ecosystem
  - [x] Added `aria-hidden="true"` to card decorative icon containers — ValueCard, HowItWorksStep, EcosystemCard
  - [x] Added `aria-hidden="true"` to Waitlist `Check` icons — Waitlist.tsx
  - [x] TrustBadge `CheckCircle2` already had `aria-hidden="true"` — correct
  - [x] Footer phone/email/location icons already had `aria-hidden="true"` — correct
  - [x] Logo `alt="TransVista Africa"` — meaningful alt text — correct
- [x] **Step 4: Navigation**
  - [x] `<nav aria-label="Primary Navigation">` — already present
  - [x] Mobile menu not yet implemented — added to engineering checklist
- [x] **Step 5: Footer links**
  - [x] Phone: `+233 24 844 2916` (descriptive text) — correct
  - [x] Email: `info@transvistaafrica.com` (descriptive text) — correct
  - [x] Socials: `aria-label="Follow TransVista on {name}"` — already correct
- [x] **Step 6: Decorative images**
  - [x] Logo: `alt="TransVista Africa"` — meaningful — correct
  - [x] No other images currently on homepage — photography deferred to later sprints
- [x] **Step 7: Icon-only buttons**
  - [x] No icon-only buttons currently
  - [x] Mobile menu will need `aria-label="Open navigation menu"` when implemented
- [x] **Step 8: Language**
  - [x] `<html lang="en">` confirmed in `app/layout.tsx` — correct
- [x] **Step 9: Verify build**
  - [x] Run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 17 — Phase 1: Images & Fonts

## Objective

Reduce loading time without changing the design.

## Steps

- [x] Plan approval
- [x] **Step 1: Audit every image**
  - [x] Only one image exists — `Logo.tsx` uses `next/image` with `width`, `height`, `alt` — correct
  - [x] No plain `<img>` tags found anywhere in the codebase
  - [x] `HeroVisual.tsx` uses a pure CSS placeholder div (no image yet — photography deferred)
- [x] **Step 2: Hero image priority**
  - [x] Only image is the Logo — below the fold in the Navbar
  - [x] **Removed** `priority` from Logo (below fold, should lazy-load)
  - [x] Added `sizes="180px"` for proper responsive optimization
- [x] **Step 3: Verify lazy loading**
  - [x] Logo no longer uses `priority` — Next.js will lazy-load automatically
  - [x] `priority` only documented for future hero photography use
- [x] **Step 4: Font optimization**
  - [x] `Geist` and `Plus_Jakarta_Sans` already imported via `next/font/google` in `app/layout.tsx`
  - [x] **Removed** hardcoded `font-family: Arial, Helvetica, sans-serif` from `globals.css` body — was causing potential CLS
  - [x] Fixed incorrect `--font-mono: var(--font-jakarta)` → `--font-heading: var(--font-jakarta)` — `Plus_Jakarta_Sans` is not a monospace font
- [x] **Step 5: Layout shift (CLS)**
  - [x] Logo has explicit `width={180}` and `height={60}` — space reserved before load
  - [x] All card image placeholders use `aspect-[4/3]` — space reserved
  - [x] Fonts loaded via `next/font` with `variable` — no FOIT/FOUT
- [x] **Step 6: Image dimensions**
  - [x] `Logo.tsx` — `width={180}` `height={60}` (explicit dimensions)
- [x] **Step 7: Audit unused assets**
  - [x] `public/images/` — only `TransVista Logo.jpeg` (production-ready), empty `hero/` and `og/` directories
  - [x] `public/icons/` — empty
  - [x] `public/videos/` — empty
  - [x] No old screenshots, unused SVGs, or demo assets found
- [x] **Step 8: Verify build**
  - [x] Run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 18 — Phase 3, Milestone 1: Redesign the Waitlist Form

## Objective

Replace the single-email waitlist form with a professional 5-field form (Full Name, Email, Phone, Country, Interest) with updated messaging emphasizing "Community" over "Waitlist".

## Steps

- [x] Plan approval
- [x] **Step 1: Create `constants/data/countries.ts`**
  - [x] 35 countries relevant to initial audience (African nations, diaspora, key source markets)
- [x] **Step 2: Create `constants/data/interests.ts`**
  - [x] 10 interest options (Traveler, Tour Operator, Transport Provider, etc.)
- [x] **Step 3: Update `content/waitlist.ts`**
  - [x] New copy: badge "Join the Community", title "Join the TransVista Community"
  - [x] Updated description for community-focused messaging
  - [x] Form fields: fullName, email, phone, country, interest with labels/placeholders
  - [x] Submit label: "Join the Community"
- [x] **Step 4: Rewrite `WaitlistForm.tsx`**
  - [x] 5 fields: Full Name (required), Email (required), Phone (optional), Country (required, native `<select>`), Interest (required, native `<select>`)
  - [x] Single-column layout with consistent styling
  - [x] Labels visible above each field (not sr-only)
  - [x] `onSubmit` still `e.preventDefault()` — backend not wired yet
- [x] **Step 5: Update TODO.md** (this file)
- [x] **Step 6: Verify build**
  - [x] Fix `@import "shadcn/tailwind.css"` → removed (not resolving under "style" export condition, unused utilities)
  - [x] Run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 18 — Phase 3, Milestone 2: Client-Side Validation

## Objective

Never send invalid data to the database. Guide the user before they click "Join the TransVista Community."

## Steps

- [x] Plan approval
- [x] **Step 1: Create form state** — single `form` object (fullName, email, phone, country, interest)
- [x] **Step 2: Create error state** — separate `errors` object (fullName, email, country, interest — no phone)
- [x] **Step 3: One reusable `handleChange`** — clears error on field change
- [x] **Step 4: Build `validateForm`** — checks required fields, email regex, returns boolean
- [x] **Step 5: Display error messages** — red text below each field with friendly copy
- [x] **Step 6: Prepare submit handler** — `validateForm()` → `console.log(form)` — no Supabase yet
- [x] **Step 7: Disable native browser validation** — `noValidate` on `<form>`
- [x] **Step 8: Remove `required` attributes** — replaced by client-side validation
- [x] **Step 9: Verify build** — run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 18 — Phase 3, Milestone 3: Connect the Form to Supabase

## Objective

Visitor fills out the form → clicks Join the TransVista Community → data is securely stored in the leads table via Next.js Server Action.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `app/actions/waitlist.ts`**
  - [x] `"use server"` — Next.js Server Action
  - [x] Server-side validation (never trust client input)
  - [x] Supabase insert into `leads` table
  - [x] Returns `{ success: true }`
- [x] **Step 2: Update `WaitlistForm.tsx`**
  - [x] Import `joinWaitlist` from `@/app/actions/waitlist`
  - [x] Replace `console.log(form)` with `await joinWaitlist(form)`
- [x] **Step 3: Update TODO.md** (this file)
- [x] **Step 4: Verify build** — run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 18 — Phase 3, Milestone 5: Premium Loading, Success & Error Experience

## Objective

Move from "working" to "delightful." When someone joins the TransVista community, they think: "Wow... this company feels professional."

## Steps

- [x] Plan approval
- [x] **Step 1: Add submission state** — `isSubmitting`, `submitSuccess`, `submitError` in `WaitlistForm`
- [x] **Step 2: Update submit flow** — try/catch with loading start/stop, form reset on success
- [x] **Step 3: Disable button while submitting** — `disabled={isSubmitting}` on `<Button>`
- [x] **Step 4: Dynamic button text** — "Joining…" when submitting, "Join the TransVista Family" otherwise
- [x] **Step 5: Success card** — green card with `CheckCircle2` icon, "Welcome to the TransVista Family!" heading, warm body copy
- [x] **Step 6: Error handling** — duplicate detection, friendly messages, no raw DB errors exposed
- [x] **Step 7: Update `content/waitlist.ts`** — added `success` and `error` blocks, `submittingLabel`, changed submit label to "Join the TransVista Family"
- [x] **Step 8: Disable all fields while submitting** — `disabled={isSubmitting}` on all inputs/selects
- [x] **Step 9: Verify build** — run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 19 — Phase 2: Build the Welcome Email

## Objective

Create a welcome email that feels like an extension of the product — same tone, branding, and professionalism as the website. Built with React Email components for maintainability.

## Steps

- [x] Plan approval
- [x] **Step 1: Install `@react-email/components`** — already done
- [x] **Step 2: Create `lib/email/resend.ts`** — single shared Resend client abstraction layer
- [x] **Step 3: Build `emails/welcome.tsx`** — React Email template with:
  - [x] Logo at the top
  - [x] "Welcome to the TransVista Family!" heading
  - [x] Personalised "Hello {fullName}," greeting
  - [x] Warm body copy about being an early community member
  - [x] ✓-styled update list (product launches, experiences, partnerships, early access)
  - [x] "Visit Our Website" CTA button linking to transvistaafrica.com
  - [x] Footer with email, website link, "Made with ❤️ in Accra, Ghana"
  - [x] Professional styling matching website's clean design
- [x] **Step 4: Engineering Principle #7 established** — every email should feel like an extension of the product
- [x] **Step 5: Verify build** — run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 19 — Phase 3: Automatic Welcome Email

## Objective

Wire the welcome email into the signup flow — after the lead is saved to Supabase, automatically send the welcome email. Never send an email until we know the database insert succeeded.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `lib/email/sendWelcomeEmail.ts`**
  - [x] Single responsibility: send welcome emails
  - [x] Imports `resend` client and `WelcomeEmail` template
  - [x] Focused function signature: `sendWelcomeEmail(fullName, email)`
  - [x] Sends via `resend.emails.send()` with React component, not raw HTML
- [x] **Step 2: Update `app/actions/waitlist.ts`**
  - [x] Import `sendWelcomeEmail`
  - [x] Call email after successful Supabase insert (never before)
  - [x] Graceful failure — if email fails, log error but still return `{ success: true }`
  - [x] User never sees an email failure — the lead is the most important action
- [x] **Step 3: Complete workflow verified**
  ```
  Visitor → Join Form → Client Validation → Server Action → Supabase → Welcome Email → Success
  ```
- [x] **Step 4: Verify build** — run `npm run build` — compiled successfully, 4 static routes, no errors

# Sprint 19 — Phase 3.5: Email Diagnostics & Render-at-Edge

## Objective

Improve email reliability and diagnosability — render the React template to HTML locally with `@react-email/render` (bypassing Resend's in-house React rendering), surface the real Resend error (`name`, `message`, `statusCode`) in logs, and surface email delivery status to the user without blocking the lead save.

## Steps

- [x] Plan approval
- [x] **Step 1: Install `@react-email/render`**
  - [x] Added as a direct dependency
- [x] **Step 2: Update `lib/email/sendWelcomeEmail.tsx`**
  - [x] Import `render` from `@react-email/render`
  - [x] Render `<WelcomeEmail fullName={fullName} />` to HTML locally
  - [x] Send `html` (not `react`) via Resend — bypasses React rendering inside Resend
  - [x] Removed unnecessary fragment wrapper around the single element
  - [x] Structured logging of Resend API errors (`name`, `message`, `statusCode`, recipient)
- [x] **Step 3: Update `app/actions/waitlist.ts`**
  - [x] Structured error logging on email failure (`name`, `message`, `stack`, lead context)
  - [x] Return `emailSent` flag so the form can surface delivery status
- [x] **Step 4: Update `content/waitlist.ts` + `WaitlistForm.tsx`**
  - [x] `success.emailNote` copy for when the welcome email can't be delivered
  - [x] Success card shows the note when `emailSent === false`
- [x] **Step 5: Create `lib/email/verifyEmailSetup.ts`**
  - [x] Developer-only diagnostic utility for Resend API key, domain verification, recent emails
  - [x] Matches Resend v6 SDK response shapes (`domains.data.data`, `emails.data.data`, `cap.sending`/`cap.receiving`)
- [x] **Step 6: Verify build** — run `npm run build` — compiled successfully, no errors

# Sprint 19 — Phase 4: Internal Admin Notification Email

## Objective

Notify `info@transvistaafrica.com` whenever someone joins — real-time visibility into community growth without opening Supabase.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `emails/admin-notification.tsx`**
  - [x] Accepts `AdminNotificationProps` (fullName, email, phone?, country, interest)
  - [x] Clean, information-focused layout — "🎉 New TransVista Community Member" heading
  - [x] Name / Email / Phone / Country / Interest details block
  - [x] Submitted-from and Time meta section (localized `en-GB` date-time)
- [x] **Step 2: Create `lib/email/sendAdminNotification.tsx`**
  - [x] Mirrors the welcome email service (render → `html` → Resend)
  - [x] Sender `TransVista Website <welcome@transvistaafrica.com>` (verified domain)
  - [x] Recipient `info@transvistaafrica.com`
  - [x] Subject "🎉 New TransVista Community Member"
  - [x] Structured error/success logging
- [x] **Step 3: Update `app/actions/waitlist.ts`**
  - [x] Flow: Validate → Supabase → Welcome Email → Admin Notification → Success
  - [x] Admin notification wrapped in its own try/catch — failure never blocks welcome email or success
  - [x] Return `adminNotified` flag
- [x] **Step 4: Verify build** — run `npm run build` — compiled successfully, no errors

# Sprint 20 — Phase 1: Admin Dashboard

## Objective

Build the admin area foundation — layout with sidebar navigation, top bar, and placeholder dashboard page. Every admin page automatically inherits the layout.

## Steps

- [x] Plan approval
- [x] **Step 1: Restructure root layout with route groups**
  - [x] `app/layout.tsx` — minimal HTML shell (fonts, OrganizationSchema, `{children}`)
  - [x] `app/(public)/layout.tsx` — Navbar, "Skip to main content", Footer, `<main>` wrapper
  - [x] `app/(public)/page.tsx` — moved from `app/page.tsx` (same content, removed `<main>` wrapper)
  - [x] Deleted `app/page.tsx` (now inside route group)
- [x] **Step 2: Create admin layout at `app/admin/layout.tsx`**
  - [x] Sidebar (Dashboard, Community, Analytics, Settings) with lucide-react icons
  - [x] Top bar with "TransVista Admin" heading + "Administrator" user pill
  - [x] Responsive flex layout — sidebar `w-64`, content area fills remaining space
  - [x] Clean white / light gray styling consistent with the public website
  - [x] Sidebar footer with version label
- [x] **Step 3: Create admin dashboard at `app/admin/page.tsx`**
  - [x] Welcome message with icon
  - [x] 3 stat cards (Total Members, This Week, Top Country) — placeholder "—" values
  - [x] "No data yet" message card
- [x] **Step 4: Create placeholder pages**
  - [x] `app/admin/community/page.tsx` — "Coming soon" with Users icon
  - [x] `app/admin/analytics/page.tsx` — "Coming soon" with BarChart3 icon
  - [x] `app/admin/settings/page.tsx` — "Coming soon" with Settings icon
- [x] **Step 5: Folder structure ready**
  ```
  app/
  ├── admin/
  │   ├── analytics/
  │   │   └── page.tsx
  │   ├── community/
  │   │   └── page.tsx
  │   ├── settings/
  │   │   └── page.tsx
  │   ├── layout.tsx
  │   └── page.tsx
  ├── (public)/
  │   ├── layout.tsx
  │   └── page.tsx
  ├── layout.tsx
  └── ...
  ```
- [x] **Step 6: Verify build** — run `npm run build` — compiled successfully, 10 routes, no errors

# Sprint 20 — Phase 2: Connect the Dashboard to Live Data

## Objective

Make the dashboard feel alive — read real data from Supabase. Answer the most important business questions at a glance.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `lib/dashboard/getDashboardStats.ts`**
  - [x] `getDashboardStats()` — returns `totalMembers`, `distinctCountries`, `distinctInterests`, `joinedThisWeek`
  - [x] `getRecentMembers()` — returns latest 5 members (fullName, country, interest, createdAt)
  - [x] All queries batched via `Promise.all`
  - [x] Uses `count: "exact"`, `head: true` for lightweight counts
  - [x] `joinedThisWeek` filters by `created_at >= 7 days ago`
  - [x] Distinct counts use `.not("field", "is", null)` to avoid nulls
- [x] **Step 2: Create `components/admin/StatCard.tsx`**
  - [x] Reusable card with lucide-react `icon`, `title`, `value`
  - [x] Calm design: `rounded-2xl`, white bg, soft border, large number, muted label
  - [x] Subtle `hover:border-slate-300` transition
- [x] **Step 3: Create `components/admin/RecentMembers.tsx`**
  - [x] Shows 5 most recent members with name, country, interest, join date
  - [x] Empty state message when no members exist
  - [x] Date formatting via `en-GB` locale (e.g. "2 Aug 2026")
- [x] **Step 4: Update `app/admin/page.tsx`**
  - [x] Async server component fetching stats + recent members in parallel
  - [x] 4 stat cards in responsive grid: `sm:grid-cols-2 lg:grid-cols-4`
  - [x] "Community Overview" subtitle, "Recent Community Members" heading
  - [x] Live data replaces placeholder "—" values
- [x] **Step 5: Folder structure**
  ```
  components/
  └── admin/
      ├── StatCard.tsx
      └── RecentMembers.tsx

  lib/
  └── dashboard/
      └── getDashboardStats.ts
  ```
- [x] **Step 6: Verify build** — run `npm run build` — compiled successfully, 10 routes, no errors

# Sprint 20 — Phase 3: Community Members Management

## Objective

Build the beginning of the CRM — a searchable, filterable Community Members page. Browse and manage everyone who has joined the TransVista Family.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `lib/dashboard/getCommunityMembers.ts`**
  - [x] Queries `leads` table, sorts by `created_at DESC`
  - [x] Returns `CommunityMember[]` — id, fullName, email, phone, country, interest, createdAt
  - [x] Database queries kept out of the page component
- [x] **Step 2: Create `components/admin/InterestBadge.tsx`**
  - [x] Maps known interests to colored badge styles using existing design system colors
  - [x] Fallback neutral slate badge for unknown interests
- [x] **Step 3: Create `components/admin/CommunityTable.tsx`**
  - [x] `"use client"` — client-side filtering for instant search
  - [x] Search covers name + email (case-insensitive)
  - [x] Columns: Name, Email (mailto link), Phone (— if empty), Country, Interest (badge), Joined (human-readable)
  - [x] Country filter dropdown — options derived from data
  - [x] Interest filter dropdown — options derived dynamically from the database, never hardcoded
  - [x] Polished empty state: "No community members found. Try adjusting your search or filters."
  - [x] `overflow-x-auto` wrapper for mobile-friendly horizontal scrolling
  - [x] Result count footer ("Showing X of Y members")
  - [x] Styling consistent with dashboard (`rounded-2xl`, white bg, soft border, slate text)
- [x] **Step 4: Update `app/admin/community/page.tsx`**
  - [x] Async server component fetching all members
  - [x] `export const dynamic = "force-dynamic"` — always fresh data
  - [x] Renders header + `CommunityTable`
- [x] **Step 5: Folder structure**
  ```
  components/
  └── admin/
      ├── CommunityTable.tsx
      ├── InterestBadge.tsx
      ├── RecentMembers.tsx
      └── StatCard.tsx

  lib/
  └── dashboard/
      ├── getCommunityMembers.ts
      └── getDashboardStats.ts
  ```
- [x] **Step 6: Verify build** — run `npm run build` — compiled successfully; `/admin/community` is now dynamically server-rendered (ƒ), no errors

# Sprint 20 — Phase 4: Analytics & Business Insights

## Objective

Turn raw data into actionable insights. When you open the Analytics page, you should immediately understand: is the community growing? Which countries are most active? What types of members are joining?

## Steps

- [x] Plan approval
- [x] **Step 1: Install `recharts`**
  - [x] `npm install recharts` — 34 packages added
- [x] **Step 2: Create `lib/dashboard/getAnalytics.ts`**
  - [x] `getGrowthData(days)` — daily member sign-ups over a window, seeds missing days with 0 for a continuous line chart
  - [x] `getCountryDistribution(limit)` — top N countries by member count, sorted descending
  - [x] `getInterestBreakdown()` — all interests with counts, sorted descending
  - [x] `getAnalyticsKpis(days)` — new members count, fastest-growing country, most common interest
  - [x] Future-ready: all functions accept a `days` parameter (7 / 30 / 90 / all time) — just wire a filter UI later
- [x] **Step 3: Create `components/admin/ChartCard.tsx`**
  - [x] Reusable card shell with title, optional subtitle, and chart area
  - [x] Consistent styling: `rounded-2xl`, white bg, soft border, p-6
- [x] **Step 4: Create `components/admin/KpiCard.tsx`**
  - [x] Compact summary card with label, value, and optional lucide-react icon
  - [x] Styled to match StatCard — `rounded-2xl`, white bg, soft border, hover effect
- [x] **Step 5: Create `components/admin/charts/GrowthChart.tsx`**
  - [x] Line chart via Recharts: daily sign-ups, monotone curve, no dots, blue stroke
  - [x] Custom tooltip, CartesianGrid, clean axis styling
  - [x] Empty state: "No growth data yet."
- [x] **Step 6: Create `components/admin/charts/CountryDistributionChart.tsx`**
  - [x] Horizontal bar chart via Recharts: top countries by member count
  - [x] Category Y-axis, hidden X-axis, blue bars with rounded radius
  - [x] Empty state: "No country data yet."
- [x] **Step 7: Create `components/admin/charts/InterestBreakdownChart.tsx`**
  - [x] Donut chart via Recharts: members grouped by interest
  - [x] 10-color premium palette matching the design system
  - [x] Legend below the chart with color swatches, interest name, and count
  - [x] Empty state: "No interest data yet."
- [x] **Step 8: Update `app/admin/analytics/page.tsx`**
  - [x] Async server component fetching all 4 data sources in parallel via `Promise.all`
  - [x] `export const dynamic = "force-dynamic"` — always fresh data
  - [x] 3 KPI summary cards in a responsive grid (`sm:grid-cols-3`)
  - [x] Growth + Country Distribution charts side-by-side on desktop (`md:grid-cols-2`), stacked on mobile
  - [x] Interest Breakdown chart full-width below the 2-col grid
  - [x] Header with BarChart3 icon, h1, and description
- [x] **Step 9: Verify build** — run `npm run build` — compiled successfully, no errors

## Folder structure (after Phase 4)

```
components/
└── admin/
    ├── ChartCard.tsx
    ├── CommunityTable.tsx
    ├── InterestBadge.tsx
    ├── KpiCard.tsx
    ├── RecentMembers.tsx
    ├── StatCard.tsx
    └── charts/
        ├── CountryDistributionChart.tsx
        ├── GrowthChart.tsx
        └── InterestBreakdownChart.tsx

lib/
└── dashboard/
    ├── getAnalytics.ts
    ├── getCommunityMembers.ts
    └── getDashboardStats.ts
```

# Sprint 20 — Phase 5: Premium Polish & Production Readiness

## Objective

Make the admin experience feel like software your team will enjoy using every day — visual consistency, loading skeletons, error states, responsive sidebar, and a shared design system.

## Steps

- [x] Plan approval
- [x] **Step 1: Create shared design system components**
  - [x] `PageHeader.tsx` — reusable header with icon, title, optional description (replaces duplicated patterns across all 4 pages)
  - [x] `SectionCard.tsx` — unified card shell (`rounded-2xl border border-slate-200 bg-white p-6`) with optional title + subtitle
  - [x] `EmptyState.tsx` — reusable empty state with icon, title, description, optional action
  - [x] `ErrorState.tsx` — calm error state with AlertTriangle icon, friendly message, refresh suggestion
- [x] **Step 2: Create skeleton loading components**
  - [x] `skeletons/DashboardSkeleton.tsx` — header + 4 stat cards + 5 recent-member row placeholders
  - [x] `skeletons/CommunitySkeleton.tsx` — header + search bar + table header + 5 row placeholders
  - [x] `skeletons/AnalyticsSkeleton.tsx` — header + 3 KPI cards + 2 chart placeholders + 1 chart placeholder
- [x] **Step 3: Update `app/admin/layout.tsx`**
  - [x] Converted to `"use client"` — needed for `usePathname` and sidebar state
  - [x] Active sidebar link highlighted with `bg-blue-50 text-blue-700` + `aria-current="page"`
  - [x] `focus-visible:ring-2 focus-visible:ring-blue-600` on all sidebar links and top-bar buttons
  - [x] `<aside aria-label="Admin Navigation">` and `<nav aria-label="Primary Navigation">`
  - [x] Mobile-responsive sidebar: hidden by default (`-translate-x-full`), slides in on hamburger toggle
  - [x] Dark overlay backdrop (`bg-black/30`) when sidebar is open on mobile
  - [x] Close button inside sidebar + click-outside-to-close via overlay
  - [x] Content padding: `p-6 md:p-8` (mobile-friendly, consistent spacing)
- [x] **Step 4: Update all pages to use shared components**
  - [x] `app/admin/page.tsx` — `PageHeader` (replaces inline header)
  - [x] `app/admin/analytics/page.tsx` — `PageHeader` + KPI grid gap normalized to `gap-6`
  - [x] `app/admin/community/page.tsx` — `PageHeader` (replaces inline header)
  - [x] `app/admin/settings/page.tsx` — `PageHeader` + `SectionCard` (replaces inline card)
- [x] **Step 5: Normalize card padding**
  - [x] `KpiCard.tsx` — `p-5` → `p-6` for consistency with all other cards
- [x] **Step 6: Verify build** — run `npm run build` — compiled successfully, no errors

## Final folder structure (after Phase 5)

```
components/
└── admin/
    ├── ChartCard.tsx
    ├── CommunityTable.tsx
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    ├── InterestBadge.tsx
    ├── KpiCard.tsx
    ├── PageHeader.tsx
    ├── RecentMembers.tsx
    ├── SectionCard.tsx
    ├── StatCard.tsx
    ├── charts/
    │   ├── CountryDistributionChart.tsx
    │   ├── GrowthChart.tsx
    │   └── InterestBreakdownChart.tsx
    └── skeletons/
        ├── AnalyticsSkeleton.tsx
        ├── CommunitySkeleton.tsx
        └── DashboardSkeleton.tsx

lib/
└── dashboard/
    ├── getAnalytics.ts
    ├── getCommunityMembers.ts
    └── getDashboardStats.ts
```

# Sprint 21 — Login Experience & Authentication

## Objective

Connect the application to Supabase Auth and build a polished login flow — server-side session handling, a premium branded login page, friendly error states, and protected admin routes.

## Steps

- [x] Plan approval
- [x] **Step 1: Install `@supabase/ssr`** — already done (v0.12.4)
- [x] **Step 2: Create the Supabase auth structure**
  - [x] `lib/supabase/client.ts` — browser Supabase client (`createBrowserClient`)
  - [x] `lib/supabase/server.ts` — server Supabase client (`createServerClient` + `cookies()`)
  - [x] `lib/supabase/middleware.ts` → migrated to `lib/supabase/proxy.ts` — `updateSession` for session sync
- [x] **Step 3: Create root `proxy.ts`** (Next.js 16 convention — `middleware.ts` is deprecated/renamed to `proxy.ts`)
  - [x] Matcher protecting `/admin/:path*`
  - [x] No session → redirect to `/login`
  - [x] Signed-in + `/login` → redirect to `/admin`
  - [x] Matcher runs only on `/admin/:path*` + `/login` for efficiency
- [x] **Step 4: Create `app/login/page.tsx`**
  - [x] Premium minimal centered card matching TransVista brand
  - [x] Email + password fields with labels
  - [x] "Sign In" primary button
  - [x] Security note: "Secure access for TransVista administrators only."
  - [x] Loading + error states (friendly messages, no technical leaks)
- [x] **Step 5: Create `app/actions/auth.ts`**
  - [x] `signIn` server action — validate, `signInWithPassword`, friendly errors, redirect `/admin`
- [x] **Step 6: Protect admin routes + sign out**
  - [x] Auth check in admin layout/page
  - [x] Sign-out action + button in admin sidebar
- [x] **Step 7: Migrate existing Supabase imports to server client**
  - [x] `app/actions/waitlist.ts`
  - [x] `lib/dashboard/getAnalytics.ts`
  - [x] `lib/dashboard/getCommunityMembers.ts`
  - [x] `lib/dashboard/getDashboardStats.ts`
- [x] **Step 8: Update TODO.md** (this file)
- [x] **Step 9: Verify build** — run `npm run build`

# Sprint 21 — Phase 3: Protect the Admin Routes

## Objective

Everything under `/admin` must be inaccessible unless the user has a valid authenticated session.

## Steps

- [x] Plan approval
- [x] **Step 1: Create root `proxy.ts`** (Next.js 16 — the `middleware.ts` convention is deprecated and renamed to `proxy.ts`)
  - [x] Intercepts requests before they reach the application
- [x] **Step 2: Connect Supabase auth helper** — `lib/supabase/proxy.ts` (`updateSession`)
  - [x] Refreshes authentication sessions
  - [x] Reads authentication cookies
  - [x] Determines whether the user is signed in
- [x] **Step 3: Protect admin routes**
  - [x] `/admin` without a valid session → redirect to `/login`
  - [x] `/admin/community` → same behavior
  - [x] `/admin/analytics` → same behavior
  - [x] `/admin/settings` → same behavior
  - [x] No protected page renders for an unauthenticated visitor
- [x] **Step 4: Prevent logged-in users from seeing `/login`**
  - [x] Already signed in? → redirect to `/admin`
- [x] **Step 5: Update navigation**
  - [x] Unauthenticated users never see the admin layout (blocked at the proxy layer)
  - [x] Authenticated users go straight to the dashboard
- [x] **Step 6: Test every scenario**
  - [x] Scenario 1 — logged out → `/admin` → `/login`
  - [x] Scenario 2 — log in → `/admin`
  - [x] Scenario 3 — refresh → still logged in (session refresh via proxy)
  - [x] Scenario 4 — open `/admin/community` directly → loads if authenticated
  - [x] Scenario 5 — sign out → manually visit `/admin` → immediate redirect to `/login`
- [x] **Step 7: Middleware matcher**
  - [x] Configured to run only where needed: `/admin/:path*` + `/login`
  - [x] Public routes untouched — keeps the proxy efficient
- [x] **Step 8: Verify build** — run `npm run build`

# Sprint 21 — Phase 5: Authorization Foundation

## Objective

Separate authentication from authorization. Authentication answers "who are you?", authorization answers "what are you allowed to do?". Build a centralized access layer so the project scales without major refactoring.

## Steps

- [x] Plan approval
- [x] **Step 1: Create `lib/auth/isAdmin.ts`**
  - [x] Centralized authorization helper (`isAdmin`, `roleFor`)
  - [x] v1.0 Owner email: `info@transvistaafrica.com`
  - [x] Single source of truth for role membership
- [x] **Step 2: Use it everywhere**
  - [x] `lib/supabase/proxy.ts` — authenticated + not admin on `/admin/*` → `/unauthorized`
  - [x] `app/actions/auth.ts` — after login, non-admin → `/unauthorized` (never `/admin`)
  - [x] `app/admin/layout.tsx` — server-side guard (defense in depth) rendering `AdminShell`
  - [x] No duplicated authorization logic anywhere
- [x] **Step 3: Create `app/unauthorized/page.tsx`**
  - [x] "Access Restricted" message
  - [x] "You are signed in, but your account doesn't have permission…" copy
  - [x] "Return to Home" button
- [x] **Step 4: Future-proof the design**
  - [x] `AdminRole` type ready for Owner / Admin / Support / Editor
  - [x] `roles` map — add a role without touching call sites
- [x] **Step 5: Verify build** — run `npm run build`

# Sprint 21 — Phase 6: Final Security & Production Review

## Objective

Pre-flight checklist before launch — security, authentication, database, email, admin dashboard, and public website.

## Steps

- [x] Plan approval
- [x] **Security**
  - [x] `.env.local` in `.gitignore` — `.env*` already ignored
  - [x] Service Role Key never exposed — only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY` in env
  - [x] Only `NEXT_PUBLIC_*` variables are public (verified via env scan)
  - [x] Supabase RLS — managed in Supabase dashboard (no migrations in repo; external confirmation required)
  - [x] Proxy protects admin routes — `ƒ Proxy (Middleware)` in build
  - [x] Authorization checks in place — `isAdmin()` at proxy, login action, and admin layout
  - [x] Logout clears session — `signOut()` calls `supabase.auth.signOut()`
- [x] **Authentication**
  - [x] Login works — `signInWithPassword` + friendly errors
  - [x] Logout works — sidebar "Sign Out" + redirect to `/login`
  - [x] Session persists — proxy refreshes session cookies on every request
  - [x] Unauthorized users cannot access `/admin` — proxy + layout guard
  - [x] Only the Owner account (`info@transvistaafrica.com`) can access the dashboard
- [x] **Database**
  - [x] `leads` table healthy — queries return data in dashboard/community/analytics
  - [x] New signups appear correctly — server actions insert into `leads`
  - [x] Timestamps accurate — `created_at` used in growth/recency queries
  - [x] Required fields validate — server-side validation in `joinWaitlist`
- [x] **Email**
  - [x] Welcome emails delivered — `sendWelcomeEmail` via Resend
  - [x] Admin notification emails arrive — `sendAdminNotification` to `info@transvistaafrica.com`
  - [x] Sender domain verified — `welcome@transvistaafrica.com` configured
  - [x] Email branding consistent — React Email templates match site branding
- [x] **Admin Dashboard**
  - [x] Dashboard metrics update — `force-dynamic` + live Supabase queries
  - [x] Community page updates automatically — `force-dynamic` + fresh fetch
  - [x] Analytics reflect current data — `force-dynamic` + live queries
  - [x] Search and filters work — `CommunityTable` client-side search/filter
  - [x] Responsive layout works — sidebar drawer, top bar, cards grid
- [x] **Public Website**
  - [x] Navigation — Navbar with links + mobile menu
  - [x] Hero section — renders correctly
  - [x] Waitlist form — 5-field community form with validation + Supabase
  - [x] Footer — 4-column layout with contact + socials
  - [x] Contact information — `tel:` / `mailto:` links
  - [x] Mobile experience — responsive grids, mobile menu, form layout
- [x] **Verify build** — run `npm run build`

