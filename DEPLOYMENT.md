# Deployment Guide

This guide covers deploying the Loan Calculator application to Firebase Hosting.

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** configured (already set up as `amortizer-80483`)

3. **Authentication** with Firebase:
   ```bash
   firebase login
   ```

## Environment Configuration

The application uses environment-specific configuration files:

- `.env.development` - Used during local development
- `.env.production` - Used for production builds
- `.env` - Local overrides (gitignored)
- `.env.example` - Template for new developers

### Environment Variables

All Firebase configuration is stored in environment variables prefixed with `VITE_`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Build Process

### Development Build
```bash
bun run build
```

### Production Build
```bash
bun run build:prod
```

This command:
1. Runs TypeScript compilation (`tsc -b`)
2. Builds optimized production bundle with Vite
3. Outputs to `dist/` directory

### Build Optimizations

The production build includes:
- **Code splitting**: React and Firebase vendors separated for better caching
- **Minification**: Using esbuild for fast, efficient minification
- **Asset hashing**: All assets include content hash for cache busting
- **Tree shaking**: Removes unused code
- **CSS optimization**: Code splitting and minification

## Deployment Commands

### Deploy Hosting Only
```bash
bun run deploy
```

This deploys only the hosting (static files) to Firebase.

### Deploy Everything (Hosting + Firestore Rules)
```bash
bun run deploy:full
```

This deploys:
- Hosting (static files)
- Firestore security rules
- Firestore indexes

### Manual Deployment
```bash
# Build first
bun run build:prod

# Then deploy
firebase deploy --only hosting

# Or deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Firebase Hosting Configuration

The `firebase.json` file configures hosting with:

### Caching Strategy

- **Static Assets** (JS, CSS, images, fonts): 1 year cache with immutable flag
- **index.html**: No cache (always fetch fresh)

### SPA Routing

All routes rewrite to `/index.html` for client-side routing support.

### Clean URLs

- `cleanUrls: true` - Removes `.html` extensions
- `trailingSlash: false` - Removes trailing slashes

## Testing Deployment Locally

Before deploying to production, test locally:

```bash
# Build production bundle
bun run build:prod

# Preview with Vite
bun run preview

# Or use Firebase hosting emulator
firebase emulators:start --only hosting
```

The preview server runs on `http://localhost:5000`

## Deployment Checklist

Before deploying to production:

- [ ] Run linter: `bun run lint`
- [ ] Test build locally: `bun run build:prod`
- [ ] Preview build: `bun run preview`
- [ ] Verify environment variables in `.env.production`
- [ ] Test authentication flow
- [ ] Test data persistence
- [ ] Test export functionality
- [ ] Check browser console for errors
- [ ] Verify responsive design on mobile

## Post-Deployment Verification

After deployment:

1. **Visit the live URL**: `https://amortizer-80483.web.app`
2. **Test authentication**: Sign up and sign in
3. **Test calculator**: Modify loan parameters
4. **Test persistence**: Refresh page and verify data loads
5. **Test export**: Download CSV file
6. **Check performance**: Use Lighthouse or similar tools
7. **Verify caching**: Check network tab for proper cache headers

## Rollback

If issues occur after deployment:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version (if needed)
# Note: Firebase doesn't have built-in rollback, but you can redeploy a previous build
```

## Continuous Deployment (Optional)

For automated deployments, consider setting up GitHub Actions:

1. Store Firebase token: `firebase login:ci`
2. Add token to GitHub Secrets
3. Create `.github/workflows/deploy.yml`

## Monitoring

Monitor your deployment:

- **Firebase Console**: https://console.firebase.google.com
- **Hosting Dashboard**: View traffic, bandwidth, and errors
- **Authentication**: Monitor user sign-ups and activity
- **Firestore**: Check database usage and queries

## Troubleshooting

### Build Fails

- Check TypeScript errors: `tsc -b`
- Verify all dependencies installed: `bun install`
- Clear cache: `rm -rf node_modules dist && bun install`

### Deployment Fails

- Verify Firebase CLI is logged in: `firebase login`
- Check project is correct: `firebase use --add`
- Ensure `dist/` directory exists and has content

### App Not Loading After Deployment

- Check browser console for errors
- Verify environment variables are set correctly
- Check Firebase Hosting logs in console
- Ensure Firestore rules are deployed

### Authentication Issues

- Verify Firebase Auth is enabled in console
- Check authorized domains include your hosting URL
- Verify API keys are correct in environment variables

## Performance Optimization

The build is optimized for performance:

- **Bundle Size**: Vendor chunks separated for parallel loading
- **Caching**: Aggressive caching for static assets
- **Compression**: Firebase Hosting automatically serves gzip/brotli
- **Modern Browsers**: Targets ES2020 for smaller bundles

## Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` as template
- Rotate API keys if accidentally exposed
- Keep Firestore security rules restrictive
- Enable Firebase App Check for additional security (optional)
