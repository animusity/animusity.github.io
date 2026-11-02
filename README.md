# animusity.github.io

Home Base For The Goblins

An original character archive inspired by the pale grids, stacked menus, geometric details, and red selection highlights of the Animus 2.0 interface. This is an original implementation; no game screenshots, logos, music, or other game assets are included.

## What's included

- Overview, searchable character records, individual profiles, worlds, future plans, and an about page.
- Hash links that can be bookmarked without a server router.
- Responsive layouts, keyboard navigation, visible focus indicators, and reduced-motion support.
- Background animation is off by default and can be enabled with the footer control. The preference is saved in the visitor's browser.
- Explicitly marked sample content. No personal lore has been copied into this public repository.
- No dependencies, account system, analytics, or paid hosting required by the code.

## Deploy to GitHub Pages

1. Open **Settings → Pages** in this repository: <https://github.com/animusity/animusity.github.io/settings/pages>.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Commit the site to `main` (or merge its pull request). The **Deploy character archive** workflow validates the content, prepares the static files, and deploys them.
4. If the code was already on `main` when you changed the setting, open **Actions → Deploy character archive → Run workflow**, select `main`, and run it.
5. Wait for the workflow's build and deploy jobs to succeed. The deployment URL should be <https://animusity.github.io/>.

Future commits to `main` repeat validation and deployment automatically. Pull requests validate without deploying. Do not put private character notes or secrets in this public repository.

GitHub reference: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>.

## Edit the content

All public content lives in `data.json`. Use GitHub's file editor or edit it locally. Preserve JSON punctuation: double quotes around strings, commas between fields, and no trailing comma after the last item.

- `site.tagline` and `site.about`: introduction text.
- `site.preview`: leave `true` while the site contains demonstration records. Change to `false` after replacing them.
- `characters`: one object per profile. Use a unique lowercase `id` containing letters, digits, or hyphens. Status must be `Published`, `Draft`, or `Planned`.
- `worlds`: one object per setting. A character's `world` must match a world ID, or use an empty string for an independent character.
- `plans`: a title, stage, and description for each future idea. Stages are plain text, such as `Concept` or `In progress`.
- `sample`: change to `false` for your own content, or remove the field.

Draft and Planned are descriptive labels, **not access restrictions**. Everything in `data.json`, including drafts, is publicly readable.

### Add a character

Duplicate the existing sample object in `characters`, then replace its fields. For example:

```json
{
  "id": "character-name",
  "name": "Character Name",
  "subtitle": "A short introduction",
  "world": "",
  "status": "Published",
  "sample": false,
  "tags": ["Fantasy"],
  "summary": "A short public introduction.",
  "bio": "Their story so far.\n\nA second paragraph.",
  "portrait": "assets/character-name.webp",
  "portraitAlt": "A description of the portrait",
  "facts": {"Pronouns": "he/him", "Age": "30"},
  "gallery": [
    {"src": "assets/character-scene.webp", "alt": "Description of the scene", "caption": "Optional caption"}
  ],
  "links": [
    {"label": "Roleplay profile", "url": "https://example.com/profile"}
  ]
}
```

Upload your artwork to an `assets/` folder. Filenames are case-sensitive; match them exactly in `data.json`. Use compressed WebP, JPEG, or PNG files. An empty portrait field displays the geometric placeholder. Gallery and external-link sections appear only when entries are supplied. Write plain text rather than HTML in content fields.

## Preview locally

With Node.js 22+ and Python 3 installed:

```bash
node --check app.js
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000/>. Use a local server rather than double-clicking `index.html`, because the page loads its content with `fetch`.

## Files

- `index.html`: page shell and navigation.
- `styles.css`: visual theme and responsive layout.
- `app.js`: browsing, filtering, routes, and motion preferences.
- `data.json`: public content.
- `scripts/build.mjs`: checks record IDs, statuses and world references; copies website files into `dist/`.
- `.github/workflows/pages.yml`: validation and GitHub Pages deployment.

The interface is not affiliated with Ubisoft or Assassin's Creed.
