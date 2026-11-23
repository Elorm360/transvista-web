# Roadmap

What's next, roughly in priority order. Move items to the
[changelog](CHANGELOG.md) when they ship.

## Now

- [ ] **Original photography.** Accra, Kumasi and Kakum (and their
      experiences) have no photo; Cape Coast, Volta and Mole use illustrative
      ones. Drop originals into `photos/` and run `npm run photos`
      ([how](PHOTOS.md)). *Owner: TransVista team.*
- [ ] **Merge the open quality PRs** (#27 access and stats, #28 performance
      and SEO, #29 photos and colours, plus form protection). #28 and #29 have
      a small conflict in the trip page.
- [ ] **Turn on leaked-password protection** in Supabase → Authentication →
      Settings. *Owner: account admin.*
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** in Vercel production. Team-invite links
      fall back to localhost without it.

## Next

- [ ] **Validate trip rich results.** When the next group trip is published,
      run its page through Google's Rich Results Test (Event markup).
- [ ] **Bring all migrations into one repo.** Eight production migrations
      (`traveller_profiles`, `mobile_trip_planner`, `pricing_foundation`, …)
      have no file here; they probably live in the mobile app repo.
- [ ] **About page.** `/about` temporarily redirects to the homepage. A real
      page (team, company registration, licences) would strengthen trust.
- [ ] **Waitlist vs. trip planning.** Now that trips are bookable, decide
      whether the homepage still needs both "Join the community" and "Plan my
      trip", or whether the waitlist becomes a newsletter. *Owner: product.*
- [ ] **Wider end-to-end tests:** submit each public form against a preview
      deploy, and smoke-test admin sign-in.

## Later

- [ ] **Admin on brand colours.** About 290 generic blue/amber/orange classes
      in `app/admin` and `components/admin`; deferred to avoid a large visual
      change.
- [ ] **Dashboard stats in SQL.** "Distinct countries / interests" read up to
      Supabase's 1,000-row default; move them to a view or RPC before the
      waitlist passes that.
- [ ] **Remove the hard-coded owner email** from the `admin_team_members`
      policies in favour of the owner role.
- [ ] **Tighten admin pages' performance** if the team grows (most are
      dynamic per request today).
