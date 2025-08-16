# Deployment Guide - Wings of Steel Website

## 🚨 CRITICAL: This site deploys to Netlify

### Pre-Deployment Checklist

Before pushing ANY changes that will trigger a deployment:

- [ ] Run `npm run build` locally - MUST succeed
- [ ] Run `npm run preview` and test the site at http://localhost:4173
- [ ] Verify all pages load correctly in preview
- [ ] Check browser console for any errors
- [ ] Ensure `dist` folder is NOT being committed (it's in .gitignore)

### Netlify Configuration

The site uses these critical files for Netlify deployment:

1. **`netlify.toml`** - Contains build configuration
   - Clears caches before building: `rm -rf dist node_modules/.vite`
   - Sets publish directory to `dist`
   - Excludes public env vars from secrets scanning

2. **`public/_redirects`** - Required for React Router SPA
   ```
   /*    /index.html   200
   ```

3. **`.gitignore`** - MUST include `dist` folder
   - Netlify must build fresh to avoid asset hash mismatches

### Common Deployment Issues & Solutions

#### 1. Blank Page on Netlify
**Symptom**: Site loads but shows blank page
**Cause**: Asset hash mismatch between local and Netlify builds
**Solution**: 
- Ensure `dist` is not committed
- Clear Netlify cache and redeploy
- Check browser console for MIME type errors

#### 2. MIME Type Errors
**Symptom**: Console shows "Refused to apply style... MIME type ('text/html')"
**Cause**: Asset files don't exist (wrong hash), server returns HTML 404
**Solution**: 
- Never commit `dist` folder
- Let Netlify build from source

#### 3. Build Failures - Secrets Scanning
**Symptom**: Build fails with "Secrets detected"
**Cause**: Netlify detects env vars in build output
**Solution**: Already configured in `netlify.toml` to exclude public vars

### Deployment Process

1. Make changes locally
2. Test with `npm run build && npm run preview`
3. Commit changes (NOT the `dist` folder!)
4. Push to GitHub: `git push origin master`
5. Netlify automatically deploys from master branch
6. Check deployment at: https://wingsofsteeltestwebsite.netlify.app/

### Environment Variables

Required environment variables in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `VITE_PRINTIFY_API_TOKEN`
- `VITE_PRINTIFY_SHOP_ID`

### Emergency Rollback

If deployment breaks the site:
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Find last working deployment
4. Click "Publish deploy" on the working version

### Testing Deployment

After deployment completes:
1. Visit https://wingsofsteeltestwebsite.netlify.app/
2. Check all major sections load
3. Open browser console - should be error-free
4. Test navigation between pages
5. Verify images and styles load correctly

---

**Remember**: The #1 rule is NEVER commit the `dist` folder. Netlify must build it fresh every time!