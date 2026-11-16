insert into public.travel_events (
  slug, title, region, summary, description, start_date, price_amount, currency,
  pickup_location, inclusions, itinerary, status, published_at
) values (
  'central-region-heritage-adventure-2026',
  'Central Region Heritage & Adventure Day Trip',
  'Central Region',
  'A full-day journey combining rainforest adventure, coastal heritage, shared meals and a guided photo and video experience.',
  'TransVista group experience departing from Accra, featuring Kakum National Park, Hans Cottage Botel, Cape Coast Castle and Elmina Castle.',
  '2026-11-14',
  400,
  'GHS',
  'Accra Mall, Accra',
  array[
    'Round-trip transport from Accra',
    'Meals during the trip',
    'Guided photo-shoot and video experience',
    'TransVista trip coordination'
  ],
  '[
    {"title":"Kakum National Park","detail":"Rainforest and canopy walkway experience"},
    {"title":"Hans Cottage Botel","detail":"Stop for food, nature and group moments"},
    {"title":"Cape Coast Castle","detail":"Guided heritage visit"},
    {"title":"Elmina Castle","detail":"Guided coastal heritage visit"}
  ]'::jsonb,
  'completed',
  now()
)
on conflict (slug) do nothing;