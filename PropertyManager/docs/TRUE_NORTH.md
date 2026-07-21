# PropertyManager - True North Document

> The guiding vision, values, and principles for PropertyManager 2.0

---

## Mission Statement

**PropertyManager exists to make rental property ownership simple, informed, and stress-free by connecting owners, property managers, and tenants through a unified, intelligent platform.**

---

## Core Values

### 1. Project-Centric Design
Everything flows from projects. A property is a collection of projects - past, present, and future. Maintenance tasks, costs, documents, vendors, and communications should all be contextually tied to their projects, not scattered across disconnected pages.

### 2. Context Over Navigation
Information should appear where it's needed, not hidden behind multiple clicks. Documents belong with their projects. Costs belong with their expenses. Vendors appear in the context of the work they're doing.

### 3. Clarity Over Complexity
- One clear overview beats five confusing tabs
- Expandable sections beat navigation mazes
- Consistent visual language (green = good/up, red = bad/down)
- Show the most important information first

### 4. Role-Appropriate Access
Each user sees what matters to them, nothing more, nothing less:
- **Owners** need financial clarity and project visibility
- **Property Managers** need operational control and communication tools
- **Tenants** need transparency and easy communication

### 5. AI as Assistant, Not Obstacle
AI enhances decision-making through contextual suggestions, not through complex wizards. The AI Assistant should be prominent and helpful, not buried at the bottom of navigation.

---

## User Personas & Their True North

### Owner (e.g., Shanie Holman)

**Primary Goal**: See what's happening at my property and understand what my current financial situation regarding this property is.

**True North Values**:
- **Financial Transparency**: At a glance, I should know if my property is making or losing money. Clear charts, not confusing numbers.
- **Project Visibility**: I should see all active projects, their progress, costs, and who's working on them.
- **Vendor Awareness**: I should know who is authorized to work on my property and their track record.
- **Communication**: Important updates should reach me without me having to search for them.
- **Trust but Verify**: I trust my PM, but I want to see what's happening.

**What the Owner Should See**:
```
Home
├── Property snapshot (address, value, key metrics)
├── Image gallery of MY property
├── Cash flow status (immediately visible chart)
├── Active projects with progress
├── Open issues summary
└── Recent important updates

Issues (READ-ONLY + ESCALATIONS)
├── View all issues at MY property
├── Issue resolution metrics
├── Average time to resolution
├── Approve/decide on escalated issues
└── Cost summary for issue resolutions

Projects & Maintenance
├── All projects affecting MY property
├── Each project's costs, timeline, status photos
├── Routine maintenance schedule
└── Historical project archive

Vendors (READ-ONLY)
├── Who's approved to work on my property
├── Their ratings and past work
└── Contact information for emergencies

Financials
├── Immediate visual: Cash flow chart
├── Property value trend
├── Income vs expenses breakdown
├── Issue-related costs tracking
├── Mortgage payoff tools
└── AI-powered insights
```

**What the Owner Should NOT See**:
- Tenant management controls (that's PM's job)
- Vendor management CRUD (PM manages, owner views)
- Internal PM workflows

---

### Property Manager (PM)

**Primary Goal**: Efficiently manage properties, coordinate vendors, and keep owners and tenants informed.

**True North Values**:
- **Operational Efficiency**: Quick access to create, update, and track projects
- **Communication Hub**: Easy messaging with all stakeholders
- **Vendor Management**: Full control over vendor relationships
- **Tenant Relations**: Handle tenant requests and maintain satisfaction
- **Accountability**: Document everything for owner transparency

**What the PM Should See**:
```
Dashboard
├── Active issues requiring attention
├── Pending approvals
├── Upcoming inspections
├── Vendor availability
└── Satisfaction metrics

Issues (FULL ACCESS)
├── All open/active issues
├── Kanban + list views
├── Triage and prioritization
├── Assignment to self/vendor/tenant
├── SLA tracking and breach alerts
├── Resolution workflow
├── Convert to Project capability
└── Issue metrics and history

Projects & Maintenance
├── Full project CRUD capabilities
├── Kanban workflow management
├── Cost tracking and budgets
├── Vendor assignment
├── Stakeholder communication
└── Impact analysis tools

Vendors (FULL ACCESS)
├── Add/edit/remove vendors
├── Track estimates and bids
├── Job history and ratings
├── Emergency contacts
└── Insurance/license tracking

Tenants
├── Tenant information
├── Lease management
├── Issue history per tenant
└── Communication history

Messages
├── All stakeholder threads
├── Project-specific discussions
├── Inspection scheduling
└── Notification management
```

---

### Tenant (e.g., Gregg Marshall)

**Primary Goal**: Live comfortably, report issues easily, understand my responsibilities.

**True North Values**:
- **Easy Reporting**: Submit maintenance requests in seconds
- **Transparency**: Know when work will happen at my home
- **Communication**: Reach PM quickly when needed
- **Clarity**: Understand my lease terms and responsibilities

**What the Tenant Should See**:
```
Dashboard
├── Days until rent due
├── Lease status
├── Active issues (my reported)
└── Recent messages

Issues (MY ISSUES)
├── Report new issue (with photos)
├── View my active issues
├── Track status updates
├── See scheduled work dates
├── View resolution history
└── No access to other tenant issues

Messages
├── PM communication
├── Inspection scheduling
└── Important notices

Responsibilities
├── What I'm responsible for
├── What the landlord handles
└── Emergency contacts
```

---

## Design Principles

### Visual Hierarchy
1. **Most Important First**: Charts and key metrics appear immediately, not after clicking tabs
2. **Progressive Disclosure**: Details expand on demand, not cluttering the initial view
3. **Consistent Color Coding**:
   - Green = positive trend, good status, income
   - Red = negative trend, issues, expenses
   - Orange = attention needed, action items
   - Blue = informational, neutral
   - Purple = AI suggestions

### Navigation Philosophy
- **Flat over Deep**: Maximum 2 levels of navigation
- **Context over Categories**: Information appears where it's relevant
- **AI Prominent**: Assistant accessible via `Cmd+.` and visible in nav
- **Quick Actions**: Common tasks accessible from anywhere

### Component Patterns
- **Cards**: Contained information units with clear boundaries
- **Expandable Sections**: Progressive detail revelation
- **Inline Actions**: Act where you see, not navigate-then-act
- **Contextual Documents**: Documents appear with their related entities

---

## Information Architecture

### Current Problems
1. **Fragmented Data**: Projects, tasks, costs, documents all separate
2. **Hidden Vendors**: Owners can't see who works on their property
3. **Tab Overload**: Financials has 5 tabs with sub-tabs
4. **Buried AI**: Assistant below settings
5. **Disconnected Communication**: Messages separate from context
6. **Generic Display**: Shows "Property" instead of owner name

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPERTYMANAGER 2.0                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                           │
│  │ AI ASSIST   │  ← Prominent, top of sidebar              │
│  └─────────────┘                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                      HOME                            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐              │   │
│  │  │Property │ │ Gallery │ │  Quick  │              │   │
│  │  │Snapshot │ │Carousel │ │ Metrics │              │   │
│  │  └─────────┘ └─────────┘ └─────────┘              │   │
│  │  ┌───────────────────────────────────┐            │   │
│  │  │     Cash Flow Chart (immediate)   │            │   │
│  │  └───────────────────────────────────┘            │   │
│  │  ┌───────────────────────────────────┐            │   │
│  │  │       Active Projects             │            │   │
│  │  └───────────────────────────────────┘            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PROJECTS & MAINTENANCE                  │   │
│  │                                                       │   │
│  │  ┌─ Project Card ─────────────────────────────────┐ │   │
│  │  │ Title: HVAC Upgrade                            │ │   │
│  │  │ Status: In Progress ████████░░ 80%            │ │   │
│  │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │ │   │
│  │  │ │Images│ │Costs │ │Tasks │ │Docs  │         │ │   │
│  │  │ └──────┘ └──────┘ └──────┘ └──────┘         │ │   │
│  │  │ Vendor: Cool Air HVAC                         │ │   │
│  │  │ Timeline: Jan 20 - Jan 30                     │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    VENDORS                           │   │
│  │  (Owner: Read-only | PM: Full CRUD)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   FINANCIALS                         │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ [Chart: Cash Flow - IMMEDIATE]               │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ▼ Property Value                                   │   │
│  │  ▼ Income & Expenses                               │   │
│  │  ▼ Mortgage Tools                                   │   │
│  │  ▼ Tax Planning                                     │   │
│  │  💬 "Ask AI about your finances..."                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Relationships (The Connected Model)

```
Property
├── Owner (displayed prominently)
├── Property Manager
├── Tenant(s)
├── Issues[] ───────────────────────────┐
│   ├── Status workflow                 │ Quick problems
│   ├── Assignment (PM/Vendor/Tenant)   │ needing
│   ├── Photos (before/after)           │ resolution
│   ├── Resolution notes                │
│   ├── Cost tracking                   │
│   ├── SLA tracking                    │
│   └── → Can escalate to Project ──────┼─┐
├── Projects[] ─────────────────────────┤ │
│   ├── Tasks/Checklists               │ │
│   ├── Costs/Expenses                 │ │ Everything
│   ├── Documents (contextual)         │ │ connected
│   ├── Images (before/during/after)   │ │
│   ├── Vendors (assigned)             │ │
│   ├── Stakeholder Input              │ │
│   ├── Messages (project-specific)    │ │
│   └── ← Can originate from Issue ────┼─┘
├── Vendors[] (available pool)          │
├── Financial Data                      │
│   ├── Mortgage                        │
│   ├── Rental Income                   │
│   ├── Expenses → linked to projects/issues
│   └── Tax Info
└── Documents[] (searchable archive)
```

### Issues vs Projects vs Messages

| Concept | Purpose | Lifecycle | Example |
|---------|---------|-----------|---------|
| **Message** | Communication | Ongoing thread | "When is rent due?" |
| **Issue** | Problem tracking | Open → Resolved | "Kitchen faucet leaking" |
| **Project** | Major work | Draft → Complete | "Renovate master bath" |

**Issue → Project escalation**: When an issue reveals larger scope (e.g., "leaky faucet" becomes "replumb entire kitchen"), the PM can convert it to a full project while preserving the issue history.

---

## Success Metrics

### Owner Experience
- Time to understand property status: < 5 seconds
- Time to see active project details: < 10 seconds
- Clicks to reach any information: ≤ 2

### PM Experience
- Time to create new project: < 2 minutes
- Time to update project status: < 30 seconds
- Communication turnaround: Same day

### Tenant Experience
- Time to submit maintenance request: < 1 minute
- Visibility into request status: Real-time
- Understanding of responsibilities: Immediate

---

## Technical True North

### Authentication
- Support OAuth (Google, Apple) for production
- Current mock auth is placeholder only
- Session persistence across browser sessions

### Data Architecture
- Project-centric data model
- localStorage → IndexedDB migration path
- Ready for backend integration (Firebase, Supabase)

### Design System
- TeachAssist color scheme (professional, accessible)
- Light/dark mode toggle
- Consistent component library
- Mobile-responsive

### AI Integration
- Context-aware suggestions
- Financial analysis chat
- Project planning assistance
- Prominent, not hidden

---

## What We Will NOT Do

1. **Over-engineer for edge cases**: Build for the common case first
2. **Add features without purpose**: Every feature must serve a True North value
3. **Create navigation mazes**: If it takes > 2 clicks, rethink it
4. **Hide important information**: Key metrics visible immediately
5. **Separate what belongs together**: Projects contain their tasks, costs, docs
6. **Ignore mobile users**: Responsive from the start
7. **Make AI optional**: AI assistance is core, not add-on

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-25 | Initial True North document |

---

*This document is the single source of truth for PropertyManager's vision. All design and development decisions should align with these principles.*
