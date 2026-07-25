export interface LoanParams {
  principal: number;
  annualRate: number;
  baseMonthlyPAndI: number;
  escrow: number;
  totalPayment: number;
  startDate: Date;
}

export interface AmortizationEntry {
  month: number;
  paymentDate: Date;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface ComparisonResults {
  originalSchedule: AmortizationEntry[];
  acceleratedSchedule: AmortizationEntry[];
  originalTotalInterest: number;
  acceleratedTotalInterest: number;
  originalPayoffDate: Date | null;
  acceleratedPayoffDate: Date | null;
  monthsSaved: number;
  interestSaved: number;
  originalTotalPrincipalPaid: number;
  acceleratedTotalPrincipalPaid: number;
}

export const DEFAULT_LOAN_PARAMS: LoanParams = {
  principal: 59957.41,
  annualRate: 0.057285,
  baseMonthlyPAndI: 1336.39,
  escrow: 790.03,
  totalPayment: 2126.42,
  startDate: new Date('2025-07-01')
};

export function calculateAmortizationSchedule(
  loanParams: LoanParams,
  extraMonthlyPayment = 0,
  oneTimePayment = { amount: 0, month: 0 }
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  let currentBalance = loanParams.principal;
  const monthlyRate = loanParams.annualRate / 12;
  let monthNumber = 0;
  const paymentDate = new Date(loanParams.startDate);
  const maxMonths = 60 * 12;

  while (currentBalance > 0.005 && monthNumber < maxMonths) {
    monthNumber++;
    const interestThisMonth = currentBalance * monthlyRate;

    let principalFromBasePayment = loanParams.baseMonthlyPAndI - interestThisMonth;
    if (principalFromBasePayment < 0 && loanParams.baseMonthlyPAndI > 0) {
      principalFromBasePayment = 0;
    }

    let actualExtraPaymentApplied = extraMonthlyPayment;

    // Add one-time payment if this is the right month
    if (oneTimePayment.amount > 0 && monthNumber === oneTimePayment.month) {
      actualExtraPaymentApplied += oneTimePayment.amount;
    }

    if (currentBalance + interestThisMonth <= loanParams.baseMonthlyPAndI + actualExtraPaymentApplied) {
      if (currentBalance + interestThisMonth <= loanParams.baseMonthlyPAndI) {
        principalFromBasePayment = currentBalance;
        actualExtraPaymentApplied = 0;
      } else {
        principalFromBasePayment = Math.max(0, loanParams.baseMonthlyPAndI - interestThisMonth);
        actualExtraPaymentApplied = currentBalance - principalFromBasePayment;
      }
      currentBalance = 0;
    } else {
      currentBalance -= (principalFromBasePayment + actualExtraPaymentApplied);
    }

    const finalPrincipalFromBase = Math.max(0, principalFromBasePayment);
    const finalActualExtra = Math.max(0, actualExtraPaymentApplied);
    const finalInterest = Math.max(0, interestThisMonth);
    const totalPaymentThisMonth = finalPrincipalFromBase + finalInterest + finalActualExtra;

    schedule.push({
      month: monthNumber,
      paymentDate: new Date(paymentDate),
      principalPaid: finalPrincipalFromBase,
      interestPaid: finalInterest,
      extraPayment: finalActualExtra,
      totalPayment: totalPaymentThisMonth,
      remainingBalance: currentBalance < 0.005 ? 0 : currentBalance,
    });

    if (currentBalance <= 0.005) {
      break;
    }
    paymentDate.setMonth(paymentDate.getMonth() + 1);
  }
  return schedule;
}

export function analyzeSchedules(
  originalSchedule: AmortizationEntry[],
  acceleratedSchedule: AmortizationEntry[],
  initialPrincipal: number
): ComparisonResults {
  const originalTotalInterest = originalSchedule.reduce((sum, entry) => sum + entry.interestPaid, 0);
  const acceleratedTotalInterest = acceleratedSchedule.reduce((sum, entry) => sum + entry.interestPaid, 0);

  const originalPayoffDate = originalSchedule.length > 0 ? originalSchedule[originalSchedule.length - 1].paymentDate : null;
  const acceleratedPayoffDate = acceleratedSchedule.length > 0 ? acceleratedSchedule[acceleratedSchedule.length - 1].paymentDate : null;

  let monthsSaved = 0;
  if (originalPayoffDate && acceleratedPayoffDate) {
    monthsSaved = originalSchedule.length - acceleratedSchedule.length;
  }

  const interestSaved = originalTotalInterest - acceleratedTotalInterest;

  return {
    originalSchedule,
    acceleratedSchedule,
    originalTotalInterest,
    acceleratedTotalInterest,
    originalPayoffDate,
    acceleratedPayoffDate,
    monthsSaved,
    interestSaved,
    originalTotalPrincipalPaid: initialPrincipal,
    acceleratedTotalPrincipalPaid: initialPrincipal,
  };
}

/**
 * Calculate the current principal balance based on how many payments have been made
 * since the loan start date
 */
export function calculateCurrentPrincipal(
  loanParams: LoanParams,
  asOfDate: Date = new Date()
): number {
  // Calculate how many months have passed since loan start
  const startDate = new Date(loanParams.startDate);
  const monthsElapsed = Math.max(0,
    (asOfDate.getFullYear() - startDate.getFullYear()) * 12 +
    (asOfDate.getMonth() - startDate.getMonth())
  );

  if (monthsElapsed === 0) {
    return loanParams.principal;
  }

  // Calculate the amortization schedule up to the current month
  const schedule = calculateAmortizationSchedule(loanParams, 0, { amount: 0, month: 0 });

  // Find the current balance at the elapsed months
  if (monthsElapsed >= schedule.length) {
    return 0; // Loan is paid off
  }

  // Return the remaining balance after the payments made
  return schedule[monthsElapsed - 1]?.remainingBalance || loanParams.principal;
}

export function calculateExtraPaymentForTargetDate(
  loanParams: LoanParams,
  targetPayoffUserDate: Date,
  originalSchedule: AmortizationEntry[]
): number | null {
  if (originalSchedule.length === 0) return null;

  const lastOriginalPaymentDate = originalSchedule[originalSchedule.length - 1].paymentDate;
  const targetDate = new Date(targetPayoffUserDate.getFullYear(), targetPayoffUserDate.getMonth(), targetPayoffUserDate.getDate());
  const normStartDateForCompare = new Date(loanParams.startDate.getFullYear(), loanParams.startDate.getMonth(), loanParams.startDate.getDate());

  if (targetDate < normStartDateForCompare) {
    return null;
  }

  if (targetDate.getTime() >= lastOriginalPaymentDate.getTime()) {
    return 0;
  }

  let low = 0.00;
  let high = loanParams.principal;
  let bestExtraPayment: number | null = null;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    const mid = parseFloat(((low + high) / 2).toFixed(2));

    if (mid < 0 || (high - low) < 0.01) break;

    const schedule = calculateAmortizationSchedule(loanParams, mid, { amount: 0, month: 0 });

    if (schedule.length === 0 || schedule[schedule.length - 1].remainingBalance > 0.01) {
      low = mid + 0.01;
      continue;
    }

    const currentPayoffDate = schedule[schedule.length - 1].paymentDate;

    if (currentPayoffDate <= targetDate) {
      bestExtraPayment = mid;
      high = mid - 0.01;
    } else {
      low = mid + 0.01;
    }
  }

  if (bestExtraPayment !== null) {
    const finalSchedule = calculateAmortizationSchedule(loanParams, bestExtraPayment, { amount: 0, month: 0 });
    if (finalSchedule.length > 0 && finalSchedule[finalSchedule.length - 1].remainingBalance < 0.01 && finalSchedule[finalSchedule.length - 1].paymentDate <= targetDate) {
      if (bestExtraPayment < 0.01 && lastOriginalPaymentDate <= targetDate) return 0;
      return bestExtraPayment;
    }
  }
  return null;
}
