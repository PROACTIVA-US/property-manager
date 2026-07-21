# Zillow Property Value Integration

This document explains the three ways to fetch and update your property's Zillow Zestimate value.

## Overview

Since Zillow's API is restricted and doesn't offer a free tier for single property lookups, we've created three alternative methods to get property valuations:

1. **In-App Widget** - Manual entry with one-click Zillow access
2. **Monthly Script** - Command-line tool for quick updates
3. **Library Functions** - Reusable TypeScript/JavaScript functions

## Method 1: In-App Widget (Easiest)

The Property Value Widget is integrated into your Owner Dashboard.

### Features:
- One-click link to open Zillow
- Manual value entry
- Automatic storage in localStorage
- 30-day freshness indicator
- One-click apply to property market value

### How to Use:
1. Go to your Owner Dashboard
2. Find the "Property Value" widget
3. Click the external link icon (↗) to open Zillow
4. Copy the Zestimate value
5. Paste it into the manual update field
6. Click "Update"
7. (Optional) Click "Apply to Property Value" to update your property's market value

### Location:
- **File**: `src/components/PropertyValueWidget.tsx`
- **Dashboard**: Owner Dashboard (integrated)

---

## Method 2: Monthly Script (Command Line)

A standalone Node.js script that can be run once per month.

### Setup:
No additional setup required - just run the script!

### Usage:

**View current saved value:**
```bash
node scripts/get-property-value.cjs
```

**Update with new value:**
```bash
# Get the Zestimate from Zillow (e.g., $1,089,100)
# Then run with just the number (no $ or commas):
node scripts/get-property-value.cjs 1089100
```

**Check saved value only:**
```bash
node scripts/get-property-value.cjs --show
```

### Add to package.json (Optional):
```json
{
  "scripts": {
    "update-value": "node scripts/get-property-value.cjs"
  }
}
```

Then you can run:
```bash
npm run update-value 1089100
```

### Storage:
The script saves data to `property-value-data.json` in the project root.

### Location:
- **File**: `scripts/get-property-value.cjs`
- **Data**: `property-value-data.json` (auto-created)

---

## Method 3: Library Functions

Reusable TypeScript functions for programmatic access.

### Available Functions:

```typescript
import {
  loadZillowEstimate,
  saveZillowEstimate,
  parseZillowEstimate,
  formatZillowEstimate,
  isEstimateFresh,
  type ZillowEstimate
} from './lib/zillow';

// Load saved estimate
const estimate = loadZillowEstimate();

// Create and save new estimate
const newEstimate = parseZillowEstimate(
  '14102 129th Ave NE, Kirkland, WA 98034',
  1089100, // zestimate value
  3,       // bedrooms (optional)
  2,       // bathrooms (optional)
  1400     // square feet (optional)
);
saveZillowEstimate(newEstimate);

// Format for display
const formatted = formatZillowEstimate(estimate); // "$1,089,100"

// Check if estimate is fresh (< 30 days old)
const isFresh = isEstimateFresh(estimate);
```

### Data Structure:

```typescript
interface ZillowEstimate {
  address: string;
  zestimate: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lastUpdated: string; // ISO timestamp
}
```

### Location:
- **File**: `src/lib/zillow.ts`

---

## Workflow Recommendation

**Monthly Update Routine:**

1. **Last day of each month**, run:
   ```bash
   node scripts/get-property-value.cjs
   ```

2. Follow the on-screen instructions to:
   - Open Zillow
   - Get the current Zestimate
   - Save it with the script

3. **Or** use the in-app widget:
   - Open your Owner Dashboard
   - Click the Zillow link in the Property Value widget
   - Enter the value manually

4. The value will be stored and available in your Property Manager app

---

## Data Storage

All three methods use the same storage locations:

- **Browser Storage**: `localStorage` with key `propertyManager_zillow_estimate`
- **File Storage**: `property-value-data.json` (for the script)
- **Property Data**: Automatically integrated with Settings when you click "Apply to Property Value"

---

## Configuration

### Update Your Property Address:

**In the Script:**
Edit `scripts/get-property-value.cjs`:
```javascript
const PROPERTY_ADDRESS = '14102 129th Ave NE'; // Change this
```

**In the App:**
The app automatically uses your property address from Settings > Property Details.

---

## Future Enhancements

Potential improvements for automated updates:

1. **Browser Automation** (Puppeteer/Playwright)
   - Fully automated monthly scraping
   - Headless browser integration

2. **Third-Party API** (Paid)
   - RentCast API
   - ATTOM Data API
   - BatchData API

3. **Scheduled Updates**
   - Cron job for monthly automated updates
   - Email notifications when value changes significantly

---

## Troubleshooting

**Script won't run:**
- Make sure Node.js is installed (`node --version`)
- Run from the project root directory

**Value not updating in app:**
- Clear localStorage and try again
- Check browser console for errors
- Make sure you're logged in

**Zillow link not working:**
- Make sure your property address is set in Settings > Property Details
- Try manually navigating to Zillow and searching for your address

---

## Files Created

```
PropertyManager/
├── src/
│   ├── lib/
│   │   └── zillow.ts                          # Library functions
│   └── components/
│       ├── PropertyValueWidget.tsx            # Dashboard widget
│       └── role-dashboards/
│           └── OwnerDashboard.tsx             # Updated with widget
├── scripts/
│   └── get-property-value.cjs                 # Monthly script
├── docs/
│   └── ZILLOW_INTEGRATION.md                  # This file
└── property-value-data.json                   # Auto-created by script
```

---

## Questions?

For issues or feature requests, please refer to the project documentation or create an issue in the repository.
