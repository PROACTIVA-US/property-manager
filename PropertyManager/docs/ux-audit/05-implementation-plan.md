# UX Audit: Step 5 - Implementation Plan

**Date:** 2026-02-04
**Status:** Complete
**Previous Step:** [04-component-audit.md](./04-component-audit.md)

---

## Overview

This document provides a complete, production-ready implementation plan for transforming PropertyManager into a clean, role-separated system. Based on the component audit findings, changes are organized into four priority tiers with specific file changes, code snippets, and testing checklists.

### Implementation Summary

| Priority | Focus | Estimated Effort | Files Changed |
|----------|-------|------------------|---------------|
| **P0** | Route Guards, Navigation, Escalation, Financial Access | 20-25 hours | 15 files |
| **P1** | Dashboard Enhancements, Alert Systems | 15-20 hours | 12 files |
| **P2** | New PM Pages, Tenant Improvements | 18-24 hours | 11 files |
| **P3** | Polish, Payment Methods, PM Updates | 8-12 hours | 6 files |

**Total Estimated Effort:** 61-81 hours (2-3 weeks)

---

## P0: Critical - Week 1

### P0.1 Route Guards & Navigation Restructure

#### New File: `src/config/roleRoutes.ts`

```typescript
import type { UserRole } from '../contexts/AuthContext';

export type FinancialTab = 'overview' | 'property' | 'rental' | 'tax' | 'projections';

export interface RouteConfig {
  path: string;
  allowedRoles: Array<'owner' | 'pm' | 'tenant'>;
  label?: string;
}

// Owner: 5 nav items
export const OWNER_ROUTES: RouteConfig[] = [
  { path: '/', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Dashboard' },
  { path: '/financials', allowedRoles: ['owner'], label: 'Financials' },
  { path: '/properties', allowedRoles: ['owner'], label: 'Properties' },
  { path: '/documents', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Documents' },
  { path: '/messages', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Messages' },
];

// PM: 8 nav items
export const PM_ROUTES: RouteConfig[] = [
  { path: '/', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Dashboard' },
  { path: '/issues', allowedRoles: ['pm'], label: 'Issues' },
  { path: '/tenants', allowedRoles: ['pm'], label: 'Tenants' },
  { path: '/inspections', allowedRoles: ['pm'], label: 'Inspections' },
  { path: '/rent', allowedRoles: ['pm'], label: 'Rent' },
  { path: '/vendors', allowedRoles: ['pm'], label: 'Vendors' },
  { path: '/leases', allowedRoles: ['pm'], label: 'Leases' },
  { path: '/expenses', allowedRoles: ['pm'], label: 'Expenses' },
];

// Tenant: 4 nav items
export const TENANT_ROUTES: RouteConfig[] = [
  { path: '/', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Home' },
  { path: '/payments', allowedRoles: ['tenant'], label: 'Payments' },
  { path: '/maintenance', allowedRoles: ['owner', 'pm', 'tenant'], label: 'Maintenance' },
  { path: '/lease', allowedRoles: ['tenant'], label: 'Lease' },
];

export const RESTRICTED_ROUTES = {
  tenant: ['/financials', '/projects', '/vendors', '/tenants', '/accounts', '/inspections', '/rent', '/leases', '/expenses'],
  pm: ['/financials'],
};

export function getRoutesByRole(role: UserRole): RouteConfig[] {
  switch (role) {
    case 'owner': return OWNER_ROUTES;
    case 'pm': return PM_ROUTES;
    case 'tenant': return TENANT_ROUTES;
    default: return [];
  }
}

export function canAccessRoute(userRole: UserRole | null, path: string): boolean {
  if (!userRole) return false;
  const routes = getRoutesByRole(userRole);
  return routes.some(route => path.startsWith(route.path));
}
```

#### New File: `src/components/RoleBasedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'owner' | 'pm' | 'tenant'>;
  fallbackPath?: string;
}

export default function RoleBasedRoute({
  children,
  allowedRoles,
  fallbackPath = '/',
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles) {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role as any)) {
    console.warn(`Access denied: ${user.role} tried to access route restricted to ${allowedRoles.join(', ')}`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
```

#### Modify: `src/components/Layout.tsx`

**Lines 103-121 - Replace navigation structure:**

```typescript
import { Building2, ClipboardCheck, Home, Receipt, HardHat } from 'lucide-react';

const getPrimaryNavByRole = (userRole: string | null, unreadCount: number) => {
  switch (userRole) {
    case 'owner':
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Financials', href: '/financials', icon: Calculator },
        { name: 'Properties', href: '/properties', icon: Building2 },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
      ];
    case 'pm':
      return [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Issues', href: '/issues', icon: AlertCircle },
        { name: 'Tenants', href: '/tenants', icon: Users },
        { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
        { name: 'Rent', href: '/rent', icon: CreditCard },
        { name: 'Vendors', href: '/vendors', icon: HardHat },
        { name: 'Leases', href: '/leases', icon: FileText },
        { name: 'Expenses', href: '/expenses', icon: Receipt },
      ];
    case 'tenant':
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Payments', href: '/payments', icon: CreditCard },
        { name: 'Maintenance', href: '/maintenance', icon: Wrench },
        { name: 'Lease', href: '/lease', icon: FileText },
      ];
    default:
      return [];
  }
};

// Replace existing filtering with:
const primaryNav = getPrimaryNavByRole(user?.role || null, unreadCount);
```

#### Modify: `src/App.tsx`

**Add imports and wrap routes with RoleBasedRoute:**

```typescript
import RoleBasedRoute from './components/RoleBasedRoute';

// Example route updates:
<Route path="/financials" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['owner']}>
      <Financials />
    </RoleBasedRoute>
  </ProtectedRoute>
} />

<Route path="/issues" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['pm']}>
      <IssuesPage />
    </RoleBasedRoute>
  </ProtectedRoute>
} />

<Route path="/payments" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['tenant']}>
      <TenantPortal section="payments" />
    </RoleBasedRoute>
  </ProtectedRoute>
} />
```

---

### P0.2 Owner Escalation Workflow

#### Modify: `src/types/issues.types.ts`

**Add to Issue interface (~line 157):**

```typescript
export interface Issue {
  // ... existing fields ...

  // Escalation fields
  escalatedAt?: string;
  escalatedBy?: string;
  escalatedByName?: string;
  escalationReason?: string;
  ownerApprovalStatus?: 'pending' | 'approved' | 'rejected';
  ownerApprovedAt?: string;
  ownerDecision?: string;
}
```

#### Modify: `src/lib/issues.ts`

**Add escalation functions (~line 565):**

```typescript
export function getEscalatedIssues(): Issue[] {
  const issues = getIssues();
  return issues.filter(issue => issue.status === 'escalated');
}

export function getPendingEscalations(): Issue[] {
  const issues = getIssues();
  return issues.filter(
    issue => issue.status === 'escalated' &&
      (!issue.ownerApprovalStatus || issue.ownerApprovalStatus === 'pending')
  );
}

export function escalateIssue(
  issueId: string,
  reason: string,
  escalatedBy: string,
  escalatedByName: string,
  escalatedByRole: 'owner' | 'pm' | 'tenant'
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];
  const activities = [...currentIssue.activities];

  activities.push({
    id: generateActivityId(),
    issueId,
    type: 'escalated',
    description: `Issue escalated to owner: "${reason}"`,
    performedBy: escalatedBy,
    performedByName: escalatedByName,
    performedByRole: escalatedByRole,
    performedAt: now,
    metadata: { escalationReason: reason },
  });

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'escalated',
    escalatedAt: now,
    escalatedBy,
    escalatedByName,
    escalationReason: reason,
    ownerApprovalStatus: 'pending',
    activities,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

export function approveEscalation(
  issueId: string,
  ownerDecision: string,
  approverId: string,
  approverName: string
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'assigned',
    ownerApprovalStatus: 'approved',
    ownerApprovedAt: now,
    ownerDecision,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

export function rejectEscalation(
  issueId: string,
  ownerDecision: string,
  rejectorId: string,
  rejectorName: string
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'triaged',
    ownerApprovalStatus: 'rejected',
    ownerApprovedAt: now,
    ownerDecision,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

export function getEscalationCount(): number {
  return getPendingEscalations().length;
}
```

#### New File: `src/components/issues/EscalateToOwnerModal.tsx`

```typescript
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { escalateIssue } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';

interface EscalateToOwnerModalProps {
  issue: Issue;
  onClose: () => void;
  onEscalated: () => void;
}

export default function EscalateToOwnerModal({
  issue,
  onClose,
  onEscalated,
}: EscalateToOwnerModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !user) return;

    setIsLoading(true);
    escalateIssue(issue.id, reason.trim(), user.uid, user.displayName, user.role as any);
    onEscalated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-md">
        <div className="flex items-start justify-between px-6 py-4 border-b border-cc-border">
          <div>
            <h2 className="text-lg font-bold text-cc-text">Escalate to Owner</h2>
            <p className="text-sm text-cc-muted mt-1">Request owner decision</p>
          </div>
          <button onClick={onClose} className="p-2 text-cc-muted hover:text-cc-text rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-cc-bg/50 rounded-lg p-3 border border-cc-border/50">
            <p className="text-xs text-cc-muted uppercase mb-1">Issue</p>
            <p className="text-sm font-medium text-cc-text">{issue.title}</p>
          </div>

          <div className="flex gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-600">
              Owner will need to approve before this issue can proceed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-cc-text mb-2">
              Reason for Escalation
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this needs owner decision..."
              className="input-field w-full h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!reason.trim() || isLoading}>
              {isLoading ? 'Escalating...' : 'Escalate to Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### New File: `src/components/issues/OwnerEscalationWidget.tsx`

```typescript
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getPendingEscalations } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';

interface OwnerEscalationWidgetProps {
  onIssueClick: (issue: Issue) => void;
}

export default function OwnerEscalationWidget({ onIssueClick }: OwnerEscalationWidgetProps) {
  const pendingEscalations = getPendingEscalations();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-cc-text">Attention Needed</h3>
            <p className="text-xs text-cc-muted">Escalated issues awaiting decision</p>
          </div>
        </div>
        {pendingEscalations.length > 0 && (
          <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
            {pendingEscalations.length}
          </span>
        )}
      </div>

      {pendingEscalations.length > 0 ? (
        <div className="space-y-2">
          {pendingEscalations.slice(0, 5).map((issue) => (
            <button
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className="w-full text-left p-3 rounded-lg bg-cc-bg/50 hover:bg-cc-bg border border-cc-border hover:border-cc-accent/50 transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-cc-text text-sm flex-1 line-clamp-1">
                  {issue.title}
                </p>
                <span className="text-xs font-semibold text-red-400 shrink-0 ml-2">PENDING</span>
              </div>
              <p className="text-xs text-cc-muted line-clamp-1">{issue.escalationReason}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-cc-muted">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">All escalations addressed</p>
        </div>
      )}
    </div>
  );
}
```

#### Modify: `src/pages/Issues.tsx`

**Update loadIssues (~line 26):**

```typescript
const loadIssues = useCallback(() => {
  generateSampleIssues();

  // Owners ONLY see escalated issues
  if (isOwner) {
    const { getEscalatedIssues } = require('../lib/issues');
    setIssues(getEscalatedIssues());
  } else if (isTenant && user) {
    setIssues(getIssuesByReporter(user.uid));
  } else {
    setIssues(getIssues());
  }

  if (isPM || isOwner) {
    setMetrics(getIssueMetrics());
  }
}, [isTenant, isPM, isOwner, user]);
```

#### Modify: `src/components/role-dashboards/OwnerDashboard.tsx`

**Add escalation widget import and rendering:**

```typescript
import OwnerEscalationWidget from '../issues/OwnerEscalationWidget';
import IssueDetailModal from '../issues/IssueDetailModal';
import { getEscalatedIssues, getIssueById } from '../../lib/issues';
import type { Issue } from '../../types/issues.types';

// Add state:
const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

// Add section before Financial Analysis Tools:
{getEscalatedIssues().length > 0 && (
  <section>
    <OwnerEscalationWidget onIssueClick={(issue) => setSelectedIssue(issue)} />
  </section>
)}

// Add modal at end:
{selectedIssue && (
  <IssueDetailModal
    issue={selectedIssue}
    onClose={() => setSelectedIssue(null)}
    onUpdated={() => {
      const updated = getIssueById(selectedIssue.id);
      setSelectedIssue(updated || null);
    }}
  />
)}
```

---

### P0.3 Financial Access Control

#### New File: `src/lib/financialAccess.ts`

```typescript
import type { UserRole } from '../contexts/AuthContext';

export type FinancialTab = 'overview' | 'property' | 'rental' | 'tax' | 'projections';

const FINANCIAL_TAB_ACCESS: Record<string, FinancialTab[]> = {
  owner: ['overview', 'property', 'rental', 'tax', 'projections'],
  pm: ['rental'],
  tenant: [],
};

export function getAccessibleTabs(role: UserRole): FinancialTab[] {
  return FINANCIAL_TAB_ACCESS[role || ''] || [];
}

export function canAccessTab(role: UserRole, tab: FinancialTab): boolean {
  return getAccessibleTabs(role).includes(tab);
}

export function getDefaultTab(role: UserRole): FinancialTab | null {
  const accessible = getAccessibleTabs(role);
  return accessible.length > 0 ? accessible[0] : null;
}

export interface OverviewSections {
  rentalIncome: boolean;
  rentalExpenses: boolean;
  netCashFlow: boolean;
  mortgageAnalysis: boolean;
  personalIncome: boolean;
  combinedSummary: boolean;
}

export function getOverviewSections(role: UserRole): OverviewSections {
  switch (role) {
    case 'owner':
      return {
        rentalIncome: true,
        rentalExpenses: true,
        netCashFlow: true,
        mortgageAnalysis: true,
        personalIncome: true,
        combinedSummary: true,
      };
    case 'pm':
      return {
        rentalIncome: true,
        rentalExpenses: true,
        netCashFlow: true,
        mortgageAnalysis: false,
        personalIncome: false,
        combinedSummary: false,
      };
    default:
      return {
        rentalIncome: false,
        rentalExpenses: false,
        netCashFlow: false,
        mortgageAnalysis: false,
        personalIncome: false,
        combinedSummary: false,
      };
  }
}
```

#### New File: `src/components/FinancialAccessDenied.tsx`

```typescript
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function FinancialAccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cc-bg flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-full">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cc-text">Access Denied</h1>
          <p className="text-cc-muted">
            Financial analysis tools are not available for {user?.role} users.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
```

#### Modify: `src/pages/Financials.tsx`

**Add role-based tab filtering:**

```typescript
import { useAuth } from '../contexts/AuthContext';
import FinancialAccessDenied from '../components/FinancialAccessDenied';
import { getAccessibleTabs, canAccessTab, getDefaultTab, type FinancialTab } from '../lib/financialAccess';

export default function Financials() {
  const { user } = useAuth();

  // Redirect tenants
  if (user?.role === 'tenant') {
    return <FinancialAccessDenied />;
  }

  const accessibleTabs = getAccessibleTabs(user?.role || null);

  // Filter tabs array
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'property', label: 'Property & Mortgage', icon: Building2 },
    { id: 'rental', label: 'Rental Income', icon: Home },
    { id: 'tax', label: 'Tax Planning', icon: FileText },
    { id: 'projections', label: 'Projections', icon: TrendingUp },
  ].filter(tab => accessibleTabs.includes(tab.id as FinancialTab));

  // ... rest of component
}
```

#### Modify: `src/components/TaxAnalysis.tsx` and `src/components/KeepVsSell.tsx`

**Add role guard at component start:**

```typescript
import { useAuth } from '../contexts/AuthContext';
import FinancialAccessDenied from './FinancialAccessDenied';

export default function TaxAnalysis(props) {
  const { user } = useAuth();

  if (user?.role !== 'owner') {
    return <FinancialAccessDenied />;
  }

  // ... rest of component
}
```

---

### P0 Testing Checklist

#### Navigation Visibility
- [ ] Owner sees exactly 5 nav items (Dashboard, Financials, Properties, Documents, Messages)
- [ ] PM sees exactly 8 nav items (Dashboard, Issues, Tenants, Inspections, Rent, Vendors, Leases, Expenses)
- [ ] Tenant sees exactly 4 nav items (Home, Payments, Maintenance, Lease)

#### Route Access Control
- [ ] Owner accessing `/issues` redirects to `/`
- [ ] PM accessing `/financials` redirects to `/`
- [ ] Tenant accessing `/financials` shows Access Denied
- [ ] Tenant accessing `/issues` redirects to `/`

#### Escalation Workflow
- [ ] PM can escalate issue from IssueDetailModal
- [ ] Owner sees escalated issues on Dashboard
- [ ] Owner can approve/reject escalations
- [ ] Status changes correctly after approval/rejection

#### Financial Access
- [ ] Owner sees all 5 Financials tabs
- [ ] PM sees only Rental tab
- [ ] Tenant cannot access Financials page
- [ ] TaxAnalysis blocks non-owner access

---

## P1: High Priority - Week 2

### P1.1 Dashboard Enhancements

#### New File: `src/components/dashboard-kpis/PortfolioValueKPI.tsx`

```typescript
import { TrendingUp } from 'lucide-react';
import { loadSettings } from '../../lib/settings';

interface PortfolioValueKPIProps {
  onDrillDown?: () => void;
}

export default function PortfolioValueKPI({ onDrillDown }: PortfolioValueKPIProps) {
  const settings = loadSettings();
  const value = settings.property?.currentMarketValue || 0;

  return (
    <div
      onClick={onDrillDown}
      className="card cursor-pointer hover:border-cc-accent/50 transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
          <TrendingUp size={20} />
        </div>
        <span className="text-sm text-cc-muted">Portfolio Value</span>
      </div>
      <p className="text-2xl font-bold text-cc-text">
        ${value.toLocaleString()}
      </p>
    </div>
  );
}
```

#### New File: `src/components/dashboard-kpis/OccupancyRateKPI.tsx`

```typescript
import { Home } from 'lucide-react';

interface OccupancyRateKPIProps {
  onViewLeases?: () => void;
}

export default function OccupancyRateKPI({ onViewLeases }: OccupancyRateKPIProps) {
  // For MVP: hardcoded single property
  const occupied = 1;
  const total = 1;
  const rate = Math.round((occupied / total) * 100);

  return (
    <div
      onClick={onViewLeases}
      className="card cursor-pointer hover:border-cc-accent/50 transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${rate >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          <Home size={20} />
        </div>
        <span className="text-sm text-cc-muted">Occupancy Rate</span>
      </div>
      <p className="text-2xl font-bold text-cc-text">{rate}%</p>
      <p className="text-xs text-cc-muted">{occupied}/{total} units</p>
    </div>
  );
}
```

#### New File: `src/components/dashboard-alerts/PMAlertBar.tsx`

```typescript
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { getIssues } from '../../lib/issues';

export default function PMAlertBar() {
  const [dismissed, setDismissed] = useState(false);

  const issues = getIssues();
  const atRiskCount = issues.filter(i =>
    i.status !== 'closed' && i.priority === 'urgent'
  ).length;

  if (dismissed || atRiskCount === 0) return null;

  return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} className="text-red-400" />
        <span className="text-sm text-red-300">
          {atRiskCount} issue{atRiskCount > 1 ? 's' : ''} approaching SLA breach
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-300">
        <X size={16} />
      </button>
    </div>
  );
}
```

#### New File: `src/components/dashboard-widgets/IssuesByPriority.tsx`

```typescript
import { getIssues } from '../../lib/issues';

interface IssuesByPriorityProps {
  onPriorityClick?: (priority: string) => void;
}

export default function IssuesByPriority({ onPriorityClick }: IssuesByPriorityProps) {
  const issues = getIssues().filter(i => i.status !== 'closed');

  const counts = {
    urgent: issues.filter(i => i.priority === 'urgent').length,
    high: issues.filter(i => i.priority === 'high').length,
    medium: issues.filter(i => i.priority === 'medium').length,
    low: issues.filter(i => i.priority === 'low').length,
  };

  const priorities = [
    { key: 'urgent', label: 'Emergency', color: 'bg-red-500', count: counts.urgent },
    { key: 'high', label: 'Urgent', color: 'bg-orange-500', count: counts.high },
    { key: 'medium', label: 'Standard', color: 'bg-yellow-500', count: counts.medium },
    { key: 'low', label: 'Low', color: 'bg-green-500', count: counts.low },
  ];

  return (
    <div className="card">
      <h3 className="font-semibold text-cc-text mb-4">Issues by Priority</h3>
      <div className="space-y-2">
        {priorities.map(p => (
          <button
            key={p.key}
            onClick={() => onPriorityClick?.(p.key)}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-cc-bg/50"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="text-sm text-cc-text">{p.label}</span>
            </div>
            <span className="text-sm font-medium text-cc-muted">({p.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## P2: Medium Priority - Week 3

### P2.1 New PM Pages

#### New File: `src/pages/Inspections.tsx`

```typescript
import { useState } from 'react';
import { Plus, ClipboardCheck } from 'lucide-react';
import { getInspections } from '../lib/messages';
import InspectionScheduler from '../components/InspectionScheduler';

export default function Inspections() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
  const inspections = getInspections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Property Inspections</h1>
          <p className="text-cc-muted">Schedule and track property inspections</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Schedule Inspection
        </button>
      </div>

      <div className="flex gap-2 border-b border-cc-border/50 pb-2">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'scheduled' ? 'bg-cc-accent text-white' : 'text-cc-muted'}`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'history' ? 'bg-cc-accent text-white' : 'text-cc-muted'}`}
        >
          History
        </button>
      </div>

      {showForm && <InspectionScheduler onClose={() => setShowForm(false)} />}

      <div className="grid gap-4">
        {inspections
          .filter(i => activeTab === 'scheduled' ? i.status !== 'completed' : i.status === 'completed')
          .map(inspection => (
            <div key={inspection.id} className="card">
              <div className="flex items-center gap-3">
                <ClipboardCheck size={20} className="text-cc-accent" />
                <div>
                  <p className="font-medium text-cc-text">{inspection.type}</p>
                  <p className="text-sm text-cc-muted">
                    {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
```

#### New File: `src/pages/Rent.tsx`

```typescript
import { CreditCard, AlertTriangle } from 'lucide-react';
import PaymentHistory from '../components/PaymentHistory';

export default function Rent() {
  // Mock data for demonstration
  const collectionStats = {
    totalDue: 3700,
    collected: 1850,
    overdue: 1850,
    rate: 50,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cc-text">Rent Collection</h1>
        <p className="text-cc-muted">Track payments, delinquencies, and trends</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Total Due</p>
          <p className="text-xl font-bold text-cc-text">${collectionStats.totalDue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Collected</p>
          <p className="text-xl font-bold text-green-400">${collectionStats.collected.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Overdue</p>
          <p className="text-xl font-bold text-red-400">${collectionStats.overdue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Collection Rate</p>
          <p className="text-xl font-bold text-cc-text">{collectionStats.rate}%</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-cc-text mb-4">Payment History</h2>
        <PaymentHistory />
      </div>
    </div>
  );
}
```

#### New File: `src/pages/Leases.tsx`

```typescript
import { FileText, AlertCircle } from 'lucide-react';
import { getLease } from '../lib/tenant';

export default function Leases() {
  const lease = getLease();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cc-text">Property Leases</h1>
        <p className="text-cc-muted">Manage active leases and renewals</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Active Leases</p>
          <p className="text-xl font-bold text-cc-text">1</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Expiring Soon</p>
          <p className="text-xl font-bold text-yellow-400">0</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Need Renewal</p>
          <p className="text-xl font-bold text-cc-text">0</p>
        </div>
      </div>

      {lease && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} className="text-cc-accent" />
            <div>
              <p className="font-medium text-cc-text">{lease.tenantName}</p>
              <p className="text-sm text-cc-muted">{lease.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-cc-muted">Start Date</p>
              <p className="text-cc-text">{new Date(lease.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-cc-muted">End Date</p>
              <p className="text-cc-text">{new Date(lease.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-cc-muted">Monthly Rent</p>
              <p className="text-cc-text">${lease.monthlyRent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-cc-muted">Status</p>
              <p className="text-green-400 capitalize">{lease.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### P2.2 Tenant Language Fixes

#### Modify: `src/components/PaymentHistory.tsx`

**Line 121:**
```typescript
// Change:
<h1 className="text-2xl font-bold text-cc-text">Rent Payments</h1>
// To:
<h1 className="text-2xl font-bold text-cc-text">Your Payments</h1>
```

#### Modify: `src/components/LeaseDetails.tsx`

**Line 58:**
```typescript
// Change:
<h1 className="text-2xl font-bold text-cc-text">Lease Details</h1>
// To:
<h1 className="text-2xl font-bold text-cc-text">Your Lease</h1>
```

#### Modify: `src/components/MaintenanceRequest.tsx`

**Line 158:**
```typescript
// Change:
<h1 className="text-2xl font-bold text-cc-text">Maintenance Requests</h1>
// To:
<h1 className="text-2xl font-bold text-cc-text">Your Maintenance Requests</h1>
```

---

## P3: Low Priority - Week 4+

### P3.1 Tenant Messages Screen

#### New File: `src/components/tenant/TenantMessages.tsx`

```typescript
import { useState } from 'react';
import { getThreads, getMessages } from '../../lib/messages';
import MessageThread from '../MessageThread';
import MessageComposer from '../MessageComposer';

export default function TenantMessages() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const threads = getThreads().filter(t => t.participants.some(p => p.role === 'tenant'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-2">
        <h2 className="font-semibold text-cc-text mb-4">Messages</h2>
        {threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => setSelectedThread(thread.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedThread === thread.id
                ? 'border-cc-accent bg-cc-accent/10'
                : 'border-cc-border hover:border-cc-accent/50'
            }`}
          >
            <p className="font-medium text-cc-text text-sm">{thread.subject}</p>
            <p className="text-xs text-cc-muted line-clamp-1">{thread.lastMessage}</p>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col min-h-[400px]">
        {selectedThread ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <MessageThread threadId={selectedThread} />
            </div>
            <div className="border-t border-cc-border p-4">
              <MessageComposer threadId={selectedThread} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cc-muted">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
```

### P3.2 Responsibilities Restriction

#### Modify: `src/App.tsx`

**Wrap responsibilities route with role guard:**

```typescript
<Route path="/responsibilities" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['pm', 'owner']}>
      <Responsibilities />
    </RoleBasedRoute>
  </ProtectedRoute>
} />
```

---

## File Change Summary

### New Files (16)

| File | Priority | Purpose |
|------|----------|---------|
| `src/config/roleRoutes.ts` | P0 | Route configuration |
| `src/components/RoleBasedRoute.tsx` | P0 | Route guard component |
| `src/lib/financialAccess.ts` | P0 | Financial access control |
| `src/components/FinancialAccessDenied.tsx` | P0 | Access denied component |
| `src/components/issues/EscalateToOwnerModal.tsx` | P0 | Escalation form |
| `src/components/issues/OwnerEscalationWidget.tsx` | P0 | Dashboard widget |
| `src/components/dashboard-kpis/PortfolioValueKPI.tsx` | P1 | Owner KPI |
| `src/components/dashboard-kpis/OccupancyRateKPI.tsx` | P1 | Owner KPI |
| `src/components/dashboard-alerts/PMAlertBar.tsx` | P1 | PM alert component |
| `src/components/dashboard-widgets/IssuesByPriority.tsx` | P1 | PM widget |
| `src/pages/Inspections.tsx` | P2 | PM page |
| `src/pages/Rent.tsx` | P2 | PM page |
| `src/pages/Leases.tsx` | P2 | PM page |
| `src/components/tenant/TenantMessages.tsx` | P3 | Tenant messages |

### Modified Files (12)

| File | Priority | Changes |
|------|----------|---------|
| `src/components/Layout.tsx` | P0 | Navigation restructure |
| `src/App.tsx` | P0 | Route guards |
| `src/types/issues.types.ts` | P0 | Escalation fields |
| `src/lib/issues.ts` | P0 | Escalation functions |
| `src/pages/Issues.tsx` | P0 | Owner filtering |
| `src/pages/Financials.tsx` | P0 | Tab filtering |
| `src/components/TaxAnalysis.tsx` | P0 | Role guard |
| `src/components/KeepVsSell.tsx` | P0 | Role guard |
| `src/components/role-dashboards/OwnerDashboard.tsx` | P0/P1 | Add widgets |
| `src/components/role-dashboards/PMDashboard.tsx` | P1 | Add alerts |
| `src/components/PaymentHistory.tsx` | P2 | Title change |
| `src/components/LeaseDetails.tsx` | P2 | Title change |
| `src/components/MaintenanceRequest.tsx` | P2 | Title change |

---

## Success Criteria

### P0 Complete When:
- [ ] Each role sees correct number of nav items
- [ ] Route guards prevent unauthorized access
- [ ] PM can escalate issues to owner
- [ ] Owner sees escalation widget on dashboard
- [ ] Financial tools restricted by role

### P1 Complete When:
- [ ] Owner dashboard shows Portfolio Value and Occupancy KPIs
- [ ] PM dashboard shows Alert Bar and Issues by Priority
- [ ] Dashboard layouts match IA wireframes

### P2 Complete When:
- [ ] All 3 new PM pages functional
- [ ] Tenant screens use "Your" language
- [ ] No console errors

### P3 Complete When:
- [ ] Tenant has full Messages screen
- [ ] Responsibilities restricted to PM/Owner
- [ ] All tests passing

---

*Document generated 2026-02-04 using parallel agent orchestration*
