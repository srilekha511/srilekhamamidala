# GitHub Pages Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Verify Repository Name
- Repository name: `srilekhamamidala`
- Expected URL: `https://srilekha511.github.io/srilekhamamidala/`

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **"GitHub Actions"** (NOT "Deploy from a branch")
4. Save the settings

### 3. Check GitHub Actions Workflow
1. Go to **Actions** tab in your repository
2. Verify the workflow "Deploy to GitHub Pages" has run
3. Check if it completed successfully (green checkmark)
4. If it failed, click on it to see error messages

### 4. Verify Deployment
- After the workflow completes, wait 1-2 minutes
- Visit: `https://srilekha511.github.io/srilekhamamidala/`
- Note: With HashRouter, routes will have `#`: 
  - Home: `https://srilekha511.github.io/srilekhamamidala/#/`
  - About: `https://srilekha511.github.io/srilekhamamidala/#/about`
  - Projects: `https://srilekha511.github.io/srilekhamamidala/#/projects`

## 🔧 Troubleshooting

### If you still get 404:

1. **Check the Actions tab:**
   - Is there a workflow run?
   - Did it succeed?
   - Check the build logs for errors

2. **Verify GitHub Pages Settings:**
   - Settings → Pages → Source should be "GitHub Actions"
   - If it says "Deploy from a branch", change it to "GitHub Actions"

3. **Check the URL:**
   - Make sure you're using: `https://srilekha511.github.io/srilekhamamidala/`
   - Include the trailing slash
   - Try with hash: `https://srilekha511.github.io/srilekhamamidala/#/`

4. **Clear browser cache:**
   - Try incognito/private window
   - Or hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

5. **Trigger workflow manually:**
   - Go to Actions tab
   - Click "Deploy to GitHub Pages" workflow
   - Click "Run workflow" button
   - Select "main" branch and run

## 📝 Next Steps After Fixing

Once it's working, commit and push your changes:

```bash
git add .
git commit -m "Fix GitHub Pages deployment configuration"
git push origin main
```

The workflow will automatically run and deploy your site.

