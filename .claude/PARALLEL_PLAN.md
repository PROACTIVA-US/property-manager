# Parallel Development Plan

## Strategy
Use git worktrees + subagents to develop features in parallel, then merge to main.

## Worktree Structure
```
PropertyManager/           # main branch (coordinator)
../pm-worktrees/
  ├── feature-firebase/    # Firebase + real auth
  ├── feature-maintenance/ # Enhanced maintenance system
  ├── feature-vendors/     # Vendor management CRUD
  ├── feature-financials/  # Owner financial dashboard
  ├── feature-comms/       # Communication hub
  └── feature-tenant/      # Tenant features (rent, lease)
```

## Feature Assignments

### 1. feature-firebase (Foundation)
- Set up Firebase project config
- Firestore data models
- Replace mock auth with Firebase Auth
- Security rules by role
**Dependencies**: None (integrate later)

### 2. feature-maintenance
- Persist checklist to localStorage (then Firebase)
- Add/edit/delete tasks
- Due date management with notifications
- Major project planning section
**Dependencies**: None

### 3. feature-vendors
- Full CRUD for vendors
- Contact info, specialties
- Estimate upload & comparison
- Job history tracking
**Dependencies**: None

### 4. feature-financials
- Personal rent/utilities input
- Job income input
- Rental vs personal cost comparison
- Tax liability estimator
- Keep vs sell analysis
**Dependencies**: None

### 5. feature-comms
- In-app messaging system
- Inspection scheduling
- Tenant satisfaction tracking
- Notification center
**Dependencies**: None

### 6. feature-tenant
- Rent payment history
- Lease document viewing
- Maintenance request form
- Enhanced tenant dashboard
**Dependencies**: None

## Merge Order
1. feature-maintenance → main
2. feature-vendors → main
3. feature-tenant → main
4. feature-financials → main
5. feature-comms → main
6. feature-firebase → main (final integration)

## Commands
```bash
# Create worktree directory
mkdir -p ../pm-worktrees

# Create worktrees
git worktree add ../pm-worktrees/feature-firebase -b feature/firebase
git worktree add ../pm-worktrees/feature-maintenance -b feature/maintenance
git worktree add ../pm-worktrees/feature-vendors -b feature/vendors
git worktree add ../pm-worktrees/feature-financials -b feature/financials
git worktree add ../pm-worktrees/feature-comms -b feature/comms
git worktree add ../pm-worktrees/feature-tenant -b feature/tenant
```
