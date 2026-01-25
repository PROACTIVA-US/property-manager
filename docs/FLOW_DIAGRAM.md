# PropertyManager - Application Flow Diagram

> Visual representation of data flow, user journeys, and system connections

---

## System Overview

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
│  │       │              │              │                │             │   │
│  │       └──────────────┴──────────────┴────────────────┘             │   │
│  │                              │                                      │   │
│  │                    ┌─────────▼─────────┐                           │   │
│  │                    │   AuthContext     │                           │   │
│  │                    │  ┌─────────────┐  │                           │   │
│  │                    │  │ user: User  │  │                           │   │
│  │                    │  │ role: Role  │  │                           │   │
│  │                    │  │ loading     │  │                           │   │
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
│    └──────┬──────┘      └───────┬───────┘     └──────┬──────┘            │
│           │                     │                     │                   │
└───────────┼─────────────────────┼─────────────────────┼───────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
```

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Login     │     │   Auth      │     │  Protected  │
│   Visits    │────▶│   Page      │────▶│  Context    │────▶│   Route     │
│   App       │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   │
                    ┌──────▼──────┐     ┌──────▼──────┐
                    │ Select Role │     │ Load User   │
                    │             │     │ Settings    │
                    │ • Owner     │     │             │
                    │ • PM        │     │ • Name      │
                    │ • Tenant    │     │ • Email     │
                    └──────┬──────┘     │ • Role      │
                           │            └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ localStorage│
                    │             │
                    │ mockUserRole│
                    └─────────────┘

FUTURE OAUTH FLOW:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Login  │───▶│ OAuth   │───▶│Provider │───▶│Callback │───▶│ Create  │
│  Click  │    │ Redirect│    │ Auth    │    │ Handler │    │ Session │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## Data Flow Architecture

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
│  └────────┬────────┘    │ • impactAnalysis│    └────────┬────────┘     │
│           │             │ • vendorId      │──────────────┘              │
│           │             └────────┬────────┘                             │
│           │                      │                                      │
│           │        ┌─────────────┴─────────────┐                       │
│           │        │                           │                       │
│  ┌────────▼────────▼───┐    ┌─────────────────▼───┐                   │
│  │      MESSAGES       │    │     DOCUMENTS       │                   │
│  │   (messages.ts)     │    │   (documents.ts)    │                   │
│  ├─────────────────────┤    ├─────────────────────┤                   │
│  │ • threads[]         │    │ • id                │                   │
│  │ • notifications[]   │    │ • fileName          │                   │
│  │ • inspections[]     │    │ • category          │                   │
│  │ • satisfaction      │    │ • dataUrl (base64)  │                   │
│  └─────────────────────┘    │ • tags[]            │                   │
│                             └─────────────────────┘                   │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      STORAGE LAYER                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │ localStorage│  │  IndexedDB  │  │  Future: Firebase/      │ │  │
│  │  │  (current)  │  │  (planned)  │  │  Supabase Backend       │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

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
└── teachassist-*                   → Help/AI stores (if persisted)
```

---

## Owner User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OWNER USER JOURNEY                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────────────────────────────────────────────┐    │
│  │  Login  │───▶│                    HOME                         │    │
│  │ (Owner) │    │  ┌──────────────────────────────────────────┐  │    │
│  └─────────┘    │  │ "Good morning, Shanie"                    │  │    │
│                 │  │ 14102 129th Ave NE, Kirkland, WA          │  │    │
│                 │  └──────────────────────────────────────────┘  │    │
│                 │  ┌──────────────────────────────────────────┐  │    │
│                 │  │ [Property Image Gallery - Carousel]       │  │    │
│                 │  └──────────────────────────────────────────┘  │    │
│                 │  ┌────────┐ ┌────────┐ ┌────────┐              │    │
│                 │  │$2,400  │ │+$1,200 │ │2 Active│              │    │
│                 │  │Monthly │ │Cash    │ │Projects│              │    │
│                 │  │Rent    │ │Flow    │ │        │              │    │
│                 │  └────────┘ └────────┘ └────────┘              │    │
│                 │  ┌──────────────────────────────────────────┐  │    │
│                 │  │ [Cash Flow Chart - Immediately Visible]   │  │    │
│                 │  └──────────────────────────────────────────┘  │    │
│                 │  ┌──────────────────────────────────────────┐  │    │
│                 │  │ Active Projects:                          │  │    │
│                 │  │ • HVAC Upgrade ████████░░ 80%            │  │    │
│                 │  │ • Paint Touch-up ██░░░░░░░░ Approved     │  │    │
│                 │  └──────────────────────────────────────────┘  │    │
│                 └─────────────────────────────────────────────────┘    │
│                                    │                                    │
│              ┌─────────────────────┼─────────────────────┐             │
│              │                     │                     │             │
│              ▼                     ▼                     ▼             │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐   │
│  │    PROJECTS &     │ │     VENDORS       │ │    FINANCIALS     │   │
│  │   MAINTENANCE     │ │   (Read-Only)     │ │                   │   │
│  ├───────────────────┤ ├───────────────────┤ ├───────────────────┤   │
│  │ • View all projs  │ │ • See who works   │ │ • Cash flow chart │   │
│  │ • See progress    │ │   on property     │ │ • Property value  │   │
│  │ • View costs      │ │ • View ratings    │ │ • Income/expenses │   │
│  │ • See timelines   │ │ • Contact info    │ │ • Mortgage tools  │   │
│  │ • Project images  │ │ • Past work hist  │ │ • Tax planning    │   │
│  │ • Read messages   │ │                   │ │ • AI insights     │   │
│  │ • Add stakeholder │ │ NO: Edit, Delete, │ │                   │   │
│  │   input           │ │ Add vendors       │ │                   │   │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## PM User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PM USER JOURNEY                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────────────────────────────────────────────┐    │
│  │  Login  │───▶│                  DASHBOARD                      │    │
│  │  (PM)   │    │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │    │
│  └─────────┘    │  │ Active  │ │Messages │ │Inspect- │          │    │
│                 │  │ Issues  │ │  (3)    │ │ ions    │          │    │
│                 │  │   2     │ │         │ │  Due    │          │    │
│                 │  └─────────┘ └─────────┘ └─────────┘          │    │
│                 │  ┌──────────────────────────────────────────┐  │    │
│                 │  │ Quick Actions:                           │  │    │
│                 │  │ [+ New Project] [+ Add Vendor] [Message] │  │    │
│                 │  └──────────────────────────────────────────┘  │    │
│                 └─────────────────────────────────────────────────┘    │
│                                    │                                    │
│       ┌────────────┬───────────────┼───────────────┬────────────┐      │
│       │            │               │               │            │      │
│       ▼            ▼               ▼               ▼            ▼      │
│  ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐ ┌─────────┐   │
│  │PROJECTS │ │ VENDORS │    │ TENANTS │    │MESSAGES │ │SETTINGS │   │
│  │& MAINT  │ │(Full)   │    │         │    │         │ │         │   │
│  ├─────────┤ ├─────────┤    ├─────────┤    ├─────────┤ ├─────────┤   │
│  │• Create │ │• Add    │    │• View   │    │• All    │ │• Profile│   │
│  │• Edit   │ │• Edit   │    │• Contact│    │  threads│ │• Notifs │   │
│  │• Delete │ │• Delete │    │• Lease  │    │• Project│ │• Data   │   │
│  │• Kanban │ │• Assign │    │• Requests│   │  msgs   │ │         │   │
│  │• Costs  │ │• Rate   │    │• History│    │• Schedule│ │         │   │
│  │• Assign │ │• History│    │         │    │  inspect│ │         │   │
│  │  vendor │ │         │    │         │    │         │ │         │   │
│  └─────────┘ └─────────┘    └─────────┘    └─────────┘ └─────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Project Data Flow (The Central Hub)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROJECT AS CENTRAL HUB                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         ┌─────────────────┐                             │
│                         │     PROJECT     │                             │
│                         │  "HVAC Upgrade" │                             │
│                         └────────┬────────┘                             │
│                                  │                                       │
│    ┌─────────────────────────────┼─────────────────────────────┐        │
│    │         │         │         │         │         │         │        │
│    ▼         ▼         ▼         ▼         ▼         ▼         ▼        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │Phases│ │Stake-│ │Images│ │Costs │ │Tasks │ │ Docs │ │Msgs  │       │
│ │      │ │holder│ │      │ │      │ │      │ │      │ │      │       │
│ ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤       │
│ │Site  │ │Owner │ │Before│ │Est:  │ │Phase │ │Permit│ │Status│       │
│ │Assess│ │Shanie│ │During│ │$8,500│ │check-│ │Invoice│ │update│       │
│ │Procur│ │PM Dan│ │After │ │Act:  │ │lists │ │Warran│ │Quest-│       │
│ │Remove│ │Tenant│ │      │ │$7,200│ │      │ │ty    │ │ions  │       │
│ │Install│ │Gregg │ │      │ │      │ │      │ │      │ │      │       │
│ │Test  │ │      │ │      │ │      │ │      │ │      │ │      │       │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
│    │                                             │                      │
│    │         ┌─────────────────────────┐         │                      │
│    └────────▶│        VENDOR           │◀────────┘                      │
│              │   "Cool Air HVAC"       │                                │
│              │   Assigned to project   │                                │
│              └─────────────────────────┘                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      IMPACT ANALYSIS                                │ │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐         │ │
│  │  │     TENANT IMPACT       │  │     OWNER IMPACT        │         │ │
│  │  │ Level: Moderate         │  │ Level: Moderate         │         │ │
│  │  │ Duration: 3-4 days      │  │ Cost: $8,500            │         │ │
│  │  │ Recommendations: [...]  │  │ Tax benefit: Yes        │         │ │
│  │  └─────────────────────────┘  └─────────────────────────┘         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      ZUSTAND STORES                              │   │
│  │                                                                   │   │
│  │  ┌─────────────────┐    ┌─────────────────┐                     │   │
│  │  │ aiAssistantStore│    │   helpStore     │                     │   │
│  │  ├─────────────────┤    ├─────────────────┤                     │   │
│  │  │ isOpen          │    │ isOpen          │                     │   │
│  │  │ suggestions[]   │    │ searchQuery     │                     │   │
│  │  │ isLoading       │    │ activeCategory  │                     │   │
│  │  │ currentRoute    │    │ selectedArticle │                     │   │
│  │  │ recentActions   │    │ viewedArticles  │ ← persisted        │   │
│  │  └────────┬────────┘    └────────┬────────┘                     │   │
│  │           │                      │                               │   │
│  │           └──────────┬───────────┘                               │   │
│  │                      │                                           │   │
│  │              ┌───────▼───────┐                                   │   │
│  │              │   ACTIONS     │                                   │   │
│  │              │               │                                   │   │
│  │              │ toggleAssist()│                                   │   │
│  │              │ toggleHelp()  │                                   │   │
│  │              │ refresh()     │                                   │   │
│  │              │ dismiss()     │                                   │   │
│  │              └───────────────┘                                   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    REACT CONTEXT                                 │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                  AuthContext                             │    │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │   │
│  │  │  │ user        │  │ loading     │  │ login()     │     │    │   │
│  │  │  │ • uid       │  │             │  │ logout()    │     │    │   │
│  │  │  │ • email     │  │             │  │             │     │    │   │
│  │  │  │ • name      │  │             │  │             │     │    │   │
│  │  │  │ • role      │  │             │  │             │     │    │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KEYBOARD SHORTCUTS                            │   │
│  │                                                                   │   │
│  │     Cmd+/  ────▶  toggleHelp()                                   │   │
│  │     Cmd+.  ────▶  toggleAssistant()                              │   │
│  │     Escape ────▶  closeHelp(), closeAssistant()                  │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── AuthProvider
│   └── Router
│       ├── KeyboardShortcuts
│       ├── HelpCenter (global)
│       ├── AIAssistant (global)
│       ├── ContextualTip (global)
│       └── Routes
│           ├── /login → LoginPage
│           │
│           └── ProtectedRoute (checks auth)
│               └── Layout
│                   ├── Sidebar
│                   │   ├── Logo
│                   │   ├── Navigation[]
│                   │   │   └── NavItem (role-filtered)
│                   │   ├── AI Assistant Toggle
│                   │   └── UserProfile
│                   │
│                   └── Main Content
│                       ├── / → WelcomePage
│                       │   ├── WelcomeHero
│                       │   ├── QuickStartSection
│                       │   ├── RecentActivitySection
│                       │   └── FeatureOverview
│                       │
│                       ├── /properties → Dashboard
│                       │   ├── OwnerDashboard (role=owner)
│                       │   ├── PMDashboard (role=pm)
│                       │   └── TenantDashboard (role=tenant)
│                       │
│                       ├── /maintenance → Maintenance
│                       │   ├── MaintenanceChecklist
│                       │   └── Expenses
│                       │
│                       ├── /projects → Projects
│                       │   └── ProjectKanban
│                       │       ├── KanbanColumn[]
│                       │       ├── ProjectCard[]
│                       │       └── ProjectDetailModal
│                       │           ├── OverviewTab
│                       │           ├── PhasesTab
│                       │           ├── StakeholdersTab
│                       │           ├── MessagesTab
│                       │           ├── AttachmentsTab
│                       │           └── ImpactTab
│                       │
│                       ├── /vendors → Vendors (PM only currently)
│                       │   ├── VendorList
│                       │   ├── VendorCard
│                       │   └── VendorModal
│                       │
│                       ├── /financials → Financials (Owner only)
│                       │   ├── FinancialsOverview
│                       │   ├── PropertyForm
│                       │   ├── MortgageForm
│                       │   ├── RentalIncomeForm
│                       │   ├── TaxInfoForm
│                       │   ├── TaxAnalysis
│                       │   ├── KeepVsSell
│                       │   └── MortgageCalculator
│                       │
│                       ├── /messages → Messages
│                       ├── /documents → Documents
│                       ├── /tenants → Tenants (PM only)
│                       ├── /settings → Settings
│                       ├── /gallery → Gallery
│                       ├── /responsibilities → Responsibilities
│                       └── /3d-view → View3D
```

---

## Data Inconsistencies to Fix

```
CURRENT ISSUES:
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. OWNER NAME MISMATCH                                                 │
│     ├── settings.ts: DEFAULT_OWNER.name = "Property Owner"              │
│     └── projects.ts: stakeholders[] has "Shanie Holman"                 │
│                                                                          │
│  2. VENDORS NOT VISIBLE TO OWNERS                                       │
│     └── Layout.tsx line 62: roles: ['pm'] only                          │
│                                                                          │
│  3. AI ASSISTANT POSITION                                               │
│     └── Below all nav items, should be at top                           │
│                                                                          │
│  4. FINANCIALS COLOR INCONSISTENCY                                      │
│     └── Green shown for income but with red indicators                  │
│                                                                          │
│  5. WELCOME PAGE SPARSE FOR OWNERS                                      │
│     └── Missing gallery, charts, property snapshot                      │
│                                                                          │
│  6. DOCUMENTS DISCONNECTED                                              │
│     └── Should be contextual to projects                                │
│                                                                          │
│  7. NO LIGHT MODE OPTION                                                │
│     └── Only dark mode available                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Future OAuth Integration Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     OAUTH INTEGRATION PLAN                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CURRENT (MOCK):                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LoginPage                                                       │   │
│  │  └── Select role (owner/pm/tenant)                              │   │
│  │      └── Store in localStorage                                   │   │
│  │          └── AuthContext reads on mount                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  FUTURE (OAUTH):                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LoginPage                                                       │   │
│  │  └── Click "Sign in with Google/Apple"                          │   │
│  │      └── Redirect to OAuth provider                              │   │
│  │          └── Provider returns to callback URL                    │   │
│  │              └── Exchange code for tokens                        │   │
│  │                  └── Create/fetch user record                    │   │
│  │                      └── Set role based on user record           │   │
│  │                          └── AuthContext updated                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  INTEGRATION POINTS:                                                    │
│  ├── src/contexts/AuthContext.tsx                                       │
│  │   └── Add OAuth provider initialization                             │
│  │   └── Add token refresh logic                                       │
│  │   └── Add user profile sync                                         │
│  │                                                                      │
│  ├── src/pages/Login.tsx                                               │
│  │   └── Add OAuth buttons (Google, Apple)                             │
│  │   └── Handle OAuth callbacks                                        │
│  │                                                                      │
│  ├── src/lib/auth.ts (new file)                                        │
│  │   └── OAuth configuration                                           │
│  │   └── Token management                                              │
│  │   └── User profile types                                            │
│  │                                                                      │
│  └── Environment variables                                              │
│      └── VITE_GOOGLE_CLIENT_ID                                         │
│      └── VITE_APPLE_CLIENT_ID                                          │
│      └── VITE_AUTH_CALLBACK_URL                                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

*This flow diagram documents all data connections, user journeys, and system architecture. Use this as the single source of truth for understanding how PropertyManager components interact.*
