# Diana Tiart — portfolio

Static site: plain HTML, CSS, JS. No build step.

## Pages
- `index.html` home (bento grid)
- `work.html` project list
- `iask-search.html`, `iask-ios.html`, `seo-article-generator.html`, `prowler.html` case studies (order: Search, iOS, SEO, Prowler)
- `about.html`, `contact.html`
- `styles.css`, `script.js` shared by every page; `assets/` images and video

## Run locally
    cd site
    python3 -m http.server 8000
    # open http://localhost:8000

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
