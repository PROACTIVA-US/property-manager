# UX Audit: Step 3 - Workflow Mapping

**Date:** 2026-02-04
**Status:** Complete
**Previous Step:** [02-information-architecture.md](./02-information-architecture.md)
**Next Step:** Component Audit

---

## Overview

This document maps the key user workflows for each role in the PropertyManager application. Each workflow includes triggers, step-by-step flows, decision points, cross-role touchpoints, and outcome states.

### Workflows by Role

| Owner | PM | Tenant |
|-------|-------|--------|
| Review & Approve Capital Expense | Handle New Maintenance Request | Pay Monthly Rent |
| Monthly Financial Review | Escalate Issue to Owner | Submit Maintenance Request |
| Respond to Vacancy Alert | Handle Late Rent Payment | Track Maintenance Status |
| Tax Season Preparation | Conduct Property Inspection | Emergency Maintenance |
| Keep vs Sell Decision | Process Lease Renewal | View & Understand Lease |
| — | Daily Triage Workflow | Lease Renewal Process |
| — | — | Move-Out Process |

---

## Cross-Role Interaction Map

```
                    ┌─────────────────────────────────────────────────────┐
                    │                     OWNER                           │
                    │  • Approves capital expenses (>$500)                │
                    │  • Reviews PM reports                               │
                    │  • Makes strategic decisions (keep/sell)            │
                    └───────────────────────┬─────────────────────────────┘
                                            │
                    Escalations ↑           │           ↓ Decisions
                    Reports ↑               │           ↓ Approvals
                                            │
                    ┌───────────────────────┴─────────────────────────────┐
                    │                   PROPERTY MANAGER                   │
                    │  • Triages maintenance requests                      │
                    │  • Coordinates vendors                               │
                    │  • Collects rent & handles delinquencies            │
                    │  • Conducts inspections                             │
                    │  • Escalates to Owner when needed                   │
                    └───────────────────────┬─────────────────────────────┘
                                            │
                    Requests ↑              │           ↓ Updates
                    Questions ↑             │           ↓ Scheduling
                                            │
                    ┌───────────────────────┴─────────────────────────────┐
                    │                      TENANT                          │
                    │  • Pays rent monthly                                 │
                    │  • Submits maintenance requests                      │
                    │  • Communicates with PM                              │
                    │  • Views lease & renewal options                     │
                    └─────────────────────────────────────────────────────┘
```

---

# Owner Workflows

## 1. Review and Approve Capital Expense

### Trigger
PM escalates expense > $500 requiring owner approval

### Flow Diagram

```
PM SIDE                                           OWNER SIDE
────────                                          ──────────
[Issue Created]                                        │
      │                                                │
      v                                                │
[PM Reviews Issue]                                     │
      │                                                │
      v                                                │
[Estimate > $500?]───NO──>[PM handles directly]        │
      │                                                │
     YES                                               │
      │                                                │
      v                                                │
[Set Status: 'escalated']──────NOTIFICATION──────>[🔔 Attention Needed]
[Create Message Thread]                                │
      │                                                v
      │                                    [Owner Opens Dashboard/Messages]
      │                                                │
      │                                                v
      │                                    [Review: Description, Photos,
      │                                     Cost Estimate, PM Recommendation]
      │                                                │
      │                                         ┌──────┴──────┐
      │                                         │             │
      │                                     APPROVE        DENY
      │                                         │             │
      v                                         v             v
[PM Receives Response]<─────────────[Status: assigned] [Status: closed]
      │                                                     + reason
      v
[Proceed with Work]
```

### Steps

| Step | Actor | Screen | Action |
|------|-------|--------|--------|
| 1 | PM | Issue Detail | Estimates cost, uploads quotes |
| 2 | PM | Issue Detail | Changes status to `escalated` |
| 3 | PM | Messages | Creates thread with context for Owner |
| 4 | System | — | Notification sent to Owner |
| 5 | Owner | Dashboard | Sees "Attention Needed" badge |
| 6 | Owner | Messages > Approvals | Reviews escalation details |
| 7 | Owner | Messages > Approvals | Clicks Approve or Deny |
| 8 | System | — | Notification sent to PM |
| 9 | PM | Issue Detail | Proceeds or updates tenant |

### Decision Points
- **Approve**: Status changes to `assigned`, PM proceeds with vendor
- **Deny**: Status changes to `closed`, PM notifies tenant
- **Request More Info**: Owner adds comment, status remains `escalated`

---

## 2. Monthly Financial Review

### Trigger
Owner wants to check investment performance (self-initiated)

### Flow Diagram

```
[Owner Opens Dashboard]
         │
         v
┌────────────────────────────────────────────────────────────┐
│  KPI CARDS                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Net Cash  │ │Portfolio │ │Total     │ │Occupancy │      │
│  │Flow +$1.4k│ │Value $485k│ │Equity $165k│ │Rate 100%│      │
│  └────┬─────┘ └──────────┘ └────┬─────┘ └──────────┘      │
└───────┼────────────────────────┼───────────────────────────┘
        │                        │
        v                        v
   [Drill-Down Modal]       [Drill-Down Modal]
   - Rent income            - Market value
   - PITI payment           - Mortgage balance
   - Utilities              - Appreciation
        │
        v
[Analysis Tools Grid]
├── Cash Flow Analysis → /financials?tab=overview
├── Tax Estimates → /financials?tab=tax
├── Keep vs Sell → /financials?tab=projections
└── Mortgage Payoff → /financials?tab=projections
```

### Key Metrics Reviewed

| Metric | Calculation | Click Action |
|--------|-------------|--------------|
| Net Cash Flow | Rent - PITI - Utilities | Drill-down modal |
| Portfolio Value | Property market value | Properties screen |
| Total Equity | Value - Mortgage Balance | Drill-down modal |
| Occupancy Rate | Leased units / Total | Properties screen |

---

## 3. Respond to Vacancy Alert

### Trigger
Property vacant > 30 days (system-generated alert)

### Flow Diagram

```
[System Detects Vacancy > 30 Days]
              │
              v
      [Create Notification]
              │
     ┌────────┴────────┐
     v                 v
  OWNER               PM
[Dashboard]      [Dashboard]
     │                 │
     v                 v
[Attention Needed   [Alert in
 Card]               Queue]
     │
     v
[Review: Days Vacant, Last Tenant, Rental History]
     │
     ├──> [Message PM] → "What's our marketing plan?"
     ├──> [Review Financials] → Impact on cash flow
     └──> [Adjust Rent?] → Settings > Rental
```

### Owner Actions Available

| Action | Screen | Outcome |
|--------|--------|---------|
| Message PM | Messages | Request status update |
| Review Impact | Financials | See cash flow impact |
| Adjust Rent | Settings > Rental | Lower asking rent |
| Acknowledge | Dashboard | Dismiss alert |

---

## 4. Tax Season Preparation

### Trigger
End of year / tax time (Q1 annually)

### Flow Diagram

```
[Tax Season Begins]
         │
         ├──────────────────────────────────────────────────────┐
         │                         │                            │
         v                         v                            v
    [DOCUMENTS]              [FINANCIALS]                 [ACCOUNTS]
    /documents               /financials?tab=tax          /accounts
         │                         │                            │
         v                         v                            v
    Leases Tab               Tax Planning Tab             Account Portals
    - Lease agreements       - TaxAnalysis               - Mortgage 1099
    - Amendments             - Tax Estimates             - Insurance docs
                             - Mitigation                - Property tax
    Receipts Tab             Strategies
    - Expense receipts
    - Repair invoices
         │                         │                            │
         └─────────────────────────┴────────────────────────────┘
                                   │
                                   v
                        [Export Data / Share with Accountant]
                        - Download JSON export
                        - Print tax analysis
                        - Provide portal access
```

### Documents Needed

| Category | Documents | Source |
|----------|-----------|--------|
| **Income** | Lease agreements, Rent receipts | Documents > Leases |
| **Expenses** | Repair invoices, Vendor receipts | Documents > Receipts |
| **Tax Forms** | Schedule E preview, Depreciation | Financials > Tax |
| **Accounts** | Mortgage 1099, Property tax stmt | Accounts |

---

## 5. Keep vs Sell Decision

### Trigger
Owner considering exit strategy

### Flow Diagram

```
[Owner Contemplating Exit]
              │
              v
[Dashboard > Keep vs Sell Tool]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  INPUT ASSUMPTIONS                                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Property Value: $485,000    Mortgage: $320,000          ││
│  │ Monthly Rent: $2,100        PITI: $1,850                ││
│  │ Appreciation: 3%/yr         Alt Return: 7% (S&P)        ││
│  │ Projection Period: [5──────●──────20] 10 years          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  PROJECTION CHART                                            │
│       $800k ┤                                    ╭── Sell    │
│       $600k ┤                            ╭──────╯            │
│       $400k ┤                    ╭──────╯                    │
│       $200k ┤────────────╭──────╯ ←── Keep                   │
│             └────────────────────────────────────────        │
│              Yr1  Yr2  Yr3  Yr4  Yr5  Yr6  Yr7  Yr8  Yr9 Yr10│
└─────────────────────────────────────────────────────────────┘
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  RECOMMENDATION                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✓ Consider Keeping                                       ││
│  │ Property outperforms alternative by $45,000 over 10 yrs ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Analysis Components

| Component | Data | User Control |
|-----------|------|--------------|
| Property Values | Auto-loaded from Settings | Editable |
| Alternative Return | Default 7% (S&P avg) | Slider 2-12% |
| Projection Period | Default 10 years | Slider 5-20 years |
| Recommendation | System-calculated | Read-only |

---

# PM Workflows

## 1. Handle New Maintenance Request

### Trigger
Tenant submits maintenance request

### Flow Diagram

```
[Tenant Submits Request]
         │
         v
[PM Dashboard: New Issue Alert]
         │
         v
┌────────────────────────────────────────┐
│  1. TRIAGE                             │
│  - Review details & photos             │
│  - Set priority (urgent/high/med/low)  │
│  - Verify category                     │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  2. ASSIGN                             │
│  - Select vendor from directory        │
│  - Schedule date/time slot             │
│  - Update status to 'assigned'         │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  3. COMMUNICATE                        │
│  - Message tenant with schedule        │
│  - Notify vendor (external)            │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  4. TRACK                              │
│  - Monitor SLA countdown               │
│  - Update status as work progresses    │
│  - Log activity notes                  │
└────────────────┬───────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    Cost > $500?        NO
         │               │
        YES              v
         │         [5. RESOLVE]
         v         - Add resolution notes
    [ESCALATE]     - Record actual cost
    to Owner       - Upload after photos
         │         - Close issue
         v               │
    [Await           ┌───┘
     Approval]       v
         │      [COMPLETE]
         v
    [Proceed or
     Close]
```

### SLA Targets

| Priority | Target | Warning | Breach |
|----------|--------|---------|--------|
| Urgent | 4 hours | 2 hours | 4 hours |
| High | 24 hours | 18 hours | 24 hours |
| Medium | 72 hours | 48 hours | 72 hours |
| Low | 168 hours | 120 hours | 168 hours |

---

## 2. Escalate Issue to Owner

### Trigger
- Expense exceeds $500 threshold
- Issue requires Owner decision
- Legal/compliance matter
- Major structural repair

### Flow Diagram

```
[PM Identifies Escalation Need]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  PREPARE ESCALATION                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Issue: #1042 - Water heater not working                 ││
│  │ Cost Estimate: $1,200                                   ││
│  │ Vendor Quotes: [ABC Plumbing $1,200] [XYZ $1,450]       ││
│  │ PM Recommendation: "Approve ABC - best price & warranty"││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
              │
              v
[Change Status to 'escalated']
              │
              v
[Create Message Thread with Owner]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  WAITING STATE                                               │
│  - Issue shows "Awaiting Owner Approval"                    │
│  - PM can add comments, upload more quotes                  │
│  - Can send reminder if no response                         │
└─────────────────────────────────────────────────────────────┘
              │
       Owner Responds
              │
     ┌────────┴────────┐
     │                 │
  APPROVED          DENIED
     │                 │
     v                 v
[Status: assigned]  [Status: closed]
[Proceed with      [Add reason]
 work]             [Notify tenant]
```

### Escalation Package

| Component | Required | Source |
|-----------|----------|--------|
| Issue Summary | Yes | Issue title + description |
| Photos | Recommended | Issue images |
| Cost Estimate | Yes | Issue estimatedCost field |
| Vendor Quotes | Recommended | Document uploads |
| PM Recommendation | Yes | Message body |
| Response Deadline | Optional | Message thread |

---

## 3. Handle Late Rent Payment

### Trigger
Rent payment overdue (after 5th of month)

### Flow Diagram

```
                    [Payment Due: 1st of Month]
                              │
                        Days 1-5
                              │
                              v
                    [GRACE PERIOD]
                    Status: 'pending'
                              │
                        Day 6+
                              │
                              v
                    [STATUS: OVERDUE]
                    Dashboard alert appears
                              │
                              v
┌─────────────────────────────────────────────────────────────┐
│  Day 6-10: FIRST REMINDER                                    │
│  - Send friendly reminder message                           │
│  - Reference amount due and late fee policy                 │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Payment            No Response
              Received                 │
                    │                  v
                    v    ┌─────────────────────────────────────┐
             [UPDATE     │  Day 11-15: SECOND REMINDER         │
              STATUS]    │  - Phone call attempt               │
                         │  - Formal written notice            │
                         └─────────────────────────────────────┘
                                       │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              Payment                           Still No Payment
              Received                                  │
                    │                                   v
                    v            ┌─────────────────────────────────────┐
             [UPDATE             │  Day 16+: ESCALATE TO OWNER         │
              STATUS]            │  - Create thread with Owner         │
                                 │  - Discuss next steps               │
                                 │  - Consider eviction process        │
                                 └─────────────────────────────────────┘
```

### Escalation Timeline

| Day | Action | Communication |
|-----|--------|---------------|
| 6 | First reminder | Friendly message |
| 11 | Second reminder | Phone + formal notice |
| 16 | Escalate | Message to Owner |
| 30+ | Legal process | Eviction proceedings |

---

## 4. Conduct Property Inspection

### Trigger
- Quarterly inspection schedule
- Move-in/Move-out inspection
- Complaint-triggered inspection

### Flow Diagram

```
[Inspection Needed]
         │
         v
┌────────────────────────────────────────┐
│  1. SCHEDULE                           │
│  - Create inspection in system         │
│  - Propose times to tenant             │
│  - Wait for tenant confirmation        │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  2. PREPARE                            │
│  - Review previous inspection notes    │
│  - Load checklist template             │
│  - Check for open issues               │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  3. CONDUCT (On-site, mobile)          │
│  - Work through checklist by room      │
│  - Take photos of findings             │
│  - Note condition ratings              │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  4. DOCUMENT                           │
│  - Create issues for problems found    │
│  - Upload photos to issues             │
│  - Complete inspection record          │
└────────────────┬───────────────────────┘
                 │
                 v
┌────────────────────────────────────────┐
│  5. REPORT                             │
│  - Message Owner with summary          │
│  - Update tenant on findings           │
│  - Mark inspection complete            │
└────────────────────────────────────────┘
```

### Checklist Categories

| Category | Items Checked |
|----------|---------------|
| Kitchen | Appliances, sink, cabinets, flooring |
| Bathrooms | Fixtures, plumbing, ventilation |
| HVAC | Filters, operation, vents |
| Safety | Smoke detectors, CO detectors, locks |
| Exterior | Doors, windows, structure |

---

## 5. Process Lease Renewal

### Trigger
Lease expiring within 90 days

### Flow Diagram

```
[Lease Expires in 90 Days]
              │
              v
[PM Notified: Renewal Pipeline]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  1. INITIAL OUTREACH (Day -90)                              │
│  - Message tenant about renewal                             │
│  - Ask about intent to stay                                 │
└─────────────────────────────────────────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
  INTERESTED      NOT INTERESTED
     │                 │
     v                 v
[Consult Owner    [Begin Move-Out
 on Terms]         Process]
     │
     v
┌─────────────────────────────────────────────────────────────┐
│  2. PROPOSE TERMS (Day -60)                                 │
│  - Get Owner approval on rent (if changing)                 │
│  - Present offer to tenant                                  │
└─────────────────────────────────────────────────────────────┘
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  3. NEGOTIATE (Day -45 to -30)                              │
│  - Handle counter-offers                                    │
│  - Finalize terms                                           │
└─────────────────────────────────────────────────────────────┘
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  4. EXECUTE (Day -30 to -15)                                │
│  - Generate new lease document                              │
│  - Collect signatures                                       │
│  - Update system records                                    │
└─────────────────────────────────────────────────────────────┘
```

### Timeline

| Days Before | Milestone |
|-------------|-----------|
| -90 | First renewal notice |
| -75 | Follow up if no response |
| -60 | Consult Owner on terms |
| -45 | Present offer to tenant |
| -30 | Final decision deadline |
| -15 | Execute new lease |

---

## 6. Daily Triage Workflow

### Trigger
PM starts their work day

### Dashboard Priority View

```
┌─────────────────────────────────────────────────────────────┐
│  PM DASHBOARD - 8:00 AM                                      │
├─────────────────────────────────────────────────────────────┤
│  ALERT BAR: "2 issues approaching SLA breach"               │
├─────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │Open    │ │Due     │ │Unread  │ │Overdue │ │Tenant  │    │
│  │Issues  │ │Today   │ │Msgs    │ │Rent    │ │Satis.  │    │
│  │  12    │ │   5    │ │   3    │ │   2    │ │  4.2   │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
├─────────────────────────────────────────────────────────────┤
│  WORK QUEUE                        ISSUES BY PRIORITY       │
│  ☐ 9:00 Inspect Unit 4B           🔴 Emergency (1)          │
│  ☐ 10:30 Plumber @ Unit 2A        🟠 Urgent (3)             │
│  ☐ 2:00 Lease signing              🟡 Standard (6)           │
│  ☐ Call re: late rent             🟢 Low (2)                │
└─────────────────────────────────────────────────────────────┘
```

### Daily Schedule

| Time | Activity | Screen |
|------|----------|--------|
| 8:00 | Check Dashboard | Dashboard |
| 8:15 | Respond to urgent messages | Messages |
| 8:30 | Triage new issues | Issues |
| 9:00 | Coordinate vendors | Vendors |
| 9:30 | Review checklist | Maintenance |
| 10:00+ | Field work | Mobile |
| 4:00 | Update statuses | Various |
| 4:30 | Send Owner report | Messages |

---

# Tenant Workflows

## 1. Pay Monthly Rent

### Trigger
- Rent due date approaching
- Overdue alert on dashboard

### Flow Diagram

```
[Dashboard: Rent Status Card]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │              $1,850.00 due Feb 1                     │   │
│  │         [████████████░░░░] 5 days left              │   │
│  │                  [ PAY NOW ]                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              │
         Click "Pay Now"
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  PAYMENTS SCREEN                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Current Balance: $1,850.00                          │   │
│  │ Due: February 1, 2026                               │   │
│  │              [ PAY RENT NOW ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              │
         Click "Pay Rent Now"
              │
              v
[Processing... 2 seconds]
              │
     ┌────────┴────────┐
     │                 │
  SUCCESS           FAILED
     │                 │
     v                 v
[Toast: "Payment   [Error message]
 Successful!"]     [Retry option]
     │
     v
[Payment History Updated]
[Confirmation # generated]
```

### Status Colors

| Status | Color | Button Text |
|--------|-------|-------------|
| Paid | Green | "Paid for This Month" (disabled) |
| Pending | Default | "Pay Rent Now" |
| Overdue | Red | "Pay Now" (urgent styling) |

---

## 2. Submit Maintenance Request

### Trigger
Tenant discovers issue in unit

### Flow Diagram

```
[Dashboard: "Request Maintenance" Action]
              │
              v
[Maintenance Screen]
              │
              v
[Click "+ New Request"]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  NEW REQUEST FORM                                            │
├─────────────────────────────────────────────────────────────┤
│  Category:                                                   │
│  [Plumbing] [Electrical] [HVAC] [Appliance]                 │
│  [Structural] [Pest] [Other]                                │
├─────────────────────────────────────────────────────────────┤
│  Urgency:                                                    │
│  [Low] [Medium] [High] [🔴 Emergency]                        │
│                                                              │
│  ⚠️ Emergency: "For life-threatening emergencies,            │
│     call 911 first."                                         │
├─────────────────────────────────────────────────────────────┤
│  Title: [___________________________________]                │
│                                                              │
│  Description:                                                │
│  [                                                          ]│
│  [                                                          ]│
├─────────────────────────────────────────────────────────────┤
│  Photos (optional): [ + Add Photos ] (up to 3)              │
├─────────────────────────────────────────────────────────────┤
│                    [ SUBMIT REQUEST ]                        │
└─────────────────────────────────────────────────────────────┘
              │
              v
[Toast: "Request Submitted!"]
              │
              v
[Request appears in list with "Submitted" status]
```

### Urgency Levels

| Level | Color | Response Expectation |
|-------|-------|---------------------|
| Low | Blue | 1-2 weeks |
| Medium | Yellow | 3-5 days |
| High | Orange | 24-48 hours |
| Emergency | Red | Immediate (911 warning shown) |

---

## 3. Track Maintenance Status

### Trigger
Tenant wants update on existing request

### Status Progression

```
[Submitted] ──> [In Progress] ──> [Scheduled] ──> [Completed]
    │               │                 │               │
Yellow icon     Blue icon        Purple icon     Green icon
  Clock          Loader           Calendar        Checkmark
```

### Request Card Information

```
┌─────────────────────────────────────────────────────────────┐
│ [Scheduled]  AC not cooling properly          [Medium]      │
│                                               [Scheduled]   │
│                                                             │
│ The air conditioning unit is running but not cooling...     │
│                                                             │
│ [Wrench] HVAC | Submitted: June 15 | Scheduled: June 20    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Notes from Maintenance:                                  ││
│ │ Technician will arrive between 9am-12pm.                ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Emergency Maintenance

### Trigger
Urgent issue (flooding, no heat, security concern)

### Emergency vs Standard Flow

```
                    [EMERGENCY SITUATION]
                             │
          ┌──────────────────┴──────────────────┐
          │                                      │
[LIFE-THREATENING]                    [PROPERTY EMERGENCY]
(Fire, Gas, etc)                      (Flood, No Heat)
          │                                      │
          v                                      v
    [CALL 911 FIRST]                    [Open App]
          │                                      │
          v                                      v
    [Then report in app]                [Submit Request]
          │                                      │
          └──────────────────┬───────────────────┘
                             │
                             v
                    [Select "Emergency" Urgency]
                             │
                             v
                    [⚠️ Warning: "For life-threatening
                     emergencies, call 911 first."]
                             │
                             v
                    [Complete form & Submit]
                             │
                             v
                    [Request Escalated in PM Queue]
```

---

## 5. Lease Renewal Process

### Trigger
Lease expiring within 60 days

### Flow Diagram

```
[Lease <= 60 Days Remaining]
              │
              v
[Dashboard: Yellow Alert Banner]
"Lease Expiring Soon - Review renewal options"
              │
              v
[Click "View Lease Details"]
              │
              v
┌─────────────────────────────────────────────────────────────┐
│  LEASE SCREEN                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⚠️ Your lease expires in 45 days                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ... lease details ...                                       │
│                                                              │
│  LEASE RENEWAL                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ You are eligible for lease renewal.                  │   │
│  │                                                      │   │
│  │ [ I'm Interested in Renewing ]                       │   │
│  │ [ I'm Planning to Move Out ]                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
  RENEW           MOVE OUT
     │                 │
     v                 v
[Toast: "Interest   [Move-out info
 Recorded!"]         displayed]
     │                 │
     v                 v
[Green confirmation [Checklist
 shown]              shown]
     │
     v
[PM Notified]
[Await new terms]
```

---

## 6. Move-Out Process

### Trigger
Tenant decides not to renew

### Checklist Items

| Item | Deadline |
|------|----------|
| Submit 30-day written notice | 30 days before |
| Cancel/transfer utilities | 5 days before |
| Professional cleaning | Move-out day |
| Return all keys | Move-out day |
| Final walkthrough | Move-out day |
| Provide forwarding address | Move-out day |

### Security Deposit Timeline

| Step | Timeline |
|------|----------|
| Move-out inspection | Move-out day |
| Damage assessment | Within 7 days |
| Itemized statement | Within 14 days |
| Refund issued | Within 30 days |

---

## Summary: Cross-Role Workflow Touchpoints

### Tenant → PM

| Tenant Action | PM Receives |
|---------------|-------------|
| Submit maintenance request | New issue notification |
| Pay rent | Payment confirmation |
| Express renewal interest | Renewal pipeline update |
| Send message | Message notification |

### PM → Owner

| PM Action | Owner Receives |
|-----------|----------------|
| Escalate issue (>$500) | Approval request |
| Send monthly report | Report notification |
| Flag vacancy | Vacancy alert |
| Request lease terms | Lease approval request |

### Owner → PM

| Owner Action | PM Receives |
|--------------|-------------|
| Approve expense | Approval notification |
| Deny expense | Denial with reason |
| Respond to vacancy | Direction/acknowledgment |
| Set rent for renewal | Terms to offer tenant |

---

## Next Steps

1. **Step 4: Component Audit** - Identify which components need role-based variants
2. **Step 5: Implementation Plan** - Prioritized list of changes

---

*Document generated 2026-02-04 using parallel agent orchestration*
