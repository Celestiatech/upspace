# Floorverse

Next.js application with Supabase authentication and a 3D building experience.

## Production deployment (Vercel)

1. Push this project to a Git provider and import the repository in [Vercel](https://vercel.com/new).
2. Keep Vercel's detected Next.js settings. The build command is `npm run build`; the output directory should be left blank.
3. In **Project Settings > Environment Variables**, add the variables in [`.env.example`](.env.example) for the **Production** environment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` - the final production URL, such as `https://app.example.com`, with no trailing slash.
4. Deploy. If a custom domain is used, add it in **Project Settings > Domains**, then set `NEXT_PUBLIC_SITE_URL` to that canonical domain and redeploy.

`NEXT_PUBLIC_*` values are included in the browser bundle. Use only the Supabase project URL and publishable/anonymous key; never add a Supabase service-role key to Vercel or a client-exposed variable.

## Supabase OAuth redirects

Google sign-in returns to `/auth/callback`. After the Vercel deployment URL is known, open **Supabase Dashboard > Authentication > URL Configuration** and set:

- **Site URL:** the same canonical URL as `NEXT_PUBLIC_SITE_URL` (for example, `https://app.example.com`).
- **Redirect URLs:** `https://app.example.com/auth/callback`.

If you use Vercel preview deployments for authentication testing, add each trusted preview callback URL explicitly, such as `https://your-preview.vercel.app/auth/callback`. Ensure the Google provider is enabled and configured in **Authentication > Providers > Google** with its OAuth client credentials.

## Local setup

Copy `.env.example` to `.env.local`, fill it with your own Supabase values, then run:

```bash
npm install
npm run dev
```

Before deploying, run `npm run build` locally when possible.
