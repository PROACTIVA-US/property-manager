import { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';
import CSVImport from '../components/CSVImport';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  isCapitalImprovement: boolean;
}

const STORAGE_KEY = 'property_expenses';

const EXPENSE_CATEGORIES = [
  'Repairs',
  'Maintenance',
  'Utilities',
  'Insurance',
  'Property Tax',
  'HOA Fees',
  'Property Management',
  'Capital Improvement',
  'Other',
];

function loadExpenses(): Expense[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Repairs',
    amount: 0,
    isCapitalImprovement: false,
  });

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const handleAddExpense = () => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      ...newExpense,
    };
    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Repairs',
      amount: 0,
      isCapitalImprovement: false,
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleCSVImport = (data: Record<string, string>[]) => {
    const newExpenses: Expense[] = data.map((row, index) => ({
      id: `exp-csv-${Date.now()}-${index}`,
      date: row.date || new Date().toISOString().split('T')[0],
      description: row.description || '',
      category: row.category || 'Other',
      amount: parseFloat(row.amount) || 0,
      isCapitalImprovement: row.isCapitalImprovement === 'true' || row.isCapitalImprovement === '1',
    }));
    setExpenses([...newExpenses, ...expenses]);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const capitalImprovements = expenses.filter(e => e.isCapitalImprovement).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cc-text">Expense Tracking</h1>
          <p className="text-cc-muted mt-1">
            Track repairs, maintenance, and capital improvements
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card !p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-cc-muted uppercase">Total Expenses</p>
              <p className="text-xl font-bold text-cc-text">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card !p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-xs text-cc-muted uppercase">Capital Improvements</p>
              <p className="text-xl font-bold text-cc-text">
                ${capitalImprovements.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Import */}
      <CSVImport
        title="Import Expenses from CSV"
        description="Upload a CSV file with your expense data. Download the template to see the expected format."
        templateColumns={['date', 'description', 'category', 'amount', 'isCapitalImprovement']}
        onRecordsImported={handleCSVImport}
      />

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-bold text-cc-text mb-4">New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Date
              </label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Amount
              </label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                className="input w-full"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Category
              </label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="input w-full"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cc-text mb-2">
                Description
              </label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="input w-full"
                placeholder="Replaced water heater"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-cc-text">
              <input
                type="checkbox"
                checked={newExpense.isCapitalImprovement}
                onChange={(e) => setNewExpense({ ...newExpense, isCapitalImprovement: e.target.checked })}
                className="rounded"
              />
              Capital Improvement (increases property basis for tax purposes)
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleAddExpense} className="btn-primary">
              Save Expense
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="card">
        <h3 className="text-lg font-bold text-cc-text mb-4 flex items-center gap-2">
          <Receipt size={20} className="text-cc-accent" />
          Expense History ({expenses.length})
        </h3>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-cc-muted">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <p>No expenses recorded yet</p>
            <p className="text-sm mt-1">Add your first expense or import from CSV</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 bg-cc-bg/50 border border-cc-border/50 rounded-lg flex items-center justify-between hover:border-cc-border transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-cc-accent/20 rounded-lg text-cc-accent">
                    <Receipt size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-cc-text">{expense.description}</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-cc-border/50 text-cc-muted">
                        {expense.category}
                      </span>
                      {expense.isCapitalImprovement && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          Capital Improvement
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-cc-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cc-text">
                      ${expense.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="ml-4 p-2 text-cc-muted hover:text-red-400 transition-colors"
                  title="Delete expense"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
