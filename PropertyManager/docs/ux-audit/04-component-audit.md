# UX Audit: Step 4 - Component Audit

**Date:** 2026-02-04
**Status:** Complete
**Previous Step:** [03-workflow-mapping.md](./03-workflow-mapping.md)
**Next Step:** Implementation Plan

---

## Overview

This document audits all existing components against the new role-based Information Architecture. It identifies which components need modification, creation, or role-based variants to implement the clean separation defined in Steps 1-3.

### Audit Scope

| Category | Components Audited |
|----------|-------------------|
| Navigation & Layout | 2 |
| Financial Components | 4 |
| Issues/Maintenance | 10 |
| Role Dashboards | 4 |
| Tenant-Specific | 8 |
| Settings/Forms | 7 |
| **Total** | **35** |

---

## Executive Summary

### Overall Compliance by Role

| Role | Current IA Alignment | Key Gaps |
|------|---------------------|----------|
| **Owner** | 70% | Missing escalation alerts, Portfolio KPI, route guards |
| **PM** | 60% | Missing escalation workflow UI, SLA dashboard, work queue |
| **Tenant** | 85% | Missing Messages screen, generic language, route guards |

### Critical Findings

1. **No Route Guards** - Routes are not protected by role; any user can access any URL
2. **No Escalation UI** - Status exists but no Owner approval workflow
3. **Financial Leakage** - PM/Tenant can access Owner-only financial tools via direct URL
4. **Two Maintenance Systems** - Tenant MaintenanceRequest not integrated with PM Issues
5. **Generic Language** - Tenant screens use "Payments" not "Your Payments"

---

## 1. Navigation & Layout Audit

### Layout.tsx

**Current State:**
- 9 nav items with role-based filtering via `item.roles.includes(user.role)`
- Mobile and desktop navigation both use the same filtered array
- Role filtering works but is too permissive

**Current Navigation Map:**

| Menu Item | Current Roles | New IA Requirement |
|-----------|---------------|-------------------|
| Dashboard | owner, pm, tenant | Keep all |
| Issues | owner, pm, tenant | PM only |
| Projects | owner, pm, tenant | Remove (use Maintenance for PM) |
| Messages | owner, pm, tenant | Keep all |
| Financials | owner, pm, tenant | Owner only |
| Accounts | owner, pm | Owner only (merge into Financials) |
| Documents | owner, pm, tenant | Owner, PM only |
| People | owner, pm | PM only (rename to Tenants) |
| Vendors | owner, pm | PM only |

**Required Changes:**

```typescript
// New Owner Navigation (5 items)
const ownerNav = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'financials', label: 'Financials', icon: DollarSign, path: '/financials' },
  { key: 'properties', label: 'Properties', icon: Building2, path: '/properties' },
  { key: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
];

// New PM Navigation (8 items)
const pmNav = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'issues', label: 'Issues', icon: AlertCircle, path: '/issues' },
  { key: 'tenants', label: 'Tenants', icon: Users, path: '/tenants' },
  { key: 'inspections', label: 'Inspections', icon: ClipboardCheck, path: '/inspections' },
  { key: 'rent', label: 'Rent', icon: CreditCard, path: '/rent' },
  { key: 'vendors', label: 'Vendors', icon: HardHat, path: '/vendors' },
  { key: 'leases', label: 'Leases', icon: FileText, path: '/leases' },
  { key: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
];

// New Tenant Navigation (4 items)
const tenantNav = [
  { key: 'home', label: 'Home', icon: Home, path: '/' },
  { key: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { key: 'lease', label: 'Lease', icon: FileText, path: '/lease' },
];
```

### AuthContext.tsx

**Current State:**
- UserRole type: `'owner' | 'tenant' | 'pm' | null`
- Supports mock roles and OAuth roles
- No route permission checking

**Required Changes:**
- Add `canAccessRoute(role, path)` helper function
- Add route configuration with allowed roles

### Route Guards (MISSING)

**Current State:** Only `ProtectedRoute` checks if user exists, not role permissions

**Required:** Create `RoleBasedRoute` component

```typescript
// Proposed implementation
const roleRoutes = {
  owner: ['/', '/financials', '/properties', '/documents', '/messages', '/settings'],
  pm: ['/', '/issues', '/tenants', '/inspections', '/rent', '/vendors', '/leases', '/expenses', '/messages', '/settings'],
  tenant: ['/', '/payments', '/maintenance', '/lease', '/messages'],
};

function RoleBasedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    toast.info("That page isn't available for your account type");
    return <Navigate to="/" />;
  }
  return children;
}
```

---

## 2. Financial Components Audit

### Summary Table

| Component | Current Auth | Required Auth | Changes Needed |
|-----------|--------------|---------------|----------------|
| KeepVsSell.tsx | None | Owner only | Add role guard |
| TaxAnalysis.tsx | None | Owner only | Add role guard |
| FinancialsOverview.tsx | None | Owner (full) / PM (rental only) | Section-level guards |
| Financials.tsx (page) | None | Role-based tabs | Filter tabs by role |

### KeepVsSell.tsx

**Current:** No role restrictions, publicly accessible
**Required:** Owner only
**Change:** Wrap in role guard, return "Access Denied" for PM/Tenant

### TaxAnalysis.tsx

**Current:** No role restrictions, publicly accessible
**Required:** Owner only
**Change:** Wrap in role guard, return "Access Denied" for PM/Tenant

### FinancialsOverview.tsx

**Current:** Shows all financial data to any viewer
**Required:** Mixed access

| Section | Owner | PM | Tenant |
|---------|-------|----|----|
| Rental Income | ✓ | ✓ | ✗ |
| Operating Expenses | ✓ | ✓ | ✗ |
| Net Cash Flow | ✓ | ✓ | ✗ |
| Mortgage Payoff Analysis | ✓ | ✗ | ✗ |
| Personal Income | ✓ | ✗ | ✗ |
| Combined Summary | ✓ | ✗ | ✗ |

**Change:** Add conditional section rendering based on role prop

### Financials.tsx (Page)

**Current Tabs:** overview, property, rental, tax, projections (all visible to all)
**Required Tab Visibility:**

| Tab | Owner | PM | Tenant |
|-----|-------|----|----|
| overview | ✓ | ✗ | ✗ |
| property | ✓ | ✗ | ✗ |
| rental | ✓ | ✓ | ✗ |
| tax | ✓ | ✗ | ✗ |
| projections | ✓ | ✗ | ✗ |

**Change:** Filter `tabs` array based on user role before rendering

---

## 3. Issues & Maintenance Audit

### Current Architecture Problem

**Two Separate Systems:**
1. **Issue System** (PM workflow): IssueCreateForm, IssueDetailModal, IssueKanban
2. **MaintenanceRequest System** (Tenant workflow): MaintenanceRequest component

**Problem:** Tenant submits MaintenanceRequest → NOT visible as Issue to PM unless manually converted

### Issue Components

| Component | Current Role Handling | Required |
|-----------|----------------------|----------|
| IssueList.tsx | None (inherits from parent) | PM only |
| IssueCard.tsx | None (display only) | PM only |
| IssueDetailModal.tsx | isPM/isOwner check for buttons | PM (edit) / Owner (approve/reject) |
| IssueCreateForm.tsx | All roles can create | PM only |
| IssueKanban.tsx | isPM for drag/drop | PM only |
| IssueResolution.tsx | No restrictions | PM only |
| IssueTimeline.tsx | No restrictions | PM only |

### Issues.tsx (Page)

**Current Role Filtering:**
- Owner: Sees ALL issues (incorrect - should only see escalations)
- PM: Sees ALL issues (correct)
- Tenant: Sees own issues only via `getIssuesByReporter(user.uid)` (correct)

**Required Changes:**
- Owner: Filter to `status === 'escalated'` only, or remove access entirely
- PM: Keep current behavior
- Tenant: Redirect to `/maintenance` instead

### Escalation Workflow Status

| Feature | Implemented | Notes |
|---------|-------------|-------|
| `escalated` status in workflow | ✓ | Defined in types |
| Escalated column in Kanban | ✓ | Red highlighting |
| Activity tracking for escalation | ✓ | IssueActivity type |
| **Escalation button in UI** | ✗ | Missing |
| **Owner escalation dashboard alerts** | ✗ | Missing |
| **Owner approve/reject workflow** | ✗ | Missing |
| **Escalation reason form** | ✗ | Missing |
| **PM "Escalate to Owner" modal** | ✗ | Missing |

### Required New Components

| Component | Role | Purpose |
|-----------|------|---------|
| **OwnerEscalationWidget** | Owner | Dashboard card showing pending escalations |
| **OwnerEscalationView** | Owner | Read-only list of escalated issues |
| **EscalateToOwnerModal** | PM | Form to escalate with reason/context |
| **OwnerIssueDetailModal** | Owner | Read-only view with Approve/Reject buttons |

### MaintenanceRequest.tsx (Tenant)

**Current State:** Good - simplified form with category, urgency, title, description, photos
**Gap:** Not integrated with Issue system
**Required:** Bridge to create Issue record when tenant submits MaintenanceRequest

---

## 4. Dashboard Components Audit

### OwnerDashboard.tsx

**Currently Implemented:**
- ✓ Net Cash Flow KPI with breakdown modal
- ✓ Equity Built KPI with breakdown modal
- ✓ Property Value Widget
- ✓ Financial Analysis Tools (5 interactive cards)
- ✓ Quick Cash Flow Summary

**Missing from IA:**
- ✗ Portfolio Value KPI (multi-property total)
- ✗ Occupancy Rate KPI
- ✗ **Attention Needed Card** (escalations)
- ✗ **PM Updates Section**
- ✗ Cash Flow Chart (12-month visualization)

### PMDashboard.tsx

**Currently Implemented:**
- ✓ Quick Stats (4 cards: Issues, Messages, Inspections, Satisfaction)
- ✓ Maintenance Checklist
- ✓ Current Tenant card
- ✓ Vendor Directory (compact)

**Missing from IA:**
- ✗ **Alert Bar** (critical issues at top)
- ✗ **Work Queue** (prioritized daily tasks)
- ✗ **Issues by Priority Breakdown** (not just count)
- ✗ **SLA Status Section**
- ✗ Quick Actions section expansion

### TenantDashboard.tsx

**Currently Implemented:**
- ✓ Welcome header with property/unit
- ✓ Quick Stats (4 cards matching IA)
- ✓ Alerts section (overdue, expiring)
- ✓ Rent Status hero card with Pay button
- ✓ Quick Actions (3 cards)
- ✓ PM Messages preview
- ✓ Monthly Payment Summary

**Missing from IA:**
- Minor: Rent Status hero could be more prominent
- Minor: Messages section positioned lower than ideal

**Assessment:** 85% aligned - best of the three dashboards

---

## 5. Tenant-Specific Components Audit

### Component Inventory

| Component | Purpose | IA Alignment |
|-----------|---------|--------------|
| TenantPortal.tsx | Router for /tenant/* routes | ✓ Good |
| TenantDashboard.tsx | Home screen | ✓ Good |
| PaymentHistory.tsx | Rent payments | ⚠️ Generic title |
| LeaseDetails.tsx | Lease info & renewal | ⚠️ Generic title |
| MaintenanceRequest.tsx | Submit/track requests | ⚠️ Generic title |
| TenantResponsibilities.tsx | Responsibility tracking | ✗ Not in IA |
| ResponsibilityChecklist.tsx | Checklist UI | ✗ Not in IA |

### Data Scoping Audit

| Component | Scoped to Tenant? | Notes |
|-----------|-------------------|-------|
| PaymentHistory | ✓ | Uses `getPayments()` - returns tenant's only |
| LeaseDetails | ✓ | Uses `getLease()` - single lease per tenant |
| MaintenanceRequest | ✓ | Uses `getMaintenanceRequests()` - filtered |
| TenantResponsibilities | ✓ | Uses `getActiveResponsibilities()` - filtered |

### Language Audit

| Screen | Current Title | Required Title | Status |
|--------|--------------|----------------|--------|
| Dashboard | "Welcome Home, {name}" | ✓ Personal | Correct |
| Payments | "Rent Payments" | "Your Payments" | ✗ Generic |
| Lease | "Lease Details" | "Your Lease" | ✗ Generic |
| Maintenance | "Maintenance Requests" | "Your Maintenance Requests" | ✗ Generic |
| Responsibilities | "Your Responsibilities" | N/A (remove feature) | ✗ Wrong feature |

### Missing Features

| Feature | IA Requirement | Current State |
|---------|----------------|---------------|
| Full Messages screen | Required | Only dashboard preview |
| Payment Methods tab | "TABS: [ Payment History ] [ Payment Methods ]" | Missing |
| Lease tabs | "TABS: [ Documents ] [ Details ] [ Renewal ]" | Single page (no tabs) |

### Features to Remove

| Feature | Reason |
|---------|--------|
| `/responsibilities` route | PM feature, not tenant feature per IA |
| TenantResponsibilities.tsx | Not in tenant IA scope |
| ResponsibilityChecklist.tsx | Not in tenant IA scope |

---

## 6. Settings Components Audit

| Component | Current Access | Required Access |
|-----------|---------------|-----------------|
| PropertyForm.tsx | Owner, PM | Owner only |
| MortgageForm.tsx | Owner, PM | Owner only |
| RentalIncomeForm.tsx | Owner, PM | Owner, PM |
| TaxInfoForm.tsx | Owner, PM | Owner only |
| OwnerForm.tsx | Owner | Owner only |
| PMForm.tsx | PM | PM only |
| TenantForm.tsx | Owner, PM | PM only |

---

## 7. Component Creation Matrix

### New Components Required

| Component | Role | Priority | Complexity |
|-----------|------|----------|------------|
| **RoleBasedRoute.tsx** | All | P0 | Low |
| **OwnerEscalationWidget.tsx** | Owner | P0 | Medium |
| **OwnerEscalationView.tsx** | Owner | P0 | Medium |
| **EscalateToOwnerModal.tsx** | PM | P0 | Medium |
| **PMAlertBar.tsx** | PM | P1 | Low |
| **PMWorkQueue.tsx** | PM | P1 | Medium |
| **PMSLAStatus.tsx** | PM | P1 | Medium |
| **TenantMessagesScreen.tsx** | Tenant | P1 | Medium |
| **PortfolioValueKPI.tsx** | Owner | P2 | Low |
| **OccupancyKPI.tsx** | Owner | P2 | Low |
| **CashFlowChart.tsx** | Owner | P2 | Medium |
| **PMUpdatesSection.tsx** | Owner | P2 | Low |

### Components Requiring Modification

| Component | Change Type | Priority |
|-----------|-------------|----------|
| Layout.tsx | Restructure nav by role | P0 |
| App.tsx | Add RoleBasedRoute to routes | P0 |
| Financials.tsx | Filter tabs by role | P0 |
| Issues.tsx | Owner filter to escalated only | P0 |
| IssueDetailModal.tsx | Add escalate button, owner variant | P0 |
| OwnerDashboard.tsx | Add Attention Needed card | P0 |
| PMDashboard.tsx | Add Alert Bar, Work Queue | P1 |
| PaymentHistory.tsx | Change title to "Your Payments" | P2 |
| LeaseDetails.tsx | Change title to "Your Lease" | P2 |
| MaintenanceRequest.tsx | Change title, integrate with Issues | P2 |

### Components to Remove/Hide

| Component | Action | Reason |
|-----------|--------|--------|
| TenantResponsibilities.tsx | Hide from tenant nav | Not in tenant IA |
| ResponsibilityChecklist.tsx | Keep but restrict to PM | PM feature only |
| Responsibilities.tsx (page) | Restrict to PM | PM feature only |

---

## 8. Route Configuration Summary

### Owner Routes (5)

| Route | Component | New? |
|-------|-----------|------|
| `/` | OwnerDashboard | Existing |
| `/financials` | Financials | Existing |
| `/properties` | Properties | **New page needed** |
| `/documents` | Documents | Existing |
| `/messages` | Messages | Existing |

### PM Routes (8+)

| Route | Component | New? |
|-------|-----------|------|
| `/` | PMDashboard | Existing |
| `/issues` | Issues | Existing |
| `/tenants` | Tenants | Existing (rename from People) |
| `/inspections` | Inspections | **New page needed** |
| `/rent` | Rent | **New page needed** |
| `/vendors` | Vendors | Existing |
| `/leases` | Leases | **New page needed** |
| `/expenses` | Expenses | Existing |

### Tenant Routes (4)

| Route | Component | New? |
|-------|-----------|------|
| `/` | TenantDashboard | Existing |
| `/payments` | PaymentHistory | Existing |
| `/maintenance` | MaintenanceRequest | Existing |
| `/lease` | LeaseDetails | Existing |

### Shared Routes

| Route | Roles | Component |
|-------|-------|-----------|
| `/messages` | All | Messages |
| `/settings` | All (role-specific sections) | Settings |

---

## 9. Security Vulnerabilities Identified

| Vulnerability | Severity | Location | Fix |
|--------------|----------|----------|-----|
| No route guards | High | App.tsx | Add RoleBasedRoute |
| Financials accessible to all | High | /financials | Role guard + tab filtering |
| Owner sees all issues | Medium | Issues.tsx | Filter to escalated only |
| PM can access tax tools | Medium | TaxAnalysis.tsx | Component-level guard |
| Tenant can access /issues | Medium | Issues.tsx | Route redirect |
| Settings sections not filtered | Low | Settings.tsx | Section-level guards |

---

## Summary: Implementation Priorities

### P0 - Critical (Week 1)

1. Create `RoleBasedRoute` component
2. Update `App.tsx` with role-based route protection
3. Restructure `Layout.tsx` navigation per role
4. Add Owner escalation components (Widget, View, Modal)
5. Filter Financials tabs by role

### P1 - High (Week 2)

1. PM Dashboard: Add Alert Bar, Work Queue, SLA Status
2. Owner Dashboard: Add Attention Needed card
3. Create missing PM pages (Inspections, Rent, Leases)
4. Integrate Tenant MaintenanceRequest with Issue system

### P2 - Medium (Week 3)

1. Owner Dashboard: Add Portfolio Value, Occupancy KPIs, Cash Flow chart
2. Tenant: Full Messages screen
3. Language fixes ("Your Payments", etc.)
4. Settings section-level filtering

### P3 - Low (Week 4+)

1. Tenant: Payment Methods tab
2. Tenant: Lease tabs structure
3. PM Updates section for Owner
4. Remove/restrict Responsibilities from tenant

---

*Document generated 2026-02-04 using parallel agent orchestration*
