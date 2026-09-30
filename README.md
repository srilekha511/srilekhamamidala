# Srilekha's Gallery

A pixel-art museum portfolio: walk the gallery, step into paintings, and read about projects and experience.

- Live: https://srilekha.dev/
- Text version: https://srilekha.dev/#/quick

## Develop

    cd frontend
    npm install
    npm run dev      # http://localhost:5173/
    npm test

## Edit content

All text lives in `frontend/src/data.js` (profile, education, skills, interests, experience, projects).
Project images go in `frontend/public/` and are referenced as `/filename.png`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds `frontend/` and publishes `dist/` to GitHub Pages.
