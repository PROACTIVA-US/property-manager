# PropertyManager 2.0 - Complete Implementation Plan

## Vision Summary

Transform PropertyManager from a basic property management tool into an intelligent property enhancement platform with:
- **Smart Welcome Hub** - Notifications, quick links, property gallery
- **Interactive 3D Visualization** - View and plan property improvements in 3D
- **AI-Powered Project Creation** - Natural language project generation with complete BOMs
- **Role-Specific Experiences** - Tailored views for PM, Owner, and Tenant

---

## Current State (Completed)

These features are already implemented:
- [x] Settings page with all data forms
- [x] Documents page with file upload
- [x] Tenants page with tenant info
- [x] Maintenance checklist system
- [x] Vendor management
- [x] Financial analysis tools
- [x] Role-based dashboards (PM, Owner, Tenant)
- [x] Messaging system

---

## Phase Overview

| Phase | Focus | Duration | Complexity |
|-------|-------|----------|------------|
| **Phase 1** | Welcome Hub & Tenant Responsibilities | 1-2 weeks | Medium |
| **Phase 1B** | Issue Tracking System | 1-2 weeks | Medium |
| **Phase 2** | Enhanced Project System & Kanban | 1-2 weeks | Medium |
| **Phase 3** | 3D Viewer Integration | 2-3 weeks | High |
| **Phase 4** | AI Project Creation & BOM | 2-3 weeks | High |

---

## Phase 1: Welcome Hub & Tenant Responsibilities

### Goals
- Create a welcoming landing experience
- Establish unified notification center
- Build property image gallery
- Tenant-specific responsibility view
- Set up worktree development workflow

### Features

#### 1.1 Welcome Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome, Dan                              [Notifications 🔔]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 📋 Projects │  │ 🔧 Vendors  │  │ 📊 Financials│         │
│  │   3 Active  │  │  4 Active   │  │  View Report │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🏠 Property Gallery                    [View 3D →]  │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                 │  │
│  │  │    │ │    │ │    │ │    │ │    │  ← Carousel     │  │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐  ┌────────────────────────────┐   │
│  │ Recent Notifications│  │ Active Projects            │   │
│  │ • HVAC update...    │  │ • HVAC Upgrade [In Progress]│   │
│  │ • Rent received...  │  │ • Paint Touch-up [Approved] │   │
│  └─────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 Notification Center
- Unified notification system
- Categories: Projects, Maintenance, Messages, Payments
- Mark as read/unread, archive
- Push notification ready (future)

#### 1.3 Property Image Gallery
- Upload property photos (exterior, interior, rooms)
- Categorize by area (Front, Kitchen, Bedroom 1, etc.)
- Before/After comparisons for projects
- Lightbox viewer with zoom
- Carousel on dashboard

#### 1.4 Tenant-Specific View
Tenants see ONLY:
- Their responsibilities from lease (smoke detectors, filters, etc.)
- Checklist of delegated maintenance items
- Way to report issues
- Payment portal
- Messages

```
┌─────────────────────────────────────────────────────────────┐
│  👋 Welcome, Gregg                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Your Responsibilities                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☐ Test smoke detectors (Monthly)                    │   │
│  │ ☐ Replace HVAC filter (Quarterly)                   │   │
│  │ ☐ Check CO detector batteries (Monthly)             │   │
│  │ ☐ Clean dryer vent lint trap (Weekly)               │   │
│  │ ✓ Report any leaks immediately                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💰 Rent Status                     📬 Messages (2 new)    │
│  ┌─────────────────┐                ┌─────────────────┐    │
│  │ Due: Feb 1      │                │ From: Dan       │    │
│  │ Amount: $2,400  │                │ Re: HVAC Update │    │
│  │ [Pay Now]       │                │ [View All]      │    │
│  └─────────────────┘                └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Technical Tasks
- [ ] Create `WelcomeHub` component
- [ ] Build `NotificationCenter` component
- [ ] Implement `PropertyGallery` with image upload
- [ ] Create `TenantResponsibilities` component
- [ ] Create `ResponsibilityChecklist` with lease-based items
- [ ] Add notification aggregation from all sources
- [ ] Update routing to use WelcomeHub as default

---

## Phase 1B: Issue Tracking System

### Goals
- Create a dedicated issue tracking system distinct from messages and projects
- Enable tenants to easily report problems with photo documentation
- Give PM tools to triage, assign, and resolve issues efficiently
- Provide owner visibility into property issues and resolution metrics

### Why Issues ≠ Messages ≠ Projects

| Aspect | Messages | Issues | Projects |
|--------|----------|--------|----------|
| **Purpose** | Communication threads | Track problems to resolution | Plan & execute improvements |
| **Lifecycle** | Ongoing conversation | Open → Resolved → Closed | Draft → Approved → Completed |
| **Scope** | Any topic | Specific problem/request | Major work with phases |
| **Assignment** | N/A | Single responsible party | Vendor + stakeholders |
| **Duration** | Indefinite | Days to weeks | Weeks to months |
| **Cost** | N/A | Optional (minor repairs) | Required (budgeted) |
| **Example** | "When is rent due?" | "Kitchen faucet leaking" | "Renovate master bath" |

### Features

#### 1B.1 Issue List View (Kanban + List Toggle)
```
┌─────────────────────────────────────────────────────────────┐
│  Issues                           [+ New Issue] [🔍 Filter] │
├─────────────────────────────────────────────────────────────┤
│  [Kanban View] [List View]                                  │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │  Open   │ │ Triaged │ │Assigned │ │In Prog  │ │Resolved│ │
│  │   (3)   │ │   (2)   │ │   (4)   │ │   (2)   │ │  (12) │ │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├───────┤ │
│  │┌───────┐│ │┌───────┐│ │┌───────┐│ │┌───────┐│ │       │ │
│  ││🔴 Leak││ ││🟡 Door││ ││🟢 Light││ ││🔴 HVAC││ │       │ │
│  ││Kitchen││ ││Squeaks││ ││Fixture││ ││Filter ││ │       │ │
│  │└───────┘│ │└───────┘│ │└───────┘│ │└───────┘│ │       │ │
│  │┌───────┐│ │         │ │┌───────┐│ │         │ │       │ │
│  ││🟡 Pest││ │         │ ││🟡 Yard││ │         │ │       │ │
│  ││Concern││ │         │ ││Maint. ││ │         │ │       │ │
│  │└───────┘│ │         │ │└───────┘│ │         │ │       │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 1B.2 Issue Creation Form (All Roles)
```
┌─────────────────────────────────────────────────────────────┐
│  Report an Issue                                       [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What's the issue? *                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Kitchen faucet is leaking constantly                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Describe the problem:                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ The kitchen faucet has been dripping for 2 days.    │   │
│  │ Getting worse - now a steady stream when off.       │   │
│  │ Water pooling under sink.                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Category:        [Maintenance ▼]                           │
│  Priority:        [High ▼]        (🔴 = urgent, affects    │
│                                    habitability)            │
│  Location:        [Kitchen ▼]                               │
│                                                             │
│  📷 Add Photos:                                             │
│  ┌──────┐ ┌──────┐ ┌──────────────────────────────────┐   │
│  │ 📸   │ │ 📸   │ │  + Add Photo                     │   │
│  │photo1│ │photo2│ │  (helps us understand the issue) │   │
│  └──────┘ └──────┘ └──────────────────────────────────┘   │
│                                                             │
│  [Cancel]                              [Submit Issue]       │
└─────────────────────────────────────────────────────────────┘
```

#### 1B.3 Issue Detail View (PM/Owner)
```
┌─────────────────────────────────────────────────────────────┐
│  Issue #42: Kitchen Faucet Leaking             [Edit] [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: [In Progress ▼]        Priority: 🔴 High           │
│  Category: Maintenance          Location: Kitchen           │
│  Reported: Jan 24, 2026         By: Gregg Marshall (Tenant) │
│  SLA: ⚠️ 18 hours (high priority = 24hr target)            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📝 Description:                                            │
│  The kitchen faucet has been dripping for 2 days. Getting   │
│  worse - now a steady stream when off. Water pooling under  │
│  sink.                                                      │
│                                                             │
│  📷 Photos (2):                                             │
│  ┌──────────┐ ┌──────────┐                                 │
│  │ [Photo1] │ │ [Photo2] │                                 │
│  │  Faucet  │ │  Under   │                                 │
│  │  drip    │ │  sink    │                                 │
│  └──────────┘ └──────────┘                                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  👤 Assignment:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Assigned to: ProPlumb LLC (Vendor)                  │   │
│  │ Contact: Mike - (555) 123-4567                      │   │
│  │ Assigned: Jan 24, 2026 by Dan (PM)                  │   │
│  │ Scheduled: Jan 25, 2026 @ 2:00 PM                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💰 Cost Estimate: $150-200 (faucet cartridge replacement)  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📋 Activity Timeline:                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Jan 24, 4:30 PM - Scheduled vendor visit for 1/25   │   │
│  │ Jan 24, 3:15 PM - Assigned to ProPlumb LLC          │   │
│  │ Jan 24, 2:00 PM - Triaged: High priority (water)    │   │
│  │ Jan 24, 1:45 PM - Issue created by Gregg Marshall   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💬 Add Note: [________________________________] [Add]      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Actions:                                                   │
│  [Reassign] [Escalate to Owner] [Convert to Project]       │
│  [Mark Resolved]                                            │
└─────────────────────────────────────────────────────────────┘
```

#### 1B.4 Issue Resolution Flow
```
┌─────────────────────────────────────────────────────────────┐
│  Resolve Issue #42                                     [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resolution Summary: *                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Replaced faucet cartridge. Leak stopped. Tested     │   │
│  │ for 10 minutes, no drips. Cleaned up water damage   │   │
│  │ under sink - no mold detected.                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📷 After Photos:                                           │
│  ┌──────┐ ┌──────────────────────────────────────────┐     │
│  │ 📸   │ │  + Add completion photo                  │     │
│  │after1│ │  (shows issue resolved)                  │     │
│  └──────┘ └──────────────────────────────────────────┘     │
│                                                             │
│  Final Cost: [$175.00_______]                               │
│  Paid By:    [Owner expense ▼]                              │
│                                                             │
│  Vendor Rating (optional):                                  │
│  ★ ★ ★ ★ ☆  (4/5)                                          │
│  Quick response, professional work.                         │
│                                                             │
│  [Cancel]                              [Mark Resolved]      │
└─────────────────────────────────────────────────────────────┘
```

#### 1B.5 Tenant Issue View (Simplified)
```
┌─────────────────────────────────────────────────────────────┐
│  My Issues                               [+ Report Issue]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Active Issues (2)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Kitchen Faucet Leaking                           │   │
│  │ Status: In Progress • Vendor scheduled 1/25 @ 2 PM  │   │
│  │ [View Details]                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 Bedroom Door Squeaks                             │   │
│  │ Status: Assigned to PM • Est. fix this week        │   │
│  │ [View Details]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ▼ Resolved Issues (5) - Click to expand                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation

#### Data Types
```typescript
// Issue Status Workflow
type IssueStatus =
  | 'open'              // Just reported
  | 'triaged'           // PM reviewed, priority set
  | 'assigned'          // Assigned to party
  | 'in_progress'       // Work started
  | 'pending_approval'  // Work done, needs verification
  | 'resolved'          // Successfully resolved
  | 'closed'            // Closed (resolved or won't fix)
  | 'escalated';        // Escalated to owner

type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

type IssueCategory =
  | 'maintenance'       // Repairs, fixes
  | 'safety'            // Safety concerns
  | 'pest'              // Pest issues
  | 'noise'             // Noise complaints
  | 'appliance'         // Appliance problems
  | 'plumbing'          // Plumbing specific
  | 'electrical'        // Electrical specific
  | 'hvac'              // HVAC specific
  | 'exterior'          // Exterior/yard
  | 'lease'             // Lease questions
  | 'billing'           // Payment issues
  | 'other';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location?: string;           // Area of property

  // Reporting
  reportedBy: string;          // User ID
  reportedByName: string;
  reportedByRole: UserRole;
  reportedAt: string;          // ISO date

  // Assignment
  assignedTo?: string;         // User ID or Vendor ID
  assignedToName?: string;
  assignedToType?: 'pm' | 'vendor' | 'tenant';
  assignedAt?: string;
  assignedBy?: string;
  scheduledDate?: string;      // When work is scheduled

  // Resolution
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  closedAt?: string;
  closeReason?: 'resolved' | 'duplicate' | 'wont_fix' | 'invalid';

  // Media
  images: IssueImage[];

  // Cost
  estimatedCost?: number;
  actualCost?: number;
  costPaidBy?: 'owner' | 'tenant' | 'insurance' | 'warranty';

  // Linking
  linkedVendorId?: string;
  linkedProjectId?: string;    // If converted to project

  // Activity
  activities: IssueActivity[];

  // SLA
  slaTargetHours?: number;     // Based on priority
  slaBreach?: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface IssueImage {
  id: string;
  url: string;                 // Data URL or file path
  caption?: string;
  type: 'before' | 'during' | 'after';
  uploadedAt: string;
  uploadedBy: string;
}

interface IssueActivity {
  id: string;
  issueId: string;
  type: 'created' | 'status_change' | 'assigned' | 'comment' |
        'image_added' | 'scheduled' | 'escalated' | 'resolved';
  description: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}

// SLA Configuration
const SLA_TARGETS: Record<IssuePriority, number> = {
  urgent: 4,    // 4 hours
  high: 24,     // 24 hours
  medium: 72,   // 3 days
  low: 168      // 7 days
};
```

#### File Structure
```
src/
├── components/
│   └── issues/
│       ├── IssueList.tsx          # List/Kanban view toggle
│       ├── IssueKanban.tsx        # Kanban board view
│       ├── IssueCard.tsx          # Issue card component
│       ├── IssueCreateForm.tsx    # Create new issue
│       ├── IssueDetailModal.tsx   # Full issue details
│       ├── IssueTimeline.tsx      # Activity timeline
│       ├── IssueAssignment.tsx    # Assignment UI
│       ├── IssueResolution.tsx    # Resolution form
│       ├── IssueImageUpload.tsx   # Photo upload
│       └── TenantIssueView.tsx    # Simplified tenant view
├── lib/
│   └── issues.ts                  # CRUD operations
├── types/
│   └── issues.types.ts            # Type definitions
└── pages/
    └── Issues.tsx                 # Issues page
```

### Technical Tasks
- [ ] Create `src/types/issues.types.ts` with all type definitions
- [ ] Create `src/lib/issues.ts` for CRUD and localStorage
- [ ] Build `IssueList` component with Kanban/List toggle
- [ ] Build `IssueKanban` component with drag-and-drop
- [ ] Build `IssueCard` component for both views
- [ ] Build `IssueCreateForm` with image upload
- [ ] Build `IssueDetailModal` with all sections
- [ ] Build `IssueTimeline` component
- [ ] Build `IssueAssignment` component (PM only)
- [ ] Build `IssueResolution` form
- [ ] Build `TenantIssueView` (simplified for tenants)
- [ ] Create `Issues.tsx` page and add route
- [ ] Add issue notifications to NotificationCenter
- [ ] Add issue metrics to PM dashboard
- [ ] Add "Convert to Project" functionality

### Success Criteria
- [ ] Tenants can create issues with photos in < 1 minute
- [ ] PM can triage and assign issues in < 30 seconds
- [ ] Issue status updates notify relevant parties
- [ ] SLA tracking shows overdue issues
- [ ] Issues can be converted to projects when scope grows
- [ ] Owner can view issue history and resolution metrics

---

## Phase 2: Enhanced Project System & Kanban

### Goals
- Complete project management system
- Vendor integration with projects
- Stakeholder management with notifications
- Message center per project
- AI Impact Analysis (display only, generation in Phase 4)

### Features

#### 2.1 Project Kanban Board
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Draft   │ │ Pending  │ │ Approved │ │In Progress│ │Completed │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │
│ │Card 1│ │ │ │Card 2│ │ │ │Card 3│ │ │ │Card 4│ │ │ │Card 5│ │
│ └──────┘ │ │ └──────┘ │ │ └──────┘ │ │ └──────┘ │ │ └──────┘ │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

- Drag-and-drop between stages
- Valid transition enforcement
- Priority indicators
- Vendor assignment badges

#### 2.2 Project Detail View (Tabs)
```
┌─────────────────────────────────────────────────────────────┐
│  HVAC System Upgrade                            [Edit] [X]  │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Phases] [Team] [Messages] [Files] [Impact]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overview Tab:                                              │
│  • Full description                                         │
│  • Category, Priority, Status                               │
│  • Assigned vendor with contact                             │
│  • Cost estimates vs actual                                 │
│  • Timeline (estimated vs actual)                           │
│                                                             │
│  Phases Tab:                                                │
│  • Milestone tracker                                        │
│  • Phase status (pending/in_progress/completed)             │
│  • Assigned vendor per phase                                │
│                                                             │
│  Team Tab (Stakeholders):                                   │
│  • Project owner (PM)                                       │
│  • Stakeholder list with notification preferences           │
│  • Emergency contacts                                       │
│                                                             │
│  Messages Tab:                                              │
│  • Project-specific message thread                          │
│  • System messages (status changes)                         │
│  • File attachments in messages                             │
│                                                             │
│  Files Tab:                                                 │
│  • Before/During/After photos                               │
│  • Estimates and invoices                                   │
│  • Plans and permits                                        │
│                                                             │
│  Impact Tab (AI-generated):                                 │
│  • Tenant impact analysis                                   │
│  • Owner impact analysis                                    │
│  • Suggested notifications                                  │
│  • [Regenerate Analysis ✨]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3 Vendor-Project Linking
- View vendor's active/completed projects
- Assign vendors to project phases
- Emergency contact integration
- Performance tracking per project

### Technical Tasks
- [ ] Complete `ProjectKanban` component (started)
- [ ] Build `ProjectDetailModal` with tabbed interface
- [ ] Create `ProjectMessageCenter` component
- [ ] Add `ProjectPhases` component for milestones
- [ ] Implement `StakeholderManager` component
- [ ] Create `ProjectFilesManager` component
- [ ] Build `ImpactAnalysisView` component
- [ ] Update `VendorDirectory` with project links
- [ ] Add project creation form/wizard

---

## Phase 3: 3D Viewer Integration

### Goals
- Interactive 3D property visualization
- Upload/view 3D models (GLTF/GLB)
- Annotate areas for projects
- Basic scene navigation (rotate, zoom, pan)
- Library of common 3D objects

### Architecture

**Stack: Three.js with React Three Fiber**
- Modern React bindings for Three.js
- Component-based 3D development
- Good ecosystem (drei helpers)
- Works with TypeScript

### Features

#### 3.1 3D Model Viewer
```
┌─────────────────────────────────────────────────────────────┐
│  Property 3D View                    [Upload Model] [Reset] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                   /                   \                     │
│                  /     3D HOUSE        \                    │
│                 /       MODEL           \                   │
│                ├─────────────────────────┤                  │
│                │                         │                  │
│                │    [Rotate/Zoom/Pan]    │                  │
│                │                         │                  │
│                └─────────────────────────┘                  │
│                                                             │
│  ┌──────────────┐                                          │
│  │ 📍 Markers   │  • Deck Project (click to view)          │
│  │              │  • Garden Area (proposed)                │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Model Sources
- Upload GLTF/GLB files (3D model format)
- Basic primitive shapes for concepting
- Library of common objects (trees, deck sections, fencing)
- Photo-to-3D integration (future - AI based)

#### 3.3 Project Annotations
- Click on 3D model to add project markers
- Link markers to project cards
- Toggle visibility of proposed changes
- Before/after state visualization

### Technical Implementation (STUBBED - HIGH COMPLEXITY)

```typescript
// STUB: Property3DViewer Component
// Complexity: HIGH
// Dependencies: @react-three/fiber, @react-three/drei, three

interface Property3DViewerProps {
  modelUrl?: string;           // GLTF/GLB model URL or data URL
  annotations: Annotation[];   // Project markers on the model
  onAnnotationClick: (id: string) => void;
  onAnnotationAdd?: (position: Vector3) => void;
  mode: 'view' | 'annotate';
}

interface Annotation {
  id: string;
  projectId: string;
  position: [number, number, number];
  label: string;
  color: string;
}

// Key implementation points:
// 1. Canvas from @react-three/fiber for 3D rendering
// 2. GLTFLoader for model loading with Suspense
// 3. OrbitControls from drei for camera manipulation
// 4. Raycaster for click detection on model surfaces
// 5. Html component from drei for annotation labels
// 6. Environment/Lighting for realistic rendering
// 7. Grid helper for orientation
```

```typescript
// STUB: ModelLibrary - Pre-built 3D assets
// Complexity: MEDIUM

interface ModelAsset {
  id: string;
  name: string;
  category: 'landscape' | 'structure' | 'exterior' | 'interior';
  thumbnail: string;
  modelUrl: string;
  dimensions: { width: number; height: number; depth: number };
  tags: string[];
}

const ASSET_CATEGORIES = {
  landscape: ['tree_oak', 'tree_pine', 'shrub_boxwood', 'flower_bed', 'grass_patch'],
  structure: ['deck_10x12', 'deck_12x16', 'fence_section', 'pergola', 'shed_8x10'],
  exterior: ['window_double', 'door_entry', 'siding_panel', 'roof_section'],
  interior: ['cabinet_base', 'counter_section', 'toilet', 'vanity', 'tub']
};

// Implementation: Store models in /public/models/ or use CDN
// Load on-demand with React Suspense
// Allow drag-drop placement in edit mode
```

### Dependencies to Add
```json
{
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "three": "^0.160.x",
  "@types/three": "^0.160.x"
}
```

### Fallback for Non-3D
- 2D floor plan with clickable zones
- Photo gallery with annotation overlays
- Sketch/drawing tool for conceptual planning

---

## Phase 4: AI Project Creation & BOM

### Goals
- Natural language project creation
- AI-generated project plans with phases
- Accurate Bill of Materials generation
- Cost estimation
- Future: Supplier API integration

### Features

#### 4.1 Smart Project Creator
```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Smart Project Creator                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Describe your project:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Build a 12x16 composite deck off the back of the  │   │
│  │  house with built-in bench seating and LED rail    │   │
│  │  lighting. Include stairs down to the yard."       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                          [Generate Plan ✨] │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  📋 Generated Project Plan                                  │
│  ├─ Phase 1: Permits & Site Prep (3-5 days)                │
│  │   └─ Pull deck permit, call 811, mark utilities         │
│  ├─ Phase 2: Foundation & Framing (2-3 days)               │
│  │   └─ Set footings, install posts, build frame           │
│  ├─ Phase 3: Decking Installation (1-2 days)               │
│  │   └─ Install joists, lay composite boards               │
│  ├─ Phase 4: Railings & Stairs (1-2 days)                  │
│  │   └─ Install posts, rails, balusters, build stairs      │
│  ├─ Phase 5: Seating & Electrical (1 day)                  │
│  │   └─ Build bench, run low-voltage LED, test             │
│  └─ Phase 6: Final Inspection (1 day)                      │
│                                                             │
│  💡 AI Notes:                                               │
│  • Permit typically required for decks over 200 sq ft      │
│  • Consider frost depth for footings in your area          │
│  • LED rail lighting requires GFCI-protected circuit       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Bill of Materials Generator
```
┌─────────────────────────────────────────────────────────────┐
│  📦 Bill of Materials                    Estimated: $5,240  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Category          │ Items │ Est. Cost │ Details           │
│  ──────────────────┼───────┼───────────┼─────────────────  │
│  Lumber & Framing  │   28  │  $1,180   │ [Expand ▼]        │
│  Composite Decking │   42  │  $2,640   │ [Expand ▼]        │
│  Hardware          │  186  │   $520    │ [Expand ▼]        │
│  Railing System    │   24  │   $680    │ [Expand ▼]        │
│  Electrical        │   14  │   $220    │ [Expand ▼]        │
│  ──────────────────┴───────┴───────────┴─────────────────  │
│                                                             │
│  ┌─ Lumber & Framing (Expanded) ───────────────────────┐   │
│  │ 2x8x12 PT Lumber          12 ea   @ $18.50 = $222   │   │
│  │ 2x8x16 PT Lumber           8 ea   @ $24.00 = $192   │   │
│  │ 2x6x12 PT Lumber          16 ea   @ $14.00 = $224   │   │
│  │ 4x4x10 PT Posts            6 ea   @ $22.00 = $132   │   │
│  │ 2x10x12 PT Stair Stringer  3 ea   @ $28.00 =  $84   │   │
│  │ Post brackets (adjustable) 6 ea   @ $18.00 = $108   │   │
│  │ Joist hangers 2x8         24 ea   @  $3.50 =  $84   │   │
│  │ ...                                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Hardware Detail (Down to the last nail) ────────────┐  │
│  │ Deck screws 3" (coated)     2 boxes (350ct) = $89    │  │
│  │ Structural screws 4"        1 box (50ct) = $42       │  │
│  │ Carriage bolts 1/2"x6"     16 ea = $28               │  │
│  │ Lag screws 3/8"x4"         32 ea = $24               │  │
│  │ Joist hanger nails (10d)    1 box (1lb) = $12        │  │
│  │ Post cap bolts 5/16"x4"    12 ea = $18               │  │
│  │ Concrete (80lb bags)        8 bags = $52             │  │
│  │ ...                                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Export to CSV] [Save to Project] [Get Vendor Quotes]      │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation (STUBBED - HIGH COMPLEXITY)

```typescript
// STUB: AI Project Generator Service
// Complexity: HIGH
// Dependencies: OpenAI API or Claude API

interface ProjectGenerationRequest {
  description: string;          // Natural language description
  propertyContext?: {
    address?: string;
    squareFootage?: number;
    propertyType?: 'single_family' | 'townhouse' | 'condo';
    existingFeatures?: string[];
    climate?: string;           // For seasonal considerations
  };
  constraints?: {
    maxBudget?: number;
    preferredTimeline?: string;
    diyLevel?: 'none' | 'basic' | 'intermediate' | 'advanced';
    vendorPreference?: string;  // Specific vendor to use
  };
}

interface GeneratedProject {
  title: string;
  description: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  phases: GeneratedPhase[];
  bom: BillOfMaterials;
  estimatedCost: CostBreakdown;
  estimatedDuration: string;
  requiredPermits: string[];
  requiredSkills: string[];
  warnings: string[];
  aiNotes: string[];
  impactAnalysis: ImpactAnalysis;
}

interface GeneratedPhase {
  name: string;
  description: string;
  estimatedDays: number;
  tasks: string[];
  requiredMaterials: string[];  // References to BOM items
  requiredSkills: string[];
  inspectionRequired: boolean;
}

// Implementation approach:
// 1. Build detailed prompt template with project types
// 2. Include construction knowledge base in prompt
// 3. Request structured JSON response
// 4. Validate response against BOM formulas
// 5. Allow user editing before finalizing
// 6. Learn from user corrections (future)
```

```typescript
// STUB: Bill of Materials Engine
// Complexity: HIGH

interface BOMItem {
  id: string;
  name: string;
  description: string;
  category: 'lumber' | 'hardware' | 'electrical' | 'plumbing' |
            'finishing' | 'concrete' | 'decking' | 'roofing' | 'other';
  quantity: number;
  unit: 'each' | 'linear_ft' | 'sq_ft' | 'box' | 'bag' | 'gallon' | 'lb';
  unitPrice: number;          // AI estimated or from supplier
  totalPrice: number;
  sku?: string;               // For supplier integration
  supplier?: string;          // 'home_depot' | 'lowes' | 'local'
  alternatives?: BOMItem[];   // Alternative products/brands
  notes?: string;
  wasteFactor: number;        // e.g., 1.10 for 10% waste allowance
}

interface BillOfMaterials {
  projectId: string;
  items: BOMItem[];
  categories: BOMCategory[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  contingency: number;        // 10-15% buffer for unforeseen
  laborEstimate?: number;     // Optional labor cost estimate
  grandTotal: number;
  generatedAt: string;
  priceSource: 'ai_estimate' | 'supplier_api' | 'manual';
  lastPriceUpdate?: string;
}

interface BOMCategory {
  name: string;
  items: BOMItem[];
  subtotal: number;
}

// Calculation formulas (embedded in AI prompt):
// - Deck boards: (length × width / board_coverage) × waste_factor
// - Joists: (length / joist_spacing) + 1
// - Screws: ~350 per 100 sq ft for decking
// - Concrete: (footing_diameter² × 3.14 × depth) / 27 per footing
// etc.
```

```typescript
// STUB: Supplier Integration (Future)
// Complexity: MEDIUM (once API access secured)

interface SupplierService {
  provider: 'home_depot' | 'lowes' | 'menards' | 'local';

  // Get real-time pricing
  getPrice(sku: string): Promise<{
    price: number;
    inStock: boolean;
    storeLocation?: string;
  }>;

  // Search for products
  search(query: string, category?: string): Promise<Product[]>;

  // Build shopping list
  createShoppingList(items: BOMItem[]): Promise<{
    listUrl: string;
    totalPrice: number;
    itemsFound: number;
    itemsMissing: string[];
  }>;

  // Check availability at nearby stores
  checkAvailability(sku: string, zipCode: string): Promise<StoreAvailability[]>;
}
```

### AI Integration Options

| Provider | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| OpenAI GPT-4 | Best structured output, function calling | Cost ($), rate limits | Primary choice |
| Anthropic Claude | Great reasoning, long context | Similar cost | Good alternative |
| Local LLM (Llama) | Free, private | Less capable, more work | Future option |

### AI Prompt Engineering Notes

The AI prompt should include:
1. Construction best practices knowledge
2. Material calculation formulas
3. Local code requirements (based on property location)
4. Waste factors for different materials
5. Common project templates as examples
6. Safety considerations
7. Permit requirements by project type

---

## Cross-Phase: Document Signing & Approval Workflows

### Overview
Document signing and approval workflows are needed across multiple phases:
- **Leases**: Tenant signs lease, responsibilities are parsed
- **Vendor Contracts**: PM approves vendor agreements
- **Projects**: PM-done projects need owner approval
- **Tenant Responsibilities**: PM can add new items that require tenant approval

### Features

#### Signing Workflow States
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Draft   │ -> │  Sent    │ -> │  Viewed  │ -> │  Signed  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     v                               v
               ┌──────────┐                   ┌──────────┐
               │ Declined │                   │ Countered│
               └──────────┘                   └──────────┘
```

#### Lease Signing Flow
```
┌─────────────────────────────────────────────────────────────┐
│  Lease Document                                    [Status] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📄 Lease Agreement - 123 Property Lane                     │
│     Uploaded: Jan 15, 2026                                  │
│     Parties: Shanie Holman (Owner) ↔ Gregg Marshall (Tenant)│
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Signature Status                                     │   │
│  │ ✓ Owner (Shanie Holman) - Signed Jan 16, 2026       │   │
│  │ ○ Tenant (Gregg Marshall) - Pending                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 Parsed Responsibilities (Auto-extracted):              │
│  • Test smoke detectors monthly                            │
│  • Replace HVAC filters quarterly                          │
│  • Maintain yard (mowing, basic landscaping)               │
│  • Report maintenance issues within 48 hours               │
│                                                             │
│  [View Document] [Send Reminder] [Download]                 │
└─────────────────────────────────────────────────────────────┘
```

#### Tenant Responsibility Approval
```
┌─────────────────────────────────────────────────────────────┐
│  New Responsibility Request                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  From: Dan Connolly (Property Manager)                      │
│  Date: Jan 24, 2026                                         │
│                                                             │
│  📋 Proposed New Responsibility:                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Check and clean gutter guards monthly during fall  │   │
│  │  season (September - November)"                      │   │
│  │                                                       │   │
│  │ Frequency: Monthly (seasonal)                        │   │
│  │ Category: Exterior Maintenance                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  PM Notes: "This helps prevent water damage and reduces     │
│  maintenance costs. Owner has approved this addition."      │
│                                                             │
│  [Accept] [Decline] [Discuss]                               │
└─────────────────────────────────────────────────────────────┘
```

#### Project Approval (PM-Done Projects)
```
┌─────────────────────────────────────────────────────────────┐
│  Project Approval Request                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project: Install Smart Thermostat                          │
│  Submitted by: Dan Connolly (PM)                            │
│  Date: Jan 24, 2026                                         │
│                                                             │
│  📋 Project Details:                                        │
│  • Category: Upgrade                                        │
│  • Estimated Cost: $180 (device) + $0 (PM labor)           │
│  • Duration: 2 hours                                        │
│  • Tenant Impact: Minimal - 30 min HVAC downtime           │
│                                                             │
│  📦 Materials Needed:                                       │
│  • Nest Learning Thermostat - $179.99                      │
│  • Wire nuts (have on hand) - $0                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approval Required From:                              │   │
│  │ ○ Owner (Shanie Holman) - Pending                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Approve] [Request Changes] [Decline]                      │
└─────────────────────────────────────────────────────────────┘
```

#### Vendor Contract Approval
```
┌─────────────────────────────────────────────────────────────┐
│  Vendor Agreement                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔧 Vendor: Cool Air HVAC                                   │
│  Service: HVAC System Upgrade                               │
│  Quote: $8,500                                              │
│                                                             │
│  📄 Attached Documents:                                     │
│  • Detailed Estimate (PDF)                                  │
│  • Insurance Certificate                                    │
│  • Service Agreement                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approval Chain:                                      │   │
│  │ ✓ PM Review (Dan Connolly) - Approved Jan 20        │   │
│  │ ○ Owner Approval (Shanie Holman) - Pending          │   │
│  │ ○ Vendor Confirmation - Awaiting owner approval     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Approve & Notify Vendor] [Request Changes] [Decline]      │
└─────────────────────────────────────────────────────────────┘
```

### Technical Implementation (STUBBED)

```typescript
// STUB: Document Signing System
// Complexity: MEDIUM-HIGH
// Consider: DocuSign API, HelloSign API, or custom implementation

type SignatureStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'declined' | 'countered';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

interface SignableDocument {
  id: string;
  type: 'lease' | 'vendor_contract' | 'project_approval' | 'responsibility_addition';
  title: string;
  documentUrl?: string;        // PDF or file reference
  createdAt: string;
  createdBy: string;

  signers: Signer[];
  approvers: Approver[];

  status: 'draft' | 'pending_signatures' | 'completed' | 'cancelled';
  completedAt?: string;

  // For leases - parsed responsibilities
  parsedResponsibilities?: TenantResponsibility[];
}

interface Signer {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'tenant' | 'pm' | 'vendor';
  status: SignatureStatus;
  signedAt?: string;
  ipAddress?: string;          // For audit trail
  signatureData?: string;      // Base64 signature image or typed name
}

interface Approver {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'tenant' | 'pm';
  status: ApprovalStatus;
  respondedAt?: string;
  notes?: string;
}

interface TenantResponsibility {
  id: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
  category: 'safety' | 'cleaning' | 'exterior' | 'interior' | 'utilities' | 'other';
  source: 'lease_parsed' | 'pm_added';

  // For PM-added items
  addedBy?: string;
  addedAt?: string;
  tenantApprovalStatus?: ApprovalStatus;
  tenantApprovedAt?: string;

  // Tracking
  isActive: boolean;
  lastCompletedAt?: string;
}

// Lease parsing (AI-assisted)
interface LeaseParsingResult {
  responsibilities: TenantResponsibility[];
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  securityDeposit: number;
  petPolicy?: string;
  utilities?: string[];
  confidence: number;          // 0-1 confidence score
  requiresReview: boolean;     // Flag if low confidence
}
```

### Integration Points

| Feature | Phases | Integration |
|---------|--------|-------------|
| Lease Signing | 1, 2 | Parsed responsibilities flow to TenantDashboard |
| Tenant Resp. Approval | 1 | PM adds → Tenant approves → Added to checklist |
| Project Approval | 2 | PM creates → Owner approves → Project starts |
| Vendor Contracts | 2 | PM reviews → Owner approves → Vendor confirms |

### Signing Implementation Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| DocuSign API | Industry standard, legally binding | Cost ($), complexity | For production |
| HelloSign API | Simpler, Dropbox integration | Similar cost | Alternative |
| Custom (typed name + checkbox) | Free, simple | Less legally robust | MVP approach |
| Hybrid | Custom for internal, DocuSign for leases | Balanced | Recommended |

### File Structure Additions

```
src/
├── components/
│   ├── signing/
│   │   ├── SignatureWorkflow.tsx       # Main signing flow
│   │   ├── SignaturePad.tsx            # Draw/type signature
│   │   ├── ApprovalRequest.tsx         # Approval UI
│   │   ├── SignerStatus.tsx            # Show who signed
│   │   └── DocumentViewer.tsx          # View document inline
│   └── ...
├── lib/
│   ├── signing.ts                      # Signing CRUD & logic
│   ├── lease-parser.ts                 # AI lease parsing
│   └── ...
```

---

## Worktree Development Strategy

### Setup Commands
```bash
# From main PropertyManager directory
cd /Users/danielconnolly/Projects/PropertyManager

# Create worktrees for parallel development
git worktree add ../PropertyManager-welcome feature/welcome-hub
git worktree add ../PropertyManager-3d feature/3d-viewer

# List worktrees
git worktree list
```

### Worktree Assignments

| Worktree | Branch | Focus | Phase |
|----------|--------|-------|-------|
| `PropertyManager` | `main` | Stable releases, bug fixes | All |
| `PropertyManager-welcome` | `feature/welcome-hub` | Welcome Hub, Notifications, Tenant View | 1 |
| `PropertyManager-3d` | `feature/3d-viewer` | 3D Viewer, Model Library | 3 |

Note: Phases 2 (Projects) and 4 (AI/BOM) can be done on main or separate branches as needed.

### Merge Strategy
1. Feature branches → `develop` branch for integration testing
2. `develop` → `main` for releases
3. Tag releases (v2.0.0, v2.1.0, etc.)

---

## Proposed File Structure

```
src/
├── components/
│   ├── welcome/
│   │   ├── WelcomeHub.tsx              # Phase 1
│   │   ├── NotificationCenter.tsx      # Phase 1
│   │   ├── PropertyGallery.tsx         # Phase 1
│   │   ├── QuickLinks.tsx              # Phase 1
│   │   └── ImageCarousel.tsx           # Phase 1
│   ├── issues/
│   │   ├── IssueList.tsx               # Phase 1B - List/Kanban toggle
│   │   ├── IssueKanban.tsx             # Phase 1B - Kanban board
│   │   ├── IssueCard.tsx               # Phase 1B - Issue card
│   │   ├── IssueCreateForm.tsx         # Phase 1B - Create issue form
│   │   ├── IssueDetailModal.tsx        # Phase 1B - Issue details
│   │   ├── IssueTimeline.tsx           # Phase 1B - Activity timeline
│   │   ├── IssueAssignment.tsx         # Phase 1B - Assignment (PM)
│   │   ├── IssueResolution.tsx         # Phase 1B - Resolution form
│   │   ├── IssueImageUpload.tsx        # Phase 1B - Photo upload
│   │   └── TenantIssueView.tsx         # Phase 1B - Tenant view
│   ├── tenant/
│   │   ├── TenantResponsibilities.tsx  # Phase 1
│   │   ├── ResponsibilityChecklist.tsx # Phase 1
│   │   └── TenantDashboard.tsx         # Update existing
│   ├── projects/
│   │   ├── ProjectKanban.tsx           # Phase 2 (started)
│   │   ├── ProjectDetailModal.tsx      # Phase 2
│   │   ├── ProjectFormModal.tsx        # Phase 2
│   │   ├── ProjectMessageCenter.tsx    # Phase 2
│   │   ├── ProjectPhases.tsx           # Phase 2
│   │   ├── ProjectFiles.tsx            # Phase 2
│   │   ├── StakeholderManager.tsx      # Phase 2
│   │   ├── ImpactAnalysisView.tsx      # Phase 2
│   │   └── SmartProjectCreator.tsx     # Phase 4
│   ├── viewer3d/
│   │   ├── Property3DViewer.tsx        # Phase 3 (stub)
│   │   ├── ModelViewer.tsx             # Phase 3
│   │   ├── ModelLibrary.tsx            # Phase 3
│   │   ├── AnnotationMarker.tsx        # Phase 3
│   │   ├── SceneControls.tsx           # Phase 3
│   │   └── ModelUploader.tsx           # Phase 3
│   ├── bom/
│   │   ├── BOMGenerator.tsx            # Phase 4 (stub)
│   │   ├── BOMDetailView.tsx           # Phase 4
│   │   ├── BOMCategoryExpander.tsx     # Phase 4
│   │   ├── BOMExport.tsx               # Phase 4
│   │   └── BOMItemEditor.tsx           # Phase 4
│   └── ... (existing components)
├── lib/
│   ├── projects.ts                     # Created
│   ├── issues.ts                       # Phase 1B - Issue CRUD
│   ├── notifications.ts                # Phase 1
│   ├── property-gallery.ts             # Phase 1
│   ├── tenant-responsibilities.ts      # Phase 1
│   ├── model-library.ts                # Phase 3 (stub)
│   ├── bom.ts                          # Phase 4 (stub)
│   ├── ai-generator.ts                 # Phase 4 (stub)
│   └── ... (existing libs)
├── hooks/
│   ├── useNotifications.ts             # Phase 1
│   ├── useThree.ts                     # Phase 3
│   └── useAI.ts                        # Phase 4
├── pages/
│   ├── Dashboard.tsx                   # Update for WelcomeHub
│   ├── Issues.tsx                      # Phase 1B - Issues page
│   └── Projects.tsx                    # Phase 2 - new page
└── types/
    ├── project.types.ts
    ├── issues.types.ts                 # Phase 1B - Issue types
    ├── bom.types.ts
    └── viewer3d.types.ts
```

---

## Implementation Priority

### Start Now (Phase 1)
1. Welcome Hub component
2. Property Gallery with image upload
3. Notification Center aggregation
4. Tenant Responsibilities view

### Queue (Phase 2)
1. Complete Project Kanban
2. Project Detail Modal with all tabs
3. Project creation form
4. Message center per project

### Research & Prototype (Phase 3)
1. Set up React Three Fiber
2. Basic model viewer
3. Simple annotation system
4. Model upload flow

### Deferred (Phase 4)
1. AI integration research
2. BOM calculation engine
3. Prompt engineering
4. Supplier API exploration

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 3D complexity delays | High | Medium | Start simple, iterate; have 2D fallback |
| AI accuracy for BOM | Medium | Medium | Always show as "estimate", allow editing |
| localStorage limits with images | High | High | Compress images; plan backend migration |
| Scope creep | High | High | Strict phase boundaries; MVP first |
| Mobile 3D performance | Medium | Medium | Disable 3D on mobile; 2D view instead |
| AI API costs | Medium | Low | Cache results; rate limit usage |

---

## Success Criteria

### Phase 1 Complete
- [ ] Welcome Hub is the default landing page
- [ ] 10+ property images can be uploaded and displayed
- [ ] Notifications aggregate from projects, messages, payments
- [ ] Tenants see only their lease responsibilities
- [ ] Responsibility checklist is functional

### Phase 1B Complete
- [ ] Issues page accessible from navigation
- [ ] Tenants can create issues with photos in < 1 minute
- [ ] Issues display in both Kanban and List views
- [ ] PM can triage, assign, and resolve issues
- [ ] SLA tracking shows time since reported
- [ ] Issue status updates trigger notifications
- [ ] Issues can be converted to projects
- [ ] Owner can view all issues and metrics

### Phase 2 Complete
- [ ] Projects can be created via form
- [ ] Kanban drag-drop works with valid transitions
- [ ] Project details show all tabs with data
- [ ] Messages work within project context
- [ ] Vendors can be assigned to projects

### Phase 3 Complete
- [ ] 3D model (GLTF) loads and displays
- [ ] Orbit controls work (rotate, zoom, pan)
- [ ] Annotation markers can be placed
- [ ] Markers link to projects
- [ ] Basic model library available

### Phase 4 Complete
- [ ] Natural language creates project outline
- [ ] BOM generates with 70%+ accuracy for common projects
- [ ] Cost estimates are reasonable (within 30%)
- [ ] User can edit generated plans/BOM
- [ ] Can export BOM to spreadsheet

---

## Next Steps

1. **Approve this plan** - Any changes needed?
2. **Set up worktrees** for parallel development
3. **Begin Phase 1** - Welcome Hub and Tenant Responsibilities
4. **Research 3D options** - While building Phase 1, explore Three.js patterns

---

*Plan Version: 2.0*
*Created: January 2026*
*Last Updated: January 24, 2026*
