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

