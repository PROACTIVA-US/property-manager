import { useAuth } from '../../contexts/AuthContext';
import MortgageCalculator from '../MortgageCalculator';
import { Bot, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Owner Overview</h1>
          <p className="text-brand-muted mt-1">Financial health and property insights for {user?.displayName}</p>
        </div>
        <button className="btn-primary flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-navy border border-purple-400/30">
          <Bot size={18} />
          Ask Gem
        </button>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-brand-navy to-slate-800">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
               <DollarSign size={24} />
             </div>
             <h3 className="font-semibold text-brand-light">Net Cash Flow</h3>
           </div>
           <p className="text-3xl font-bold text-brand-light">+$273.58<span className="text-sm font-normal text-brand-muted">/mo</span></p>
           <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
             <TrendingUp size={12} />
             12% vs last year
           </p>
        </div>

        <div className="card">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
               <TrendingUp size={24} />
             </div>
             <h3 className="font-semibold text-brand-light">Equity Built</h3>
           </div>
           <p className="text-3xl font-bold text-brand-light">$62,400</p>
           <p className="text-xs text-brand-muted mt-2">Total since purchase</p>
        </div>

        <div className="card relative overflow-hidden group cursor-pointer hover:border-brand-orange/50 transition-colors">
           <div className="absolute -right-4 -top-4 bg-brand-orange/10 w-24 h-24 rounded-full group-hover:bg-brand-orange/20 transition-all" />
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
               <HelpCircle size={24} />
             </div>
             <h3 className="font-semibold text-brand-light">Ask Gem</h3>
           </div>
           <p className="text-sm text-brand-muted mb-3">
             "Am I losing money this month?"<br/>
             "Show me repair costs for 2024."
           </p>
           <span className="text-xs text-brand-orange font-medium">Start Chat &rarr;</span>
        </div>
      </div>

      {/* Mortgage Calculator Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-brand-light">Financial Simulator</h2>
          <span className="px-2 py-0.5 rounded text-[10px] bg-brand-orange/20 text-brand-orange font-medium uppercase tracking-wide">Interactive</span>
        </div>
        <div className="card bg-slate-800/50">
          <MortgageCalculator />
        </div>
      </section>
    </div>
  );
}
