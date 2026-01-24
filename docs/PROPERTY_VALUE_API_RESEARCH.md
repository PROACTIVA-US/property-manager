# Property Value API Research & Implementation Plan

**Date:** January 24, 2026
**Status:** Research Complete - Ready for Implementation

---

## Executive Summary

This document outlines available APIs for retrieving real-time property values to replace manual market value entry in the Property Manager application.

**Key Finding:** Zillow's public API is no longer available. **ATTOM Data Solutions** is the recommended alternative with 158M+ property records and comprehensive real estate data.

---

## Current State

**Problem:**
- Users must manually enter and update property market values
- No automation for tracking property appreciation
- Values become stale without regular updates
- No source of truth for accurate property valuations

**Goal:**
- Automatically fetch current property values from reliable sources
- Display value trends and historical data
- Reduce manual data entry
- Provide accurate, up-to-date property valuations

---

## API Provider Analysis

### 1. ATTOM Data Solutions ⭐ **RECOMMENDED**

**Coverage:** 158M+ U.S. properties

**Features:**
- Property characteristics
- Current valuations
- Ownership details
- Mortgage records
- Parcel boundaries
- Hazard data
- Market analytics
- Historical sales data

**Pricing:** $99-$499/month (tiered by API call volume)

**Pros:**
- Most comprehensive dataset
- Official API with excellent documentation
- Used by major financial institutions
- Reliable and supported
- Predictable pricing

**Cons:**
- Monthly subscription cost
- Not free tier

**API Endpoint Example:**
```
GET /property/detail
?address1=123+Main+St&address2=City+State+Zip
```

**Documentation:** https://www.attomdata.com/developers/

---

### 2. Homesage.ai

**Coverage:** 140M+ U.S. residential properties

**Features:**
- AI-powered valuations
- Investment analytics
- Market trends
- Predictive models
- Rental estimates

**Pricing:** API-based (pay per call)

**Pros:**
- Modern AI/ML approach
- More accurate than traditional models
- Investment-focused analytics
- Flexible pricing

**Cons:**
- Newer provider (less track record)
- Per-call pricing can be unpredictable

**Use Case:** Best for investment properties and rental analysis

---

### 3. Estated

**Coverage:** 150M+ properties

**Features:**
- Property valuations
- Ownership information
- Tax records
- Physical characteristics
- Neighborhood data

**Pricing:** $99-$299/month

**Pros:**
- Developer-friendly API
- Good documentation
- Comprehensive property data
- Reasonable pricing

**Cons:**
- Less features than ATTOM
- Smaller market presence

---

### 4. HouseCanary

**Coverage:** National

**Features:**
- AI-driven valuations (highest accuracy)
- Risk assessment tools
- Market forecasts
- Lending decision models

**Pricing:** Enterprise (likely $500+/month)

**Pros:**
- Industry-leading accuracy
- Used by institutional lenders
- Advanced AI models
- Risk analytics

**Cons:**
- Expensive (enterprise only)
- Overkill for individual property owners

**Use Case:** Best for institutional investors, lenders, asset managers

---

### 5. Redfin (Unofficial/Third-Party)

**Coverage:** National

**Features:**
- Redfin Estimate (2% error for listed homes, 7.69% for off-market)
- Property details
- Neighborhood data
- Historical sales

**Pricing:** $49-$99/month (via third-party services like HasData, PropAPIS)

**Pros:**
- Lower cost option
- Good accuracy
- Wide coverage

**Cons:**
- No official API (scraping-based)
- Against Redfin TOS
- Could break anytime
- Rate limiting risks
- No official support

**Use Case:** Budget option if API costs are prohibitive

---

### 6. Zillow ❌ **NOT AVAILABLE**

**Status:** Public API discontinued

**Background:**
- Zillow previously offered Zestimate API
- Restricted to existing commercial partners only
- No new developer registrations accepted
- Must use alternatives

---

## Recommended Implementation

### Phase 1: ATTOM Data Integration (Week 1)

**Step 1: API Setup**
1. Sign up at ATTOM Data Solutions
2. Choose appropriate pricing tier
3. Obtain API credentials
4. Review rate limits and quotas

**Step 2: Backend Service**

Create `src/lib/propertyValueAPI.ts`:

```typescript
interface PropertyValueProvider {
  name: string;
  fetchValue(address: string): Promise<PropertyValue>;
  fetchDetails(address: string): Promise<PropertyDetails>;
}

interface PropertyValue {
  estimatedValue: number;
  lowEstimate: number;
  highEstimate: number;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low';
  provider: string;
  valueChange?: {
    amount: number;
    percentage: number;
    period: string;
  };
}

interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  yearBuilt: number;
  lotSize: number;
  propertyType: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessment?: number;
}

class ATTOMProvider implements PropertyValueProvider {
  private apiKey: string;
  private baseUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

  async fetchValue(address: string): Promise<PropertyValue> {
    const response = await fetch(
      `${this.baseUrl}/property/detail?address1=${encodeURIComponent(address)}`,
      {
        headers: {
          'apikey': this.apiKey,
          'accept': 'application/json'
        }
      }
    );

    const data = await response.json();

    return {
      estimatedValue: data.property[0].avm.amount.value,
      lowEstimate: data.property[0].avm.amount.value * 0.95,
      highEstimate: data.property[0].avm.amount.value * 1.05,
      lastUpdated: new Date().toISOString(),
      confidence: 'high',
      provider: 'ATTOM Data',
    };
  }
}

// Main service with fallback support
export class PropertyValueService {
  private providers: PropertyValueProvider[];

  constructor() {
    this.providers = [
      new ATTOMProvider(),
      // Add fallback providers here
    ];
  }

  async fetchCurrentValue(address: string): Promise<PropertyValue> {
    for (const provider of this.providers) {
      try {
        return await provider.fetchValue(address);
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next...`);
        continue;
      }
    }
    throw new Error('All providers failed');
  }
}
```

**Step 3: UI Integration**

Update `src/components/settings/PropertyForm.tsx`:

```typescript
// Add to component state
const [isRefreshingValue, setIsRefreshingValue] = useState(false);
const [valueMetadata, setValueMetadata] = useState({
  lastUpdated: null,
  source: 'Manual Entry',
  trend: null
});

const handleRefreshValue = async () => {
  setIsRefreshingValue(true);
  try {
    const service = new PropertyValueService();
    const value = await service.fetchCurrentValue(formData.address);

    handleChange('currentMarketValue', value.estimatedValue);
    setValueMetadata({
      lastUpdated: value.lastUpdated,
      source: value.provider,
      trend: value.valueChange
    });
  } catch (error) {
    alert('Failed to fetch property value. Please try again.');
  } finally {
    setIsRefreshingValue(false);
  }
};

// Add to Current Market Value field
<div className="flex items-center gap-2">
  <input ... />
  <button
    type="button"
    onClick={handleRefreshValue}
    disabled={isRefreshingValue}
    className="btn-secondary"
  >
    {isRefreshingValue ? 'Refreshing...' : '🔄 Refresh'}
  </button>
</div>
{valueMetadata.lastUpdated && (
  <p className="text-xs text-brand-muted mt-1">
    Last updated: {new Date(valueMetadata.lastUpdated).toLocaleDateString()}
    {' via '}{valueMetadata.source}
    {valueMetadata.trend && (
      <span className={valueMetadata.trend.amount > 0 ? 'text-green-400' : 'text-red-400'}>
        {' '}({valueMetadata.trend.percentage > 0 ? '+' : ''}
        {valueMetadata.trend.percentage.toFixed(1)}%)
      </span>
    )}
  </p>
)}
```

---

### Phase 2: Automatic Updates (Week 2)

**Features:**
1. Monthly auto-refresh toggle in Settings
2. Email notification when value changes >5%
3. Historical value tracking (store in localStorage)
4. Value trend chart on Dashboard

**Implementation:**

```typescript
// src/lib/autoUpdateService.ts
export class AutoUpdateService {
  private static STORAGE_KEY = 'property_value_history';

  static scheduleMonthlyUpdate(propertyAddress: string) {
    const lastUpdate = this.getLastUpdate();
    const now = new Date();

    // Check if 30 days have passed
    if (!lastUpdate || daysSince(lastUpdate) >= 30) {
      this.updateValue(propertyAddress);
    }
  }

  static async updateValue(address: string) {
    const service = new PropertyValueService();
    const value = await service.fetchCurrentValue(address);

    // Store in history
    this.addToHistory({
      date: new Date().toISOString(),
      value: value.estimatedValue,
      source: value.provider
    });

    // Update settings
    updateProperty({ currentMarketValue: value.estimatedValue });

    // Check for significant change
    const previousValue = this.getPreviousValue();
    if (previousValue) {
      const changePercent = ((value.estimatedValue - previousValue) / previousValue) * 100;
      if (Math.abs(changePercent) >= 5) {
        this.notifyUser(changePercent);
      }
    }
  }
}
```

---

### Phase 3: Advanced Features (Month 1)

1. **Historical Value Chart**
   - Line chart showing value over time
   - Compare to neighborhood average
   - Equity growth visualization

2. **Market Analytics**
   - Days on market average
   - Price per square foot
   - Neighborhood trends
   - Comparable properties

3. **Rental Price Suggestions**
   - Recommended rent based on area
   - Rental yield calculations
   - Market rent trends

---

## Cost-Benefit Analysis

### Investment
- API subscription: $99-$499/month
- Development time: ~16 hours (2 weeks part-time)
- Maintenance: ~2 hours/month

### Benefits
- **Time Savings:** Eliminate manual value research (saves ~30 min/month)
- **Accuracy:** Professional-grade valuations vs. guesswork
- **Automation:** Set-and-forget updates
- **Insights:** Historical trends and market analytics
- **Portfolio Management:** Accurate equity tracking across properties

### ROI
For property owners managing multiple properties or serious investors, the time savings and accuracy improvements justify the cost within the first month.

---

## Alternative: Free Option

If budget is a constraint, consider:

1. **Manual Zillow/Redfin Checks** (Current approach)
   - Cost: $0
   - Effort: 10-15 min/month per property
   - Accuracy: Good

2. **Redfin Third-Party API** (via HasData/PropAPIS)
   - Cost: $49-$99/month
   - Effort: Automated
   - Accuracy: Good (2-7% error)
   - Risk: Could break if Redfin changes

3. **ATTOM Free Tier** (if available)
   - Check if ATTOM offers limited free tier for low-volume use
   - May allow 10-50 calls/month

---

## Implementation Timeline

| Phase | Duration | Effort | Deliverable |
|-------|----------|--------|-------------|
| Research & Planning | Complete | N/A | This document |
| API Setup | 1 day | 2 hours | ATTOM account, credentials |
| Backend Service | 2 days | 8 hours | PropertyValueService |
| UI Integration | 2 days | 6 hours | Refresh button, metadata |
| Testing | 1 day | 2 hours | Verify with real properties |
| Auto-Update Feature | 3 days | 8 hours | Scheduled updates |
| Historical Tracking | 2 days | 6 hours | Chart and analytics |

**Total:** 2-3 weeks part-time

---

## Security Considerations

1. **API Key Storage**
   - Store API credentials in environment variables
   - Never commit keys to git
   - Use `.env.local` for development
   - Use secure environment variables in production

2. **Rate Limiting**
   - Implement client-side throttling
   - Cache results for 24 hours minimum
   - Respect API provider rate limits

3. **Error Handling**
   - Graceful fallback to manual entry
   - User-friendly error messages
   - Logging for debugging

---

## Next Steps

1. **Decision:** Choose API provider (ATTOM recommended)
2. **Sign Up:** Create account and obtain credentials
3. **Prototype:** Build basic integration with one property
4. **Test:** Verify accuracy with known property values
5. **Deploy:** Roll out to all users
6. **Monitor:** Track API usage and costs

---

## References

- [ATTOM Data Solutions API](https://www.attomdata.com/news/attom-insights/best-apis-real-estate/)
- [Homesage.ai Property Evaluation APIs](https://homesage.ai/best-property-evaluation-apis-2025/)
- [Zillow API Alternatives - RapidAPI](https://rapidapi.com/collection/zillow-alternatives)
- [Mashvisor Real Estate Data API Comparison](https://www.mashvisor.com/blog/best-real-estate-data-api-comparison/)
- [Redfin Estimate Information](https://www.redfin.com/redfin-estimate)
- [Best Real Estate APIs 2025](https://www.scrapingbee.com/blog/best-real-estate-apis-for-developers/)

---

## Questions for Decision

1. **Budget:** What monthly API cost is acceptable? ($0, <$100, <$500, any)
2. **Priority:** How important is automation vs. accuracy?
3. **Volume:** How many properties will be tracked?
4. **Features:** Which phase 2/3 features are must-haves?

---

**Recommendation:** Start with ATTOM Data Solutions Basic tier (~$99/month), implement Phase 1, evaluate ROI after 1 month, then decide on Phase 2/3 features.
