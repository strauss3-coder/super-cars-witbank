-- ============================================================================
-- SUPER CARS WITBANK  ·  Add the brand assets
-- ----------------------------------------------------------------------------
-- Run this once, in the SQL Editor, on a project that already has 01-schema and
-- 02-seed applied.
--
-- Why this rather than re-running 02-seed.sql: the seed REPLACES each settings
-- document wholesale, so it would throw away anything edited in the portal
-- since. This merges the new fields into what is already there with ||, so an
-- edited heading, price or opening time survives untouched.
--
-- Safe to run more than once. Fields already set to a non-empty value are left
-- alone, so a photograph swapped in the portal is never overwritten by the one
-- that shipped with the site.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. THE LOGO  ->  Business Information
-- Two files, because the header sits on white and the footer on black.
-- ---------------------------------------------------------------------------
update public.site_settings
   set value = value
     || case when coalesce(value->>'logo','') = ''
             then jsonb_build_object('logo','assets/brand/logo.png') else '{}'::jsonb end
     || case when coalesce(value->>'logoLight','') = ''
             then jsonb_build_object('logoLight','assets/brand/logo-light.png') else '{}'::jsonb end
 where key = 'business';

-- ---------------------------------------------------------------------------
-- 2. THE HOME PAGE  ->  Homepage Editor
-- The hero photograph, the dealership gallery, and the picture beside the
-- reviews. The gallery and the section switch are only added when absent, so a
-- gallery already curated in the portal is not replaced.
-- ---------------------------------------------------------------------------
update public.site_settings
   set value = value
     || case when coalesce(value->>'heroPhoto','') = ''
             then jsonb_build_object('heroPhoto','assets/photos/forecourt.jpg') else '{}'::jsonb end
     || case when coalesce(value->>'testimonialsImage','') = ''
             then jsonb_build_object('testimonialsImage','assets/photos/handover.jpg') else '{}'::jsonb end
     || case when value ? 'galleryTitle' then '{}'::jsonb else jsonb_build_object(
          'galleryTitle','Come and see the floor',
          'gallerySub','Watermeyer Street, six days a week. This is what you will find.'
        ) end
     || case when jsonb_array_length(coalesce(value->'gallery','[]'::jsonb)) > 0 then '{}'::jsonb
             else jsonb_build_object('gallery', jsonb_build_array(
               jsonb_build_object('image','assets/photos/forecourt.jpg','caption','The front of the dealership on Watermeyer Street'),
               jsonb_build_object('image','assets/photos/floor.jpg',    'caption','Under cover, so nothing sits in the sun'),
               jsonb_build_object('image','assets/photos/handover.jpg', 'caption','A customer collecting their car'),
               jsonb_build_object('image','assets/photos/canopy.jpg',   'caption','Every vehicle prepared before it is listed')
             )) end
     -- the new section needs a switch, or the page cannot turn it off
     || jsonb_build_object('sections',
          coalesce(value->'sections','{}'::jsonb)
          || case when (value->'sections') ? 'gallery' then '{}'::jsonb
                  else jsonb_build_object('gallery', true) end)
 where key = 'homepage';

-- ---------------------------------------------------------------------------
-- 3. THE ABOUT PAGE  ->  Website Content
-- ---------------------------------------------------------------------------
update public.site_settings
   set value = value
     || case when coalesce(value->>'storyImage','') = ''
             then jsonb_build_object('storyImage','assets/photos/forecourt.jpg') else '{}'::jsonb end
     || case when coalesce(value->>'locationImage','') = ''
             then jsonb_build_object('locationImage','assets/photos/canopy.jpg') else '{}'::jsonb end
 where key = 'about';

-- ---------------------------------------------------------------------------
-- 4. THE CONTACT PAGE  ->  Website Content
-- A document of its own, so it is inserted rather than merged.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value)
values ('contact', jsonb_build_object('image','assets/photos/canopy.jpg'))
on conflict (key) do update
  set value = public.site_settings.value
    || case when coalesce(public.site_settings.value->>'image','') = ''
            then jsonb_build_object('image','assets/photos/canopy.jpg') else '{}'::jsonb end;

-- ---------------------------------------------------------------------------
-- 5. CHECK IT
-- Every line below should read "set".
-- ---------------------------------------------------------------------------
select 'header logo'      as item,
       case when coalesce(value->>'logo','')      <> '' then 'set' else 'MISSING' end as state
  from public.site_settings where key = 'business'
union all
select 'footer logo',
       case when coalesce(value->>'logoLight','') <> '' then 'set' else 'MISSING' end
  from public.site_settings where key = 'business'
union all
select 'hero photograph',
       case when coalesce(value->>'heroPhoto','') <> '' then 'set' else 'MISSING' end
  from public.site_settings where key = 'homepage'
union all
select 'gallery pictures',
       jsonb_array_length(coalesce(value->'gallery','[]'::jsonb))::text
  from public.site_settings where key = 'homepage'
union all
select 'reviews photograph',
       case when coalesce(value->>'testimonialsImage','') <> '' then 'set' else 'MISSING' end
  from public.site_settings where key = 'homepage'
union all
select 'about photographs',
       case when coalesce(value->>'storyImage','') <> '' and coalesce(value->>'locationImage','') <> ''
            then 'set' else 'MISSING' end
  from public.site_settings where key = 'about'
union all
select 'contact photograph',
       case when coalesce(value->>'image','') <> '' then 'set' else 'MISSING' end
  from public.site_settings where key = 'contact';
