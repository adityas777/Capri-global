# Capri Global – Collections Call Explorer (standalone)

A self-contained copy of the interactive Collections Call Explorer (November 2026 calls, 2–18 Nov).
Plain HTML, CSS and JavaScript – no build step, no server code, no internet connection needed.

## Files
| File | What it is |
|------|-----------|
| index.html | The page |
| styles.css, theme.css | Layout, colours (light and dark mode) |
| data.js | The call-level data (12,192 calls) |
| dash-shim.js | Small runtime that loads the data, applies filters and redraws charts |
| loaders.js, calcs.js, leads_calcs.js | How the data is unpacked and every figure is calculated |
| ui.js, leads_ui.js | Charts, tables, tabs and click-to-filter |
| d3.min.js | Charting library (d3 v7.9.0, ISC licence – see d3-LICENSE.txt) |

## Try it locally
Unzip and double-click `index.html`.

## Host on Replit
1. Create a new Repl using the **HTML, CSS, JS** template.
2. Delete the template's files and upload everything from this folder (keep the same names, all in the top level).
3. Press **Run** – the page opens in the webview.
4. To get a permanent link, use **Deploy → Static** and set the public directory to `.` (the top folder).

A `.replit` file is included that serves the folder with Python if you use a Python Repl instead.

## Other hosts
Any static host works: drag the folder onto Netlify Drop, push it to GitHub Pages, or deploy it on Vercel as a static site.

## Privacy
`data.js` contains agent names and loan account numbers (no customer names or phone numbers).
Anyone who can open the hosted link can read it. Keep the Repl / site private or behind a login,
or ask for a version with loan numbers masked.

## Updating the data
Re-run `build_explorer_data.py` on a new call-report export, then replace the JSON inside `data.js`
(`window.CG_DATA = { … };`).
