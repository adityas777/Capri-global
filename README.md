# Capri Global – Collections Call Explorer (standalone)

A self-contained copy of the interactive Collections Call Explorer (November 2026 calls, 2–24 Nov).
Plain HTML, CSS and JavaScript – no build step, no server code, no internet connection needed.

## Files
| File | What it is |
|------|-----------|
| index.html | The page |
| styles.css, theme.css | Layout, colours (light and dark mode) |
| data.js | The call-level data (16,846 calls, 2–24 Nov) |
| dash-shim.js | Small runtime that loads the data, applies filters and redraws charts |
| loaders.js, calcs.js, leads_calcs.js, trends_calcs.js, pw_calcs.js | How the data is unpacked and every figure is calculated |
| defs.js, ui.js, leads_ui.js, leads_links.js, extras.js, pw_ui.js, fatal_ui.js | Charts, tables, tabs, click-to-filter, fatal / non-fatal breakdowns and call links |
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
`data.js` contains agent names and masked numbers only: loan account and mobile numbers are cut to their last 4 digits,
leads are keyed by a one-way hash, and there are no customer names or emails. Agent names and call IDs are still
internal information, so keep the Repl / site private or behind a login.

## Updating the data
Re-run `build_explorer_data.py` on a new call-report export, then replace the JSON inside `data.js`
(`window.CG_DATA = { … };`).
