-- Run this once in the Supabase SQL Editor before deploying the gallery update.
alter table public.gems
add column if not exists images text[] not null default '{}'::text[];

-- Keep existing single-image listings working in the new gallery.
update public.gems
set images = array[image]
where image is not null
  and image <> ''
  and cardinality(images) = 0;
