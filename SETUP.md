# Beginner online version

This uses Supabase so sermons are saved online instead of disappearing after refresh.

1. Create a Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. In Authentication > Users, create your admin email/password.
4. In `config.js`, paste your Supabase Project URL and Publishable/anon key.
5. Put your 2:3 background image at `images/background.jpg`.
6. Host these files as a static website.
7. Open `admin.html`, log in, and upload Topic + Speaker + Date + Image + MP3.

The public site automatically gets the sermons from Supabase and still has search, year/speaker filters and Load More (4 at a time).

Do not put a Supabase service_role/secret key in the website.

Current Supabase Free plan limits should be checked before uploading a large archive; the current published limits include 1 GB file storage and 500 MB database size.
