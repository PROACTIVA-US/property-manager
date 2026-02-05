# UX Audit: Step 2 - Information Architecture Redesign

**Date:** 2026-02-04
**Status:** Complete
**Previous Step:** [01-role-job-analysis.md](./01-role-job-analysis.md)
**Next Step:** Workflow Mapping

---

## Overview

This document defines the complete Information Architecture (IA) for each role in the PropertyManager application. Based on the role analysis from Step 1, we've designed distinct navigation structures, dashboard layouts, and screen wireframes that give each user exactly what they need - nothing more.

### Design Principles

1. **Role Separation** - Each role has a unique navigation structure
2. **Noun-Based Naming** - Menu items use clear nouns (Payments, Maintenance, Lease)
3. **Minimal Tenant Experience** - Tenants see maximum 4 nav items
4. **Investor Focus for Owners** - Financial metrics, no operational noise
5. **Operational Hub for PMs** - Action-oriented with work queues and SLA tracking
6. **Escalation Clarity** - Clear pathways from PM → Owner for approvals

---

## Navigation Comparison

| Role | Nav Items | Focus |
|------|-----------|-------|
| **Owner** | 5 items | Investment performance, escalations only |
| **PM** | 8 items | Full operational toolkit |
| **Tenant** | 4 items | Rent, maintenance, lease, messages |

### Owner Navigation (5 items)

| Menu Item | Icon | Purpose |
|-----------|------|---------|
| Dashboard | `LayoutDashboard` | Investment overview, alerts, KPIs |
| Financials | `DollarSign` | P&L, cash flow, tax, scenarios |
| Properties | `Building2` | Portfolio view, valuations, equity |
| Documents | `FileText` | Tax docs, reports, contracts |
| Messages | `MessageSquare` | PM communications, approvals |

**Key Difference:** No Issues, Tenants, Vendors, or Maintenance menus. Owner only sees escalated items via Dashboard alerts and Messages > Approvals tab.

### PM Navigation (8 items)

| Menu Item | Icon | Purpose |
|-----------|------|---------|
| Dashboard | `LayoutDashboard` | Command center, work queue, SLAs |
| Issues | `AlertCircle` | Maintenance requests, work orders |
| Tenants | `Users` | Tenant directory, communication |
| Inspections | `ClipboardCheck` | Schedule and document inspections |
| Rent | `CreditCard` | Payment tracking, delinquencies |
| Vendors | `HardHat` | Vendor directory, job history |
| Leases | `FileText` | Active leases, renewals |
| Expenses | `Receipt` | Operational expenses, budgets |

**Key Difference:** No access to Tax Analysis, Keep vs Sell, Equity tracking, or any investment analysis tools.

### Tenant Navigation (4 items)

| Menu Item | Icon | Purpose |
|-----------|------|---------|
| Home | `Home` | Dashboard, rent status, quick actions |
| Payments | `CreditCard` | Payment history, make payment |
| Maintenance | `Wrench` | Submit and track requests |
| Lease | `FileText` | View lease, renewal info |

**Key Difference:** No Financials, Projects, Properties, Tenants, or Vendors. Tenants see only their own data with no filtering controls.

---

## Owner Role IA

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: "Good morning, [Name]" + Notification Bell            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ Net Cash    │ │ Portfolio   │ │ Total       │ │ Occupancy  │ │
│  │ Flow (MTD)  │ │ Value       │ │ Equity      │ │ Rate       │ │
│  │ +$1,450/mo  │ │ $485,000    │ │ $165,000    │ │ 100%       │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│                                                                  │
│  [KPI METRICS - Click any card for drill-down]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────┐ ┌────────────────────────────┐  │
│  │ ATTENTION NEEDED (2)       │ │ PM UPDATES                 │  │
│  │ • Approval: $8,500 HVAC    │ │ • Monthly report ready     │  │
│  │ • Vacancy: 45+ days Unit C │ │ • Lease renewal: Unit A    │  │
│  └────────────────────────────┘ └────────────────────────────┘  │
│                                                                  │
│  [ALERTS + PM MESSAGES - Two columns]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CASH FLOW TREND CHART (12 months)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │     ╭──╮    ╭──╮                                         │   │
│  │  ╭──╯  ╰────╯  ╰──╮    ╭──╮                             │   │
│  │  ╯                 ╰────╯  ╰──                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ANALYSIS TOOLS (Interactive Cards)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Cash Flow│ │ Tax      │ │ Keep vs  │ │ Mortgage │           │
│  │ Analysis │ │ Estimates│ │ Sell     │ │ Payoff   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### KPI Metrics Specification

| Metric | Source | Click Action | Color Logic |
|--------|--------|--------------|-------------|
| Net Cash Flow | Rent - PITI - Utilities | Drill-down modal | Green (+) / Red (-) |
| Portfolio Value | Property settings | Properties screen | Neutral |
| Total Equity | Value - Mortgage | Drill-down modal | Green (growth) |
| Occupancy Rate | Lease status | Properties screen | Green (100%) / Yellow (<100%) |

### Attention Needed Card

Items that appear here:
- **Capital Expense Approvals** (> $500 configurable threshold)
- **Vacancy Alerts** (> 30 days vacant)
- **Lease Expiration Warnings** (< 60 days)
- **PM Escalated Issues** (flagged for owner attention)

Each item shows: Type icon, brief description, property reference, age, and action buttons (Approve/Deny for approvals).

### Owner Financials Screen (Tabs)

| Tab | Content |
|-----|---------|
| **Overview** | Summary metrics, income/expense breakdowns, YoY comparisons |
| **P&L** | Detailed profit & loss statement with line-item detail |
| **Tax** | Schedule E preview, depreciation, deductions, export to accountant |
| **Scenarios** | What-if tools: rent increase modeling, refinance, keep vs sell |

### Owner Properties Screen

Portfolio view showing for each property:
- Address & photo
- Current estimated value
- Equity (Value - Mortgage)
- Monthly cash flow
- Occupancy status
- YoY change indicators

**Property Detail** shows: Summary, Finances, Equity tools, Lease terms (no tenant contact info - PM handles communication).

### Owner Messages Screen (Tabs)

| Tab | Content |
|-----|---------|
| **Inbox** | PM communications, reports, updates |
| **Approvals** | Pending approval requests with Approve/Deny buttons |
| **Sent** | Owner's sent messages |

---

## PM Role IA

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: Property Selector + Today's Date + [+ Quick Add]              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ALERT BAR: "2 issues approaching SLA breach"                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ Open   │ │ Due    │ │ Unread │ │ Overdue│ │ Tenant │               │
│  │ Issues │ │ Today  │ │ Msgs   │ │ Rent   │ │ Satis. │               │
│  │  12    │ │   5    │ │   3    │ │   2    │ │  4.2   │               │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────┐ ┌────────────────────────────┐         │
│  │ TODAY'S WORK QUEUE         │ │ ISSUES BY PRIORITY         │         │
│  │ ☐ 9:00 Inspect Unit 4B     │ │ 🔴 Emergency (1)           │         │
│  │ ☐ 10:30 Plumber @ Unit 2A  │ │ 🟠 Urgent (3)              │         │
│  │ ☐ 2:00 Lease signing       │ │ 🟡 Standard (6)            │         │
│  │ ☐ Call re: late rent       │ │ 🟢 Low (2)                 │         │
│  │ [+ Add Task]               │ │ [View All Issues →]        │         │
│  └────────────────────────────┘ └────────────────────────────┘         │
│                                                                         │
│  ┌────────────────────────────┐ ┌────────────────────────────┐         │
│  │ RECENT MESSAGES            │ │ SLA STATUS                 │         │
│  │ • Sarah Chen (2h ago)      │ │ Emergency: 0/1 at risk     │         │
│  │   "When will the..."       │ │ Urgent: 1/3 approaching ⚠️ │         │
│  │ • Mike Torres (5h ago)     │ │ Standard: 0/6 at risk      │         │
│  │   "Thanks for..."          │ │ Avg Resolution: 2.3 days   │         │
│  │ [View All →]               │ │ [View SLA Report →]        │         │
│  └────────────────────────────┘ └────────────────────────────┘         │
│                                                                         │
│  ┌────────────────────────────┐ ┌────────────────────────────┐         │
│  │ UPCOMING                   │ │ QUICK ACTIONS              │         │
│  │ 📋 3 inspections this week │ │ [+ New Issue]              │         │
│  │ 📄 2 leases expire <60 days│ │ [+ Message Tenant]         │         │
│  │ 💰 Rent due in 5 days      │ │ [+ Schedule Inspection]    │         │
│  │ [View Calendar →]          │ │ [Generate Report]          │         │
│  └────────────────────────────┘ └────────────────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Alert Bar Logic

Appears when any of these conditions are true:
- Any issue within 4 hours of SLA breach
- Any rent payment more than 7 days overdue
- Any emergency issue unassigned for more than 30 minutes
- Any inspection overdue

### PM Issues Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ISSUES                                        [+ New Issue]    │
├─────────────────────────────────────────────────────────────────┤
│  FILTERS: [Status ▼] [Priority ▼] [Unit ▼] [Search...]         │
│                                                                  │
│  TABS: [ Open (12) ] [ In Progress ] [ Awaiting ] [ Closed ]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔴 #1042 - Water heater not working           Unit 2A    │   │
│  │    Reported: 2h ago │ SLA: 4h remaining ⚠️               │   │
│  │    Assigned: ABC Plumbing │ Status: Dispatched           │   │
│  │    [View] [Update] [Escalate] [Message Tenant]           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ 🟠 #1041 - HVAC making noise                  Unit 4B    │   │
│  │    Reported: 1d ago │ SLA: 20h remaining                 │   │
│  │    Assigned: Unassigned │ Status: New                    │   │
│  │    [View] [Assign Vendor] [Update] [Message Tenant]      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Issue Card Data:**
- Priority indicator (color-coded: 🔴🟠🟡🟢)
- Issue ID and title
- Unit/property reference
- SLA countdown with warning states
- Assigned party
- Current status
- Quick action buttons

### PM Escalation Workflow

When PM needs owner approval (expense > $500, legal matter, major repair):

```
┌─────────────────────────────────────────────────────────────────┐
│  ESCALATE TO OWNER                                        [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Issue: #1042 - Water heater not working                        │
│                                                                  │
│  Reason for Escalation:                                          │
│  ○ Expense exceeds threshold ($500+)                            │
│  ○ Requires owner decision                                      │
│  ○ Legal/compliance matter                                      │
│  ○ Other: _______________                                       │
│                                                                  │
│  Message to Owner:                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ The water heater needs replacement. Quote attached.      │   │
│  │ Requesting approval to proceed with $1,200 repair.       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Attachments: [vendor_quote.pdf] [+ Add]                        │
│  ☑ Request response by: [Feb 2, 2026 ▼]                         │
│                                                                  │
│  [Cancel]                               [Send to Owner]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

After escalation, issue card shows:
```
│ Status: ⏳ AWAITING OWNER APPROVAL                              │
│ Escalated: Jan 29 │ Response requested by: Feb 2                │
```

### PM Financial Visibility

**CAN Access:**
- Rent amounts and collection status
- Maintenance expenses and budgets
- Vendor invoices and quotes
- Utility costs
- Monthly expense totals
- Budget vs. actual comparisons

**CANNOT Access:**
- Mortgage payments/balance
- Property equity/value
- Tax deductions/categories
- Keep vs. Sell analysis
- Cap rate / NOI calculations
- Owner's other properties

---

## Tenant Role IA

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back, Gregg                                            │
│  123 Main St, Unit 4B                             [Profile] [🔔]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   RENT STATUS (Hero)                      │   │
│  │                                                           │   │
│  │               $1,850.00 due Feb 1                        │   │
│  │                                                           │   │
│  │          [████████████░░░░] 5 days left                  │   │
│  │                                                           │   │
│  │                 [ PAY NOW ]                               │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ Days Until │ │ Open       │ │ Unread     │ │ Lease Days │   │
│  │ Rent       │ │ Requests   │ │ Messages   │ │ Left       │   │
│  │     5      │ │     2      │ │     1      │ │    234     │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                  │
│  [QUICK STATS - Tap any to navigate]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Lease expires in 60 days - Review renewal options           │
│                                                                  │
│  [CONTEXTUAL ALERT]                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  🔧 Report      │ │  💬 Contact     │ │  📄 View        │   │
│  │     Issue       │ │    Manager      │ │     Lease       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  [QUICK ACTIONS - Large tap targets]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Messages from Property Manager                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ● Scheduled maintenance - Tomorrow 2-4pm     [New]       │   │
│  │ ○ Welcome to your new home!                              │   │
│  │ ○ Parking reminder                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Rent Status Hero Element

- **Green state:** "Paid" badge, next due date shown
- **Yellow state:** Due within 5 days, countdown prominent
- **Red state:** Overdue, "Pay Now" button emphasized, late fee warning

### Tenant Payments Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Payments                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Balance                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  $1,850.00 due February 1                                │   │
│  │                 [ PAY NOW ]                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TABS: [ Payment History ] [ Payment Methods ]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Payment History                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Jan 1, 2026    $1,850.00    ✓ Paid    ACH Auto-pay      │   │
│  │ Dec 1, 2025    $1,850.00    ✓ Paid    Credit Card       │   │
│  │ Nov 1, 2025    $1,850.00    ✓ Paid    ACH Auto-pay      │   │
│  │ Oct 1, 2025    $1,850.00    ✓ Paid    ACH Auto-pay      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [ Download Statement ]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tenant Maintenance Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Maintenance                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [ + New Request ]                                              │
│                                                                  │
│  TABS: [ Open (2) ] [ Completed ] [ All ]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your Open Requests                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔧 Leaky faucet - Kitchen                                │   │
│  │    Submitted Jan 25 • Status: In Progress                │   │
│  │    Tech assigned: Tomorrow 2-4pm                         │   │
│  │    [View Details]                                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ 💡 Light out - Hallway                                   │   │
│  │    Submitted Jan 28 • Status: Scheduled                  │   │
│  │    [View Details]                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### New Maintenance Request Form

```
┌─────────────────────────────────────────────────────────────────┐
│  ← New Request                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  What needs attention?                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Brief description...                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Category                                                        │
│  [Plumbing ▼]                                                   │
│                                                                  │
│  Location in unit                                                │
│  [Kitchen ▼]                                                    │
│                                                                  │
│  Urgency                                                         │
│  ○ Low - When convenient                                        │
│  ● Normal - Within a few days                                   │
│  ○ Urgent - Affecting daily life                                │
│  ○ Emergency - Safety hazard or major damage                    │
│                                                                  │
│  Photos (optional)                                               │
│  [ + Add Photos ] (up to 3)                                     │
│                                                                  │
│  [ Submit Request ]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tenant Lease Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Your Lease                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Lease Status                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ✓ Active                                                 │   │
│  │ March 1, 2025 → February 28, 2026                        │   │
│  │ 234 days remaining                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  TABS: [ Documents ] [ Details ] [ Renewal ]                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Lease Document                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📄 Lease Agreement.pdf                                   │   │
│  │ [ View ] [ Download ]                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Key Terms                                                       │
│  • Monthly rent: $1,850                                         │
│  • Security deposit: $1,850                                     │
│  • Pet policy: No pets                                          │
│  • Parking: 1 space included                                    │
│                                                                  │
│  [ View Move-Out Checklist → ]                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### "My Items" Filtering Strategy

**The tenant never sees filtering controls** because they only have access to their own data.

**Language Patterns:**
- "Your Payments" not "Payment History"
- "Your Maintenance Requests" not "All Requests"
- "Your Lease" not "Leases"

**Empty States use personal language:**
- "You haven't submitted any maintenance requests yet"
- "No messages from your property manager yet"

**No Property Selector:** Unlike Owner/PM views, there is no property dropdown. The tenant is scoped to their single unit.

### Restricted Access Handling

If a tenant navigates to a restricted URL (`/financials`, `/projects`, etc.):

**Behavior:** Redirect to Dashboard with toast notification

```typescript
if (restrictedRoutes.includes(path) && user.role === 'tenant') {
  toast.info("That page isn't available for tenant accounts");
  redirect('/');
}
```

**Restricted Routes for Tenant:**
- `/financials` → Redirect
- `/projects` → Redirect
- `/vendors` → Redirect
- `/tenants` → Redirect
- `/settings/billing` → Redirect

---

## Escalation Workflow Summary

### Escalation Categories

| Category | Trigger | Owner Action |
|----------|---------|--------------|
| **Capital Expense** | > $500 (configurable) | Approve / Deny / Request quotes |
| **Vacancy Alert** | > 30 days | Acknowledge / Request update |
| **Lease Decision** | Renewal/termination | Approve terms / Modify / Decline |
| **Emergency** | PM-designated | Acknowledge / Provide direction |
| **Legal Matter** | Eviction, dispute | Review / Provide direction |

### Visual Priority of Alerts (Owner Dashboard)

| Priority | Color | Examples |
|----------|-------|----------|
| **Critical** | Red | Emergency repairs, legal issues, security |
| **Urgent** | Orange | Capital expense approvals, vacancy >45 days |
| **Attention** | Yellow | Vacancy >30 days, lease expiring <60 days |
| **Info** | Blue | Monthly reports, documents uploaded |

### Escalation Flow

```
PM identifies issue requiring Owner attention
                    ↓
PM creates escalation (selects type, adds context)
                    ↓
Owner sees escalation in:
  1. Push notification (if enabled)
  2. Dashboard "Attention Needed" card
  3. Messages > Approvals tab
  4. Navigation badge
                    ↓
Owner reviews and takes action
(Approve, Deny, Request More Info, Acknowledge)
                    ↓
PM receives Owner's response
```

---

## Implementation Notes

### Navigation Configuration

```typescript
// Owner navigation
const ownerNav = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'financials', label: 'Financials', icon: DollarSign, path: '/financials' },
  { key: 'properties', label: 'Properties', icon: Building2, path: '/properties' },
  { key: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', badge: true },
];

// PM navigation
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

// Tenant navigation
const tenantNav = [
  { key: 'home', label: 'Home', icon: Home, path: '/' },
  { key: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { key: 'lease', label: 'Lease', icon: FileText, path: '/lease' },
];
```

### Role-Based Route Guards

```typescript
const roleRoutes = {
  owner: ['/', '/financials', '/properties', '/documents', '/messages', '/settings'],
  pm: ['/', '/issues', '/tenants', '/inspections', '/rent', '/vendors', '/leases', '/expenses', '/messages', '/settings'],
  tenant: ['/', '/payments', '/maintenance', '/lease', '/messages'],
};

function canAccessRoute(userRole: string, path: string): boolean {
  return roleRoutes[userRole]?.some(route => path.startsWith(route)) ?? false;
}
```

---

## Summary: What Changes

### Owner Changes
- **Remove:** Issues from nav (keep escalations via Alerts)
- **Remove:** Tenants, Vendors from nav
- **Add:** "Attention Needed" card on dashboard
- **Add:** Approvals tab in Messages

### PM Changes
- **Remove:** Tax Analysis, Keep vs Sell, Equity tracking access
- **Add:** Escalation workflow UI
- **Add:** SLA tracking widgets
- **Rename:** "Issues" (not "Projects")

### Tenant Changes
- **Remove:** Financials, Projects from nav entirely
- **Reduce:** Nav to 4 items only
- **Add:** Personal language ("Your Payments")
- **Add:** Restricted access handling

---

## Next Steps

1. **Step 3: Workflow Mapping** - Define key user flows for each role
2. **Step 4: Component Audit** - Identify which components need role-based variants
3. **Step 5: Implementation Plan** - Prioritized list of changes

---

*Document generated 2026-02-04 using parallel agent orchestration*
