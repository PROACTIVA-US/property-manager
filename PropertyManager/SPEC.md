# PropertyManager 2.0 - Complete Developer Handoff Specification

> **Document Version**: 1.0
> **Created**: January 29, 2026
> **Status**: Final Consolidated Spec for Developer Handoff

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Mission & Vision](#mission--vision)
3. [Current State Assessment](#current-state-assessment)
4. [Architecture Overview](#architecture-overview)
5. [User Personas & Data](#user-personas--data)
6. [Property Information](#property-information)
7. [Feature Specifications](#feature-specifications)
8. [Data Models & Types](#data-models--types)
9. [File Structure](#file-structure)
10. [Implementation Status](#implementation-status)
11. [Known Issues & Technical Debt](#known-issues--technical-debt)
12. [API Integrations](#api-integrations)
13. [Development Workflow](#development-workflow)
14. [Testing & Deployment](#testing--deployment)
15. [Future Roadmap](#future-roadmap)

---

## Executive Summary

PropertyManager is a React + TypeScript + Vite web application designed to manage rental properties. It provides role-based dashboards for **Property Owners**, **Property Managers (PMs)**, and **Tenants**, enabling project tracking, financial analysis, issue management, vendor coordination, and 3D property visualization.

### Key Technologies
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand stores + React Context
- **3D Visualization**: Three.js with React Three Fiber
- **AI Integration**: Anthropic Claude API (with mock mode)
- **Storage**: localStorage (with IndexedDB migration path)
- **Deployment Target**: Vercel (static PWA)

### Quick Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Mission & Vision

### Mission Statement
**PropertyManager exists to make rental property ownership simple, informed, and stress-free by connecting owners, property managers, and tenants through a unified, intelligent platform.**

### Core Values

1. **Project-Centric Design**: Everything flows from projects. A property is a collection of projects - past, present, and future.

2. **Context Over Navigation**: Information appears where it's needed, not hidden behind multiple clicks.

3. **Clarity Over Complexity**: One clear overview beats five confusing tabs.

4. **Role-Appropriate Access**: Each user sees what matters to them, nothing more, nothing less.

5. **AI as Assistant, Not Obstacle**: AI enhances decision-making through contextual suggestions.

### Design Principles
- Maximum 2 levels of navigation
- Show the most important information first
- Progressive disclosure via expandable sections
- Consistent color coding:
  - **Green**: positive trend, good status, income
  - **Red**: negative trend, issues, expenses
  - **Orange**: attention needed, action items
  - **Blue**: informational, neutral
  - **Purple**: AI suggestions

---

## Current State Assessment

### Completed Features
- [x] Phase 1: Welcome Hub & Tenant Responsibilities
- [x] Phase 2: Project Management System with Kanban
- [x] Phase 3: 3D Property Viewer with Three.js
- [x] Phase 4 Part 1: AI Types & Services
- [x] Core infrastructure: Zustand stores, hooks, services
- [x] Help Center with Cmd+/
- [x] AI Assistant panel with Cmd+.
- [x] Contextual tips system
- [x] Settings page with all data forms
- [x] Documents page with file upload
- [x] Tenants page with tenant info
- [x] Maintenance checklist system
- [x] Vendor management
- [x] Financial analysis tools
- [x] Role-based dashboards (PM, Owner, Tenant)
- [x] Messaging system

### Not Yet Completed
- [ ] Phase 4 Part 2: AI Project Creator UI components
- [ ] Issue Tracking System (Phase 1B)
- [ ] OAuth authentication (currently mock auth)
- [ ] Light/dark mode toggle
- [ ] PWA conversion with IndexedDB
- [ ] Property Value API integration

---

## Architecture Overview

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROPERTYMANAGER 2.0                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AUTHENTICATION LAYER                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  Mock    │  │  Google  │  │  Apple   │  │  Email/Password  │   │   │
│  │  │  Login   │  │  OAuth   │  │  OAuth   │  │    (Future)      │   │   │
│  │  │(Current) │  │ (Future) │  │ (Future) │  │                  │   │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │   │
│  │       └──────────────┴──────────────┴────────────────┘             │   │
│  │                              │                                      │   │
│  │                    ┌─────────▼─────────┐                           │   │
│  │                    │   AuthContext     │                           │   │
│  │                    │  ┌─────────────┐  │                           │   │
│  │                    │  │ user: User  │  │                           │   │
│  │                    │  │ role: Role  │  │                           │   │
│  │                    │  └─────────────┘  │                           │   │
│  │                    └─────────┬─────────┘                           │   │
│  └──────────────────────────────┼──────────────────────────────────────┘   │
│                                 │                                          │
│                    ┌────────────▼────────────┐                            │
│                    │    ROLE-BASED ROUTER    │                            │
│                    └────────────┬────────────┘                            │
│                                 │                                          │
│           ┌─────────────────────┼─────────────────────┐                   │
│           │                     │                     │                   │
│    ┌──────▼──────┐      ┌───────▼───────┐     ┌──────▼──────┐            │
│    │   OWNER     │      │      PM       │     │   TENANT    │            │
│    │   VIEWS     │      │    VIEWS      │     │   VIEWS     │            │
│    └─────────────┘      └───────────────┘     └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │    SETTINGS     │    │    PROJECTS     │    │    VENDORS      │     │
│  │   (settings.ts) │    │  (projects.ts)  │    │  (vendors.ts)   │     │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤     │
│  │ • owner         │    │ • id            │    │ • id            │     │
│  │ • pm            │    │ • title         │    │ • name          │     │
│  │ • tenant        │    │ • status        │    │ • specialty     │     │
│  │ • property      │    │ • priority      │    │ • status        │     │
│  │ • mortgage      │    │ • phases[]      │    │ • rating        │     │
│  │ • rentalIncome  │    │ • stakeholders[]│    │ • jobHistory[]  │     │
│  │ • taxInfo       │    │ • messages[]    │    │ • estimates[]   │     │
│  │ • personalExp   │    │ • attachments[] │    │                 │     │
│  └─────────────────┘    │ • impactAnalysis│    └─────────────────┘     │
│                         │ • vendorId      │                             │
│                         └─────────────────┘                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      STORAGE LAYER                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│  │  │ localStorage│  │  IndexedDB  │  │  Future: Firebase/      │ │   │
│  │  │  (current)  │  │  (planned)  │  │  Supabase Backend       │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

STORAGE KEYS:
├── propertyManager_settings_v1     → Settings/Property data
├── propertyMgr_projects            → Projects
├── propertyMgr_projectAttachments  → Project images/files
├── propertyMgr_vendors             → Vendors
├── propertyMgr_estimates           → Vendor estimates
├── propertyMgr_jobHistory          → Vendor job history
├── pm_threads                      → Message threads
├── pm_messages                     → Messages
├── pm_inspections                  → Inspections
├── pm_satisfaction                 → Satisfaction ratings
├── pm_notifications                → Notifications
├── property_expenses               → Expenses
├── propertymanager_documents       → Documents
├── propertymanager_boms            → Bill of Materials
├── mockUserRole                    → Current auth role
└── propertyManager_zillow_estimate → Property value data
```

### State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ aiAssistantStore│    │   helpStore     │                     │
│  ├─────────────────┤    ├─────────────────┤                     │
│  │ isOpen          │    │ isOpen          │                     │
│  │ suggestions[]   │    │ searchQuery     │                     │
│  │ isLoading       │    │ activeCategory  │                     │
│  │ currentRoute    │    │ selectedArticle │                     │
│  │ recentActions   │    │ viewedArticles  │ ← persisted        │
│  └─────────────────┘    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    REACT CONTEXT                                 │
├─────────────────────────────────────────────────────────────────┤
│  AuthContext: user, loading, login(), logout()                   │
└─────────────────────────────────────────────────────────────────┘

KEYBOARD SHORTCUTS:
├── Cmd+/  → toggleHelp()
├── Cmd+.  → toggleAssistant()
└── Escape → closeHelp(), closeAssistant()
```

---

## User Personas & Data

### Owner: Shanie Holman

**Role**: Property Owner
**Primary Goal**: See what's happening at the property and understand the current financial situation.

**Default Data** (from `src/lib/settings.ts`):
```typescript
{
  name: 'Shanie Holman',
  email: 'shanie@email.com',
  phone: '(555) 100-0002',
  entityType: 'individual'
}
```

**What Owner Should See**:
- Home: Property snapshot, image gallery, cash flow chart, active projects
- Issues: Read-only view + escalation approvals
- Projects & Maintenance: All projects with costs, timelines, status photos
- Vendors: Read-only view of approved vendors
- Financials: Cash flow chart, property value, income/expenses, mortgage tools

**What Owner Should NOT See**:
- Tenant management controls (PM's job)
- Vendor management CRUD (PM manages, owner views)
- Internal PM workflows

---

### Property Manager: Dan Connolly

**Role**: Property Manager (PM)
**Primary Goal**: Efficiently manage properties, coordinate vendors, keep stakeholders informed.

**Default Data** (from `src/lib/settings.ts`):
```typescript
{
  name: 'Dan Connolly',
  email: 'dan@propertypm.com',
  phone: '(555) 100-0001',
  company: 'Connolly Property Management'
}
```

**What PM Should See**:
- Dashboard: Active issues, messages, inspections due, quick actions
- Issues: Full access - Kanban, triage, assignment, SLA tracking, resolution
- Projects & Maintenance: Full CRUD, Kanban workflow, cost tracking, vendor assignment
- Vendors: Full CRUD - add, edit, delete, assign, rate, history
- Tenants: View, contact, lease management, issue history
- Messages: All threads, project-specific discussions, inspection scheduling

---

### Tenant: Gregg Marshall

**Role**: Tenant
**Primary Goal**: Live comfortably, report issues easily, understand responsibilities.

**Default Data** (from `src/lib/settings.ts`):
```typescript
{
  name: 'Gregg Marshall',
  email: 'gregg@email.com',
  phone: '(555) 100-0003',
  leaseStart: '2024-01-15',
  leaseEnd: '2025-01-14',
  rentAmount: 2400,
  securityDeposit: 4800,
  paymentDueDay: 1
}
```

**What Tenant Should See**:
- Dashboard: Days until rent due, lease status, active issues, recent messages
- Issues: Report new issues with photos, view own issues, track status
- Messages: PM communication, inspection scheduling, important notices
- Responsibilities: What tenant handles vs landlord, emergency contacts

---

## Property Information

### Property Address
```
14102 129th Ave NE
Kirkland, WA 98034
```

### Property Details (from `src/lib/settings.ts`)
```typescript
{
  address: '14102 129th Ave NE',
  city: 'Kirkland',
  state: 'WA',
  zip: '98034',
  propertyType: 'single_family',
  yearBuilt: 1985,
  squareFootage: 1400,
  bedrooms: 3,
  bathrooms: 2,
  lotSize: 7500,
  purchasePrice: 450000,
  purchaseDate: '2018-06-15',
  currentMarketValue: 1089100  // Zillow Zestimate
}
```

### Mortgage Information
```typescript
{
  lender: 'Wells Fargo',
  originalAmount: 360000,
  currentBalance: 285000,
  interestRate: 3.25,
  monthlyPayment: 1567,
  propertyTax: 450,
  insurance: 125,
  pmi: 0,
  startDate: '2018-06-15',
  term: 30
}
```

### Rental Income
```typescript
{
  monthlyRent: 3000,           // Base lease amount
  monthlyUtilities: 300,       // Utilities paid separately by tenant
  includesUtilities: true,     // If true, owner pays utilities (tenant reimburses)
  monthlyPropertyTax: 350,
  monthlyInsurance: 150,
  monthlyHOA: 0,
  monthlyMaintenanceReserve: 200,
  monthlyVacancyReserve: 165,  // 5% of rent
  monthlyManagementFee: 0      // Self-managed
}
```

### Utilities Tracking
```typescript
{
  bills: UtilityBill[],        // Array of monthly utility bills
  overageThreshold: 50         // Alert when actual exceeds stated by this amount
}

interface UtilityBill {
  id: string;
  month: string;               // YYYY-MM format
  amount: number;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}
```

**Utility Tracking Features:**
- Track actual monthly utility costs vs stated amount
- Overage alerts when actual costs exceed threshold
- Bill status tracking (pending, paid, overdue)
- Integration with owner dashboard
- Tenant portal displays utilities breakdown

### Tax Information
```typescript
{
  annualPropertyTax: 5400,
  taxYear: 2024,
  filingStatus: 'married_filing_jointly',
  taxBracket: 24
}
```

---

## Feature Specifications

### Phase 1: Welcome Hub & Tenant Responsibilities (COMPLETE)

**Components**:
- `WelcomeHub.tsx` - Main landing experience
- `NotificationCenter.tsx` - Unified notification system
- `PropertyGallery.tsx` - Property image carousel
- `TenantResponsibilities.tsx` - Lease-based checklist

**Tenant Responsibilities Checklist**:
- Test smoke detectors (Monthly)
- Replace HVAC filter (Quarterly)
- Check CO detector batteries (Monthly)
- Clean dryer vent lint trap (Weekly)
- Report any leaks immediately

---

### Phase 1B: Issue Tracking System (NOT STARTED)

**Purpose**: Track problems to resolution, distinct from messages and projects.

**Issue Status Workflow**:
```
open → triaged → assigned → in_progress → pending_approval → resolved → closed
                                                          ↘ escalated
```

**Issue Priorities with SLA Targets**:
| Priority | Target Resolution |
|----------|-------------------|
| Urgent   | 4 hours           |
| High     | 24 hours          |
| Medium   | 72 hours (3 days) |
| Low      | 168 hours (7 days)|

**Issue Categories**:
- maintenance, safety, pest, noise, appliance
- plumbing, electrical, hvac, exterior
- lease, billing, other

**Key Components to Build**:
```
src/components/issues/
├── IssueList.tsx           # List/Kanban view toggle
├── IssueKanban.tsx         # Kanban board view
├── IssueCard.tsx           # Issue card component
├── IssueCreateForm.tsx     # Create new issue (all roles)
├── IssueDetailModal.tsx    # Full issue details
├── IssueTimeline.tsx       # Activity timeline
├── IssueAssignment.tsx     # Assignment UI (PM only)
├── IssueResolution.tsx     # Resolution form
├── IssueImageUpload.tsx    # Photo upload
└── TenantIssueView.tsx     # Simplified tenant view
```

---

### Phase 2: Project Management System (COMPLETE)

**Project Status Workflow**:
```
draft → pending_approval → approved → in_progress → completed
                                   ↘ on_hold
```

**Project Detail Modal Tabs**:
1. Overview - Summary, status, priority
2. Phases - Milestone tracking with dates
3. Team/Stakeholders - Comments, approvals
4. Messages - Project-specific thread
5. Files/Attachments - Before/during/after photos
6. Impact Analysis - Tenant/owner impact

**Project Categories**:
- improvement, maintenance, repair, upgrade, safety, cosmetic, other

---

### Phase 3: 3D Property Viewer (COMPLETE)

**Technologies**:
- Three.js
- @react-three/fiber
- @react-three/drei

**Features**:
- GLTF/GLB model loading
- Orbit camera controls (rotate, zoom, pan)
- 3D annotation markers linked to projects
- Model library with 13 built-in assets
- Custom model upload

**Asset Categories**:
- landscape: tree_oak, tree_pine, shrub_boxwood, flower_bed, grass_patch
- structure: deck_10x12, deck_12x16, fence_section, pergola, shed_8x10
- exterior: window_double, door_entry, siding_panel, roof_section
- interior: cabinet_base, counter_section, toilet, vanity, tub

**Route**: `/3d-view`

---

### Phase 4: AI Project Creation & BOM (PART 1 COMPLETE)

**Completed Services**:
- `src/types/ai.types.ts` - Complete AI generation types (450+ lines)
- `src/types/bom.types.ts` - Complete BOM types
- `src/lib/ai-generator.ts` - Anthropic Claude API integration
- `src/lib/ai-mock.ts` - Mock AI with 5 project templates
- `src/lib/bom.ts` - BOM calculations, validation, CSV export

**Mock Project Templates**:
1. Deck building (12x16 composite deck)
2. Interior/exterior painting
3. Fence installation
4. HVAC system upgrade
5. Generic home improvement

**UI Components to Build**:
```
src/components/bom/
├── SmartProjectCreator.tsx    # Natural language input form
├── BOMDetailView.tsx          # Display generated BOM
├── BOMCategoryExpander.tsx    # Collapsible category sections
└── BOMExport.tsx              # Download options (CSV)
```

**API Configuration**:
```bash
# Add to .env file for real AI (optional - mock mode works without):
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

---

### Property Value Integration

**Recommended Provider**: ATTOM Data Solutions ($99-$499/month)
- 158M+ U.S. properties
- Property characteristics, valuations, ownership, mortgage records

**Current Implementation**: Manual + Zillow Widget
- In-app widget for manual entry with Zillow link
- Monthly script: `node scripts/get-property-value.cjs`
- Library functions in `src/lib/zillow.ts`

**Zillow Integration Commands**:
```bash
# View current saved value
node scripts/get-property-value.cjs

# Update with new value (number only, no $ or commas)
node scripts/get-property-value.cjs 1089100
```

---

### PWA Conversion (PLANNED)

**Effort**: 4-6 hours

**Key Changes**:
1. Add `public/manifest.json` - App metadata, icons
2. Add `public/sw.js` - Service worker
3. Add `public/icons/` - App icons (192x192, 512x512)
4. Migrate localStorage to IndexedDB using Dexie.js
5. Add InstallPrompt component

**Service Worker Strategy**:
- Cache-first for static assets (JS, CSS, images)
- Offline fallback page
- Background sync (future)

---

## Data Models & Types

### Issue Type Definition
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location?: string;

  // Reporting
  reportedBy: string;
  reportedByName: string;
  reportedByRole: UserRole;
  reportedAt: string;

  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedToType?: 'pm' | 'vendor' | 'tenant';
  assignedAt?: string;
  scheduledDate?: string;

  // Resolution
  resolvedAt?: string;
  resolutionNotes?: string;
  closeReason?: 'resolved' | 'duplicate' | 'wont_fix' | 'invalid';

  // Media
  images: IssueImage[];

  // Cost
  estimatedCost?: number;
  actualCost?: number;
  costPaidBy?: 'owner' | 'tenant' | 'insurance' | 'warranty';

  // Linking
  linkedVendorId?: string;
  linkedProjectId?: string;

  // Activity
  activities: IssueActivity[];

  // SLA
  slaTargetHours?: number;
  slaBreach?: boolean;
}
```

### Project Type Definition
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  status: ProjectStatus;

  // Dates
  startDate?: string;
  endDate?: string;
  estimatedDuration?: string;

  // Cost
  estimatedCost?: number;
  actualCost?: number;

  // Relations
  vendorId?: string;
  phases: ProjectPhase[];
  stakeholders: Stakeholder[];
  messages: ProjectMessage[];
  attachments: ProjectAttachment[];

  // AI Generated
  impactAnalysis?: ImpactAnalysis;
  bom?: BillOfMaterials;
}
```

### BOM Type Definition
```typescript
interface BOMItem {
  id: string;
  name: string;
  description: string;
  category: 'lumber' | 'hardware' | 'electrical' | 'plumbing' |
            'finishing' | 'concrete' | 'decking' | 'roofing' | 'other';
  quantity: number;
  unit: 'each' | 'linear_ft' | 'sq_ft' | 'box' | 'bag' | 'gallon' | 'lb';
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  supplier?: string;
  alternatives?: BOMItem[];
  wasteFactor: number;
}

interface BillOfMaterials {
  projectId: string;
  items: BOMItem[];
  categories: BOMCategory[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  contingency: number;
  laborEstimate?: number;
  grandTotal: number;
  generatedAt: string;
  priceSource: 'ai_estimate' | 'supplier_api' | 'manual';
}
```

---

## File Structure

```
PropertyManager/
├── public/
│   ├── models/                    # 3D model assets
│   ├── icons/                     # PWA icons (to be added)
│   ├── manifest.json              # PWA manifest (to be added)
│   └── sw.js                      # Service worker (to be added)
├── src/
│   ├── components/
│   │   ├── welcome/
│   │   │   ├── WelcomeHub.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── QuickLinks.tsx
│   │   │   ├── WelcomeHero.tsx
│   │   │   ├── QuickStartSection.tsx
│   │   │   ├── RecentActivitySection.tsx
│   │   │   └── FeatureOverview.tsx
│   │   ├── issues/                # Phase 1B (to be built)
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueKanban.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── IssueCreateForm.tsx
│   │   │   ├── IssueDetailModal.tsx
│   │   │   ├── IssueTimeline.tsx
│   │   │   ├── IssueAssignment.tsx
│   │   │   ├── IssueResolution.tsx
│   │   │   ├── IssueImageUpload.tsx
│   │   │   └── TenantIssueView.tsx
│   │   ├── tenant/
│   │   │   ├── TenantResponsibilities.tsx
│   │   │   ├── ResponsibilityChecklist.tsx
│   │   │   └── TenantDashboard.tsx
│   │   ├── projects/
│   │   │   ├── ProjectKanban.tsx
│   │   │   ├── ProjectDetailModal.tsx
│   │   │   ├── ProjectFormModal.tsx
│   │   │   ├── ProjectMessageCenter.tsx
│   │   │   ├── ProjectPhases.tsx
│   │   │   ├── ProjectFiles.tsx
│   │   │   ├── StakeholderManager.tsx
│   │   │   └── ImpactAnalysisView.tsx
│   │   ├── viewer3d/
│   │   │   ├── Property3DViewer.tsx
│   │   │   ├── ModelViewer.tsx
│   │   │   ├── ModelLibrary.tsx
│   │   │   ├── AnnotationMarker.tsx
│   │   │   ├── SceneControls.tsx
│   │   │   └── ModelUploader.tsx
│   │   ├── bom/                   # Phase 4 Part 2 (to be built)
│   │   │   ├── SmartProjectCreator.tsx
│   │   │   ├── BOMDetailView.tsx
│   │   │   ├── BOMCategoryExpander.tsx
│   │   │   └── BOMExport.tsx
│   │   ├── help/
│   │   │   ├── HelpCenter.tsx
│   │   │   └── ContextualTip.tsx
│   │   ├── ai-assistant/
│   │   │   ├── AIAssistant.tsx
│   │   │   └── SuggestionCard.tsx
│   │   ├── role-dashboards/
│   │   │   ├── OwnerDashboard.tsx
│   │   │   ├── PMDashboard.tsx
│   │   │   └── TenantDashboard.tsx
│   │   ├── settings/
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── MortgageForm.tsx
│   │   │   ├── RentalIncomeForm.tsx
│   │   │   └── TaxInfoForm.tsx
│   │   ├── PropertyValueWidget.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── WelcomePage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── Issues.tsx             # Phase 1B (to be built)
│   │   ├── Maintenance.tsx
│   │   ├── Vendors.tsx
│   │   ├── Messages.tsx
│   │   ├── Documents.tsx
│   │   ├── Tenants.tsx
│   │   ├── Settings.tsx
│   │   ├── Financials.tsx
│   │   ├── View3D.tsx
│   │   └── Login.tsx
│   ├── lib/
│   │   ├── settings.ts            # Settings/property data CRUD
│   │   ├── projects.ts            # Projects CRUD
│   │   ├── vendors.ts             # Vendors CRUD
│   │   ├── messages.ts            # Messages CRUD
│   │   ├── documents.ts           # Documents CRUD
│   │   ├── issues.ts              # Issues CRUD (to be built)
│   │   ├── notifications.ts       # Notifications
│   │   ├── property-gallery.ts    # Gallery functions
│   │   ├── model-library.ts       # 3D model library
│   │   ├── ai-generator.ts        # AI project generation
│   │   ├── ai-mock.ts             # Mock AI responses
│   │   ├── bom.ts                 # BOM calculations
│   │   └── zillow.ts              # Property value functions
│   ├── types/
│   │   ├── project.types.ts
│   │   ├── issues.types.ts        # Phase 1B (to be built)
│   │   ├── ai.types.ts
│   │   ├── bom.types.ts
│   │   └── viewer3d.types.ts
│   ├── stores/
│   │   ├── helpStore.ts           # Help Center state
│   │   └── aiAssistantStore.ts    # AI Assistant state
│   ├── hooks/
│   │   ├── useRecentActivity.ts   # Activity aggregation
│   │   ├── useNotifications.ts
│   │   └── useThree.ts
│   ├── services/
│   │   └── suggestionEngine.ts    # AI suggestion generation
│   ├── data/
│   │   ├── helpContent.ts         # Help articles
│   │   └── contextualTips.ts      # Route-based tips
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication context
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind styles
├── scripts/
│   └── get-property-value.cjs     # Zillow update script
├── docs/
│   ├── TRUE_NORTH.md              # Vision & values
│   ├── FLOW_DIAGRAM.md            # System architecture
│   ├── IMPLEMENTATION_PLAN.md     # Consolidated plan (in docs/)
│   ├── CC4_INTEGRATION.md         # UX governance proposal
│   ├── PROPERTY_VALUE_API_RESEARCH.md
│   ├── ZILLOW_INTEGRATION.md
│   ├── UX_IMPLEMENTATION_PLAN.md
│   ├── NEXT_SESSION_PROMPT.md
│   ├── NEXT_SESSION_REQUEST.md
│   ├── CONTINUE_UX_IMPLEMENTATION.md
│   └── plans/
│       ├── PHASE_3_WORKTREE_PLAN.md
│       └── PWA_PLAN.md
├── IMPLEMENTATION_PLAN.md         # Main implementation plan
├── AGENTS.md                      # AI assistant instructions
├── CLAUDE.md                      # Claude Code configuration
├── STATE.md                       # Project state
├── SPEC.md                        # This document
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Implementation Status

### Progress by Phase

| Phase | Description | Status | Branch |
|-------|-------------|--------|--------|
| Phase 1 | Welcome Hub & Tenant Responsibilities | ✅ Complete | main |
| Phase 1B | Issue Tracking System | ❌ Not Started | - |
| Phase 2 | Project Management System | ✅ Complete | main |
| Phase 3 | 3D Property Viewer | ✅ Complete | main |
| Phase 4 Part 1 | AI Types & Services | ✅ Complete | feature/ai-bom |
| Phase 4 Part 2 | AI Project Creator UI | ❌ Not Started | feature/ai-bom |

### Quick Fixes Needed (Priority Order)

1. **Fix Owner Name Display** - settings.ts has "Property Owner" not "Shanie Holman" in some places
2. **Enable Vendors for Owners** - Should be read-only visible (Layout.tsx line 62)
3. **Move AI Assistant** - Currently below settings in navigation, should be at top
4. **Fix Financial Colors** - Inconsistent green/red usage
5. **Add Light Mode** - Currently dark-only

---

## Project Status - What's Already Built

This section provides a comprehensive inventory of all implemented functionality.

### Working Pages (16 Total)

| Page | File | Status | Description |
|------|------|--------|-------------|
| Dashboard | `Dashboard.tsx` | ✅ Complete | Role-based dashboard with dev mode role switcher |
| Welcome | `WelcomePage.tsx` | ✅ Complete | Hero, quick start, recent activity, feature overview |
| Login | `Login.tsx` | ✅ Complete | Role-based login simulation (mock auth) |
| Settings | `Settings.tsx` | ✅ Complete | 9 tabs: Account, PM, Tenant, Property, Mortgage, Rental, Tax, Appearance, Security |
| Financials | `Financials.tsx` | ✅ Complete | 5 tabs: Overview, Property & Mortgage, Rental Income, Tax Planning, Projections |
| Documents | `Documents.tsx` | ✅ Complete | Categories, upload/download, import/export, project linking |
| Expenses | `Expenses.tsx` | ✅ Complete | CSV import, categories, capital improvements, analytics |
| Maintenance | `Maintenance.tsx` | ✅ Complete | Tasks & Checklist tab, Costs & Expenses tab |
| Projects | `Projects.tsx` | ✅ Complete | Project Kanban board wrapper |
| Vendors | `Vendors.tsx` | ✅ Complete | Vendor directory (PM/Owner only) |
| Gallery | `Gallery.tsx` | ✅ Complete | Property photo gallery with upload |
| 3D View | `View3D.tsx` | ✅ Complete | 3D property viewer with annotation support |
| Messages | `Messages.tsx` | ✅ Complete | Threads, search, filtering, inspections, surveys |
| Tenants | `Tenants.tsx` | ✅ Complete | Payment history, requests, lease details, edit/export/import |
| Tenant Portal | `TenantPortal.tsx` | ✅ Complete | Payment, lease, maintenance request forms |
| Responsibilities | `Responsibilities.tsx` | ✅ Complete | Tenant responsibilities management |

### Working Components (47 Total)

**Role-Based Dashboards:**
- `OwnerDashboard.tsx` - Property snapshot, financials, active projects
- `PMDashboard.tsx` - Issues, inspections, messages, quick actions
- `TenantDashboard.tsx` - Rent due, lease status, issues, messages

**Settings Forms (7 forms):**
- `OwnerForm.tsx`, `PMForm.tsx`, `TenantForm.tsx`
- `PropertyForm.tsx`, `MortgageForm.tsx`, `RentalIncomeForm.tsx`, `TaxInfoForm.tsx`

**Project Management:**
- `ProjectKanban.tsx` - Drag-and-drop board (Draft → Completed/Cancelled)
- `ProjectDetailModal.tsx` - Attachments, messages, timeline
- `ProjectFormModal.tsx` - Create/edit with BOM integration
- `ProjectPhases.tsx` - Milestones management
- `ProjectMessageCenter.tsx` - Project-specific messaging
- `StakeholderManager.tsx` - Stakeholder assignments

**BOM (Bill of Materials):**
- `SmartProjectCreator.tsx` - AI-assisted project generation
- `BOMDetailView.tsx` - Detailed BOM display
- `BOMCategoryExpander.tsx` - Expandable category view
- `BOMExport.tsx` - CSV export functionality

**Messaging & Communication:**
- `MessageThread.tsx` - Thread display with history
- `MessageComposer.tsx` - New thread/message creation
- `InspectionScheduler.tsx` - Time voting system
- `SatisfactionSurvey.tsx` - Rating collection

**Maintenance & Responsibilities:**
- `MaintenanceChecklist.tsx` - Full task management with categories
- `MaintenanceRequest.tsx` - Tenant submission form
- `ResponsibilityChecklist.tsx` - Tenant responsibility tracking

**Tenant Management:**
- `PaymentHistory.tsx` - Payment records and status
- `LeaseDetails.tsx` - Lease terms and renewal info
- `TenantResponsibilities.tsx` - Responsibilities overview

**Vendor Management:**
- `VendorDirectory.tsx` - List with search/filter
- `VendorForm.tsx` - Create/edit vendors

**3D Viewer (6 components):**
- `Property3DViewer.tsx` - Full 3D view with controls
- `ModelViewer.tsx` - Model display and interaction
- `ModelUploader.tsx` - Upload 3D models
- `ModelLibrary.tsx` - 187 built-in models
- `AnnotationMarker.tsx` - 3D annotations
- `SceneControls.tsx` - Camera and lighting

**Welcome Hub (7 components):**
- `WelcomeHero.tsx`, `QuickStartSection.tsx`, `RecentActivitySection.tsx`
- `FeatureOverview.tsx`, `PropertyGallery.tsx`, `ImageCarousel.tsx`, `NotificationCenter.tsx`

**Financial Analysis (4 components):**
- `MortgageCalculator.tsx` - Amortization and payoff analysis
- `FinancialComparison.tsx` - Rental vs personal comparison
- `TaxAnalysis.tsx` - Tax impact estimates
- `KeepVsSell.tsx` - Decision analysis with projections

**Utilities:**
- `Layout.tsx` - Main layout with role-based navigation
- `QuickSetupWizard.tsx` - Initial setup flow
- `PropertyValueWidget.tsx` - Zillow integration widget
- `AIAssistant.tsx` - AI suggestion panel (Cmd+.)
- `HelpCenter.tsx` - Help documentation (Cmd+/)
- `ContextualTip.tsx` - Route-based tooltips
- `CSVImport.tsx` - CSV import utility
- `LoadingSpinner.tsx`, `Tooltip.tsx` - UI utilities

### Working Libraries (16 Total)

| Library | Purpose | Status |
|---------|---------|--------|
| `settings.ts` | Owner, PM, Tenant, Property, Mortgage, Rental, Tax data management | ✅ Complete |
| `projects.ts` | Project CRUD, status workflow, stakeholders, attachments, BOM integration | ✅ Complete |
| `maintenance.ts` | Task categories, frequency scheduling, status tracking | ✅ Complete |
| `tenant.ts` | Payments, lease details, maintenance requests, emergency contacts | ✅ Complete |
| `vendors.ts` | Vendor profiles, estimates, job history, favorites | ✅ Complete |
| `financials.ts` | Cash flow, tax estimates, keep vs sell projections | ✅ Complete |
| `mortgage.ts` | Amortization schedules, extra payment analysis | ✅ Complete |
| `messages.ts` | Threads, messages, inspections, surveys, notifications | ✅ Complete |
| `notifications.ts` | 13 notification types, priority levels, read/archive | ✅ Complete |
| `tenant-responsibilities.ts` | Responsibility tracking, frequency, completion records | ✅ Complete |
| `documents.ts` | Upload/download, categories, search, project linking | ✅ Complete |
| `bom.ts` | BOM creation, category organization, item status | ✅ Complete |
| `model-library.ts` | 187 built-in 3D assets, upload, favorites | ✅ Complete |
| `zillow.ts` | Property estimate caching (mock data) | ⚠️ Mock only |
| `ai-generator.ts` | Claude API integration for project/BOM generation | ✅ Complete (needs API key) |
| `ai-mock.ts` | Mock AI with 5 project templates | ✅ Complete |

### State Management

| Store | File | Purpose |
|-------|------|---------|
| AI Assistant | `aiAssistantStore.ts` | Panel state, suggestions, route tracking |
| Help Center | `helpStore.ts` | Search, categories, article selection (persisted) |

### Hooks & Services

| Name | File | Purpose |
|------|------|---------|
| useRecentActivity | `useRecentActivity.ts` | Aggregates activity across projects, BOMs, vendors |
| suggestionEngine | `suggestionEngine.ts` | AI suggestions based on route and actions |

### Feature Completeness Summary

**✅ Fully Functional:**
- Role-based access control (Owner, PM, Tenant)
- Complete settings management (all 9 tabs)
- Document management with project linking
- Maintenance checklist system
- Project Kanban with full workflow
- Vendor directory with estimates/history
- Tenant management (payments, lease, requests)
- Messaging system with threads and notifications
- Inspection scheduling with time voting
- Satisfaction surveys
- Expense tracking with CSV import
- Financial analysis suite
- 3D property viewer with 187 models
- localStorage persistence with import/export
- Keyboard shortcuts (Cmd+/, Cmd+.)
- Responsive dark theme

**⚠️ Partial/Mock:**
- AI Assistant - UI present, suggestion engine is basic
- AI Project Generation - Works with API key, mock fallback available
- Zillow Integration - Returns mock values only
- Light theme - Controls exist but not fully styled
- Quick Setup Wizard - Component exists but not actively used

**❌ Not Started:**
- Issue Tracking System (Phase 1B)
- OAuth authentication
- PWA conversion with IndexedDB
- Property Value API (ATTOM)
- Backend integration

---

## Known Issues & Technical Debt

### Data Inconsistencies

1. **Owner Name Mismatch**
   - `settings.ts`: DEFAULT_OWNER.name may show generic "Property Owner"
   - `projects.ts`: stakeholders[] has "Shanie Holman"

2. **Vendors Hidden from Owners**
   - Location: `Layout.tsx` line 62
   - Fix: Change `roles: ['pm']` to `roles: ['pm', 'owner']`
   - Add read-only mode in `Vendors.tsx`

3. **AI Assistant Position**
   - Current: Below all nav items
   - Target: Top of sidebar, after logo

4. **Financials Color Inconsistency**
   - Issue: Green shown for income but with red indicators in some places
   - Fix: Audit all financial components for consistent color coding

5. **Documents Disconnected**
   - Current: Documents stored separately
   - Target: Documents linked to projects/vendors contextually

6. **No Light Mode Option**
   - Current: Dark mode only
   - Planned: Add theme toggle component

---

## API Integrations

### Current Integrations

1. **Anthropic Claude API** (Optional)
   - Purpose: AI project generation
   - Config: `VITE_ANTHROPIC_API_KEY` environment variable
   - Fallback: Mock mode with 5 project templates

### Planned Integrations

1. **ATTOM Data Solutions** (Recommended for property values)
   - Cost: $99-$499/month
   - Coverage: 158M+ U.S. properties
   - Features: Valuations, ownership, mortgage records

2. **OAuth Providers**
   - Google OAuth
   - Apple Sign-In
   - Environment variables needed:
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_APPLE_CLIENT_ID`
     - `VITE_AUTH_CALLBACK_URL`

---

## Development Workflow

### Git Worktrees

The project uses git worktrees for parallel development:

```bash
# Main worktree
/Users/danielconnolly/Projects/PropertyManager        # main branch

# Feature worktrees
/Users/danielconnolly/Projects/PropertyManager-ai     # feature/ai-bom
/Users/danielconnolly/Projects/PropertyManager-3d     # feature/3d-viewer (merged)
/Users/danielconnolly/Projects/PropertyManager-welcome # feature/welcome-hub (merged)
```

### Worktree Commands

```bash
# List worktrees
git worktree list

# Create new worktree
git worktree add ../PropertyManager-feature feature/feature-name

# Switch to worktree
cd /Users/danielconnolly/Projects/PropertyManager-ai

# Merge feature to main
cd /Users/danielconnolly/Projects/PropertyManager
git checkout main
git merge feature/ai-bom
git push origin main
```

### Commit Message Format

```
feat: implement [feature description]

- Bullet point changes
- Another change

Co-Authored-By: Claude [Model] <noreply@anthropic.com>
```

---

## Testing & Deployment

### Build Verification

```bash
# Clean build test
rm -rf node_modules dist
npm install
npm run build
```

### Deployment (Vercel)

```bash
npm run build
vercel --prod
```

### Testing Checklist

- [ ] `npm run build` succeeds with no errors
- [ ] No TypeScript errors in strict mode
- [ ] All three roles can login (Owner, PM, Tenant)
- [ ] Navigation works for each role
- [ ] Keyboard shortcuts work (Cmd+/, Cmd+.)
- [ ] Mobile responsive check
- [ ] Owner can see vendors (read-only after fix)
- [ ] Financial colors are consistent
- [ ] Projects show progress and costs
- [ ] 3D viewer loads models correctly

---

## Future Roadmap

### Short-Term (Next Sprint)

1. Complete Phase 4 Part 2 - AI Project Creator UI
2. Implement Phase 1B - Issue Tracking System
3. Fix all Quick Fixes (owner name, vendors, AI position, colors)
4. Add light/dark mode toggle

### Medium-Term

1. Implement OAuth authentication (Google, Apple)
2. Convert to PWA with IndexedDB
3. Add Property Value API integration (ATTOM)
4. Enhanced financial reports and charts

### Long-Term

1. Backend migration (Firebase or Supabase)
2. Multi-property support
3. Mobile app (React Native)
4. Supplier API integration for BOM pricing
5. CC4 UX governance integration

---

## Appendix: Environment Variables

```bash
# .env or .env.local

# AI Integration (optional - mock mode works without)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# OAuth (future)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
VITE_AUTH_CALLBACK_URL=https://your-app.vercel.app/callback

# Property Value API (future)
VITE_ATTOM_API_KEY=your_attom_api_key
```

---

## Appendix: Color Scheme (TeachAssist-based)

```css
/* Dark mode (default) */
--color-pm-bg: #0a0b0d;
--color-pm-surface: #12141a;
--color-pm-border: #1e2028;
--color-pm-text: #e5e5e5;
--color-pm-muted: #8b8d98;
--color-pm-accent: #6366f1;

/* Semantic colors */
--color-pm-success: #10b981;
--color-pm-warning: #f59e0b;
--color-pm-error: #ef4444;
--color-pm-info: #3b82f6;

/* Light mode (to be added) */
--color-pm-bg: #ffffff;
--color-pm-surface: #f8fafc;
--color-pm-border: #e2e8f0;
--color-pm-text: #1e293b;
--color-pm-muted: #64748b;
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | Claude | Initial consolidated spec from all documentation |

---

*This document consolidates all project documentation into a single developer handoff specification. For detailed implementation guidance, refer to the individual documents in the `docs/` directory.*
