# Srilekha's Personal Website 

Welcome to my website! 

## Dependencies

- **Frontend:**
  - React 18
  - React Router
  - Vite
  - CSS3

- **Backend (for local development):**
  - Node.js
  - Express
  - CORS
  - dotenv

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Backend (Optional - for local API testing)
```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5001`

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy when you push to the `main` branch

3. **Update Repository Name (if needed):**
   - If your repository name is different from `PersonalWebsite`, update the workflow file:
     - Open `.github/workflows/deploy.yml`
     - The `VITE_REPO_NAME` environment variable is automatically set to your repository name
     - If deploying to a custom domain (root path), you can modify `vite.config.js` to set `base: '/'`

4. **Access Your Site:**
   - Your site will be available at: `https://[your-username].github.io/[repository-name]/`
   - For example: `https://srilekha511.github.io/PersonalWebsite/`

### Troubleshooting "File Not Found" Error

If you're getting a "404 File Not Found" error:

1. **Check GitHub Actions:**
   - Go to your repository → **Actions** tab
   - Verify the workflow ran successfully
   - Check if there were any build errors

2. **Verify GitHub Pages Settings:**
   - Go to **Settings** → **Pages**
   - Ensure **Source** is set to **GitHub Actions** (not "Deploy from a branch")
   - Wait a few minutes after enabling for the first deployment

3. **Check Repository Name:**
   - The base path is automatically set from your repository name
   - If your repo is `username.github.io` (user/organization page), you need to set `base: '/'` in `vite.config.js`
   - If your repo is a project page (e.g., `PersonalWebsite`), the base path should be `/PersonalWebsite/`

4. **Manual Base Path Fix:**
   - If the automatic base path detection isn't working, edit `frontend/vite.config.js`:
   ```javascript
   // For project pages (username.github.io/repo-name):
   const base = '/your-repo-name/'
   
   // For user pages (username.github.io):
   const base = '/'
   ```
   - Then rebuild and redeploy

5. **Clear Browser Cache:**
   - Try accessing the site in an incognito/private window
   - Or clear your browser cache

6. **Check the URL:**
   - Make sure you're accessing: `https://[username].github.io/[repo-name]/`
   - Note the trailing slash and the hash routes (e.g., `/#/about`)

### Manual Deployment

If you prefer to deploy manually:

```bash
cd frontend
npm install
npm run build
```

Then upload the contents of the `frontend/dist` folder to your hosting service.

## Project Structure

- `frontend/` - React application built with Vite
- `backend/` - Express API server (used for local development)
- `frontend/src/data.js` - Static data file (replaces API calls for GitHub Pages)

## Notes

- The project uses **HashRouter** for GitHub Pages compatibility
- All data is now stored in `frontend/src/data.js` for static hosting
- The backend is optional and only needed for local development with API calls

## License

This project is open source and available under the MIT License.

