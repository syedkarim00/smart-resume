# Smart Resume

A lightweight BetterCV-inspired resume builder with live preview, autosave, theming, and print-ready export. Everything runs client-side—no backend required.

## Features
- Editable sections for personal details, summary, experience, education, and skills
- Live resume preview with role counts and pill badges
- Light/dark theme toggle plus print-friendly stylesheet
- LocalStorage autosave with one-click sample data reload
- Export via browser print to PDF

## Getting started
1. Install dependencies (only for formatting via `serve` or similar). No build step is required.
2. Open `index.html` in a browser, or run a quick server:
   ```bash
   python -m http.server 8000
   ```
3. Make edits in the left pane and use the Export button to print/save as PDF.

## Notes
- Resume data is stored locally in your browser under `smart-resume-data`.
- The project is intentionally framework-free for easy customization and embedding.
