-- ============================================================================
-- SUPER CARS WITBANK  ·  Restore the contact document
-- ----------------------------------------------------------------------------
-- The live database holds ten settings documents. It should hold eleven: the
-- 'contact' row is absent. 03-add-brand-assets.sql creates it, so this happens
-- when 02-seed.sql is run again afterwards — the seed knows only the ten
-- documents that existed when it was written, and replaces the set.
--
-- Nothing is broken on the website. js/contact.js falls back to the built-in
-- copy, so the page still shows the right photograph and details. What is lost
-- is the portal's ability to edit them: with no row, Website Content has
-- nothing to save into.
--
-- Safe to run more than once, and it never overwrites an edit.
-- ============================================================================
insert into public.site_settings (key, value)
values ('contact', jsonb_build_object('image','assets/photos/canopy.jpg'))
on conflict (key) do update
  set value = public.site_settings.value
    || case when coalesce(public.site_settings.value->>'image','') = ''
            then jsonb_build_object('image','assets/photos/canopy.jpg') else '{}'::jsonb end;

-- Should read 11.
select count(*) as settings_documents from public.site_settings;
