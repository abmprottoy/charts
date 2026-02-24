# Simple Charts

Single-page React app by ABM Labs for teachers to quickly create pie and bar charts from classroom question data.

## Features

- Pie and bar chart creation from simple row-based data entry
- Curated chart color themes with optional advanced custom colors
- PNG export at 2x resolution with transparent or white background
- Local auto-save of the last worksheet
- PWA-ready for installable, app-like use on Android devices

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is generated in `dist/`.

## Cloudflare Pages Deployment

1. Push this repo to GitHub/GitLab.
2. In Cloudflare Dashboard, go to `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select this repository and configure build:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (default)
   - Node version: `20+` recommended
4. Deploy.
5. If you use a custom domain, attach it in Cloudflare Pages project settings.

This project is static and deploys directly to Cloudflare Pages without server code.

## SEO and Social Preview

- Open Graph/Twitter preview tags are in `index.html`.
- Social preview image: `public/og-image.png` (1200x630).
- Crawler files:
  - `public/robots.txt`
  - `public/sitemap.xml`

Production domain is configured as:
- `https://charts.abmcodes.xyz`
