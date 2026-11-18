# Offline Safety Checklist (Warehouse Crew)

Vanilla JavaScript (ES6+) app. No framework. Data is saved in localStorage so it works offline.

## Setup and run
```
npm install
npm run dev      # http://localhost:5173
npm test
npm run lint
```
## Deploy
Static site, no build step. 
- **Netlify:** drag the project folder into app.netlify.com/drop, or connect the GitHub repo (build command: none, publish directory: `.`).
- **Vercel:** import the repo, framework preset "Other", no build command, output directory `.`.

## Structure
`index.html`, `styles.css`, `src/` (state, render, validation, sanitize, storage, api, analytics), `tests/`, `PROMPTS.md`.

## Try the unhappy paths
- Tick "Simulate network failure" then "Reload checklist" to see the loading spinner, error, Retry and cached fallback.
- Submit the forms empty to see red fields and inline errors.
- Filter with text that matches nothing to see "No data found".
- Open DevTools console to see `[Analytics]` messages.
