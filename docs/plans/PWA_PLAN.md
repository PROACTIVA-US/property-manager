# PropertyManager PWA Plan

## Overview

Convert PropertyManager to an offline-capable PWA that:
- Runs entirely in the browser (no server required)
- Stores all data locally (IndexedDB)
- Can be deployed to Vercel as a static app
- Works offline anywhere
- Easy to share: "Here's the URL"

**Current State:** Client-only SPA using localStorage
**PWA Difficulty:** Easy
**Effort:** 4-6 hours

---

## Phase 1: Add PWA Infrastructure

### 1.1 File Structure
```
public/
  manifest.json        # App metadata, icons
  sw.js               # Service worker
  icons/              # App icons (192x192, 512x512)
```

### 1.2 Manifest Configuration
```json
{
  "name": "PropertyManager",
  "short_name": "PropMgr",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0b0d",
  "theme_color": "#0a0b0d",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 1.3 Service Worker Strategy
- **Cache-first** for static assets (JS, CSS, images)
- **Offline fallback page** for navigation
- **Background sync** for future features

```javascript
// sw.js example
const CACHE_NAME = 'propertymanager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## Phase 2: Storage Migration

### 2.1 Current: localStorage (5MB limit)
### 2.2 New: IndexedDB (unlimited)

Use **Dexie.js** for easy IndexedDB API:

```bash
npm install dexie
```

```typescript
// src/lib/storage.ts
import Dexie from 'dexie';

const db = new Dexie('PropertyManager');
db.version(1).stores({
  properties: '++id, address, status, createdAt',
  settings: 'key, value'
});

export { db };
```

### 2.3 Migration Script
```typescript
// Migrate existing localStorage data to IndexedDB on first load
async function migrateFromLocalStorage() {
  const existingData = localStorage.getItem('propertyData');
  if (existingData) {
    const properties = JSON.parse(existingData);
    await db.properties.bulkAdd(properties);
    localStorage.removeItem('propertyData');
  }
}
```

---

## Phase 3: Install Prompt UI

Add a component to prompt users to install the PWA:

```typescript
// src/components/InstallPrompt.tsx
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstall}>
      Install App
    </button>
  );
}
```

---

## Phase 4: Deploy to Vercel

```bash
npm install
npm run build
vercel --prod
```

---

## Files to Modify

| File | Action |
|------|--------|
| `vite.config.ts` | Add PWA plugin |
| `index.html` | Add manifest link |
| `public/manifest.json` | NEW |
| `public/sw.js` | NEW |
| `public/icons/` | NEW (192x192, 512x512 PNGs) |
| `src/lib/storage.ts` | Migrate to IndexedDB |

---

## Verification Steps

1. `npm run build && npm run preview`
2. Open Chrome DevTools → Application → Service Workers
3. Verify service worker is registered and active
4. Check "Offline" checkbox in Network tab
5. App should still load and function
6. Test data persistence after refresh
7. Deploy to Vercel, test on mobile
8. Verify install prompt appears on mobile

---

## Security Considerations

| Concern | Solution |
|---------|----------|
| Data privacy | All data local, never sent to servers |
| Offline access | Full functionality without network |
