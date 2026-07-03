# VerdiTech Releases Page

This is a simple, lightweight static page designed to be hosted on GitHub Pages for distributing VerdiTech APKs.

## Features
- **Static Hosting Ready:** Clean HTML, CSS, and vanilla JS that runs anywhere.
- **Dynamic Releases:** Add new APKs simply by editing `releases.json`.


## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your GitHub repository settings.
2. Navigate to **Pages** on the left sidebar.
3. Select the branch you want to serve from (usually `main` or `master`) and the folder (either `/root` or `/docs`).
4. Save, and your page will be live at `https://<your-username>.github.io/<repository-name>/`.



### 2. Adding New Releases
When you have a new APK version:
1. Upload your APK to GitHub Releases.
2. Open `releases.json`.
3. Add a new JSON object at the top of the array:
   ```json
   {
       "version": "1.0.2",
       "date": "2026-07-15",
       "downloadUrl": "https://github.com/butterkookies/VerdiTech/releases/download/v1.0.2/app-release.apk",
       "notes": [
           "Added new feature X.",
           "Bug fixes."
       ]
   }
   ```
4. Commit and push the changes. The webpage will automatically update.
