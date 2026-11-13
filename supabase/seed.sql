-- Sample catalog. Replace rates, deposits, and quantities with your real inventory.

insert into public.categories (slug, name, sort_order) values
  ('compact', 'Compact cameras', 1),
  ('mirrorless', 'Mirrorless', 2),
  ('action', 'Action cameras', 3),
  ('audio', 'Audio', 4),
  ('accessories', 'Accessories', 5)
on conflict (slug) do update
set name = excluded.name, sort_order = excluded.sort_order;

insert into public.cameras (
  category_id, slug, name, brand, tagline, description, daily_rate, deposit, quantity, includes, image_url
)
select
  c.id, v.slug, v.name, v.brand, v.tagline, v.description, v.daily_rate, v.deposit, v.quantity, v.includes, v.image_url
from (values
  ('compact', 'canon-s95', 'Canon PowerShot S95', 'Canon',
   'A classic compact camera for everyday photos and travel.',
   'A pocket-sized Canon PowerShot compact camera for bringing along on everyday outings and trips.',
   500, 1000, 1, array[]::text[], '/images/cameras/Canon%20Powershot%20S95.png'),
  ('compact', 'canon-sx740-hs', 'Canon SX740 HS', 'Canon',
   'A travel-friendly compact camera with a versatile zoom.',
   'A compact PowerShot camera suited to travel, day trips, and capturing subjects near or far.',
   550, 1000, 1, array[]::text[], '/images/cameras/Canon%20sx740%20hs.png'),
  ('mirrorless', 'sony-a6400', 'Sony a6400', 'Sony',
   'An APS-C mirrorless camera for photos and video.',
   'A compact interchangeable-lens mirrorless camera for travel, portraits, and video.',
   750, 1000, 1, array[]::text[], '/images/cameras/Sony%20a6400.png'),
  ('audio', 'dji-mic-mini-2', 'DJI Mic Mini 2', 'DJI',
   'A compact wireless microphone system for clearer audio.',
   'A wireless microphone system for recording speech and audio with compatible cameras and devices.',
   300, 1000, 1, array[]::text[], '/images/cameras/DJI%20Mic%20Mini%202.png'),
  ('action', 'dji-osmo-nano', 'DJI Osmo Nano', 'DJI',
   'A compact action camera for hands-free moments.',
   'A small action camera for capturing everyday adventures and point-of-view footage.',
   450, 1000, 1, array[]::text[], '/images/cameras/DJI%20Osmo%20Nano.png'),
  ('action', 'dji-osmo-pocket-3', 'DJI Osmo Pocket 3', 'DJI',
   'A pocket-sized camera with stabilized video.',
   'A compact gimbal camera for smooth handheld footage while traveling or filming on the move.',
   400, 1000, 1, array[]::text[], '/images/cameras/DJI%20Osmo%20Pocket%203.png'),
  ('action', 'insta360-ace-pro-2', 'Insta360 Ace Pro 2', 'Insta360',
   'An action camera for adventures and creative video.',
   'A rugged action camera for capturing trips, activities, and point-of-view footage.',
   450, 1000, 1, array[]::text[], '/images/cameras/Insta360%20Ace%20Pro%202.png'),
  ('accessories', 'insta360-pocket-printer', 'Insta360 Pocket Printer', 'Insta360',
   'A portable printer for turning photos into physical prints.',
   'A compact photo printer for creating physical prints from compatible devices.',
   300, 1000, 1, array[]::text[], '/images/cameras/Insta360%20Pocket%20Printer.png'),
  ('action', 'insta360-x5', 'Insta360 X5', 'Insta360',
   'A 360 camera for immersive footage and flexible framing.',
   'A 360 camera for capturing everything around you and choosing the framing later.',
   450, 1000, 1, array[]::text[], '/images/cameras/Insta360%20X5.png')
) as v(category_slug, slug, name, brand, tagline, description, daily_rate, deposit, quantity, includes, image_url)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  brand = excluded.brand,
  tagline = excluded.tagline,
  description = excluded.description,
  daily_rate = excluded.daily_rate,
  deposit = excluded.deposit,
  quantity = excluded.quantity,
  includes = excluded.includes,
  image_url = excluded.image_url,
  is_active = true;
