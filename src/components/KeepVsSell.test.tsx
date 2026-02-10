import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KeepVsSell from './KeepVsSell';

// Mock user - will be set per test
let mockUser: { uid: string; email: string; displayName: string; role: string } | null = null;

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock FinancialAccessDenied component
vi.mock('./FinancialAccessDenied', () => ({
  default: () => (
    <div data-testid="access-denied">
      <h1>Access Restricted</h1>
      <p>Financial analysis tools are not available for non-owner users.</p>
      <button onClick={() => mockNavigate('/')}>Return to Dashboard</button>
    </div>
  ),
}));

// Mock the financials library
vi.mock('../lib/financials', () => ({
  calculateKeepVsSell: () => ({
    netSaleProceeds: 120000,
    tenYearKeepValue: 450000,
    tenYearSellValue: 380000,
    recommendation: 'keep' as const,
    recommendationReason: 'Keeping the property is projected to yield higher returns.',
    breakEvenYear: 3,
    projections: [
      { year: 1, equityValue: 150000, cumulativeCashFlow: 10000, totalReturn: 160000, alternativeInvestmentValue: 130000, keepAdvantage: 30000 },
      { year: 2, equityValue: 165000, cumulativeCashFlow: 20000, totalReturn: 185000, alternativeInvestmentValue: 141000, keepAdvantage: 44000 },
      { year: 3, equityValue: 180000, cumulativeCashFlow: 30000, totalReturn: 210000, alternativeInvestmentValue: 153000, keepAdvantage: 57000 },
      { year: 5, equityValue: 210000, cumulativeCashFlow: 50000, totalReturn: 260000, alternativeInvestmentValue: 180000, keepAdvantage: 80000 },
      { year: 10, equityValue: 300000, cumulativeCashFlow: 100000, totalReturn: 400000, alternativeInvestmentValue: 280000, keepAdvantage: 120000 },
    ],
  }),
  formatCurrency: (val: number) => `$${val.toLocaleString()}`,
  DEFAULT_PROPERTY_FINANCIALS: {
    currentMarketValue: 400000,
    mortgageBalance: 280000,
    monthlyMortgagePayment: 1800,
    monthlyRentalIncome: 2400,
    annualAppreciationRate: 0.03,
    annualMaintenanceCost: 3000,
    annualInsurance: 1200,
    annualPropertyTax: 4800,
    vacancyRate: 0.05,
  },
  DEFAULT_TAX_INPUTS: {
    federalTaxRate: 0.22,
    stateTaxRate: 0.05,
    capitalGainsTaxRate: 0.15,
    purchasePrice: 350000,
    sellingCosts: 0.06,
  },
}));

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Line: () => <div data-testid="line-chart" />,
  Area: () => <div data-testid="area-chart" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

describe('KeepVsSell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <KeepVsSell />
      </MemoryRouter>
    );
  };

  describe('Owner-Only Access Guard', () => {
    it('should show access denied for tenant users', () => {
      mockUser = {
        uid: 'tenant-1',
        email: 'tenant@example.com',
        displayName: 'Gregg Marshall',
        role: 'tenant',
      };
      renderComponent();
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    it('should show access denied for PM users', () => {
      mockUser = {
        uid: 'pm-1',
        email: 'pm@example.com',
        displayName: 'Dan Connolly',
        role: 'pm',
      };
      renderComponent();
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });

    it('should show content for owner users', () => {
      mockUser = {
        uid: 'owner-1',
        email: 'owner@example.com',
        displayName: 'Shanie Holman',
        role: 'owner',
      };
      renderComponent();
      expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
      expect(screen.getByText('Keep vs Sell Analysis')).toBeInTheDocument();
    });

    it('should show Return to Dashboard button in access denied view', () => {
      mockUser = {
        uid: 'tenant-1',
        email: 'tenant@example.com',
        displayName: 'Gregg Marshall',
        role: 'tenant',
      };
      renderComponent();
      const button = screen.getByRole('button', { name: /Return to Dashboard/i });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Financial Calculations Display (Owner View)', () => {
    beforeEach(() => {
      mockUser = {
        uid: 'owner-1',
        email: 'owner@example.com',
        displayName: 'Shanie Holman',
        role: 'owner',
      };
    });

    it('should display header and description', () => {
      renderComponent();
      expect(screen.getByText('Keep vs Sell Analysis')).toBeInTheDocument();
      expect(screen.getByText('Compare long-term wealth building scenarios')).toBeInTheDocument();
    });

    it('should display key metrics cards', () => {
      renderComponent();
      expect(screen.getByText('Current Equity')).toBeInTheDocument();
      expect(screen.getByText(/Y Keep Value/)).toBeInTheDocument();
      expect(screen.getByText(/Y Sell Value/)).toBeInTheDocument();
      expect(screen.getByText('Difference')).toBeInTheDocument();
    });

    it('should display current equity value', () => {
      renderComponent();
      // Current equity = 400000 - 280000 = 120000
      expect(screen.getByText('$120,000')).toBeInTheDocument();
    });

    it('should display 10Y keep value', () => {
      renderComponent();
      expect(screen.getByText('$450,000')).toBeInTheDocument();
    });

    it('should display 10Y sell value', () => {
      renderComponent();
      expect(screen.getByText('$380,000')).toBeInTheDocument();
    });

    it('should display wealth projection chart', () => {
      renderComponent();
      expect(screen.getByText('Wealth Projection Over Time')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should display recommendation card', () => {
      renderComponent();
      expect(screen.getByText('Analysis Recommendation')).toBeInTheDocument();
      expect(screen.getByText('Consider Keeping')).toBeInTheDocument();
      expect(screen.getByText('Keeping the property is projected to yield higher returns.')).toBeInTheDocument();
    });

    it('should display break-even year', () => {
      renderComponent();
      expect(screen.getByText(/Break-even point:/)).toBeInTheDocument();
      // Check for the break-even year text (it may be in a separate element)
      const breakEvenContainer = screen.getByText(/Break-even point:/).closest('div');
      expect(breakEvenContainer?.textContent).toContain('Year 3');
    });

    it('should display year-by-year projection table', () => {
      renderComponent();
      expect(screen.getByText('Year-by-Year Projection')).toBeInTheDocument();
      // Table headers
      expect(screen.getByText('Equity')).toBeInTheDocument();
      expect(screen.getByText('Cash Flow')).toBeInTheDocument();
      expect(screen.getByText('Total (Keep)')).toBeInTheDocument();
      expect(screen.getByText('Alt Investment')).toBeInTheDocument();
      expect(screen.getByText('Advantage')).toBeInTheDocument();
    });
  });

  describe('Input Adjustments (Owner View)', () => {
    beforeEach(() => {
      mockUser = {
        uid: 'owner-1',
        email: 'owner@example.com',
        displayName: 'Shanie Holman',
        role: 'owner',
      };
    });

    it('should toggle input section when Adjust Assumptions button is clicked', () => {
      renderComponent();
      const adjustButton = screen.getByRole('button', { name: /Adjust Assumptions/i });
      fireEvent.click(adjustButton);

      expect(screen.getByText('Property Assumptions')).toBeInTheDocument();
      expect(screen.getByText('Investment Assumptions')).toBeInTheDocument();
    });

    it('should hide input section when Hide Inputs button is clicked', () => {
      renderComponent();
      // Open inputs
      fireEvent.click(screen.getByRole('button', { name: /Adjust Assumptions/i }));
      expect(screen.getByText('Property Assumptions')).toBeInTheDocument();

      // Close inputs
      fireEvent.click(screen.getByRole('button', { name: /Hide Inputs/i }));
      expect(screen.queryByText('Property Assumptions')).not.toBeInTheDocument();
    });

    it('should display property value input when inputs are visible', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adjust Assumptions/i }));
      expect(screen.getByText(/Current Market Value/i)).toBeInTheDocument();
    });

    it('should display mortgage balance input when inputs are visible', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adjust Assumptions/i }));
      expect(screen.getByText(/Mortgage Balance/i)).toBeInTheDocument();
    });

    it('should display alternative return slider when inputs are visible', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adjust Assumptions/i }));
      expect(screen.getByText(/Alternative Investment Return:/)).toBeInTheDocument();
    });

    it('should display projection years slider when inputs are visible', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /Adjust Assumptions/i }));
      expect(screen.getByText(/Projection Period:/)).toBeInTheDocument();
    });
  });

  describe('Important Factors Section', () => {
    beforeEach(() => {
      mockUser = {
        uid: 'owner-1',
        email: 'owner@example.com',
        displayName: 'Shanie Holman',
        role: 'owner',
      };
    });

    it('should display factors not fully captured section', () => {
      renderComponent();
      expect(screen.getByText('Factors Not Fully Captured')).toBeInTheDocument();
    });

    it('should list keep property considerations', () => {
      renderComponent();
      expect(screen.getByText('Keep Property Considerations')).toBeInTheDocument();
      expect(screen.getByText(/Tax benefits from depreciation/)).toBeInTheDocument();
      expect(screen.getByText(/Potential rent increases/)).toBeInTheDocument();
    });

    it('should list sell & invest considerations', () => {
      renderComponent();
      expect(screen.getByText('Sell & Invest Considerations')).toBeInTheDocument();
      expect(screen.getByText(/Portfolio diversification benefits/)).toBeInTheDocument();
      expect(screen.getByText(/Liquidity and flexibility/)).toBeInTheDocument();
    });
  });

  describe('Chart Legend', () => {
    beforeEach(() => {
      mockUser = {
        uid: 'owner-1',
        email: 'owner@example.com',
        displayName: 'Shanie Holman',
        role: 'owner',
      };
    });

    it('should display chart legend items', () => {
      renderComponent();
      expect(screen.getByText(/Keep Property.*Equity.*Cash Flow/i)).toBeInTheDocument();
      expect(screen.getByText(/Sell & Invest in Stocks/i)).toBeInTheDocument();
    });
  });
});
