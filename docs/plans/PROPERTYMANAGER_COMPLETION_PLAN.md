---
title: PropertyManager 2.0 - Completion Plan
type: plan
status: active
created: 2026-01-30
updated: 2026-01-30
owner: daniel
priority: P0
spec_source: SPEC.md
prd_source: PRD.MD
---

# PropertyManager 2.0: Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all remaining features for PropertyManager 2.0 MVP including Issue Tracking System, AI Project Creator UI, Quick Fixes, Theme Toggle, Google OAuth, and PWA conversion.

**Repository:** `PropertyManager` (local)
**Working Directory:** `~/Projects/PropertyManager`

---

## Executive Summary

This plan completes all remaining work identified in SPEC.md and PRD.MD:

| Batch | Focus | Tasks | Est. Duration | Priority |
|-------|-------|-------|---------------|----------|
| 1 | Quick Fixes | 4 | 30-45 min | P0 |
| 2 | Issue Types & Library | 2 | 20-30 min | P0 |
| 3 | Issue Components (Part 1) | 4 | 45-60 min | P0 |
| 4 | Issue Components (Part 2) + Page | 4 | 45-60 min | P0 |
| 5 | AI Project Creator UI (PM-only) | 4 | 45-60 min | P1 |
| 6 | Theme System (Light/Dark) | 3 | 30-45 min | P1 |
| 7 | Google OAuth | 3 | 45-60 min | P2 |
| 8 | PWA Conversion | 4 | 60-90 min | P2 |

**Total:** 28 tasks across 8 batches

---

## Key Requirements

### From User Clarifications:
1. **Issue Tracking System** - Important for ALL account types (Owner, PM, Tenant)
2. **AI Project Creator** - PM-only access (restrict from Owner/Tenant)
3. **Vendors for Owner** - Full edit access (NOT read-only), edits should sync
4. **OAuth** - Google only (no Apple)

### Role-Based Access Summary:
| Feature | Owner | PM | Tenant |
|---------|-------|----|----|
| Issues - View All | ✅ | ✅ | Own only |
| Issues - Create | ✅ | ✅ | ✅ |
| Issues - Assign/Triage | ❌ | ✅ | ❌ |
| Issues - Resolve | ❌ | ✅ | ❌ |
| AI Project Creator | ❌ | ✅ | ❌ |
| Vendors - Full Access | ✅ | ✅ | ❌ |

---

## Batch 1: Quick Fixes

**Priority:** P0 - Foundation fixes before new features
**Estimated Duration:** 30-45 minutes

### Task 1.1.1: Fix Owner Name Display

**Description:** Update default owner name from generic "Property Owner" to "Shanie Holman" as specified in PRD.

**Files to modify:**
- `src/lib/settings.ts`

**Acceptance Criteria:**
- [ ] DEFAULT_OWNER.name is "Shanie Holman"
- [ ] All references to owner display correct name
- [ ] Build passes with no TypeScript errors

---

### Task 1.1.2: Enable Vendors Page for Owner Role

**Description:** Add Vendors to Owner navigation with full edit access (not read-only). Owner edits should sync with PM view.

**Files to modify:**
- `src/components/Layout.tsx` - Add 'owner' to vendors route roles
- `src/pages/Vendors.tsx` - Ensure full CRUD works for owner role

**Acceptance Criteria:**
- [ ] Owner sees Vendors in navigation
- [ ] Owner can view all vendors
- [ ] Owner can add new vendors
- [ ] Owner can edit existing vendors
- [ ] Owner can delete vendors
- [ ] Changes sync (same localStorage, visible to PM)
- [ ] Build passes

---

### Task 1.1.3: Move AI Assistant to Top of Sidebar

**Description:** Reposition AI Assistant from bottom of navigation to top (after logo/header).

**Files to modify:**
- `src/components/Layout.tsx`

**Acceptance Criteria:**
- [ ] AI Assistant button appears at top of sidebar
- [ ] Maintains Cmd+. keyboard shortcut
- [ ] Styling consistent with navigation
- [ ] Build passes

---

### Task 1.1.4: Fix Inconsistent Financial Colors

**Description:** Audit and fix financial components to use consistent color scheme:
- Green: positive/income
- Red: negative/expenses
- Orange: warnings/attention

**Files to modify:**
- `src/pages/Financials.tsx`
- `src/components/MortgageCalculator.tsx`
- `src/components/FinancialComparison.tsx`
- `src/components/KeepVsSell.tsx`

**Acceptance Criteria:**
- [ ] Income consistently green
- [ ] Expenses consistently red
- [ ] Warnings consistently orange
- [ ] No color contradictions (e.g., red for positive values)
- [ ] Build passes

---

## Batch 2: Issue Tracking - Types & Library

**Priority:** P0 - Foundation for Issue Tracking System
**Estimated Duration:** 20-30 minutes
**Reference:** PRD.MD Section 3.6, IMPLEMENTATION_PLAN.md Phase 1B

### Task 2.1.1: Create Issue Type Definitions

**Description:** Create comprehensive TypeScript types for the Issue Tracking System.

**File to create:** `src/types/issues.types.ts`

**Type definitions needed:**
```typescript
type IssueStatus = 'open' | 'triaged' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'closed' | 'escalated';
type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
type IssueCategory = 'maintenance' | 'safety' | 'pest' | 'noise' | 'appliance' | 'plumbing' | 'electrical' | 'hvac' | 'exterior' | 'lease' | 'billing' | 'other';

interface Issue { ... }
interface IssueImage { ... }
interface IssueActivity { ... }
```

**Acceptance Criteria:**
- [ ] All types from IMPLEMENTATION_PLAN.md Phase 1B defined
- [ ] SLA_TARGETS constant defined (urgent: 4h, high: 24h, medium: 72h, low: 168h)
- [ ] Exports all types
- [ ] TypeScript compiles without errors

---

### Task 2.1.2: Create Issues Library (CRUD)

**Description:** Create localStorage CRUD operations for issues.

**File to create:** `src/lib/issues.ts`

**Functions needed:**
- `getIssues(): Issue[]`
- `getIssueById(id: string): Issue | undefined`
- `getIssuesByReporter(userId: string): Issue[]`
- `getIssuesByStatus(status: IssueStatus): Issue[]`
- `createIssue(data: Partial<Issue>): Issue`
- `updateIssue(id: string, data: Partial<Issue>): Issue`
- `deleteIssue(id: string): void`
- `addIssueActivity(issueId: string, activity: Partial<IssueActivity>): void`
- `addIssueImage(issueId: string, image: Partial<IssueImage>): void`
- `checkSLABreach(issue: Issue): boolean`
- `getIssueMetrics(): { open: number, resolved: number, avgResolutionTime: number }`

**Acceptance Criteria:**
- [ ] All CRUD functions implemented
- [ ] Uses localStorage key `propertyMgr_issues`
- [ ] Generates UUIDs for new issues
- [ ] Activity logging works
- [ ] SLA breach detection works
- [ ] Build passes

---

## Batch 3: Issue Components (Part 1)

**Priority:** P0 - Core issue UI components
**Estimated Duration:** 45-60 minutes

### Task 3.1.1: Create IssueCard Component

**Description:** Reusable card component for displaying issue summary in list/kanban views.

**File to create:** `src/components/issues/IssueCard.tsx`

**Features:**
- Priority indicator (color-coded: urgent=red, high=orange, medium=yellow, low=gray)
- Category icon
- Title and truncated description
- Status badge
- SLA warning if breaching
- Click to open detail modal
- Reporter info (name, role)

**Acceptance Criteria:**
- [ ] Displays all key issue information
- [ ] Priority colors match design system
- [ ] SLA breach shows warning indicator
- [ ] onClick handler for opening details
- [ ] Responsive design
- [ ] Build passes

---

### Task 3.1.2: Create IssueKanban Component

**Description:** Kanban board view for issues with drag-and-drop.

**File to create:** `src/components/issues/IssueKanban.tsx`

**Columns:**
- Open
- Triaged
- Assigned
- In Progress
- Resolved

**Features:**
- Drag-and-drop between columns (PM only)
- Issue count per column
- Filter by category/priority
- Uses IssueCard component

**Acceptance Criteria:**
- [ ] All status columns displayed
- [ ] Issues render in correct columns
- [ ] Drag-and-drop works for PM role
- [ ] Non-PM users see read-only view
- [ ] Filters work
- [ ] Build passes

---

### Task 3.1.3: Create IssueList Component

**Description:** List view for issues with toggle to Kanban view.

**File to create:** `src/components/issues/IssueList.tsx`

**Features:**
- Table/list layout
- Sortable columns (date, priority, status)
- Filter by status, category, priority
- Search by title/description
- Toggle between List and Kanban view
- Uses IssueCard component

**Acceptance Criteria:**
- [ ] List displays all issues
- [ ] Sorting works on all columns
- [ ] Filtering works
- [ ] Search works
- [ ] View toggle switches to IssueKanban
- [ ] Build passes

---

### Task 3.1.4: Create IssueCreateForm Component

**Description:** Form for creating new issues (all roles can create).

**File to create:** `src/components/issues/IssueCreateForm.tsx`

**Form fields:**
- Title (required)
- Description (textarea)
- Category (dropdown)
- Priority (dropdown with guidance text)
- Location (dropdown: Kitchen, Bathroom, Bedroom 1, etc.)
- Photos (image upload, max 5)

**Features:**
- Image upload with preview
- Validation
- Auto-sets reportedBy from auth context
- Creates issue activity log entry

**Acceptance Criteria:**
- [ ] All form fields present
- [ ] Validation works
- [ ] Image upload works (base64 to localStorage)
- [ ] Creates issue with correct reporter info
- [ ] Activity log entry created
- [ ] Modal or slide-out form
- [ ] Build passes

---

## Batch 4: Issue Components (Part 2) + Page

**Priority:** P0 - Complete issue tracking UI
**Estimated Duration:** 45-60 minutes

### Task 4.1.1: Create IssueDetailModal Component

**Description:** Full issue detail view with all information and actions.

**File to create:** `src/components/issues/IssueDetailModal.tsx`

**Sections:**
- Header: Title, status badge, priority, edit button
- Info: Category, location, reported by, reported at
- Description: Full text
- Images: Gallery with lightbox
- Assignment (PM only): Assignee dropdown, scheduled date
- Cost: Estimated and actual cost fields
- Activity Timeline: Chronological activity log
- Actions: Status changes, escalate, convert to project

**Role-based actions:**
- PM: Full edit, assign, resolve, escalate
- Owner: View all, approve escalations
- Tenant: View own issues only

**Acceptance Criteria:**
- [ ] All sections render correctly
- [ ] Role-based actions enforced
- [ ] Status change updates issue
- [ ] Activity timeline shows history
- [ ] Images display in gallery
- [ ] Build passes

---

### Task 4.1.2: Create IssueTimeline Component

**Description:** Activity timeline display for issue history.

**File to create:** `src/components/issues/IssueTimeline.tsx`

**Features:**
- Chronological display (newest first)
- Activity type icons
- Performer name and timestamp
- Status changes highlighted

**Acceptance Criteria:**
- [ ] Renders all activities
- [ ] Proper icons per activity type
- [ ] Timestamps formatted nicely
- [ ] Scrollable if many activities
- [ ] Build passes

---

### Task 4.1.3: Create IssueResolution Component

**Description:** Form for resolving issues (PM only).

**File to create:** `src/components/issues/IssueResolution.tsx`

**Form fields:**
- Resolution summary (required)
- After photos (image upload)
- Final cost
- Cost paid by (owner/tenant/insurance/warranty)
- Vendor rating (if vendor assigned)

**Acceptance Criteria:**
- [ ] All fields present
- [ ] Validation works
- [ ] Updates issue status to 'resolved'
- [ ] Creates activity log entry
- [ ] Only accessible to PM role
- [ ] Build passes

---

### Task 4.1.4: Create Issues Page and Route

**Description:** Main issues page with navigation and routing.

**Files to modify/create:**
- Create: `src/pages/Issues.tsx`
- Modify: `src/App.tsx` - Add route
- Modify: `src/components/Layout.tsx` - Add navigation item

**Page features:**
- Header with "New Issue" button
- View toggle (List/Kanban)
- Filters
- Issue metrics dashboard (PM/Owner only)
- TenantIssueView for tenant role

**Navigation:**
- All roles see Issues in navigation
- Route: `/issues`

**Acceptance Criteria:**
- [ ] Page renders correctly
- [ ] Route `/issues` works
- [ ] Navigation item shows for all roles
- [ ] PM/Owner see full view with metrics
- [ ] Tenant sees simplified view (own issues only)
- [ ] Build passes

---

## Batch 5: AI Project Creator UI (PM-Only)

**Priority:** P1 - Complete Phase 4 Part 2
**Estimated Duration:** 45-60 minutes
**Reference:** SPEC.md Phase 4, ai.types.ts, ai-generator.ts

### Task 5.1.1: Create SmartProjectCreator Component

**Description:** Natural language project creation form (PM-only access).

**File to create:** `src/components/bom/SmartProjectCreator.tsx`

**Features:**
- Large textarea for project description
- "Generate Plan" button
- Loading state during AI generation
- Uses ai-generator.ts (or ai-mock.ts fallback)
- Displays generated project plan with phases
- AI notes/warnings display
- "Save as Project" action

**Access Control:**
- Only visible to PM role
- Check auth context and hide/disable for other roles

**Acceptance Criteria:**
- [ ] PM can access component
- [ ] Owner/Tenant cannot access (hidden or disabled)
- [ ] Text input works
- [ ] Calls AI generator service
- [ ] Shows loading state
- [ ] Displays generated plan
- [ ] Can save as new project
- [ ] Build passes

---

### Task 5.1.2: Create BOMDetailView Component

**Description:** Display generated Bill of Materials with categories.

**File to create:** `src/components/bom/BOMDetailView.tsx`

**Features:**
- Category breakdown (collapsible)
- Item list with quantities and prices
- Subtotals per category
- Grand total with tax and contingency
- Wastage factor display

**Acceptance Criteria:**
- [ ] Renders BOM data correctly
- [ ] Categories are collapsible
- [ ] Prices formatted as currency
- [ ] Totals calculate correctly
- [ ] Build passes

---

### Task 5.1.3: Create BOMCategoryExpander Component

**Description:** Collapsible category section for BOM display.

**File to create:** `src/components/bom/BOMCategoryExpander.tsx`

**Features:**
- Category header with count and subtotal
- Expandable item list
- Item details: name, quantity, unit, unit price, total
- Expand/collapse animation

**Acceptance Criteria:**
- [ ] Expands/collapses on click
- [ ] Shows category summary when collapsed
- [ ] Shows all items when expanded
- [ ] Build passes

---

### Task 5.1.4: Create BOMExport Component

**Description:** Export BOM to CSV file.

**File to create:** `src/components/bom/BOMExport.tsx`

**Features:**
- "Export to CSV" button
- Generates CSV with all BOM items
- Downloads file to user's device
- Includes category, item, quantity, unit, price columns

**Acceptance Criteria:**
- [ ] Button renders
- [ ] CSV generation works
- [ ] File downloads with correct name
- [ ] All BOM data included
- [ ] Build passes

---

## Batch 6: Theme System (Light/Dark Mode)

**Priority:** P1 - User experience improvement
**Estimated Duration:** 30-45 minutes

### Task 6.1.1: Create Theme Context

**Description:** React context for theme state management.

**File to create:** `src/contexts/ThemeContext.tsx`

**Features:**
- Theme state: 'light' | 'dark' | 'system'
- Persist to localStorage
- Provide toggle function
- Apply theme class to document

**Acceptance Criteria:**
- [ ] Context provides theme state
- [ ] Theme persists across sessions
- [ ] 'system' follows OS preference
- [ ] Document has correct class (dark/light)
- [ ] Build passes

---

### Task 6.1.2: Create ThemeToggle Component

**Description:** UI component for switching themes.

**File to create:** `src/components/ThemeToggle.tsx`

**Features:**
- Toggle button with sun/moon icons
- Dropdown for light/dark/system options
- Current theme indicator
- Accessible (keyboard, screen reader)

**Acceptance Criteria:**
- [ ] Toggle switches theme
- [ ] Icons update correctly
- [ ] Accessible
- [ ] Build passes

---

### Task 6.1.3: Add Light Mode Styles

**Description:** Add light mode CSS variables and styles.

**Files to modify:**
- `src/index.css`
- `tailwind.config.ts` (if needed)

**Light mode colors (from SPEC.md):**
```css
--color-pm-bg: #ffffff;
--color-pm-surface: #f8fafc;
--color-pm-border: #e2e8f0;
--color-pm-text: #1e293b;
--color-pm-muted: #64748b;
```

**Acceptance Criteria:**
- [ ] Light mode variables defined
- [ ] Tailwind dark: prefix works
- [ ] All components readable in both modes
- [ ] No hardcoded colors that break light mode
- [ ] Build passes

---

## Batch 7: Google OAuth

**Priority:** P2 - Authentication upgrade
**Estimated Duration:** 45-60 minutes

### Task 7.1.1: Set Up Google OAuth Configuration

**Description:** Configure Google OAuth client and environment.

**Files to create/modify:**
- Create: `src/lib/auth-google.ts`
- Modify: `.env.example` - Add VITE_GOOGLE_CLIENT_ID

**Features:**
- Google OAuth client configuration
- Token handling
- User profile extraction

**Acceptance Criteria:**
- [ ] OAuth config file created
- [ ] Environment variables documented
- [ ] Works with mock client ID for development
- [ ] Build passes

---

### Task 7.1.2: Implement OAuth Login Flow

**Description:** Add Google Sign-In button and flow.

**Files to modify:**
- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`

**Features:**
- "Sign in with Google" button
- OAuth redirect flow
- Token storage
- User creation/lookup
- Role assignment (default to 'tenant', admin assigns roles)

**Acceptance Criteria:**
- [ ] Google button renders
- [ ] OAuth flow initiates
- [ ] Successful login stores token
- [ ] User context updated
- [ ] Falls back to mock login if no Google client ID
- [ ] Build passes

---

### Task 7.1.3: Add OAuth Callback Handler

**Description:** Handle OAuth callback and token exchange.

**Files to create/modify:**
- Create: `src/pages/AuthCallback.tsx`
- Modify: `src/App.tsx` - Add callback route

**Features:**
- Parse OAuth callback params
- Exchange code for token
- Store user session
- Redirect to dashboard

**Acceptance Criteria:**
- [ ] Callback route `/auth/callback` exists
- [ ] Handles success and error states
- [ ] Stores session correctly
- [ ] Redirects to dashboard on success
- [ ] Build passes

---

## Batch 8: PWA Conversion

**Priority:** P2 - Offline capability
**Estimated Duration:** 60-90 minutes

### Task 8.1.1: Create PWA Manifest

**Description:** Add web app manifest for PWA.

**File to create:** `public/manifest.json`

**Manifest contents:**
- name: "PropertyManager"
- short_name: "PropMgr"
- icons: 192x192, 512x512
- start_url: "/"
- display: "standalone"
- theme_color: "#6366f1"
- background_color: "#0a0b0d"

**Files to modify:**
- `index.html` - Link manifest

**Acceptance Criteria:**
- [ ] Manifest file created
- [ ] Linked in index.html
- [ ] Valid manifest (no errors in DevTools)
- [ ] Build passes

---

### Task 8.1.2: Create Service Worker

**Description:** Add service worker for offline caching.

**File to create:** `public/sw.js`

**Caching strategy:**
- Cache-first for static assets (JS, CSS, images)
- Network-first for API calls
- Offline fallback page

**Files to modify:**
- `src/main.tsx` - Register service worker

**Acceptance Criteria:**
- [ ] Service worker file created
- [ ] Registered on app load
- [ ] Caches static assets
- [ ] Offline fallback works
- [ ] Build passes

---

### Task 8.1.3: Create PWA Icons

**Description:** Generate and add PWA icons.

**Files to create:**
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`
- `public/icons/apple-touch-icon.png`

**Use existing branding:**
- Property/house icon
- TeachAssist color scheme (#6366f1 accent)

**Acceptance Criteria:**
- [ ] Icons exist in public/icons/
- [ ] Referenced in manifest
- [ ] Apple touch icon in index.html
- [ ] Build passes

---

### Task 8.1.4: Migrate to IndexedDB (Foundation)

**Description:** Set up IndexedDB with Dexie.js for future localStorage migration.

**Files to create:**
- `src/lib/db.ts` - Dexie database setup

**Features:**
- Define all stores (settings, projects, issues, vendors, etc.)
- Migration function from localStorage
- Wrapper functions matching existing localStorage API

**Note:** This task sets up the foundation. Full migration of all services can be incremental.

**Acceptance Criteria:**
- [ ] Dexie.js added to dependencies
- [ ] Database schema defined
- [ ] Basic CRUD wrappers work
- [ ] Migration function exists (can be called manually)
- [ ] Build passes

---

## Execution Instructions

### For CC4 Autonomous Pipeline:

```bash
# Start CC4 backend (if not running)
cd ~/Projects/CommandCenterV3/backend
source .venv/bin/activate
uvicorn app.main:app --port 8001

# Execute plan
curl -X POST http://localhost:8001/api/v1/autonomous/start \
  -H "Content-Type: application/json" \
  -d '{
    "plan_path": "/Users/danielconnolly/Projects/PropertyManager/docs/plans/PROPERTYMANAGER_COMPLETION_PLAN.md",
    "start_batch": 1,
    "end_batch": 8,
    "execution_mode": "local",
    "project_path": "/Users/danielconnolly/Projects/PropertyManager"
  }'
```

### Manual Execution Order:

1. **Batch 1** - Quick Fixes (foundation)
2. **Batch 2** - Issue Types & Library (enables Batch 3-4)
3. **Batch 3** - Issue Components Part 1
4. **Batch 4** - Issue Components Part 2 + Page
5. **Batch 5** - AI Project Creator (independent)
6. **Batch 6** - Theme System (independent)
7. **Batch 7** - Google OAuth (independent)
8. **Batch 8** - PWA (independent)

---

## Success Criteria

### MVP Complete When:
- [ ] All quick fixes applied
- [ ] Issue Tracking System fully functional for all roles
- [ ] AI Project Creator works for PM role only
- [ ] Light/dark mode toggle works
- [ ] Google OAuth login works
- [ ] App installable as PWA
- [ ] All builds pass
- [ ] No TypeScript errors

### Testing Checklist:
- [ ] Login as Owner - verify vendors access, issues view
- [ ] Login as PM - verify full issue management, AI creator access
- [ ] Login as Tenant - verify issue creation, no AI creator
- [ ] Test light/dark mode toggle
- [ ] Test Google OAuth flow
- [ ] Test PWA install prompt

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI generator API not configured | Fall back to ai-mock.ts |
| Google OAuth client ID missing | Fall back to mock login |
| IndexedDB migration breaks data | Keep localStorage as backup |
| Large bundle size | Consider code splitting for 3D viewer |

---

*Plan Version: 1.0*
*Created: January 30, 2026*
*Target: PropertyManager 2.0 MVP Completion*
