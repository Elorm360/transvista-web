-- Avatar choice + profile photo for traveller reviews.
alter table public.traveller_reviews
  add column avatar_choice text check (avatar_choice is null or avatar_choice in
    ('nkyinkyim', 'sankofa', 'nsoromma', 'akoma', 'adinkrahene', 'nkonsonkonson')),
  add column photo_status text not null default 'none'
    check (photo_status in ('none', 'pending', 'approved', 'removed')),
  add column photo_path text check (photo_path is null or char_length(photo_path) <= 200),
  add column photo_url text check (photo_url is null or char_length(photo_url) <= 500),
  add column photo_consent boolean not null default false,
  add constraint traveller_reviews_photo_needs_consent
    check (photo_status = 'none' or photo_consent);

grant select (avatar_choice, photo_url) on public.traveller_reviews to anon, authenticated;
grant update (photo_status, photo_url, photo_path) on public.traveller_reviews to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('review-photos-pending', 'review-photos-pending', false, 1048576, array['image/jpeg']),
  ('review-photos', 'review-photos', true, 1048576, array['image/jpeg'])
on conflict (id) do nothing;
-- No storage policies: only the website server (service role) can upload, move or delete.
