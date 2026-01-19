# Setting Up GitHub Secrets

## Quick Steps

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following:

### Required Secret

**Name:** `GOODREADS_USER_ID`  
**Value:** `124342633-rahil-bhavan`

5. Click **Add secret**

## Verify It's Set

After adding, you can verify by:
- Going to Actions → Secrets
- You should see `GOODREADS_USER_ID` listed

## Test the Workflow

1. Go to **Actions** tab
2. Click **Sync Books** workflow
3. Click **Run workflow** → **Run workflow** (manual trigger)
4. Check the logs to see if it uses the secret

## Additional Secrets (Optional)

If you want to add more secrets later:

- `OPENAI_API_KEY` - For AI insights (optional)
- `WEBHOOK_SECRET` - For API authentication (optional)
