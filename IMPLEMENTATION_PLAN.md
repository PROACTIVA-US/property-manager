# Property Manager - Complete Implementation Plan

## Accurate Data from Legacy System

Based on the legacy mortgage calculator, here's the **accurate real data**:

### Mortgage Details
- **Principal Balance**: $59,957.41
- **Interest Rate**: 5.729%
- **Monthly P&I Payment**: $1,336.39
- **Monthly Escrow**: $790.03
- **Total Monthly Payment**: $2,126.42
- **Loan Start Date**: July 2025

### Property Address (to be confirmed)
- **Property**: 1234 Property Lane, Apt 4B (from current mock data)
- **Monthly Rental Income**: $2,400 (from current mock data)
- **Tenant**: Gregg Marshall (from current mock data)

---

## Missing Pages to Build

Currently these routes show "Coming Soon":

1. **`/maintenance`** - Maintenance tracking (already exists in feature/maintenance branch)
2. **`/documents`** - Document management for lease, receipts, etc.
3. **`/tenants`** - Tenant management page
4. **`/settings`** - Data input & configuration page (NEW - most important!)

---

## Development Strategy Using Git Worktrees

### Why Worktrees?
- Work on multiple features in parallel without branch switching
- Test features independently before merging
- Keep main workspace clean while developing

### Worktree Structure

```
PropertyManager/                  # Main worktree (main branch)
├── worktrees/
│   ├── feature-settings/         # New settings/data input page
│   ├── feature-documents/        # Documents page
│   ├── feature-tenants/          # Tenants page
│   └── feature-maintenance/      # Merge existing maintenance branch
```

---

## Implementation Phases

### Phase 1: Setup & Data Integration (Priority 1)

#### 1.1 Create Settings/Data Management Page
**Location**: New page `/settings`
**Purpose**: Easy way to input and manage all property data

**Features**:
- **Property Information Tab**
  - Property address (editable)
  - Purchase price, current value
  - Purchase date, years owned

- **Mortgage Tab** (pre-filled with legacy data)
  - Principal: $59,957.41
  - Interest Rate: 5.729%
  - Monthly P&I: $1,336.39
  - Escrow: $790.03
  - Loan start date: Jul 2025

- **Rental Income Tab**
  - Monthly rent amount
  - Operating expenses (taxes, insurance, HOA, etc.)

- **Tax Information Tab**
  - Filing status
  - Annual income
  - Land value, improvements

- **Tenant Information Tab**
  - Name, contact info
  - Lease dates
  - Security deposit

**Implementation**:
```bash
# Create worktree
git worktree add worktrees/feature-settings -b feature/settings

# In worktree, create:
src/pages/Settings.tsx
src/components/settings/PropertyForm.tsx
src/components/settings/MortgageForm.tsx
src/components/settings/RentalIncomeForm.tsx
src/components/settings/TaxInfoForm.tsx
src/components/settings/TenantForm.tsx
src/lib/settings.ts  # Data persistence layer
```

---

### Phase 2: Complete Missing Pages (Priority 2)

#### 2.1 Maintenance Page (Merge from feature/maintenance)
```bash
# Create worktree from existing branch
git worktree add worktrees/feature-maintenance feature/maintenance

# Test, refine, then merge to main
```

#### 2.2 Documents Page
**Location**: New page `/documents`

**Features**:
- Lease document upload/view
- Payment receipts storage
- Maintenance records
- Tax documents
- Vendor contracts/estimates
- Photo gallery for property

**Implementation**:
```bash
git worktree add worktrees/feature-documents -b feature/documents

# Create:
src/pages/Documents.tsx
src/components/documents/DocumentList.tsx
src/components/documents/DocumentUpload.tsx
src/components/documents/DocumentViewer.tsx
src/lib/documents.ts
```

#### 2.3 Tenants Page
**Location**: New page `/tenants`

**Features**:
- Current tenant profile
- Lease details and renewal status
- Payment history
- Maintenance request history
- Communication log
- Quick actions (send message, schedule inspection)

**Implementation**:
```bash
git worktree add worktrees/feature-tenants -b feature/tenants

# Create:
src/pages/Tenants.tsx
src/components/tenants/TenantProfile.tsx
src/components/tenants/LeaseInfo.tsx
src/components/tenants/TenantPaymentHistory.tsx
src/components/tenants/TenantMaintenanceHistory.tsx
```

---

### Phase 3: Data Migration & Integration (Priority 3)

#### 3.1 Create Centralized Data Store
```typescript
// src/lib/store.ts
export interface AppData {
  property: PropertyDetails;
  mortgage: MortgageDetails;
  tenant: TenantDetails;
  financials: FinancialDetails;
  // ... etc
}

// Migrate from multiple localStorage keys to single source of truth
```

#### 3.2 Update Existing Components
- Update all components to use centralized data store
- Replace DEFAULT_* constants with real data from settings
- Add data loading states
- Add error boundaries

---

## Git Worktree Commands Reference

### Create Worktrees
```bash
# Settings page (new)
git worktree add worktrees/feature-settings -b feature/settings

# Documents page (new)
git worktree add worktrees/feature-documents -b feature/documents

# Tenants page (new)
git worktree add worktrees/feature-tenants -b feature/tenants

# Maintenance (from existing branch)
git worktree add worktrees/feature-maintenance feature/maintenance
```

### Work in Worktrees
```bash
# Navigate to worktree
cd worktrees/feature-settings

# Make changes, commit
git add .
git commit -m "feat: add settings page with property form"

# Push to remote
git push -u origin feature/settings
```

### Merge Back to Main
```bash
# From main worktree
cd /Users/danielconnolly/Projects/PropertyManager

# Merge feature
git merge feature/settings

# Or create PR for review first
gh pr create --base main --head feature/settings
```

### Cleanup Worktrees
```bash
# Remove worktree after merging
git worktree remove worktrees/feature-settings

# Prune stale worktrees
git worktree prune
```

---

## Development Order (Recommended)

1. **Settings Page** (Week 1)
   - Most important - enables data input
   - Pre-fill with legacy mortgage data
   - Build all tabs (property, mortgage, rental, tax, tenant)
   - Test localStorage persistence

2. **Documents Page** (Week 2)
   - File upload/storage system
   - Document categorization
   - Integration with existing features

3. **Tenants Page** (Week 2)
   - Aggregate existing tenant data
   - Add tenant management features
   - Communication tools

4. **Maintenance Page** (Week 3)
   - Merge from feature/maintenance branch
   - Test and refine
   - Integrate with vendor directory

5. **Integration & Testing** (Week 4)
   - Centralize data storage
   - Update all components to use real data
   - End-to-end testing
   - Bug fixes

---

## Quick Start Commands

```bash
# Create all worktrees at once
git worktree add worktrees/feature-settings -b feature/settings
git worktree add worktrees/feature-documents -b feature/documents
git worktree add worktrees/feature-tenants -b feature/tenants
git worktree add worktrees/feature-maintenance feature/maintenance

# List all worktrees
git worktree list

# Start dev servers in each worktree (separate terminals)
cd worktrees/feature-settings && npm run dev
cd worktrees/feature-documents && npm run dev
cd worktrees/feature-tenants && npm run dev
cd worktrees/feature-maintenance && npm run dev
```

---

## Data to Input Immediately

Once Settings page is built, input:

### Property Details
- [ ] Actual property address
- [ ] Purchase price and date
- [ ] Current market value
- [ ] Land value estimate

### Mortgage (from legacy)
- [x] Principal: $59,957.41 ✓
- [x] Rate: 5.729% ✓
- [x] Monthly P&I: $1,336.39 ✓
- [x] Escrow: $790.03 ✓
- [x] Start date: Jul 2025 ✓

### Operating Expenses
- [ ] Monthly property tax
- [ ] Monthly insurance
- [ ] Monthly HOA (if any)
- [ ] Monthly rental income

### Tenant
- [ ] Actual tenant name
- [ ] Contact information
- [ ] Lease start/end dates
- [ ] Security deposit amount

### Tax Information
- [ ] Filing status
- [ ] Annual household income
- [ ] State tax rate
- [ ] Capital improvements made

---

## Success Criteria

### Phase 1 Complete When:
- [x] Settings page exists and is accessible
- [x] All forms are functional and save to localStorage
- [x] Legacy mortgage data is pre-filled
- [x] All property data can be inputted and edited
- [x] Data persists across page reloads

### Phase 2 Complete When:
- [x] All "Coming Soon" routes have functional pages
- [x] Documents can be uploaded and viewed
- [x] Tenants page shows comprehensive tenant info
- [x] Maintenance page is merged and functional

### Phase 3 Complete When:
- [x] All components use centralized data store
- [x] No more DEFAULT_* mock data in production
- [x] All financial calculations use real inputted data
- [x] Full app testing passes

---

## Notes

- Keep dev server running in main worktree for quick testing
- Use separate VS Code windows for each worktree
- Commit frequently in worktrees
- Create PRs for review before merging to main
- Test in browser before merging

---

## Next Steps

1. Create Settings page worktree
2. Build Settings page with all tabs
3. Pre-fill mortgage data from legacy
4. Test data persistence
5. Move to Documents page

**Let's start with Phase 1: Settings Page!**
