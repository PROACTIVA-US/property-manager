import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Building2,
  Briefcase,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadSettings } from '../../lib/settings';
import {
  getPropertyFinancials,
  getPersonalExpenses,
  calculateCashFlow,
  formatCurrency,
} from '../../lib/financials';

export default function FinancialsOverview() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Load live data from settings
  const settings = loadSettings();
  const property = getPropertyFinancials();
  const personal = getPersonalExpenses();
  const cashFlow = calculateCashFlow(property);

  // Calculate totals
  const monthlyIncome = property.monthlyRentalIncome;

  const propertyExpenses =
    property.monthlyMortgagePayment +
    property.monthlyPropertyTax +
    property.monthlyInsurance +
    property.monthlyHOA +
    property.monthlyMaintenanceReserve +
    property.monthlyVacancyReserve +
    property.monthlyManagementFee;

  const personalExpenses = personal.currentRentPayment + personal.currentUtilityCosts;

  const totalExpenses = propertyExpenses + personalExpenses;
  const netCashFlow = monthlyIncome - totalExpenses;

  // Mortgage details from settings
  const mortgage = settings.mortgage;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // Refresh when key changes
  }, [refreshKey]);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-light">Income vs Expenses</h2>
          <p className="text-sm text-brand-muted mt-1">Monthly financial snapshot</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2 text-sm"
          title="Refresh data"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Income */}
        <div className="card !p-5 bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <span className="text-sm font-medium text-green-400 uppercase tracking-wide">Income</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{formatCurrency(monthlyIncome)}</div>
          <div className="text-sm text-brand-muted mt-1">per month</div>
        </div>

        {/* Total Expenses */}
        <div className="card !p-5 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="text-red-400" size={20} />
            </div>
            <span className="text-sm font-medium text-red-400 uppercase tracking-wide">Expenses</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
          <div className="text-sm text-brand-muted mt-1">per month</div>
        </div>

        {/* Net Cash Flow */}
        <div className={`card !p-5 ${netCashFlow >= 0 ? 'bg-brand-orange/10 border border-brand-orange/30' : 'bg-slate-700/50 border border-slate-600'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${netCashFlow >= 0 ? 'bg-brand-orange/20' : 'bg-slate-600'}`}>
              <DollarSign className={netCashFlow >= 0 ? 'text-brand-orange' : 'text-slate-400'} size={20} />
            </div>
            <span className={`text-sm font-medium uppercase tracking-wide ${netCashFlow >= 0 ? 'text-brand-orange' : 'text-slate-400'}`}>
              Net Cash Flow
            </span>
          </div>
          <div className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-brand-orange' : 'text-red-400'}`}>
            {formatCurrency(netCashFlow)}
          </div>
          <div className="text-sm text-brand-muted mt-1">per month</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Details */}
        <div className="card p-5">
          <h3 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
            <Home className="text-green-400" size={18} />
            Rental Income
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="text-brand-muted">Monthly Rent</span>
              <span className="text-brand-light font-medium">{formatCurrency(property.monthlyRentalIncome)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-brand-light font-bold">Total Monthly Income</span>
              <span className="text-green-400 font-bold text-lg">{formatCurrency(monthlyIncome)}</span>
            </div>
          </div>
        </div>

        {/* Property Expenses */}
        <div className="card p-5">
          <h3 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
            <Building2 className="text-red-400" size={18} />
            Property Expenses
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-muted">Mortgage P&I</span>
              <span className="text-brand-light">{formatCurrency(property.monthlyMortgagePayment)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-muted">Property Tax</span>
              <span className="text-brand-light">{formatCurrency(property.monthlyPropertyTax)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-muted">Insurance</span>
              <span className="text-brand-light">{formatCurrency(property.monthlyInsurance)}</span>
            </div>
            {property.monthlyHOA > 0 && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-brand-muted">HOA</span>
                <span className="text-brand-light">{formatCurrency(property.monthlyHOA)}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-muted">Maintenance Reserve</span>
              <span className="text-brand-light">{formatCurrency(property.monthlyMaintenanceReserve)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-brand-muted">Vacancy Reserve</span>
              <span className="text-brand-light">{formatCurrency(property.monthlyVacancyReserve)}</span>
            </div>
            {property.monthlyManagementFee > 0 && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-brand-muted">Management Fee</span>
                <span className="text-brand-light">{formatCurrency(property.monthlyManagementFee)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-700/50">
              <span className="text-brand-light font-bold">Property Subtotal</span>
              <span className="text-red-400 font-bold">{formatCurrency(propertyExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Expenses (Office Space) */}
      <div className="card p-5">
        <h3 className="text-lg font-bold text-brand-light mb-4 flex items-center gap-2">
          <Briefcase className="text-purple-400" size={18} />
          Personal Expenses (Office Space)
        </h3>
        <p className="text-sm text-brand-muted mb-4">
          Your living costs while the property is rented out
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-navy/30 rounded-lg p-4">
            <div className="text-sm text-brand-muted mb-1">Current Rent</div>
            <div className="text-xl font-bold text-brand-light">{formatCurrency(personal.currentRentPayment)}</div>
          </div>
          <div className="bg-brand-navy/30 rounded-lg p-4">
            <div className="text-sm text-brand-muted mb-1">Utilities</div>
            <div className="text-xl font-bold text-brand-light">{formatCurrency(personal.currentUtilityCosts)}</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-sm text-purple-400 mb-1">Total Office Space</div>
            <div className="text-xl font-bold text-purple-400">{formatCurrency(personalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Mortgage Details Quick View */}
      <div className="card p-5 bg-brand-navy/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-brand-light flex items-center gap-2">
            <DollarSign className="text-brand-orange" size={18} />
            Mortgage Details
          </h3>
          <Link to="/financials?tab=mortgage" className="text-sm text-brand-orange hover:underline flex items-center gap-1">
            View Payoff Calculator <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-brand-muted uppercase mb-1">Principal</div>
            <div className="text-lg font-bold text-brand-light">{formatCurrency(mortgage.principal)}</div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase mb-1">Rate</div>
            <div className="text-lg font-bold text-brand-light">{mortgage.interestRate}%</div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase mb-1">P&I</div>
            <div className="text-lg font-bold text-brand-light">{formatCurrency(mortgage.monthlyPAndI)}</div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase mb-1">Escrow</div>
            <div className="text-lg font-bold text-brand-light">{formatCurrency(mortgage.monthlyEscrow)}</div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase mb-1">Total Payment</div>
            <div className="text-lg font-bold text-brand-orange">{formatCurrency(mortgage.totalMonthlyPayment)}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card !p-4 text-center">
          <div className="text-xs text-brand-muted uppercase mb-1">Cap Rate</div>
          <div className="text-2xl font-bold text-brand-light">{cashFlow.capRate.toFixed(1)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-brand-muted uppercase mb-1">Cash-on-Cash</div>
          <div className="text-2xl font-bold text-brand-light">{cashFlow.cashOnCashReturn.toFixed(1)}%</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-brand-muted uppercase mb-1">Annual NOI</div>
          <div className="text-2xl font-bold text-brand-light">{formatCurrency(cashFlow.netOperatingIncome)}</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-xs text-brand-muted uppercase mb-1">Equity</div>
          <div className="text-2xl font-bold text-brand-light">
            {formatCurrency(property.currentMarketValue - property.mortgageBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}
