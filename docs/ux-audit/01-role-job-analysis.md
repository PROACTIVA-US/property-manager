# UX Audit: Step 1 - Role & Job Analysis

**Date:** 2026-02-04
**Status:** Complete
**Next Step:** Information Architecture Redesign

---

## Overview

This document captures the role and job analysis for the PropertyManager application UX audit. The goal is to transform a cluttered, overlapping dashboard into a clean, role-separated system where each user sees only what they need.

### Application Context
- **Application:** Rental property management platform
- **Tech Stack:** React 19 + TypeScript + Vite + TailwindCSS + IndexedDB
- **User Roles:** Owner, Property Manager (PM), Tenant
- **Current State:** Many overlapping features, cluttered UI, insufficient role separation

---

## Owner Role Analysis

The owner is an **investor** focused on financial performance and long-term asset management. They hire a PM specifically so they don't have to deal with day-to-day operations.

### Primary Jobs to Be Done

| Job | Frequency | Core Question |
|-----|-----------|---------------|
| Monitor investment performance | Weekly | "Is my property making money?" |
| Track property value & equity | Monthly | "What's my asset worth?" |
| Tax planning & preparation | Quarterly/Annual | "How do I minimize my tax burden?" |
| Approve major capital expenditures | As needed | "Is this repair worth the cost?" |
| Decide keep vs sell | Annually | "Should I hold or exit?" |
| Review PM performance | Quarterly | "Is my manager doing their job?" |
| Track expenses for deductions | Ongoing | "What can I write off?" |

### Information Needs Matrix

| Daily | Occasionally | Edge Cases Only |
|-------|--------------|-----------------|
| Net cash flow status | Detailed P&L breakdown | Eviction proceedings |
| Critical alerts (urgent issues, SLA breaches) | Property value comps | Insurance claim details |
| Unread PM messages | Tax analysis tools | Legal/compliance issues |
| — | Mortgage payoff scenarios | Sale preparation docs |
| — | Keep vs Sell projections | Capital gains calculations |
| — | Major project approvals | Lease violation escalations |
| — | Vacancy alerts | — |

### Should NEVER See

| Item | Reason |
|------|--------|
| Day-to-day maintenance tickets | PM's job to handle |
| Vendor scheduling details | Operational noise |
| Minor tenant communications | PM should filter |
| Inspection checklists | Not their workflow |
| Routine work orders | Below their threshold |
| Tenant's personal details beyond lease | Privacy/no need |
| PM's internal task lists | Micromanagement territory |

---

## Property Manager Role Analysis

The PM is an **operations professional** focused on property condition, tenant satisfaction, and efficient coordination. They are the buffer between owner and tenant.

### Primary Jobs to Be Done

| Job | Frequency | Core Question |
|-----|-----------|---------------|
| Triage & resolve maintenance requests | Daily | "What needs fixing today?" |
| Coordinate vendors | Daily | "Who's available and qualified?" |
| Communicate with tenants | Daily | "Are tenants happy and informed?" |
| Track issue SLAs | Daily | "Am I meeting response times?" |
| Schedule & conduct inspections | Monthly | "What's the property condition?" |
| Collect rent / handle delinquencies | Monthly | "Is rent coming in?" |
| Report to owner | Weekly/Monthly | "What does the owner need to know?" |
| Manage lease renewals | As needed | "Is the tenant staying?" |

### Information Needs Matrix

| Daily | Occasionally | Edge Cases Only |
|-------|--------------|-----------------|
| Open issues by priority | Tenant payment history | Eviction process steps |
| Today's scheduled tasks | Vendor performance reviews | Legal documentation |
| Unread tenant messages | Monthly expense reports | Owner override requests |
| SLA breach warnings | Lease renewal pipeline | Emergency escalation to owner |
| Maintenance queue | Inspection history | Insurance claim filing |
| Vendor contact info | Property condition trends | Major capital project mgmt |

### Should NEVER See

| Item | Reason |
|------|--------|
| Owner's tax situation | Not their business |
| Keep vs Sell analysis | Investment decision, not ops |
| Owner's equity/appreciation details | Financial privacy |
| Capital gains calculations | Tax professional territory |
| Owner's other properties | Out of scope |
| Owner's personal financial comparisons | Irrelevant to their job |

---

## Tenant Role Analysis

The tenant is a **resident** focused on paying rent, getting issues fixed, and understanding their responsibilities. They want a responsive, transparent experience.

### Primary Jobs to Be Done

| Job | Frequency | Core Question |
|-----|-----------|---------------|
| Pay rent on time | Monthly | "How much and when is rent due?" |
| Submit maintenance requests | As needed | "How do I report a problem?" |
| Track maintenance status | As needed | "When will this get fixed?" |
| View payment history | Occasionally | "Did my payment go through?" |
| Understand lease terms | Rarely | "What are my responsibilities?" |
| Communicate with PM | As needed | "How do I reach my manager?" |
| Plan for renewal/move-out | End of lease | "What happens next?" |

### Information Needs Matrix

| Daily | Occasionally | Edge Cases Only |
|-------|--------------|-----------------|
| Days until rent due | Full payment history | Move-out checklist |
| Open maintenance request status | Lease document | Security deposit return process |
| Unread messages from PM | Tenant responsibilities | Dispute resolution |
| — | How to submit maintenance | Emergency after-hours contact |
| — | Renewal eligibility | Lease violation notices |
| — | Utility responsibility info | Early termination process |

### Should NEVER See

| Item | Reason |
|------|--------|
| Owner's identity (unless required by law) | Privacy |
| Property financial data | None of their business |
| Property value or equity | Irrelevant |
| Vendor costs or invoices | Not their concern |
| Other tenants' information | Privacy |
| PM-to-Owner communications | Internal |
| Owner's tax analysis | Completely irrelevant |
| Project budgets/cost breakdowns | Internal |
| Any financial analysis tools | Owner-only |

---

## Summary Comparison Table

| Capability | Owner | PM | Tenant |
|------------|:-----:|:--:|:------:|
| **Financial Dashboard** | ✅ Full | ⚠️ Expense tracking only | ❌ |
| **Cash Flow Analysis** | ✅ | ❌ | ❌ |
| **Tax Planning** | ✅ | ❌ | ❌ |
| **Keep vs Sell** | ✅ | ❌ | ❌ |
| **Property Value** | ✅ | ❌ | ❌ |
| **Issue Management** | ⚠️ Escalations only | ✅ Full | ⚠️ Submit & track own |
| **Vendor Management** | ❌ | ✅ Full | ❌ |
| **Maintenance Queue** | ❌ | ✅ | ⚠️ Own requests only |
| **Inspection Scheduling** | ❌ | ✅ | ❌ |
| **Tenant Communications** | ❌ | ✅ | ⚠️ With PM only |
| **Rent Collection Status** | ⚠️ Summary | ✅ Detailed | ✅ Own only |
| **Lease Management** | ⚠️ Approvals | ✅ Full | ⚠️ View own |
| **Documents** | ✅ Financial/legal | ✅ Operational | ⚠️ Lease & tenant docs |
| **Messages** | ⚠️ From PM only | ✅ All parties | ⚠️ With PM only |
| **Settings** | ✅ Property/financial | ⚠️ Operational | ⚠️ Personal only |

**Legend:** ✅ Full access | ⚠️ Limited/filtered | ❌ No access

---

## Current App Problems Identified

### 1. Owner Sees Too Much Operational Noise
- Full access to Issues system when they should only see escalations
- Can see day-to-day maintenance that PM should handle
- Vendor details visible when not needed

### 2. PM Sees Owner's Financial Analysis
- Tax planning tools visible to PM
- Keep vs Sell analysis accessible
- Equity tracking and property value details exposed

### 3. Tenant Has Excessive Access
- Currently has access to Financials page
- Can see Projects (should only see own maintenance requests)
- Navigation not sufficiently restricted

### 4. Navigation Is Nearly Identical Across Roles
- Owner and PM have the exact same menu structure
- Role-based filtering exists but is too permissive
- No clear separation of concerns in UI

### 5. Missing Escalation Workflows
- Issues don't have clear owner-escalation paths
- No threshold-based alerts (only critical issues to owner)
- PM can't easily "flag for owner attention"

### 6. No "My Items" Filtering
- Tenant should only see their own requests
- No personalized views based on "assigned to me" or "reported by me"

---

## Next Steps

1. **Step 2: Information Architecture Redesign** - Propose clean navigation structure per role
2. **Step 3: Workflow Mapping** - Define key user flows for each role
3. **Step 4: Component Audit** - Identify which components need role-based variants
4. **Step 5: Implementation Plan** - Prioritized list of changes

---

## Appendix: Current Feature Inventory

### Existing Modules (from codebase analysis)
- Authentication (mock + Google OAuth)
- Role-based dashboards (Owner, PM, Tenant)
- Settings management (property, mortgage, rental, tax, utilities)
- Financials (cash flow, equity, tax planning, keep vs sell)
- Issues tracking (full CRUD, Kanban, SLA)
- Projects management (phases, stakeholders, impact analysis)
- Vendor directory
- Messages/communication hub
- Documents management
- 3D property viewer
- AI assistant
- Help center
- PWA support

### Data Models
- PropertyData, MortgageData, RentalIncomeData, TaxInfoData
- Issue, IssueActivity, IssueImage
- Project, ProjectPhase, ImpactAnalysis
- Lease, MaintenanceRequest, Payment
- Vendor, Message, Thread, Document
