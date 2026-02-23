# Scott Hoglund Art

Gallery website for Scott Hoglund's artwork with admin panel for uploading and managing art scans.

## Tech Stack
- React + Vite
- Supabase (auth, database, image storage)
- Deployed on Vercel

## Supabase Project
- **Project:** Scott Hoglund Art
- **ID:** tgcjlspyrcgljoosbfww
- **URL:** https://tgcjlspyrcgljoosbfww.supabase.co

## Local Development

```bash
cd C:\dev\scotthoglundart
npm install
npm run dev
```

## Environment Variables
Create `.env` in project root:
```
VITE_SUPABASE_URL=https://tgcjlspyrcgljoosbfww.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Also add these to Vercel project settings → Environment Variables.

## Deployment
Push to GitHub → auto-deploys via Vercel.

## Future Additions
- [ ] Ecwid store integration (when products are ready)
- [ ] Drag-and-drop reordering in admin
- [ ] Artist bio/photo upload
- [ ] SEO meta tags per artwork
