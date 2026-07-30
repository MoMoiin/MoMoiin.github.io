# jakub adamczyk — portfolio

Personal portfolio of **Jakub Adamczyk**, DevOps/Platform Engineer — live at [momoiin.github.io](https://momoiin.github.io).

The site is a static, dependency-free build (no framework, no bundler) with two experiences:

- **Portfolio page** ([index.html](index.html)) — content-focused, responsive landing page.
- **Interactive desktop** ([pages/desktop/](pages/desktop/)) — a Windows-style desktop environment built in vanilla JS: draggable/resizable windows, a working terminal with a command system, email client, file explorer, start menu, and taskbar.

## Structure

```
├── index.html                  # Responsive portfolio landing page
├── css/ js/                    # Landing page assets
├── pages/
│   ├── desktop/                # Interactive desktop experience
│   │   ├── components/         # Self-contained window apps (browser, cmd, email, explorer)
│   │   ├── js/                 # Window manager, constants
│   │   └── js/vendor/          # Vendored anime.js ESM bundle (MIT)
│   └── mobile/                 # Redirect stub kept for old links
└── .github/workflows/          # CI/CD
```

## CI/CD

Every push and pull request to `main` runs the [deploy workflow](.github/workflows/deploy.yml):

1. **Lint** — all HTML is validated with [htmlhint](https://htmlhint.com/).
2. **Deploy** — on push to `main` only, the site is published to GitHub Pages via the official `deploy-pages` action (OIDC, no long-lived tokens).

There is no build step by design: what's in the repo is exactly what's served.

## Dependencies

The only runtime dependency is [anime.js](https://animejs.com/) v4, vendored as a single ESM bundle at [pages/desktop/js/vendor/anime.esm.min.js](pages/desktop/js/vendor/anime.esm.min.js) and wired in through an import map — no `node_modules` needed to serve or develop the site.

## Local development

Serve the repo root with any static server:

```sh
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.
