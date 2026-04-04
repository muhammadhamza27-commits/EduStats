# EduStats

EduStats is a single-file, client-side student performance tracker built in plain HTML/CSS/JavaScript.

## Production Readiness Notes

- No build step is required.
- App state/history is stored in browser `localStorage`.
- Reports are generated client-side using `jsPDF` and `jspdf-autotable` CDN scripts.
- Charts are rendered client-side using `Chart.js` CDN script.

## Quick Local Run

Open `EduStats.html` directly in a browser, or serve the folder with a static server.

### Option A: Direct open

- Double-click `EduStats.html`.

### Option B: Static server (recommended)

Use any static server, for example:

```powershell
# From this folder
npx serve .
```

Then open the URL shown in terminal.

## Deploy (Static Hosting)

This app can be deployed to any static host:

- GitHub Pages
- Netlify
- Vercel (static)
- Cloudflare Pages
- Firebase Hosting

### Minimal deployment steps

1. Upload `EduStats.html` to the host root.
2. Keep the file name as `EduStats.html`, or rename to `index.html` if your host expects a default entry file.
3. Ensure outbound internet access is allowed for CDN scripts:
   - `cdn.jsdelivr.net`
   - `cdnjs.cloudflare.com`

## Release Workflow (Dev -> Live)

Use `EduStats.html` for development and testing. When ready to publish to the live site (`index.html`), run:

```powershell
./release.ps1 -Message "Release: dark mode improvements"
```

What it does:

- Copies `EduStats.html` -> `index.html`
- Stages and commits `index.html`
- Pushes to `main`

Optional local-only release (no push):

```powershell
./release.ps1 -Message "Release: test batch" -NoPush
```

## Distribution Checklist

1. Verify all tabs load and switch correctly on desktop/tablet/mobile.
2. Verify review form opens Gmail compose and pre-fills content.
3. Verify CSV import/export works with your sample files.
4. Verify PDF report generation completes without browser pop-up blocking.
5. Verify charts and guide canvases render after analysis.

## Browser Support

Modern Chromium, Firefox, Safari, and Edge are supported. For best experience, use the latest stable browser version.

## Data & Privacy

- Student data remains in the local browser unless explicitly exported.
- Review flow opens Gmail compose; user must manually click Send.
