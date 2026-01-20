/**
 * Financial Analysis Library
 *
 * DISCLAIMER: This module provides educational estimates only.
 * All calculations are simplified approximations and should not be considered
 * financial or tax advice. Consult with qualified professionals for actual
 * financial and tax planning decisions.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface PersonalExpenses {
  currentRentPayment: number;      // Monthly rent payment at current residence
  currentUtilityCosts: number;     // Monthly utility costs at current residence
  currentJobIncome: number;        // Monthly income from employment
}

export interface PropertyFinancials {
  purchasePrice: number;
  currentMarketValue: number;
  mortgageBalance: number;
  monthlyMortgagePayment: number;  // P&I only
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyRentalIncome: number;
  monthlyMaintenanceReserve: number;
  monthlyVacancyReserve: number;   // Usually 5-8% of rental income
  monthlyManagementFee: number;    // Usually 8-10% of rental income
  yearsOwned: number;
  annualAppreciationRate: number;  // Historical/expected rate
}

export interface TaxInputs {
  filingStatus: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
  annualIncome: number;
  depreciableValue: number;        // Usually purchase price minus land value
  landValue: number;               // Typically 15-25% of purchase price
  improvementsCost: number;        // Capital improvements made
  sellingCosts: number;            // Expected selling costs (typically 6-10% of sale price)
  stateIncomeTaxRate: number;      // State tax rate (0 if no state income tax)
}

export interface CashFlowAnalysis {
  grossRentalIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  debtService: number;
  cashFlowBeforeTax: number;
  cashOnCashReturn: number;
  capRate: number;
}

export interface RentalComparison {
  personalExpensesSaved: number;   // What you'd pay if renting
  netRentalBenefit: number;        // Income after expenses minus personal cost
  monthlyAdvantage: number;        // Net benefit of owning rental
  annualAdvantage: number;
  effectiveHousingCost: number;    // Your actual housing cost considering rental income
}

export interface TaxEstimate {
  capitalGain: number;
  depreciationTaken: number;
  depreciationRecapture: number;
  adjustedBasis: number;
  totalTaxableGain: number;
  estimatedCapitalGainsTax: number;
  estimatedDepreciationRecaptureTax: number;
  estimatedTotalTax: number;
  estimatedStateTax: number;
  netProceedsAfterTax: number;
}

export interface KeepVsSellProjection {
  year: number;
  equityValue: number;
  cumulativeCashFlow: number;
  totalReturn: number;
  alternativeInvestmentValue: number;
  keepAdvantage: number;
}

export interface KeepVsSellAnalysis {
  projections: KeepVsSellProjection[];
  breakEvenYear: number | null;
  tenYearKeepValue: number;
  tenYearSellValue: number;
  recommendation: 'keep' | 'sell' | 'neutral';
  recommendationReason: string;
}

// ============================================================================
// Tax Brackets (2024 Federal Rates - Simplified)
// ============================================================================

const FEDERAL_TAX_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FEDERAL_TAX_BRACKETS_MFJ = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

// Long-term capital gains rates
const LTCG_BRACKETS_SINGLE = [
  { min: 0, max: 47025, rate: 0.00 },
  { min: 47025, max: 518900, rate: 0.15 },
  { min: 518900, max: Infinity, rate: 0.20 },
];

const LTCG_BRACKETS_MFJ = [
  { min: 0, max: 94050, rate: 0.00 },
  { min: 94050, max: 583750, rate: 0.15 },
  { min: 583750, max: Infinity, rate: 0.20 },
];

// Depreciation recapture is taxed at max 25%
const DEPRECIATION_RECAPTURE_RATE = 0.25;

// Net Investment Income Tax (NIIT) threshold
const NIIT_RATE = 0.038;
const NIIT_THRESHOLD_SINGLE = 200000;
const NIIT_THRESHOLD_MFJ = 250000;

// ============================================================================
// Calculation Functions
// ============================================================================

/**
 * Calculate monthly cash flow analysis for a rental property
 */
export function calculateCashFlow(property: PropertyFinancials): CashFlowAnalysis {
  const grossRentalIncome = property.monthlyRentalIncome * 12;

  const operatingExpenses = (
    property.monthlyPropertyTax +
    property.monthlyInsurance +
    property.monthlyHOA +
    property.monthlyMaintenanceReserve +
    property.monthlyVacancyReserve +
    property.monthlyManagementFee
  ) * 12;

  const netOperatingIncome = grossRentalIncome - operatingExpenses;
  const debtService = property.monthlyMortgagePayment * 12;
  const cashFlowBeforeTax = netOperatingIncome - debtService;

  // Cash on cash = annual cash flow / total cash invested
  const equityInvested = property.currentMarketValue - property.mortgageBalance;
  const cashOnCashReturn = equityInvested > 0
    ? (cashFlowBeforeTax / equityInvested) * 100
    : 0;

  // Cap rate = NOI / current market value
  const capRate = property.currentMarketValue > 0
    ? (netOperatingIncome / property.currentMarketValue) * 100
    : 0;

  return {
    grossRentalIncome,
    operatingExpenses,
    netOperatingIncome,
    debtService,
    cashFlowBeforeTax,
    cashOnCashReturn,
    capRate,
  };
}

/**
 * Compare rental income against personal living expenses
 */
export function calculateRentalComparison(
  property: PropertyFinancials,
  personal: PersonalExpenses
): RentalComparison {
  // What you'd pay if renting somewhere yourself
  const personalExpensesSaved = personal.currentRentPayment + personal.currentUtilityCosts;

  // Monthly property expenses (excluding mortgage principal which builds equity)
  const monthlyExpenses = (
    property.monthlyPropertyTax +
    property.monthlyInsurance +
    property.monthlyHOA +
    property.monthlyMaintenanceReserve +
    property.monthlyVacancyReserve +
    property.monthlyManagementFee
  );

  // Net rental benefit (income minus expenses, before mortgage)
  const netRentalBenefit = property.monthlyRentalIncome - monthlyExpenses;

  // Monthly advantage = net rental benefit - what you're paying elsewhere
  // If you live elsewhere and rent out, this shows if it's profitable
  const monthlyAdvantage = netRentalBenefit - property.monthlyMortgagePayment;

  // Your effective housing cost (what you pay to live somewhere)
  // Offset by rental profit
  const effectiveHousingCost = personalExpensesSaved - monthlyAdvantage;

  return {
    personalExpensesSaved,
    netRentalBenefit,
    monthlyAdvantage,
    annualAdvantage: monthlyAdvantage * 12,
    effectiveHousingCost,
  };
}

/**
 * Get the appropriate tax bracket based on filing status
 */
function getTaxBrackets(filingStatus: TaxInputs['filingStatus']) {
  switch (filingStatus) {
    case 'married_filing_jointly':
      return { income: FEDERAL_TAX_BRACKETS_MFJ, ltcg: LTCG_BRACKETS_MFJ };
    case 'single':
    case 'married_filing_separately':
    case 'head_of_household':
    default:
      return { income: FEDERAL_TAX_BRACKETS_SINGLE, ltcg: LTCG_BRACKETS_SINGLE };
  }
}

/**
 * Calculate tax on income using progressive brackets
 */
function calculateProgressiveTax(income: number, brackets: typeof FEDERAL_TAX_BRACKETS_SINGLE): number {
  let tax = 0;
  let remainingIncome = income;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

/**
 * Get marginal tax rate for a given income
 */
export function getMarginalTaxRate(
  income: number,
  filingStatus: TaxInputs['filingStatus']
): number {
  const brackets = getTaxBrackets(filingStatus).income;

  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }

  return brackets[brackets.length - 1].rate;
}

/**
 * Calculate estimated tax liability if property is sold (non-primary residence)
 */
export function calculateTaxEstimate(
  property: PropertyFinancials,
  taxInputs: TaxInputs
): TaxEstimate {
  const { ltcg: ltcgBrackets } = getTaxBrackets(taxInputs.filingStatus);

  // Calculate depreciation taken (straight-line over 27.5 years for residential)
  const depreciableBase = taxInputs.depreciableValue - taxInputs.landValue + taxInputs.improvementsCost;
  const annualDepreciation = depreciableBase / 27.5;
  const depreciationTaken = Math.min(
    annualDepreciation * property.yearsOwned,
    depreciableBase
  );

  // Adjusted basis = purchase price + improvements - depreciation
  const adjustedBasis = property.purchasePrice + taxInputs.improvementsCost - depreciationTaken;

  // Net proceeds from sale
  const netSalePrice = property.currentMarketValue - taxInputs.sellingCosts;

  // Total gain
  const totalGain = netSalePrice - adjustedBasis;
  const capitalGain = Math.max(0, totalGain - depreciationTaken);

  // Depreciation recapture (taxed at max 25%)
  const depreciationRecapture = Math.min(depreciationTaken, Math.max(0, totalGain));

  // Calculate capital gains tax
  const totalIncomeWithGains = taxInputs.annualIncome + capitalGain;
  const ltcgTax = calculateProgressiveTax(totalIncomeWithGains, ltcgBrackets) -
                  calculateProgressiveTax(taxInputs.annualIncome, ltcgBrackets);

  // Calculate depreciation recapture tax (max 25% or marginal rate, whichever is lower)
  const marginalRate = getMarginalTaxRate(taxInputs.annualIncome, taxInputs.filingStatus);
  const recaptureRate = Math.min(DEPRECIATION_RECAPTURE_RATE, marginalRate);
  const recaptureTax = depreciationRecapture * recaptureRate;

  // NIIT if applicable
  const niitThreshold = taxInputs.filingStatus === 'married_filing_jointly'
    ? NIIT_THRESHOLD_MFJ
    : NIIT_THRESHOLD_SINGLE;
  const niitableIncome = Math.max(0, totalIncomeWithGains - niitThreshold);
  const niit = Math.min(niitableIncome, capitalGain + depreciationRecapture) * NIIT_RATE;

  // State tax (simplified - applies to total gain)
  const stateTax = (capitalGain + depreciationRecapture) * taxInputs.stateIncomeTaxRate;

  const totalFederalTax = ltcgTax + recaptureTax + niit;
  const totalTax = totalFederalTax + stateTax;

  // Net proceeds after tax
  const netProceedsAfterTax = netSalePrice - totalTax;

  return {
    capitalGain,
    depreciationTaken,
    depreciationRecapture,
    adjustedBasis,
    totalTaxableGain: capitalGain + depreciationRecapture,
    estimatedCapitalGainsTax: ltcgTax + niit,
    estimatedDepreciationRecaptureTax: recaptureTax,
    estimatedTotalTax: totalFederalTax,
    estimatedStateTax: stateTax,
    netProceedsAfterTax,
  };
}

/**
 * Calculate keep vs sell analysis projecting future values
 */
export function calculateKeepVsSell(
  property: PropertyFinancials,
  taxInputs: TaxInputs,
  alternativeReturnRate: number = 0.07, // S&P 500 average
  projectionYears: number = 10
): KeepVsSellAnalysis {
  const projections: KeepVsSellProjection[] = [];

  // Get current tax estimate to understand net proceeds if sold today
  const currentTaxEstimate = calculateTaxEstimate(property, taxInputs);
  const currentNetProceeds = currentTaxEstimate.netProceedsAfterTax;

  // Calculate annual cash flow
  const cashFlow = calculateCashFlow(property);
  const annualCashFlow = cashFlow.cashFlowBeforeTax;

  let breakEvenYear: number | null = null;
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= projectionYears; year++) {
    // Project property value with appreciation
    const futurePropertyValue = property.currentMarketValue *
      Math.pow(1 + property.annualAppreciationRate, year);

    // Simple mortgage paydown estimate (principal portion increases over time)
    // Using rough estimate: assume ~40% of payment goes to principal on average
    const annualPrincipalPaydown = property.monthlyMortgagePayment * 12 * 0.4;
    const futureMortgageBalance = Math.max(0,
      property.mortgageBalance - (annualPrincipalPaydown * year)
    );

    // Future equity
    const futureEquity = futurePropertyValue - futureMortgageBalance;

    // Cumulative cash flow
    cumulativeCashFlow += annualCashFlow;

    // Total return from keeping (equity + cash flow)
    const totalReturnFromKeeping = futureEquity + cumulativeCashFlow;

    // Alternative investment growth (if sold today and invested net proceeds)
    const alternativeValue = currentNetProceeds *
      Math.pow(1 + alternativeReturnRate, year);

    // Advantage of keeping
    const keepAdvantage = totalReturnFromKeeping - alternativeValue;

    projections.push({
      year,
      equityValue: futureEquity,
      cumulativeCashFlow,
      totalReturn: totalReturnFromKeeping,
      alternativeInvestmentValue: alternativeValue,
      keepAdvantage,
    });

    // Find break-even year (when keeping becomes better than selling)
    if (breakEvenYear === null && keepAdvantage > 0) {
      breakEvenYear = year;
    }
  }

  // Get 10-year values
  const tenYearProjection = projections[projections.length - 1];
  const tenYearKeepValue = tenYearProjection?.totalReturn || 0;
  const tenYearSellValue = tenYearProjection?.alternativeInvestmentValue || 0;

  // Generate recommendation
  let recommendation: 'keep' | 'sell' | 'neutral';
  let recommendationReason: string;

  const advantagePercent = tenYearKeepValue > 0
    ? ((tenYearKeepValue - tenYearSellValue) / tenYearSellValue) * 100
    : 0;

  if (advantagePercent > 15) {
    recommendation = 'keep';
    recommendationReason = `Keeping the property projects ${advantagePercent.toFixed(0)}% higher returns over 10 years compared to selling and investing in the stock market.`;
  } else if (advantagePercent < -15) {
    recommendation = 'sell';
    recommendationReason = `Selling and investing the proceeds projects ${Math.abs(advantagePercent).toFixed(0)}% higher returns over 10 years compared to keeping the rental property.`;
  } else {
    recommendation = 'neutral';
    recommendationReason = `The projected returns are within 15% of each other. Consider other factors like hassle, liquidity needs, and personal preferences.`;
  }

  return {
    projections,
    breakEvenYear,
    tenYearKeepValue,
    tenYearSellValue,
    recommendation,
    recommendationReason,
  };
}

// ============================================================================
// Tax Mitigation Strategies (Educational Content)
// ============================================================================

export interface TaxStrategy {
  id: string;
  name: string;
  summary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  considerations: string[];
  learnMoreUrl?: string;
}

export const TAX_MITIGATION_STRATEGIES: TaxStrategy[] = [
  {
    id: '1031-exchange',
    name: '1031 Exchange (Like-Kind Exchange)',
    summary: 'Defer capital gains by reinvesting in similar property',
    description: 'A 1031 exchange allows you to defer capital gains taxes when you sell an investment property and reinvest the proceeds into another "like-kind" property. The tax is not eliminated but postponed until you eventually sell without doing another exchange.',
    requirements: [
      'Must be investment or business property (not primary residence)',
      'Must identify replacement property within 45 days',
      'Must close on replacement property within 180 days',
      'Must use a qualified intermediary (cannot touch the funds)',
      'Replacement property must be of equal or greater value',
      'All equity must be reinvested to fully defer taxes',
    ],
    benefits: [
      'Defer 100% of capital gains and depreciation recapture taxes',
      'Can be done multiple times throughout your lifetime',
      'At death, heirs receive stepped-up basis (taxes eliminated)',
      'Allows portfolio rebalancing without immediate tax impact',
    ],
    considerations: [
      'Strict timelines must be followed exactly',
      'Complex rules - professional guidance recommended',
      'Boot (cash received) is taxable',
      'State tax treatment may vary',
    ],
    learnMoreUrl: 'https://www.irs.gov/pub/irs-pdf/p544.pdf',
  },
  {
    id: 'primary-residence-conversion',
    name: 'Primary Residence Conversion',
    summary: 'Convert rental to primary residence for tax exclusion',
    description: 'By converting your rental property to your primary residence and living in it for at least 2 of the 5 years before selling, you may qualify for the capital gains exclusion of up to $250,000 (single) or $500,000 (married filing jointly).',
    requirements: [
      'Must live in property as primary residence for 2 of last 5 years',
      'Cannot have used the exclusion in the past 2 years',
      'Depreciation taken while rental is still recaptured',
      'Post-2008 rule: Portion of gain from non-residence periods still taxed',
    ],
    benefits: [
      'Exclude up to $250K (single) or $500K (MFJ) of capital gains',
      'Can be combined with 1031 exchange strategy',
      'Depreciation recapture may be reduced or eliminated',
    ],
    considerations: [
      'Requires actually living in the property for 2+ years',
      'Non-qualified use periods (post-2008) reduce exclusion',
      'May not be practical for all investors',
      'Lifestyle and market timing considerations',
    ],
    learnMoreUrl: 'https://www.irs.gov/publications/p523',
  },
  {
    id: 'installment-sale',
    name: 'Installment Sale',
    summary: 'Spread tax liability over multiple years',
    description: 'An installment sale allows you to receive payments over time rather than in a lump sum. You only pay taxes on the gain as you receive each payment, which can keep you in lower tax brackets and spread the tax burden.',
    requirements: [
      'Must receive at least one payment after the tax year of sale',
      'Interest must be charged on deferred payments (AFR minimum)',
      'Depreciation recapture recognized in year of sale',
      'Cannot be used for inventory or publicly traded securities',
    ],
    benefits: [
      'Spread capital gains over multiple years',
      'Potentially stay in lower tax brackets',
      'Create steady income stream',
      'Defer taxes while earning interest',
    ],
    considerations: [
      'Depreciation recapture still taxed in year 1',
      'Risk if buyer defaults on payments',
      'May need to secure the obligation',
      'Interest income is fully taxable',
      'NIIT may still apply to investment income',
    ],
    learnMoreUrl: 'https://www.irs.gov/publications/p537',
  },
  {
    id: 'opportunity-zone',
    name: 'Qualified Opportunity Zone Investment',
    summary: 'Invest gains in designated opportunity zones for tax benefits',
    description: 'By investing capital gains into a Qualified Opportunity Fund (QOF) that invests in designated low-income areas, you can defer and potentially reduce capital gains taxes, plus pay no tax on QOF appreciation if held 10+ years.',
    requirements: [
      'Must invest capital gains (not full sale proceeds)',
      'Must invest within 180 days of the gain',
      'Must invest through a Qualified Opportunity Fund',
      'Property must be in a designated Opportunity Zone',
    ],
    benefits: [
      'Defer original capital gains until 2026',
      '10% basis step-up if held 5 years (for pre-2027 investments)',
      '15% basis step-up if held 7 years (for pre-2027 investments)',
      'No tax on QOF appreciation if held 10+ years',
    ],
    considerations: [
      'Limited time remaining for deferral benefits',
      'Must meet substantial improvement requirements',
      'Illiquid investment for 10+ years for maximum benefit',
      'QOF investments carry their own risks',
    ],
    learnMoreUrl: 'https://www.irs.gov/credits-deductions/opportunity-zones-frequently-asked-questions',
  },
  {
    id: 'charitable-remainder-trust',
    name: 'Charitable Remainder Trust (CRT)',
    summary: 'Donate property to charity while receiving income',
    description: 'A CRT allows you to donate appreciated property to a charitable trust, receive an income stream for life or a term of years, and eventually pass the remainder to charity. You avoid immediate capital gains and receive a charitable deduction.',
    requirements: [
      'Irrevocable contribution to the trust',
      'Must be funded with appreciated assets',
      'Minimum 10% of initial value must go to charity',
      'Payout must be at least 5% annually',
    ],
    benefits: [
      'Avoid immediate capital gains tax',
      'Receive income stream for life or years',
      'Immediate charitable income tax deduction',
      'Remove assets from estate',
    ],
    considerations: [
      'Assets permanently leave your estate',
      'Cannot benefit heirs with donated assets',
      'Complex setup and administration',
      'Income from CRT is taxable',
    ],
    learnMoreUrl: 'https://www.irs.gov/charities-non-profits/charitable-remainder-trusts',
  },
];

// ============================================================================
// Formatting Utilities
// ============================================================================

export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============================================================================
// Default Values for Demo/Testing
// ============================================================================

export const DEFAULT_PROPERTY_FINANCIALS: PropertyFinancials = {
  purchasePrice: 350000,
  currentMarketValue: 420000,
  mortgageBalance: 280000,
  monthlyMortgagePayment: 1800,
  monthlyPropertyTax: 350,
  monthlyInsurance: 150,
  monthlyHOA: 0,
  monthlyRentalIncome: 2400,
  monthlyMaintenanceReserve: 200,
  monthlyVacancyReserve: 120, // 5% of rent
  monthlyManagementFee: 0,    // Self-managed
  yearsOwned: 5,
  annualAppreciationRate: 0.03,
};

export const DEFAULT_PERSONAL_EXPENSES: PersonalExpenses = {
  currentRentPayment: 1500,
  currentUtilityCosts: 200,
  currentJobIncome: 6000,
};

export const DEFAULT_TAX_INPUTS: TaxInputs = {
  filingStatus: 'single',
  annualIncome: 85000,
  depreciableValue: 350000,
  landValue: 70000, // 20% of purchase price
  improvementsCost: 15000,
  sellingCosts: 25200, // ~6% of current value
  stateIncomeTaxRate: 0.05,
};
