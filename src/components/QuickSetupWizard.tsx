import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Home, DollarSign, Users, FileText } from 'lucide-react';
import { updateProperty, updateMortgage, updateRentalIncome, updateTenant, type PropertyData, type MortgageData, type RentalIncomeData, type TenantData } from '../lib/settings';

interface QuickSetupWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 'property' | 'mortgage' | 'rental' | 'tenant' | 'complete';

export default function QuickSetupWizard({ onComplete, onCancel }: QuickSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('property');
  const [property, setProperty] = useState<Partial<PropertyData>>({});
  const [mortgage, setMortgage] = useState<Partial<MortgageData>>({});
  const [rental, setRental] = useState<Partial<RentalIncomeData>>({});
  const [tenant, setTenant] = useState<Partial<TenantData>>({});

  const steps: Step[] = ['property', 'mortgage', 'rental', 'tenant', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const stepInfo = {
    property: { title: 'Property Details', icon: Home, description: 'Basic information about your property' },
    mortgage: { title: 'Mortgage Information', icon: DollarSign, description: 'Loan details and payments' },
    rental: { title: 'Rental Income', icon: DollarSign, description: 'Monthly rent and expenses' },
    tenant: { title: 'Tenant Information', icon: Users, description: 'Current tenant details' },
    complete: { title: 'Setup Complete!', icon: Check, description: 'Your property is ready' },
  };

  const handleNext = () => {
    if (currentStep === 'property') {
      updateProperty(property as PropertyData);
      setCurrentStep('mortgage');
    } else if (currentStep === 'mortgage') {
      updateMortgage(mortgage as MortgageData);
      setCurrentStep('rental');
    } else if (currentStep === 'rental') {
      updateRentalIncome(rental as RentalIncomeData);
      setCurrentStep('tenant');
    } else if (currentStep === 'tenant') {
      updateTenant(tenant as TenantData);
      setCurrentStep('complete');
    } else if (currentStep === 'complete') {
      onComplete();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const canProceed = () => {
    if (currentStep === 'property') {
      return property.address && property.currentMarketValue;
    } else if (currentStep === 'mortgage') {
      return mortgage.principal && mortgage.interestRate && mortgage.monthlyPayment;
    } else if (currentStep === 'rental') {
      return rental.monthlyRent;
    } else if (currentStep === 'tenant') {
      return tenant.name && tenant.monthlyRent;
    }
    return true;
  };

  const StepIcon = stepInfo[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
                <StepIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-light">{stepInfo[currentStep].title}</h2>
                <p className="text-sm text-brand-muted">{stepInfo[currentStep].description}</p>
              </div>
            </div>
            <button onClick={onCancel} className="text-brand-muted hover:text-brand-light transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.slice(0, -1).map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-2 rounded-full flex-1 transition-all ${
                    index <= currentStepIndex ? 'bg-brand-orange' : 'bg-slate-700'
                  }`}
                />
                {index < steps.length - 2 && <div className="w-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'property' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Property Address *
                </label>
                <input
                  type="text"
                  value={property.address || ''}
                  onChange={(e) => setProperty({ ...property, address: e.target.value })}
                  className="input w-full"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Unit Number
                </label>
                <input
                  type="text"
                  value={property.unitNumber || ''}
                  onChange={(e) => setProperty({ ...property, unitNumber: e.target.value })}
                  className="input w-full"
                  placeholder="Apt 4B"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={property.purchasePrice || ''}
                    onChange={(e) => setProperty({ ...property, purchasePrice: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="350000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Current Market Value *
                  </label>
                  <input
                    type="number"
                    value={property.currentMarketValue || ''}
                    onChange={(e) => setProperty({ ...property, currentMarketValue: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="420000"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'mortgage' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Loan Principal *
                </label>
                <input
                  type="number"
                  value={mortgage.principal || ''}
                  onChange={(e) => setMortgage({ ...mortgage, principal: Number(e.target.value) })}
                  className="input w-full"
                  placeholder="280000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Interest Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={mortgage.interestRate || ''}
                    onChange={(e) => setMortgage({ ...mortgage, interestRate: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="5.729"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Monthly Payment *
                  </label>
                  <input
                    type="number"
                    value={mortgage.monthlyPayment || ''}
                    onChange={(e) => setMortgage({ ...mortgage, monthlyPayment: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="1800"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'rental' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={rental.monthlyRent || ''}
                  onChange={(e) => setRental({ ...rental, monthlyRent: Number(e.target.value) })}
                  className="input w-full"
                  placeholder="2400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Monthly Property Tax
                  </label>
                  <input
                    type="number"
                    value={rental.monthlyPropertyTax || ''}
                    onChange={(e) => setRental({ ...rental, monthlyPropertyTax: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="350"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Monthly Insurance
                  </label>
                  <input
                    type="number"
                    value={rental.monthlyInsurance || ''}
                    onChange={(e) => setRental({ ...rental, monthlyInsurance: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="150"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'tenant' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  value={tenant.name || ''}
                  onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                  className="input w-full"
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    value={tenant.leaseStartDate || ''}
                    onChange={(e) => setTenant({ ...tenant, leaseStartDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-light mb-2">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    value={tenant.leaseEndDate || ''}
                    onChange={(e) => setTenant({ ...tenant, leaseEndDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-light mb-2">
                  Monthly Rent *
                </label>
                <input
                  type="number"
                  value={tenant.monthlyRent || rental.monthlyRent || ''}
                  onChange={(e) => setTenant({ ...tenant, monthlyRent: Number(e.target.value) })}
                  className="input w-full"
                  placeholder="2400"
                />
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={48} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-brand-light mb-2">All Set!</h3>
              <p className="text-brand-muted max-w-md mx-auto">
                Your property has been configured. You can now use the financial analysis tools and manage your rental property.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 'complete' ? 'Get Started' : 'Next'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
