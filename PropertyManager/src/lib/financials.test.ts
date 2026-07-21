import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calculateCashFlow,
  calculateRentalComparison,
  getMarginalTaxRate,
  calculateTaxEstimate,
  calculateKeepVsSell,
  calculateSimpleCashFlow,
  formatCurrency,
  formatPercent,
  formatNumber,
  DEFAULT_PROPERTY_FINANCIALS,
  DEFAULT_PERSONAL_EXPENSES,
  DEFAULT_TAX_INPUTS,
  type PropertyFinancials,
  type PersonalExpenses,
  type TaxInputs,
} from './financials'

// Mock localStorage for functions that use settings
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

describe('financials.ts', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('calculateCashFlow', () => {
    it('should calculate gross rental income correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
      }

      const result = calculateCashFlow(property)
      expect(result.grossRentalIncome).toBe(36000) // 3000 * 12
    })

    it('should calculate operating expenses correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyPropertyTax: 300,
        monthlyInsurance: 100,
        monthlyHOA: 50,
        monthlyMaintenanceReserve: 200,
        monthlyVacancyReserve: 150,
        monthlyManagementFee: 100,
      }

      const result = calculateCashFlow(property)
      // (300 + 100 + 50 + 200 + 150 + 100) * 12 = 10800
      expect(result.operatingExpenses).toBe(10800)
    })

    it('should calculate net operating income correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 200,
        monthlyInsurance: 100,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 100,
        monthlyVacancyReserve: 100,
        monthlyManagementFee: 0,
      }

      const result = calculateCashFlow(property)
      // Gross: 36000, Operating Expenses: (200+100+0+100+100+0)*12 = 6000
      // NOI: 36000 - 6000 = 30000
      expect(result.netOperatingIncome).toBe(30000)
    })

    it('should calculate debt service correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyMortgagePayment: 1500,
      }

      const result = calculateCashFlow(property)
      expect(result.debtService).toBe(18000) // 1500 * 12
    })

    it('should calculate cash flow before tax correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
        monthlyMortgagePayment: 1000,
      }

      const result = calculateCashFlow(property)
      // NOI: 36000, Debt Service: 12000
      // Cash Flow: 36000 - 12000 = 24000
      expect(result.cashFlowBeforeTax).toBe(24000)
    })

    it('should calculate cap rate correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 500000,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
      }

      const result = calculateCashFlow(property)
      // NOI: 36000, Market Value: 500000
      // Cap Rate: (36000 / 500000) * 100 = 7.2%
      expect(result.capRate).toBeCloseTo(7.2, 1)
    })

    it('should handle zero market value for cap rate', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 0,
      }

      const result = calculateCashFlow(property)
      expect(result.capRate).toBe(0)
    })

    it('should calculate cash on cash return correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 500000,
        mortgageBalance: 300000,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
        monthlyMortgagePayment: 1500,
      }

      const result = calculateCashFlow(property)
      // Equity: 500000 - 300000 = 200000
      // Cash Flow: 36000 - 18000 = 18000
      // Cash on Cash: (18000 / 200000) * 100 = 9%
      expect(result.cashOnCashReturn).toBeCloseTo(9, 1)
    })

    it('should handle zero equity for cash on cash return', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 300000,
        mortgageBalance: 300000, // No equity
      }

      const result = calculateCashFlow(property)
      expect(result.cashOnCashReturn).toBe(0)
    })
  })

  describe('calculateRentalComparison', () => {
    it('should calculate personal expenses saved correctly', () => {
      const property = DEFAULT_PROPERTY_FINANCIALS
      const personal: PersonalExpenses = {
        currentRentPayment: 1500,
        currentUtilityCosts: 200,
        currentJobIncome: 5000,
      }

      const result = calculateRentalComparison(property, personal)
      expect(result.personalExpensesSaved).toBe(1700) // 1500 + 200
    })

    it('should calculate net rental benefit correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 200,
        monthlyInsurance: 100,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 100,
        monthlyVacancyReserve: 100,
        monthlyManagementFee: 0,
      }
      const personal = DEFAULT_PERSONAL_EXPENSES

      const result = calculateRentalComparison(property, personal)
      // Monthly expenses: 200 + 100 + 0 + 100 + 100 + 0 = 500
      // Net rental benefit: 3000 - 500 = 2500
      expect(result.netRentalBenefit).toBe(2500)
    })

    it('should calculate monthly advantage correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
        monthlyMortgagePayment: 1000,
      }
      const personal = DEFAULT_PERSONAL_EXPENSES

      const result = calculateRentalComparison(property, personal)
      // Net rental benefit: 3000 - 0 = 3000
      // Monthly advantage: 3000 - 1000 = 2000
      expect(result.monthlyAdvantage).toBe(2000)
    })

    it('should calculate annual advantage correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 2000,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
        monthlyMortgagePayment: 1500,
      }
      const personal = DEFAULT_PERSONAL_EXPENSES

      const result = calculateRentalComparison(property, personal)
      // Monthly advantage: 2000 - 1500 = 500
      // Annual advantage: 500 * 12 = 6000
      expect(result.annualAdvantage).toBe(6000)
    })
  })

  describe('getMarginalTaxRate', () => {
    it('should return correct rate for single filer in 10% bracket', () => {
      const rate = getMarginalTaxRate(10000, 'single')
      expect(rate).toBe(0.10)
    })

    it('should return correct rate for single filer in 22% bracket', () => {
      const rate = getMarginalTaxRate(75000, 'single')
      expect(rate).toBe(0.22)
    })

    it('should return correct rate for married filing jointly in 12% bracket', () => {
      const rate = getMarginalTaxRate(50000, 'married_filing_jointly')
      expect(rate).toBe(0.12)
    })

    it('should return correct rate for married filing jointly in 24% bracket', () => {
      const rate = getMarginalTaxRate(300000, 'married_filing_jointly')
      expect(rate).toBe(0.24)
    })

    it('should return highest rate for very high income', () => {
      const rate = getMarginalTaxRate(1000000, 'single')
      expect(rate).toBe(0.37)
    })
  })

  describe('calculateTaxEstimate', () => {
    it('should calculate depreciation taken correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        yearsOwned: 5,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 350000,
        landValue: 70000,
        improvementsCost: 0,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      // Depreciable base: 350000 - 70000 + 0 = 280000
      // Annual depreciation: 280000 / 27.5 = 10181.82
      // 5 years: 10181.82 * 5 = 50909.09
      expect(result.depreciationTaken).toBeCloseTo(50909.09, 0)
    })

    it('should not exceed depreciable base for depreciation', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        yearsOwned: 30, // More than 27.5 years
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 280000,
        landValue: 0,
        improvementsCost: 0,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      // Should be capped at the depreciable base
      expect(result.depreciationTaken).toBe(280000)
    })

    it('should calculate adjusted basis correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        purchasePrice: 300000,
        yearsOwned: 5,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 280000,
        landValue: 60000,
        improvementsCost: 20000,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      // Depreciable base: 280000 - 60000 + 20000 = 240000
      // Annual depreciation: 240000 / 27.5 = 8727.27
      // 5 years depreciation: 43636.36
      // Adjusted basis: 300000 + 20000 - 43636.36 = 276363.64
      expect(result.adjustedBasis).toBeCloseTo(276363.64, 0)
    })

    it('should calculate capital gain correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        purchasePrice: 300000,
        currentMarketValue: 500000,
        yearsOwned: 5,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 280000,
        landValue: 60000,
        improvementsCost: 0,
        sellingCosts: 30000,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      // Net sale price: 500000 - 30000 = 470000
      // Depreciable base: 280000 - 60000 + 0 = 220000
      // 5 years depreciation: (220000 / 27.5) * 5 = 40000
      // Adjusted basis: 300000 + 0 - 40000 = 260000
      // Total gain: 470000 - 260000 = 210000
      // Capital gain: 210000 - 40000 = 170000
      expect(result.capitalGain).toBeCloseTo(170000, -3)
    })

    it('should calculate net proceeds after tax', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        purchasePrice: 300000,
        currentMarketValue: 400000,
        yearsOwned: 3,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 280000,
        landValue: 60000,
        improvementsCost: 0,
        sellingCosts: 24000,
        stateIncomeTaxRate: 0,
        annualIncome: 50000,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      // Net proceeds should be positive and less than current market value
      expect(result.netProceedsAfterTax).toBeGreaterThan(0)
      expect(result.netProceedsAfterTax).toBeLessThan(400000)
    })

    it('should handle zero capital gain', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        purchasePrice: 300000,
        currentMarketValue: 250000, // Property lost value
        yearsOwned: 2,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        depreciableValue: 280000,
        landValue: 60000,
        improvementsCost: 0,
        sellingCosts: 15000,
      }

      const result = calculateTaxEstimate(property, taxInputs)
      expect(result.capitalGain).toBeGreaterThanOrEqual(0) // Can't be negative
    })
  })

  describe('calculateKeepVsSell', () => {
    it('should generate projections for specified years', () => {
      const property = DEFAULT_PROPERTY_FINANCIALS
      const taxInputs = DEFAULT_TAX_INPUTS

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 10)
      expect(result.projections).toHaveLength(10)
    })

    it('should project increasing equity values', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 500000,
        mortgageBalance: 300000,
        annualAppreciationRate: 0.03,
      }
      const taxInputs = DEFAULT_TAX_INPUTS

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 5)

      // Each year should have higher equity than the previous
      for (let i = 1; i < result.projections.length; i++) {
        expect(result.projections[i].equityValue).toBeGreaterThan(
          result.projections[i - 1].equityValue
        )
      }
    })

    it('should calculate cumulative cash flow correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 3000,
        monthlyPropertyTax: 200,
        monthlyInsurance: 100,
        monthlyHOA: 0,
        monthlyMaintenanceReserve: 100,
        monthlyVacancyReserve: 100,
        monthlyManagementFee: 0,
        monthlyMortgagePayment: 1500,
      }
      const taxInputs = DEFAULT_TAX_INPUTS

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 3)

      // Year 2 cumulative should be 2x year 1
      expect(result.projections[1].cumulativeCashFlow).toBeCloseTo(
        result.projections[0].cumulativeCashFlow * 2,
        -2
      )
    })

    it('should calculate alternative investment growth correctly', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        currentMarketValue: 400000,
        purchasePrice: 300000,
      }
      const taxInputs: TaxInputs = {
        ...DEFAULT_TAX_INPUTS,
        sellingCosts: 24000,
      }

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 5)

      // Alternative investment should grow at 7% annually
      const year1Alternative = result.projections[0].alternativeInvestmentValue
      const year2Alternative = result.projections[1].alternativeInvestmentValue

      expect(year2Alternative / year1Alternative).toBeCloseTo(1.07, 2)
    })

    it('should return recommendation based on advantage', () => {
      const property = DEFAULT_PROPERTY_FINANCIALS
      const taxInputs = DEFAULT_TAX_INPUTS

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 10)

      expect(['keep', 'sell', 'neutral']).toContain(result.recommendation)
      expect(result.recommendationReason).toBeTruthy()
    })

    it('should find break even year when keeping becomes better', () => {
      const property = DEFAULT_PROPERTY_FINANCIALS
      const taxInputs = DEFAULT_TAX_INPUTS

      const result = calculateKeepVsSell(property, taxInputs, 0.07, 10)

      if (result.breakEvenYear !== null) {
        expect(result.breakEvenYear).toBeGreaterThanOrEqual(1)
        expect(result.breakEvenYear).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('calculateSimpleCashFlow', () => {
    it('should calculate monthly net cash flow', () => {
      // Setup mock settings in localStorage
      const mockSettings = {
        rentalIncome: {
          monthlyRent: 3000,
          includesUtilities: false,
          monthlyUtilities: 0,
        },
        mortgage: {
          totalMonthlyPayment: 2000,
        },
      }
      localStorageMock.setItem('propertyManager_settings_v1', JSON.stringify(mockSettings))

      const result = calculateSimpleCashFlow()

      expect(result.monthlyRent).toBe(3000)
      expect(result.monthlyPITI).toBe(2000)
      expect(result.monthlyNetCashFlow).toBe(1000)
      expect(result.annualNetCashFlow).toBe(12000)
    })

    it('should handle utilities when included', () => {
      const mockSettings = {
        rentalIncome: {
          monthlyRent: 3000,
          includesUtilities: true,
          monthlyUtilities: 200,
        },
        mortgage: {
          totalMonthlyPayment: 2000,
        },
      }
      localStorageMock.setItem('propertyManager_settings_v1', JSON.stringify(mockSettings))

      const result = calculateSimpleCashFlow()

      expect(result.monthlyUtilities).toBe(200)
      // Net cash flow doesn't include utilities (they cancel out)
      expect(result.monthlyNetCashFlow).toBe(1000)
    })
  })

  describe('Formatting utilities', () => {
    describe('formatCurrency', () => {
      it('should format positive numbers correctly', () => {
        expect(formatCurrency(1234.56, 2)).toBe('$1,234.56')
        expect(formatCurrency(1000000)).toBe('$1,000,000')
      })

      it('should format negative numbers correctly', () => {
        expect(formatCurrency(-500)).toBe('-$500')
      })

      it('should format zero correctly', () => {
        expect(formatCurrency(0)).toBe('$0')
      })

      it('should respect decimal places parameter', () => {
        expect(formatCurrency(1234.5678, 0)).toBe('$1,235')
        expect(formatCurrency(1234.5678, 2)).toBe('$1,234.57')
      })
    })

    describe('formatPercent', () => {
      it('should format percentages correctly', () => {
        expect(formatPercent(50)).toBe('50.0%')
        expect(formatPercent(7.5)).toBe('7.5%')
      })

      it('should respect decimal places parameter', () => {
        expect(formatPercent(33.333, 0)).toBe('33%')
        expect(formatPercent(33.333, 2)).toBe('33.33%')
      })

      it('should handle zero', () => {
        expect(formatPercent(0)).toBe('0.0%')
      })

      it('should handle negative percentages', () => {
        expect(formatPercent(-5)).toBe('-5.0%')
      })
    })

    describe('formatNumber', () => {
      it('should format numbers with commas', () => {
        expect(formatNumber(1234567)).toBe('1,234,567')
      })

      it('should respect decimal places', () => {
        expect(formatNumber(1234.567, 2)).toBe('1,234.57')
        expect(formatNumber(1234.567, 0)).toBe('1,235')
      })

      it('should handle zero', () => {
        expect(formatNumber(0)).toBe('0')
      })

      it('should handle negative numbers', () => {
        expect(formatNumber(-1234)).toBe('-1,234')
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle zero values in cash flow calculation', () => {
      const property: PropertyFinancials = {
        purchasePrice: 0,
        currentMarketValue: 0,
        mortgageBalance: 0,
        monthlyMortgagePayment: 0,
        monthlyPropertyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyRentalIncome: 0,
        monthlyMaintenanceReserve: 0,
        monthlyVacancyReserve: 0,
        monthlyManagementFee: 0,
        yearsOwned: 0,
        annualAppreciationRate: 0,
      }

      const result = calculateCashFlow(property)
      expect(result.grossRentalIncome).toBe(0)
      expect(result.netOperatingIncome).toBe(0)
      expect(result.capRate).toBe(0)
      expect(result.cashOnCashReturn).toBe(0)
    })

    it('should handle negative cash flow scenario', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        monthlyRentalIncome: 1000,
        monthlyMortgagePayment: 2000,
        monthlyPropertyTax: 500,
        monthlyInsurance: 200,
        monthlyHOA: 100,
        monthlyMaintenanceReserve: 100,
        monthlyVacancyReserve: 50,
        monthlyManagementFee: 100,
      }

      const result = calculateCashFlow(property)
      expect(result.cashFlowBeforeTax).toBeLessThan(0)
    })

    it('should handle very large numbers', () => {
      const property: PropertyFinancials = {
        ...DEFAULT_PROPERTY_FINANCIALS,
        purchasePrice: 10000000,
        currentMarketValue: 15000000,
        monthlyRentalIncome: 50000,
      }

      const result = calculateCashFlow(property)
      expect(result.grossRentalIncome).toBe(600000)
      expect(isFinite(result.capRate)).toBe(true)
    })
  })
})
