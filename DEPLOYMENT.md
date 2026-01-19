# Deployment Guide

This guide covers deploying the automated book system to production.

## Prerequisites

- GitHub account (for repository and Actions)
- Vercel account (for hosting)
- Goodreads account (for book data)
- OpenAI API key (optional, for AI insights)

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "feat: automated book system"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Astro

3. **Configure build settings**
   - Framework Preset: Astro
   - Build Command: `npm run build` (already set)
   - Output Directory: `dist` (already set)
   - Install Command: `npm ci`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to link project
```

## Step 2: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

### Required Variables

```env
GOODREADS_USER_ID=your_goodreads_user_id
```

### Optional Variables

```env
# For AI insights (recommended)
OPENAI_API_KEY=sk-your-openai-api-key

# For webhook authentication
WEBHOOK_SECRET=your-random-secret-string

# For Vercel Cron authentication
VERCEL_CRON_SECRET=your-random-secret-string

# Control features
ENABLE_METADATA_ENRICHMENT=true
GENERATE_INSIGHTS=true
INCREMENTAL_SYNC=true
```

**Note:** Set these for all environments (Production, Preview, Development) or just Production as needed.

## Step 3: Set Up Goodreads Authentication

### Export Cookies Locally

1. **Run the cookie export script:**
   ```bash
   npm run export:goodreads-cookies
   ```

2. **Follow the prompts:**
   - Browser will open to Goodreads
   - Log in manually
   - Copy cookie values when prompted
   - Script saves to `scripts/.goodreads-cookies.json`

3. **Upload cookies to Vercel:**
   - Option A: Add as environment variable (base64 encoded)
   - Option B: Store in Vercel's file system (if supported)
   - Option C: Use Vercel's environment variables for individual cookies

### Alternative: Manual Cookie Setup

1. Log in to Goodreads in your browser
2. Open DevTools → Application → Cookies
3. Copy `_session_id` and `_session_id2` values
4. Create `scripts/.goodreads-cookies.json`:
   ```json
   [
     {
       "name": "_session_id",
       "value": "your_session_id_value",
       "domain": ".goodreads.com",
       "path": "/",
       "expires": -1,
       "httpOnly": true,
       "secure": true,
       "sameSite": "Lax"
     },
     {
       "name": "_session_id2",
       "value": "your_session_id2_value",
       "domain": ".goodreads.com",
       "path": "/",
       "expires": -1,
       "httpOnly": true,
       "secure": true,
       "sameSite": "Lax"
     }
   ]
   ```

**Important:** Cookies expire! You'll need to refresh them periodically (every few weeks/months).

## Step 4: Configure GitHub Actions

### Set Up Repository Secrets

In GitHub → Your Repository → Settings → Secrets and variables → Actions, add:

```
GOODREADS_USER_ID=your_goodreads_user_id
```

### Enable GitHub Actions

1. Go to your repository → Actions tab
2. The workflow should be enabled automatically
3. You can manually trigger it: Actions → "Sync Books" → Run workflow

### Grant Permissions

The workflow needs permission to commit. In `.github/workflows/sync-books.yml`, you may need to add:

```yaml
permissions:
  contents: write
```

## Step 5: Configure Vercel Cron

Vercel Cron is already configured in `vercel.json`. To enable:

1. **Upgrade to Vercel Pro** (Cron requires Pro plan)
   - Or use GitHub Actions as alternative (free)

2. **Set VERCEL_CRON_SECRET** environment variable
   - Generate a random secret: `openssl rand -hex 32`
   - Add to Vercel environment variables

3. **Verify cron is active**
   - Vercel Dashboard → Your Project → Cron Jobs
   - Should show `/api/cron/sync-books` scheduled

## Step 6: Test the Deployment

### Test Manual Sync

1. **Via API endpoint:**
   ```bash
   # With webhook secret
   curl -X POST https://your-domain.com/api/sync-books \
     -H "Authorization: Bearer YOUR_WEBHOOK_SECRET"
   
   # Or via GET (if no secret set)
   curl https://your-domain.com/api/sync-books?token=YOUR_SECRET
   ```

2. **Check build logs:**
   - Vercel Dashboard → Deployments → Latest → Build Logs
   - Should see book aggregation running

### Test Scheduled Syncs

1. **GitHub Actions:**
   - Go to Actions tab
   - Wait for scheduled run or trigger manually
   - Check logs for success

2. **Vercel Cron:**
   - Check Vercel Dashboard → Cron Jobs
   - Verify execution logs

## Step 7: Verify Everything Works

1. **Check data files are generated:**
   - Visit `https://your-domain.com/books`
   - Should show books (if any collected)
   - Check browser console for errors

2. **Check analytics:**
   - Visit `https://your-domain.com/analytics`
   - Should show charts and statistics

3. **Check API endpoints:**
   - `/api/sync-books` - Manual trigger
   - `/api/cron/sync-books` - Cron endpoint

## Troubleshooting

### Build Fails

**Issue:** Build times out or fails
- **Solution:** Increase Vercel build timeout (Pro plan) or optimize build
- **Alternative:** Run aggregation in GitHub Actions instead

**Issue:** Playwright not found
- **Solution:** Add `npx playwright install chromium` to build command
- **Or:** Disable browser automation, use RSS only

### No Books Collected

**Issue:** Goodreads returns 0 books
- **Check:** Cookies are valid and not expired
- **Check:** `GOODREADS_USER_ID` is correct
- **Check:** Goodreads profile is public (or cookies are set)

### AI Insights Not Working

**Issue:** No insights generated
- **Check:** `OPENAI_API_KEY` is set
- **Check:** API key has credits/quota
- **Note:** Insights are optional, system works without them

### Cron Not Running

**Issue:** Vercel Cron not executing
- **Check:** You're on Vercel Pro plan
- **Check:** `VERCEL_CRON_SECRET` is set
- **Alternative:** Use GitHub Actions (free alternative)

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Project deployed to Vercel
- [ ] Environment variables configured
- [ ] Goodreads cookies exported and uploaded
- [ ] GitHub Actions secrets configured
- [ ] GitHub Actions workflow enabled
- [ ] Vercel Cron configured (if using Pro)
- [ ] Manual sync tested
- [ ] Books page displays correctly
- [ ] Analytics page displays correctly
- [ ] Scheduled syncs working

## Maintenance

### Regular Tasks

1. **Refresh Goodreads cookies** (every 1-2 months)
   ```bash
   npm run export:goodreads-cookies
   # Upload new cookies to Vercel
   ```

2. **Monitor sync logs**
   - Check GitHub Actions runs
   - Check Vercel deployment logs
   - Verify books are updating

3. **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

### Updating the System

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel auto-deploys on push
5. Monitor deployment logs

## Alternative: GitHub Actions Only (Free)

If you don't have Vercel Pro, you can use GitHub Actions exclusively:

1. **Disable Vercel Cron:**
   - Remove cron config from `vercel.json`
   - Or keep it (it just won't run without Pro)

2. **Rely on GitHub Actions:**
   - Runs every 6 hours (free)
   - Commits changes automatically
   - Triggers Vercel rebuild

3. **Manual triggers:**
   - Use `/api/sync-books` endpoint
   - Or trigger GitHub Action manually

## Support

If you encounter issues:
1. Check build logs in Vercel
2. Check GitHub Actions logs
3. Verify environment variables
4. Test locally with `npm run sync:books`
