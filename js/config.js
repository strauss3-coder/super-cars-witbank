/* ==========================================================================
   SUPER CARS WITBANK  ·  Configuration
   --------------------------------------------------------------------------
   The only file you edit to point the website at your Supabase project.
   Both values below belong in public website code.

   The publishable key is designed to sit here where anyone can read it. It is
   row level security in the database, not this key, that protects your data:
   a visitor holding this key may read published stock and settings and may
   insert one enquiry. It cannot read a customer's details, see a VIN, or
   change a single record.

   A service_role key must NEVER appear in this file.
   ========================================================================== */
window.SC_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseKey: 'YOUR-PUBLISHABLE-KEY',

  /* How long a successful read is reused before the site asks again. */
  cacheMinutes: 5
};
