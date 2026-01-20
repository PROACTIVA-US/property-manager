import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  DEFAULT_LOAN_PARAMS,
  calculateAmortizationSchedule,
  analyzeSchedules,
  calculateExtraPaymentForTargetDate,
  type LoanParams
} from '../lib/mortgage';
import { RefreshCw, Table as TableIcon } from 'lucide-react';

export default function MortgageCalculator() {
  const [loanParams, setLoanParams] = useState<LoanParams>(DEFAULT_LOAN_PARAMS);
  const [extraPayment, setExtraPayment] = useState(0);
  const [oneTimeAmount, setOneTimeAmount] = useState(0);
  const [oneTimeMonth, setOneTimeMonth] = useState(1);
  const [showTable, setShowTable] = useState(false);
  const [targetDateIndex, setTargetDateIndex] = useState(0);

  // Manual Input State
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualInputs, setManualInputs] = useState({
    principal: loanParams.principal,
    rate: loanParams.annualRate * 100,
    pi: loanParams.baseMonthlyPAndI,
    escrow: loanParams.escrow,
    total: loanParams.totalPayment
  });

  const comparison = useMemo(() => {
    const originalSchedule = calculateAmortizationSchedule(loanParams, 0, { amount: 0, month: 0 });
    const acceleratedSchedule = calculateAmortizationSchedule(loanParams, extraPayment, {
      amount: oneTimeAmount,
      month: oneTimeMonth
    });
    return analyzeSchedules(originalSchedule, acceleratedSchedule, loanParams.principal);
  }, [loanParams, extraPayment, oneTimeAmount, oneTimeMonth]);

  // Handle Payoff Date Slider Logic
  const maxMonths = comparison.originalSchedule.length;
  
  const handleTargetDateChange = (monthsToAdd: number) => {
     setTargetDateIndex(monthsToAdd);
     if (monthsToAdd === 0 || !comparison.originalSchedule.length) {
       setExtraPayment(0);
       return;
     }

     const startDate = new Date(loanParams.startDate);
     const targetDate = new Date(startDate);
     targetDate.setMonth(startDate.getMonth() + monthsToAdd);

     const calculatedExtra = calculateExtraPaymentForTargetDate(loanParams, targetDate, comparison.originalSchedule);
     if (calculatedExtra !== null) {
       setExtraPayment(calculatedExtra);
     }
  };

  // Sync manual inputs when loan params change externally (e.g. reset)
  useEffect(() => {
    if (!isManualInput) {
      setManualInputs({
        principal: loanParams.principal,
        rate: loanParams.annualRate * 100,
        pi: loanParams.baseMonthlyPAndI,
        escrow: loanParams.escrow,
        total: loanParams.totalPayment
      });
    }
  }, [loanParams, isManualInput]);

  const handleManualInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newInputs = { ...manualInputs, [field]: numValue };
    setManualInputs(newInputs as any);

    // Update Loan Params based on input logic
    if (field === 'rate' || field === 'principal') {
       setLoanParams(prev => ({
         ...prev,
         principal: field === 'principal' ? numValue : prev.principal,
         annualRate: field === 'rate' ? numValue / 100 : prev.annualRate
       }));
    } else if (field === 'pi') {
       setLoanParams(prev => ({ ...prev, baseMonthlyPAndI: numValue, totalPayment: numValue + prev.escrow }));
    } else if (field === 'escrow') {
       setLoanParams(prev => ({ ...prev, escrow: numValue, totalPayment: prev.baseMonthlyPAndI + numValue }));
    } else if (field === 'total') {
       setLoanParams(prev => ({ ...prev, totalPayment: numValue, baseMonthlyPAndI: numValue - prev.escrow }));
    }
  };

  const chartData = useMemo(() => {
    const maxLength = Math.max(comparison.originalSchedule.length, comparison.acceleratedSchedule.length);
    const data = [];
    for (let i = 0; i < maxLength; i++) {
      data.push({
        month: i + 1,
        Original: comparison.originalSchedule[i]?.remainingBalance || 0,
        Accelerated: comparison.acceleratedSchedule[i]?.remainingBalance || 0
      });
    }
    return data;
  }, [comparison]);

  const interestData = [
    {
      name: 'Original',
      Principal: comparison.originalTotalPrincipalPaid,
      Interest: comparison.originalTotalInterest
    },
    {
      name: 'Accelerated',
      Principal: comparison.acceleratedTotalPrincipalPaid,
      Interest: comparison.acceleratedTotalInterest
    }
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatDate = (date: Date | null) => date ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-light">Mortgage Payoff Accelerator</h2>
          <p className="text-brand-muted">Visualize how extra payments save you money.</p>
        </div>
        <button
          onClick={() => {
            setLoanParams(DEFAULT_LOAN_PARAMS);
            setExtraPayment(0);
            setOneTimeAmount(0);
            setOneTimeMonth(1);
            setTargetDateIndex(comparison.monthsSaved > 0 ? comparison.originalSchedule.length - comparison.acceleratedSchedule.length : 0);
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="space-y-6">
          {/* Loan Details Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-brand-orange">Loan Details</h3>
              <button
                onClick={() => setIsManualInput(!isManualInput)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {isManualInput ? 'Use Defaults' : 'Edit Details'}
              </button>
            </div>
            
            {isManualInput ? (
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-brand-muted mb-1">Principal</label>
                   <input type="number" value={manualInputs.principal} onChange={(e) => handleManualInputChange('principal', e.target.value)} className="input-field w-full" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-brand-muted mb-1">Rate (%)</label>
                   <input type="number" value={manualInputs.rate} onChange={(e) => handleManualInputChange('rate', e.target.value)} className="input-field w-full" />
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-brand-dark/30 p-2 rounded">
                  <p className="text-brand-muted text-xs uppercase">Principal</p>
                  <p className="font-medium text-brand-light">{formatCurrency(loanParams.principal)}</p>
                </div>
                <div className="bg-brand-dark/30 p-2 rounded">
                  <p className="text-brand-muted text-xs uppercase">Rate</p>
                  <p className="font-medium text-brand-light">{(loanParams.annualRate * 100).toFixed(3)}%</p>
                </div>
                <div className="bg-brand-dark/30 p-2 rounded">
                   <p className="text-brand-muted text-xs uppercase">Start Date</p>
                   <p className="font-medium text-brand-light">{formatDate(loanParams.startDate)}</p>
                </div>
                <div className="bg-brand-dark/30 p-2 rounded">
                   <p className="text-brand-muted text-xs uppercase">Monthly P&I</p>
                   <p className="font-medium text-brand-light">{formatCurrency(loanParams.baseMonthlyPAndI)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Controls */}
          <div className="card space-y-6">
             {/* Extra Monthly Payment */}
             <div>
                <div className="flex justify-between mb-2">
                   <label className="font-medium text-brand-light">Extra Monthly Payment</label>
                   <span className="text-brand-orange font-bold">{formatCurrency(extraPayment)}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
             </div>

             {/* Payoff Date Target */}
             <div>
                <div className="flex justify-between mb-2">
                   <label className="font-medium text-brand-light">Target Payoff Date</label>
                   <span className="text-brand-orange font-bold">{formatDate(comparison.acceleratedPayoffDate)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxMonths}
                  step="1"
                  value={targetDateIndex}
                  onChange={(e) => handleTargetDateChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
             </div>
             
             {/* One-time Payment */}
             <div className="pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-medium text-brand-light mb-4">Lump Sum Payment</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-brand-muted">Amount</span>
                      <span className="font-medium text-brand-light">{formatCurrency(oneTimeAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={loanParams.principal}
                      step="100"
                      value={oneTimeAmount}
                      onChange={(e) => setOneTimeAmount(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-sm text-brand-muted">Month Applied</span>
                       <span className="font-medium text-brand-light">Month {oneTimeMonth}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={comparison.acceleratedSchedule.length}
                      value={oneTimeMonth}
                      onChange={(e) => setOneTimeMonth(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
           {/* Summary Stats */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card !p-4">
                 <p className="text-[10px] text-brand-muted uppercase">New Payoff</p>
                 <p className="text-lg font-bold text-brand-orange">{formatDate(comparison.acceleratedPayoffDate)}</p>
              </div>
              <div className="card !p-4">
                 <p className="text-[10px] text-brand-muted uppercase">Time Saved</p>
                 <p className="text-lg font-bold text-green-400">{Math.round(comparison.monthsSaved / 12 * 10) / 10} Years</p>
              </div>
              <div className="card !p-4">
                 <p className="text-[10px] text-brand-muted uppercase">Interest Saved</p>
                 <p className="text-lg font-bold text-green-400">{formatCurrency(comparison.interestSaved)}</p>
              </div>
              <div className="card !p-4">
                 <p className="text-[10px] text-brand-muted uppercase">Total Interest</p>
                 <p className="text-lg font-bold text-brand-light">{formatCurrency(comparison.acceleratedTotalInterest)}</p>
              </div>
           </div>

           {/* Balance Chart */}
           <div className="card">
              <h3 className="font-semibold text-brand-orange mb-4">Balance Over Time</h3>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                     <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                     <Tooltip 
                       formatter={(val: number) => formatCurrency(val)}
                       contentStyle={{ backgroundColor: '#1a1a2e', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                     />
                     <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
                     <Line type="monotone" dataKey="Original" stroke="#64748b" strokeWidth={2} dot={false} />
                     <Line type="monotone" dataKey="Accelerated" stroke="#ff8c42" strokeWidth={2} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Interest vs Principal Chart */}
           <div className="card">
              <h3 className="font-semibold text-brand-orange mb-4">Total Cost Breakdown</h3>
              <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={interestData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                     <Tooltip 
                       formatter={(val: number) => formatCurrency(val)} 
                       cursor={{fill: 'transparent'}}
                       contentStyle={{ backgroundColor: '#1a1a2e', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                     />
                     <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
                     <Bar dataKey="Principal" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} />
                     <Bar dataKey="Interest" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <button
             onClick={() => setShowTable(!showTable)}
             className="btn-secondary w-full flex justify-center items-center"
           >
             <TableIcon className="w-4 h-4 mr-2" />
             {showTable ? 'Hide Schedule' : 'Show Full Schedule'}
           </button>
        </div>
      </div>

      {/* Schedule Table */}
      {showTable && (
        <div className="card !p-0 overflow-hidden mt-6">
           <div className="overflow-x-auto max-h-[500px]">
             <table className="min-w-full divide-y divide-slate-700/50 text-sm">
               <thead className="bg-brand-dark sticky top-0">
                 <tr>
                   <th className="px-6 py-3 text-left font-medium text-brand-muted uppercase tracking-wider">Month</th>
                   <th className="px-6 py-3 text-left font-medium text-brand-muted uppercase tracking-wider">Date</th>
                   <th className="px-6 py-3 text-right font-medium text-brand-muted uppercase tracking-wider">Principal</th>
                   <th className="px-6 py-3 text-right font-medium text-brand-muted uppercase tracking-wider">Interest</th>
                   <th className="px-6 py-3 text-right font-medium text-brand-muted uppercase tracking-wider">Extra</th>
                   <th className="px-6 py-3 text-right font-medium text-brand-muted uppercase tracking-wider">Balance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                 {comparison.acceleratedSchedule.map((entry) => (
                   <tr key={entry.month} className="hover:bg-brand-navy/30 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-brand-light">{entry.month}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-brand-muted">{formatDate(entry.paymentDate)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-brand-light">{formatCurrency(entry.principalPaid)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-red-400">{formatCurrency(entry.interestPaid)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-medium">{formatCurrency(entry.extraPayment)}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-brand-light">{formatCurrency(entry.remainingBalance)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}