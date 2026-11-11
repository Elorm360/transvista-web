-- Signed-in users (including app travellers) must never see email or booking reference.
-- Staff moderation reads full rows through the server after an admin role check.
revoke select on public.traveller_reviews from authenticated;
grant select (id, full_name, location, trip_name, rating, review, verified, status, published_at)
  on public.traveller_reviews to anon, authenticated;
drop policy "Review team can read all reviews" on public.traveller_reviews;
create policy "Review team can read all reviews"
  on public.traveller_reviews for select to authenticated
  using (exists (
    select 1 from public.admin_team_members m
    where m.user_id = (select auth.uid()) and m.status = 'active'
      and m.role in ('owner', 'admin', 'community_manager')));
