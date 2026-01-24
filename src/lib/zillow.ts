/**
 * Zillow Property Valuation Library
 * Uses browser automation to fetch property values from Zillow's public estimator
 */

export interface ZillowEstimate {
  address: string;
  zestimate: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lastUpdated: string; // ISO timestamp
}

/**
 * Note: This function is designed to work with browser automation (Claude in Chrome)
 * For production use, you would need to:
 * 1. Use Puppeteer or similar headless browser
 * 2. Or integrate with Zillow's official API if you have partner access
 * 3. Or use a third-party property data API
 *
 * This implementation returns a promise that would be fulfilled by browser automation.
 */

/**
 * Fetch Zillow estimate for a given address
 * @param address - Full property address (e.g., "14102 129th Ave NE, Kirkland, WA 98034")
 * @returns Promise<ZillowEstimate>
 */
export async function fetchZillowEstimate(_address: string): Promise<ZillowEstimate> {
  // This is a placeholder for the browser automation logic
  // In a real implementation, you would:
  // 1. Navigate to Zillow's estimator page
  // 2. Enter the address
  // 3. Parse the results
  // 4. Return the structured data

  throw new Error(
    'This function requires browser automation to be implemented. ' +
    'See the standalone script or use the manual update feature.'
  );
}

/**
 * Parse Zillow estimate from a manual input
 * This allows users to manually enter Zillow data they retrieved
 */
export function parseZillowEstimate(
  address: string,
  zestimateValue: number,
  bedrooms?: number,
  bathrooms?: number,
  squareFeet?: number
): ZillowEstimate {
  return {
    address,
    zestimate: zestimateValue,
    bedrooms,
    bathrooms,
    squareFeet,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Format Zillow estimate for display
 */
export function formatZillowEstimate(estimate: ZillowEstimate): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(estimate.zestimate);
}

/**
 * Save Zillow estimate to localStorage
 */
const ZILLOW_STORAGE_KEY = 'propertyManager_zillow_estimate';

export function saveZillowEstimate(estimate: ZillowEstimate): void {
  try {
    localStorage.setItem(ZILLOW_STORAGE_KEY, JSON.stringify(estimate));
  } catch (error) {
    console.error('Failed to save Zillow estimate:', error);
  }
}

/**
 * Load saved Zillow estimate from localStorage
 */
export function loadZillowEstimate(): ZillowEstimate | null {
  try {
    const stored = localStorage.getItem(ZILLOW_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ZillowEstimate;
    }
  } catch (error) {
    console.error('Failed to load Zillow estimate:', error);
  }
  return null;
}

/**
 * Check if the saved estimate is recent (within 30 days)
 */
export function isEstimateFresh(estimate: ZillowEstimate | null): boolean {
  if (!estimate) return false;

  const lastUpdated = new Date(estimate.lastUpdated);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return lastUpdated > thirtyDaysAgo;
}
