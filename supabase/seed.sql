-- Sample catalog. Replace names, rates and quantities with your real inventory.

insert into public.categories (slug, name, sort_order) values
  ('compact', 'Compact cameras', 1),
  ('mirrorless', 'Mirrorless', 2),
  ('action', 'Action and gimbal', 3),
  ('lenses', 'Lenses', 4)
on conflict (slug) do nothing;

insert into public.cameras (category_id, slug, name, brand, tagline, description, daily_rate, deposit, quantity, includes)
select c.id, v.slug, v.name, v.brand, v.tagline, v.description, v.daily_rate, v.deposit, v.quantity, v.includes
from (values
  ('compact', 'canon-g7x-mark-iii', 'Canon G7 X Mark III', 'Canon',
   'Pocketable vlogging camera with a flip-up screen.',
   'A compact camera with a fast f/1.8-2.8 lens, a screen that flips up for self-shots, and live streaming over USB. Easy to carry on trips and simple enough for a first vlog.',
   500, 5000, 2, array['Battery x2', '64GB SD card', 'Charger', 'Wrist strap', 'Carry pouch']),
  ('compact', 'sony-zv-1', 'Sony ZV-1', 'Sony',
   'Vlog-first compact with strong autofocus.',
   'One-inch sensor, a built-in ND filter, and a directional mic with a wind screen. Good for talking-head videos and travel clips.',
   550, 6000, 1, array['Battery x2', '64GB SD card', 'Charger', 'Wind screen', 'Carry pouch']),
  ('mirrorless', 'canon-eos-r50', 'Canon EOS R50', 'Canon',
   'Light APS-C mirrorless with 4K video.',
   'Subject-tracking autofocus, 4K video, and RF-mount lenses. Comes with the 18-45mm kit lens.',
   750, 8000, 2, array['18-45mm kit lens', 'Battery x2', '64GB SD card', 'Charger', 'Camera strap']),
  ('mirrorless', 'fujifilm-x-t30-ii', 'Fujifilm X-T30 II', 'Fujifilm',
   'Film-style color straight out of the camera.',
   'A small APS-C body with Fujifilm color profiles, so photos look finished without editing. Comes with the 15-45mm kit lens.',
   850, 10000, 1, array['15-45mm kit lens', 'Battery x2', '64GB SD card', 'Charger', 'Camera strap']),
  ('action', 'dji-osmo-pocket-3', 'DJI Osmo Pocket 3', 'DJI',
   'Pocket gimbal camera for smooth handheld video.',
   'A three-axis gimbal with a one-inch sensor and a rotating touchscreen. Walk, run, or ride and the footage stays steady.',
   400, 5000, 3, array['Battery', '64GB microSD card', 'Charging cable', 'Wrist strap', 'Carry bag']),
  ('action', 'gopro-hero-13-black', 'GoPro HERO13 Black', 'GoPro',
   'Waterproof action camera for trips and sports.',
   'Waterproof to 10 m without a case, with 5.3K video and HyperSmooth stabilization. Includes a few mounts for helmets and handlebars.',
   450, 5000, 3, array['Enduro battery x2', '64GB microSD card', 'Charging cable', 'Mounting kit']),
  ('lenses', 'sigma-30mm-f1-4-rf', 'Sigma 30mm f/1.4 (RF mount)', 'Sigma',
   'Fast prime for portraits and low light.',
   'A bright 30mm lens with a soft blurred background. Fits Canon RF-mount APS-C bodies such as the EOS R50.',
   300, 6000, 1, array['Front and rear caps', 'Lens hood', 'Pouch'])
) as v(category_slug, slug, name, brand, tagline, description, daily_rate, deposit, quantity, includes)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
