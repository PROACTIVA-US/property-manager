# PropertyManager UX Improvements - Implementation Plan

Based on CC4 patterns analysis

## Phase 1: Core Infrastructure ✅ COMPLETE

- [x] Create `src/stores/helpStore.ts` - Zustand store for Help Center
- [x] Create `src/stores/aiAssistantStore.ts` - Zustand store for AI Assistant
- [x] Create `src/data/helpContent.ts` - Help articles and categories
- [x] Create `src/hooks/useRecentActivity.ts` - Activity aggregation
- [x] Create `src/services/suggestionEngine.ts` - AI suggestion generation

## Phase 2: UI Components (IN PROGRESS)

### Welcome Dashboard Components
- [ ] `src/pages/WelcomePage.tsx` - Main welcome page
- [ ] `src/components/welcome/WelcomeHero.tsx` - Greeting header
- [ ] `src/components/welcome/QuickStartSection.tsx` - Action grid
- [ ] `src/components/welcome/RecentActivitySection.tsx` - Activity stream
- [ ] `src/components/welcome/FeatureOverview.tsx` - Feature showcase

### Issue Tracking Components (Phase 1B)
- [ ] `src/pages/Issues.tsx` - Issues page with routing
- [ ] `src/components/issues/IssueList.tsx` - List/Kanban view toggle
- [ ] `src/components/issues/IssueKanban.tsx` - Kanban board view
- [ ] `src/components/issues/IssueCard.tsx` - Issue card component
- [ ] `src/components/issues/IssueCreateForm.tsx` - Create issue form (all roles)
- [ ] `src/components/issues/IssueDetailModal.tsx` - Full issue detail view
- [ ] `src/components/issues/IssueTimeline.tsx` - Activity timeline
- [ ] `src/components/issues/IssueAssignment.tsx` - Assignment UI (PM only)
- [ ] `src/components/issues/IssueResolution.tsx` - Resolution form
- [ ] `src/components/issues/IssueImageUpload.tsx` - Photo upload with preview
- [ ] `src/components/issues/TenantIssueView.tsx` - Simplified tenant view
- [ ] `src/components/issues/IssueMetrics.tsx` - SLA and resolution metrics
- [ ] `src/lib/issues.ts` - CRUD operations and localStorage

### Help Center Components
- [ ] `src/components/help/HelpCenter.tsx` - Main help panel (3 views)
- [ ] `src/components/help/ContextualTip.tsx` - Floating help tips
- [ ] `src/data/contextualTips.ts` - Route-based tips content

### AI Assistant Components
- [ ] `src/components/ai-assistant/AIAssistant.tsx` - Suggestion panel
- [ ] `src/components/ai-assistant/SuggestionCard.tsx` - Individual suggestion

### Reusable UI Components
- [ ] `src/components/ui/Tooltip.tsx` - Hover tooltip component

## Phase 3: App Integration

- [ ] Update `src/App.tsx`:
  - Add keyboard shortcuts (Cmd+K, Cmd+/, Cmd+.)
  - Add HelpCenter component
  - Add AIAssistant component
  - Add ContextualTip component
  - Add route for WelcomePage

- [ ] Update routing:
  - Make `/` route to WelcomePage
  - Keep existing routes

## Phase 4: Styling & Polish

- [ ] Add custom Tailwind colors (if needed)
- [ ] Test responsive layouts
- [ ] Test keyboard shortcuts
- [ ] Verify animations

## Phase 5: Testing & Refinement

- [ ] Test Welcome Dashboard with real data
- [ ] Test Help Center search
- [ ] Test AI suggestions on different routes
- [ ] Test keyboard navigation
- [ ] Build verification

## File Structure

```
src/
├── components/
│   ├── welcome/
│   │   ├── WelcomeHero.tsx
│   │   ├── QuickStartSection.tsx
│   │   ├── RecentActivitySection.tsx
│   │   └── FeatureOverview.tsx
│   ├── issues/
│   │   ├── IssueList.tsx
│   │   ├── IssueKanban.tsx
│   │   ├── IssueCard.tsx
│   │   ├── IssueCreateForm.tsx
│   │   ├── IssueDetailModal.tsx
│   │   ├── IssueTimeline.tsx
│   │   ├── IssueAssignment.tsx
│   │   ├── IssueResolution.tsx
│   │   ├── IssueImageUpload.tsx
│   │   ├── TenantIssueView.tsx
│   │   └── IssueMetrics.tsx
│   ├── help/
│   │   ├── HelpCenter.tsx
│   │   └── ContextualTip.tsx
│   ├── ai-assistant/
│   │   ├── AIAssistant.tsx
│   │   └── SuggestionCard.tsx
│   └── ui/
│       └── Tooltip.tsx
├── pages/
│   ├── WelcomePage.tsx
│   └── Issues.tsx
├── lib/
│   └── issues.ts
├── types/
│   └── issues.types.ts ✅
├── stores/
│   ├── helpStore.ts ✅
│   └── aiAssistantStore.ts ✅
├── hooks/
│   └── useRecentActivity.ts ✅
├── services/
│   └── suggestionEngine.ts ✅
├── data/
│   ├── helpContent.ts ✅
│   └── contextualTips.ts
└── App.tsx (updated)
```

## Key Features

### Welcome Dashboard
- Time-based greeting (Good morning/afternoon/evening)
- 6 quick action cards:
  1. Create Project with AI
  2. View Properties
  3. Report Issue (all roles)
  4. Review Projects
  5. View 3D Model
  6. Check Notifications
- Recent activity stream (last 8 items, includes issues)
- Feature overview for new users

### Issue Tracking (Phase 1B)
- **All Roles**: Report issues with photo upload
- **PM Features**:
  - Kanban and list view toggle
  - Drag-and-drop status changes
  - Assign to self, vendor, or tenant
  - SLA tracking with breach alerts
  - Resolution workflow with cost tracking
  - Convert to Project capability
- **Tenant Features**:
  - Simple issue creation form
  - View own issues and status
  - See scheduled work dates
- **Owner Features**:
  - Read-only view of all issues
  - Approve escalated issues
  - View resolution metrics

### Help Center
- Searchable documentation
- 6 categories: Getting Started, Properties, Projects, Tenants, Finances, Shortcuts
- 10 articles covering key features
- Keyboard shortcut: Cmd+/
- Viewed article tracking
- Contextual tips on route changes

### AI Assistant
- Context-aware suggestions
- 4 suggestion types: action, insight, reminder, next-step
- Priority levels: high, medium, low
- Route-specific + data-driven suggestions
- Keyboard shortcut: Cmd+.
- Auto-refresh on route changes

## Implementation Notes

1. **Stores**: Using Zustand for state management (already installed)
2. **Persistence**: Only persist viewedArticles (not UI state)
3. **Keyboard Shortcuts**: Meta key (Cmd on Mac, Ctrl on Windows)
4. **Icons**: Using lucide-react (already installed)
5. **Styling**: Tailwind CSS with existing theme
6. **Activity Aggregation**: Projects only (can add more entity types later)

## Next Steps

Ready to proceed with Phase 2 component creation. Should I:
1. Create all components in one batch?
2. Create them incrementally for testing?
3. Focus on Welcome Dashboard first, then Help, then AI Assistant?
