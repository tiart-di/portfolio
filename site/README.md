# Diana Tiart — portfolio

Static site: plain HTML, CSS, JS. No build step.

## Pages
- `index.html` home (bento grid)
- `work.html` project list
- `search.html`, `ios.html`, `seo.html`, `prowler.html` case studies (order: Search, iOS, SEO, Prowler)
- `about.html`, `contact.html`
- `styles.css`, `script.js` shared by every page; `assets/` images and video

## Run locally
    npx serve site
    # clean URLs (/work, /about) only work on a server that supports them (Vercel, npx serve),
    # plain `python3 -m http.server` will 404 on them

## Deploy
Push to GitHub, import the repo in Vercel (framework: Other, no build command, output directory: root).
Every push to `main` redeploys.

## Conventions
- After editing `styles.css` or `script.js`, bump `?v=N` in every html file so browsers don't serve the cached copy.
- Site copy: no em dashes. Write "0 → 1".
- Fonts load from Google Fonts.
- Video covers ship as .webm + .mp4 pair.

## Not in this folder
Old versions, unlinked pages and unused assets live one level up in `_archive/`. Source images and recordings are in `_source/`.

## Caching
`vercel.json` tells browsers to cache `/assets/*`, `styles.css` and `script.js` for a year. That is why the `?v=N` bump matters: if you change a file and keep the same `?v=N`, visitors keep seeing the old one.

## URLs
`vercel.json` has `cleanUrls: true`, so pages live at `/`, `/work`, `/about`, `/contact`, `/search`, `/ios`, `/seo`, `/prowler`. Old `.html` links and the old long names (`/iask-search`, `/iask-ios`, `/seo-article-generator`) redirect automatically. Internal links in the html use these clean paths (`href="/work"`), not file names.
