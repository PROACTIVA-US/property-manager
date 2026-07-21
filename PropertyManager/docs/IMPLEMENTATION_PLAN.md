# PropertyManager 2.0 - Consolidated Implementation Plan

> Single source of truth for all implementation tasks, replacing scattered documentation

---

## Document Consolidation Notice

This document **replaces and consolidates**:
- `docs/UX_IMPLEMENTATION_PLAN.md` (archived)
- `docs/CONTINUE_UX_IMPLEMENTATION.md` (archived)
- `docs/NEXT_SESSION_PROMPT.md` (archived)
- `docs/plans/PHASE_3_WORKTREE_PLAN.md` (archived)

All future planning should reference this document and `docs/TRUE_NORTH.md`.

---

## Current State Assessment

### Completed Features
- [x] Phase 1: Welcome Hub & Tenant Responsibilities (merged)
- [x] Phase 2: Project Management System with Kanban (merged)
- [x] Phase 3: 3D Property Viewer with Three.js (merged)
- [x] Phase 4 Part 1: AI Types & Services (in feature/ai-bom branch)
- [x] Core infrastructure: Zustand stores, hooks, services
- [x] Help Center with Cmd+/
- [x] AI Assistant panel with Cmd+.
- [x] Contextual tips system

### Known Issues (Priority Order)
1. **Owner name shows generic** - settings.ts has "Property Owner" not "Shanie Holman"
2. **Vendors hidden from owners** - Should be read-only visible
3. **AI Assistant buried** - Below settings in navigation
4. **Financials UX poor** - 5 tabs, confusing colors, no immediate chart
5. **Welcome page sparse for owners** - Missing gallery, financial snapshot
6. **Documents disconnected** - Not contextual to projects
7. **No light mode** - Only dark theme available
8. **Projects incomplete** - Missing image gallery, stakeholder per-project input

---

## Implementation Phases

### Phase A: Quick Fixes (1-2 hours)
**Goal**: Immediate UX improvements without major refactoring

#### A.1 Fix Owner Name Data
```typescript
// src/lib/settings.ts - Update DEFAULT_OWNER
export const DEFAULT_OWNER: OwnerData = {
  name: 'Shanie Holman',
  email: 'shanie@email.com',
  phone: '(555) 100-0002',
  entityType: 'individual',
  // ... rest
};
```

#### A.2 Enable Vendors for Owners (Read-Only)
```typescript
// src/components/Layout.tsx - Line 62
{ name: 'Vendors', href: '/vendors', icon: HardHat, roles: ['pm', 'owner'] },

// src/pages/Vendors.tsx - Add read-only mode
const isReadOnly = user?.role === 'owner';
```

#### A.3 Move AI Assistant to Top of Navigation
```typescript
// src/components/Layout.tsx - Move AI toggle above navigation items
```

#### A.4 Fix Financial Color Consistency
- Green = positive/income/up
- Red = negative/expense/down
- Consistent across all financial displays

---

### Phase B: TeachAssist Design System (2-3 hours)
**Goal**: Adopt TeachAssist color scheme with light/dark mode

#### B.1 Update Tailwind Configuration
```css
/* src/index.css */
@theme {
  /* Dark mode (default) - TeachAssist colors */
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

  /* Light mode overrides */
  .light {
    --color-pm-bg: #ffffff;
    --color-pm-surface: #f8fafc;
    --color-pm-border: #e2e8f0;
    --color-pm-text: #1e293b;
    --color-pm-muted: #64748b;
  }
}
```

#### B.2 Create Theme Toggle Component
```typescript
// src/components/ThemeToggle.tsx
// - Toggle between light/dark mode
// - Persist preference to localStorage
// - Add to Layout header or settings
```

#### B.3 Update Component Classes
- Replace `brand-*` classes with `pm-*` classes
- Update all card, button, input styles
- Ensure contrast ratios meet accessibility standards

---

### Phase C: Owner Welcome Page Redesign (3-4 hours)
**Goal**: Rich, informative dashboard for property owners

#### C.1 WelcomeHero Enhancement
```typescript
// src/components/welcome/WelcomeHero.tsx
// - Display owner name prominently
// - Show property address
// - Property status indicator
```

#### C.2 Property Image Gallery
```typescript
// src/components/welcome/PropertyGallery.tsx
// - Scrolling image carousel
// - Pull from documents with category='photo'
// - Lightbox on click
```

#### C.3 Financial Snapshot
```typescript
// src/components/welcome/FinancialSnapshot.tsx
// - Cash flow chart (immediate display)
// - Key metrics: rent, cash flow, vacancy
// - Link to full financials
```

#### C.4 Active Projects Summary
```typescript
// src/components/welcome/ActiveProjectsSummary.tsx
// - Progress bars for active projects
// - Budget vs actual cost
// - Next milestone due
// - Link to full project details
```

---

### Phase D: Projects & Maintenance Unification (4-6 hours)
**Goal**: Make projects the central hub for all property work

#### D.1 Rename Navigation Item
```
"Maintenance" → "Projects & Maintenance"
```

#### D.2 Project Card Enhancement
```typescript
// src/components/ProjectCard.tsx (enhanced)
// - Progress bar
// - Cost summary (budget vs actual)
// - Timeline (start → end)
// - Assigned vendor(s)
// - Image thumbnail (if available)
// - Quick actions
```

#### D.3 Project Detail Tabs Enhancement
```typescript
// ProjectDetailModal tabs:
1. Overview (summary, status, priority)
2. Timeline (phases with dates, milestones)
3. Budget (estimated vs actual, expenses linked)
4. Images (before/during/after gallery)
5. Tasks (checklists tied to phases)
6. Documents (contextual to this project)
7. Stakeholders (comments, approvals)
8. Messages (project-specific thread)
9. Impact Analysis (tenant/owner impact)
```

#### D.4 Routine Maintenance Integration
```typescript
// Convert routine maintenance tasks to "recurring project" type
// No separate modal - inline with projects
// Categories: daily, weekly, monthly, quarterly, annual
```

---

### Phase E: Financials Simplification (3-4 hours)
**Goal**: One clear view with expandable sections, not 5 tabs

#### E.1 Single-View Financials Page
```typescript
// src/pages/Financials.tsx (redesigned)
<FinancialsPage>
  <CashFlowChart />  {/* IMMEDIATELY VISIBLE */}

  <ExpandableSection title="Property Value">
    <PropertyValueWidget />
  </ExpandableSection>

  <ExpandableSection title="Income & Expenses">
    <IncomeExpenseBreakdown />
  </ExpandableSection>

  <ExpandableSection title="Mortgage & Payoff">
    <MortgageDetails />
    <PayoffCalculator />
  </ExpandableSection>

  <ExpandableSection title="Tax Planning">
    <TaxAnalysis />
  </ExpandableSection>

  <AIFinancialChat />  {/* "Ask about your finances" */}
</FinancialsPage>
```

#### E.2 Color Consistency Fix
- Income: Green text, green icons
- Expenses: Red text, red icons
- Positive trends: Green with up arrow
- Negative trends: Red with down arrow

---

### Phase F: AI Assistant Prominence (2-3 hours)
**Goal**: Make AI a core feature, not an afterthought

#### F.1 Navigation Position
```typescript
// Move to top of sidebar, before main navigation
<Sidebar>
  <Logo />
  <AIAssistantToggle />  {/* TOP POSITION */}
  <Navigation />
  <UserProfile />
</Sidebar>
```

#### F.2 Context-Aware Suggestions
```typescript
// Enhance suggestionEngine.ts
// - Financial page: Investment insights, tax tips
// - Projects page: Next steps, cost alerts
// - Messages: Follow-up reminders
// - Welcome: Daily priorities
```

#### F.3 Inline AI on Financial Page
```typescript
// Chat-style interface at bottom of Financials
// "Should I pay extra on my mortgage?"
// "What's my break-even if I sell?"
```

---

### Phase G: Complete Phase 4 - AI Project Creation (2-3 hours)
**Goal**: Finish the AI-powered project generation feature

#### G.1 SmartProjectCreator Component
```typescript
// src/components/bom/SmartProjectCreator.tsx
// - Natural language input
// - AI generates project plan
// - Creates phases, BOM, impact analysis
```

#### G.2 Integration with Projects Page
```typescript
// "Create with AI ✨" button on Projects page
// Opens SmartProjectCreator modal
// Saves generated project to list
```

---

### Phase H: OAuth Integration (Future)
**Goal**: Real authentication replacing mock login

#### H.1 Setup
- Configure Google OAuth credentials
- Configure Apple Sign-In
- Environment variables

#### H.2 Implementation
- Update AuthContext with OAuth flow
- Add OAuth buttons to Login page
- Handle callbacks and token refresh

#### H.3 User Management
- Link OAuth identity to user roles
- Role assignment flow (owner/pm/tenant)
- Multi-property support (future)

---

## Priority Matrix

| Phase | Impact | Effort | Priority |
|-------|--------|--------|----------|
| A: Quick Fixes | High | Low | **P0 - Do First** |
| B: Design System | Medium | Medium | P1 |
| C: Owner Welcome | High | Medium | P1 |
| D: Projects Hub | High | High | P2 |
| E: Financials | High | Medium | P2 |
| F: AI Prominence | Medium | Low | P1 |
| G: AI Projects | Medium | Medium | P3 |
| H: OAuth | Low | High | P4 |

---

## File Changes Summary

### New Files to Create
```
src/components/ThemeToggle.tsx
src/components/welcome/PropertyGallery.tsx
src/components/welcome/FinancialSnapshot.tsx
src/components/welcome/ActiveProjectsSummary.tsx
src/components/financials/CashFlowChart.tsx
src/components/financials/ExpandableSection.tsx
src/components/financials/AIFinancialChat.tsx
src/components/bom/SmartProjectCreator.tsx
src/components/bom/BOMDetailView.tsx
```

### Files to Modify
```
src/index.css                    → TeachAssist colors + light mode
src/lib/settings.ts              → Fix owner name
src/components/Layout.tsx        → AI position, vendor access
src/pages/Vendors.tsx            → Read-only mode for owners
src/pages/Financials.tsx         → Single-view redesign
src/pages/WelcomePage.tsx        → Owner-specific content
src/pages/Maintenance.tsx        → Rename, integrate with projects
src/components/ProjectKanban.tsx → Enhanced project cards
```

### Files to Archive (Deprecate)
```
docs/UX_IMPLEMENTATION_PLAN.md      → Replaced by this document
docs/CONTINUE_UX_IMPLEMENTATION.md  → Replaced by this document
docs/NEXT_SESSION_PROMPT.md         → Replaced by this document
```

---

## Testing Checklist

### After Each Phase
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] All three roles can login
- [ ] Navigation works for each role
- [ ] Keyboard shortcuts work (Cmd+/, Cmd+.)
- [ ] Mobile responsive check

### Specific Tests
- [ ] Owner can see vendors (read-only)
- [ ] Owner name displays correctly
- [ ] Financial colors are consistent
- [ ] AI Assistant opens from top of nav
- [ ] Welcome page shows gallery for owners
- [ ] Projects show progress and costs
- [ ] Light/dark mode toggle works

---

## Session Start Prompt

Copy this to start a new session:

```
Continue PropertyManager 2.0 implementation.

Reference documents:
- docs/TRUE_NORTH.md - Guiding vision and values
- docs/FLOW_DIAGRAM.md - System architecture
- docs/IMPLEMENTATION_PLAN.md - This document

Current priority: Phase [X]

Please:
1. Review the phase requirements
2. Implement the changes
3. Test with npm run build
4. Commit with clear message
```

---

## CC4 Integration Opportunity

**Key Insight**: CC4's decision-making capabilities could enforce UX consistency.

**Recommended CC4 Workflow**:
1. **UX Design Review** - Validate component designs against True North principles
2. **Color Consistency Check** - Ensure semantic colors used correctly
3. **Navigation Audit** - Verify role-based access patterns
4. **Accessibility Scan** - Check contrast, keyboard navigation

See separate document: `docs/CC4_INTEGRATION.md` (to be created)

---

*This is the single implementation plan for PropertyManager 2.0. Update this document as work progresses.*
