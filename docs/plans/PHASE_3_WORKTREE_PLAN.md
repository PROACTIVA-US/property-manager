# Phase 3: 3D Viewer - Worktree Development Plan

## Overview

This document outlines the git worktree workflow for developing Phase 3 (3D Viewer Integration) in isolation from the main codebase.

---

## Worktree Setup

### Current State
```bash
Worktree Location: /Users/danielconnolly/Projects/PropertyManager-3d
Branch:            feature/3d-viewer
Current Commit:    4c1a5ce (Implementation plan commit)
Status:            3 commits behind main
```

### Update Required
The feature/3d-viewer branch needs to be updated with Phase 1 and Phase 2 changes before starting Phase 3 work.

---

## Development Workflow

### Step 1: Update Worktree Branch
```bash
# Navigate to the 3D viewer worktree
cd /Users/danielconnolly/Projects/PropertyManager-3d

# Ensure we're on feature/3d-viewer branch
git checkout feature/3d-viewer

# Merge latest from main
git merge main

# Resolve any conflicts if they exist
# Install dependencies after merge
npm install
```

### Step 2: Verify Environment
```bash
# Test that the app builds successfully
npm run build

# Run dev server to ensure Phase 1 & 2 features work
npm run dev

# Check that all Phase 1 & 2 features are present:
# - Welcome Hub
# - Property Gallery
# - Notification Center
# - Project Management System
# - Project Kanban
```

### Step 3: Install Phase 3 Dependencies
```bash
# Install Three.js ecosystem packages
npm install three @react-three/fiber @react-three/drei

# Install type definitions
npm install --save-dev @types/three

# Verify installation
npm list three @react-three/fiber @react-three/drei
```

### Step 4: Create Phase 3 File Structure
```bash
# Create component directories
mkdir -p src/components/viewer3d
mkdir -p src/types
mkdir -p src/pages
mkdir -p public/models

# Directory structure:
# src/
# ├── components/
# │   └── viewer3d/
# │       ├── Property3DViewer.tsx
# │       ├── ModelViewer.tsx
# │       ├── SceneControls.tsx
# │       ├── AnnotationMarker.tsx
# │       ├── ModelUploader.tsx
# │       └── ModelLibrary.tsx
# ├── lib/
# │   └── model-library.ts
# ├── types/
# │   └── viewer3d.types.ts
# └── pages/
#     └── View3D.tsx
```

---

## Phase 3 Implementation Checklist

### Core Types & Data Models
- [ ] Create `types/viewer3d.types.ts` with interfaces:
  - `Property3DViewerProps`
  - `Annotation`
  - `ModelAsset`
  - `SceneControls`
  - `ModelUploadConfig`

### Library Functions
- [ ] Create `lib/model-library.ts`:
  - Asset catalog (trees, deck sections, fencing)
  - Asset loading functions
  - Asset caching
  - Default models

### Components (in order of dependency)

#### 1. SceneControls.tsx (Foundation)
- [ ] Set up Three.js Canvas from @react-three/fiber
- [ ] Add OrbitControls from drei
- [ ] Add lighting (ambient + directional)
- [ ] Add grid helper for orientation
- [ ] Add axes helper for debugging

#### 2. ModelViewer.tsx (Core)
- [ ] Implement GLTF/GLB loader with Suspense
- [ ] Add loading fallback component
- [ ] Handle model positioning and scaling
- [ ] Add basic materials and textures
- [ ] Error handling for invalid models

#### 3. AnnotationMarker.tsx
- [ ] Create marker mesh (sphere or custom icon)
- [ ] Use Html component from drei for labels
- [ ] Implement click handlers
- [ ] Add hover effects
- [ ] Link to project data

#### 4. ModelUploader.tsx
- [ ] File input for GLTF/GLB files
- [ ] Drag-and-drop zone
- [ ] File validation (size, format)
- [ ] Preview uploaded model
- [ ] Save to localStorage or backend

#### 5. ModelLibrary.tsx
- [ ] Display asset categories
- [ ] Thumbnail grid view
- [ ] Search/filter assets
- [ ] Drag-to-add functionality
- [ ] Asset preview on hover

#### 6. Property3DViewer.tsx (Main Container)
- [ ] Integrate all sub-components
- [ ] State management for annotations
- [ ] Mode switching (view/annotate/edit)
- [ ] Toolbar with controls
- [ ] Save/load scene state

#### 7. View3D.tsx (Page)
- [ ] Create route in App.tsx
- [ ] Page layout with sidebar
- [ ] Property selection dropdown
- [ ] Link back to property details
- [ ] Responsive design

### Integration Points
- [ ] Add "View 3D →" button to Property Gallery (WelcomeHub)
- [ ] Link annotations to Project Detail Modal
- [ ] Add 3D view option to project cards
- [ ] Store 3D model URLs in property data

### Testing & Optimization
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test performance with large models
- [ ] Add performance monitoring
- [ ] Implement LOD (Level of Detail) if needed
- [ ] Test mobile fallback (disable 3D, show 2D)

---

## Commit Strategy

### Commit Frequency
Commit after each major component is complete and tested:

```bash
# Example commits:
git add src/types/viewer3d.types.ts src/lib/model-library.ts
git commit -m "feat: add 3D viewer types and model library foundation

- Define Property3DViewerProps, Annotation, ModelAsset interfaces
- Create model-library.ts with asset catalog
- Add basic asset categories (landscape, structure, exterior)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/components/viewer3d/SceneControls.tsx
git commit -m "feat: implement SceneControls with OrbitControls

- Set up Three.js Canvas from @react-three/fiber
- Add OrbitControls for camera manipulation
- Add lighting and grid helpers
- Configure camera position and zoom

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Continue for each component...
```

### Branch Protection
- **DO NOT** merge to main until Phase 3 is complete and tested
- Keep all Phase 3 work isolated in the feature/3d-viewer branch
- Create sub-branches if experimenting with different approaches

---

## Testing Before Merge

### Functionality Checklist
- [ ] 3D model loads and displays correctly
- [ ] Camera controls work (rotate, zoom, pan)
- [ ] Can upload GLTF/GLB files
- [ ] Annotations can be placed and clicked
- [ ] Annotations link to projects correctly
- [ ] Model library loads and displays assets
- [ ] Page is accessible from navigation
- [ ] Build completes without errors
- [ ] No TypeScript errors in strict mode
- [ ] Mobile fallback works (or 3D disabled gracefully)

### Build Verification
```bash
# Clean build test
rm -rf node_modules dist
npm install
npm run build

# Should complete successfully with no errors
# Bundle size warnings are acceptable
```

---

## Merge to Main

### When Ready to Merge
```bash
# 1. Ensure worktree is clean
cd /Users/danielconnolly/Projects/PropertyManager-3d
git status  # Should be clean

# 2. Switch to main repository
cd /Users/danielconnolly/Projects/PropertyManager

# 3. Update main branch
git checkout main
git pull origin main

# 4. Merge feature branch
git merge feature/3d-viewer

# 5. Test the merge
npm install
npm run build
npm run dev

# 6. If successful, push to remote
git push origin main

# 7. Tag the release
git tag -a v2.3.0 -m "Phase 3: 3D Viewer Integration Complete"
git push origin v2.3.0

# 8. Clean up feature branch (optional, or keep for future 3D work)
# git branch -d feature/3d-viewer
# git push origin --delete feature/3d-viewer
```

---

## Parallel Development Notes

### Working Across Worktrees
If you need to reference code from main while in the 3D worktree:

```bash
# Read files from main without switching
cat /Users/danielconnolly/Projects/PropertyManager/src/components/ProjectKanban.tsx

# Or use your editor to open files from both worktrees simultaneously
```

### Avoiding Conflicts
- **Never** edit the same files in multiple worktrees at once
- Phase 3 creates NEW files, so conflicts should be minimal
- If you must modify existing files (App.tsx, etc.), do it last before merge

### Sync Strategy
```bash
# If main gets important bug fixes during Phase 3 development:
cd /Users/danielconnolly/Projects/PropertyManager-3d
git merge main  # Pull fixes into feature branch
npm install     # Update dependencies if package.json changed
```

---

## Fallback Plan (2D Alternative)

If 3D proves too complex or has performance issues:

### 2D Floor Plan Alternative
- [ ] Create ImageAnnotationViewer component
- [ ] Upload floor plan image
- [ ] Click to add markers on 2D image
- [ ] Same annotation system, just on 2D canvas
- [ ] Much lighter weight, works on all devices

### Implementation
```typescript
// Simple 2D alternative using HTML canvas
interface ImageAnnotationViewerProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationAdd: (position: [number, number]) => void;
}

// Click on image to place markers
// Draw markers as colored dots with labels
// Much simpler than 3D but still functional
```

---

## Resources

### Three.js Documentation
- Official Docs: https://threejs.org/docs/
- Examples: https://threejs.org/examples/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber/
- Drei Helpers: https://github.com/pmndrs/drei

### Free 3D Models
- Sketchfab: https://sketchfab.com/ (many free GLTF models)
- Poly Haven: https://polyhaven.com/ (CC0 3D assets)
- Three.js Editor: https://threejs.org/editor/ (create simple models)

### Learning Resources
- R3F Tutorial: https://github.com/pmndrs/react-three-fiber#tutorials
- Drei Examples: https://drei.pmnd.rs/

---

## Success Criteria (Phase 3 Complete)

- [ ] 3D model (GLTF) loads and displays in browser
- [ ] Orbit controls work smoothly (rotate, zoom, pan)
- [ ] Annotation markers can be placed on 3D model
- [ ] Markers link to project detail modal
- [ ] Can upload custom GLTF/GLB files
- [ ] Model library has at least 5 sample assets
- [ ] Page is responsive (or has mobile fallback)
- [ ] Builds successfully with no errors
- [ ] Integrated with Property Gallery "View 3D" button
- [ ] Code is documented and type-safe

---

## Estimated Timeline

| Task | Estimated Time | Priority |
|------|----------------|----------|
| Update branch & setup | 30 min | Critical |
| Install dependencies | 15 min | Critical |
| Types & lib files | 1 hour | High |
| SceneControls | 2 hours | High |
| ModelViewer | 3 hours | High |
| AnnotationMarker | 2 hours | Medium |
| ModelUploader | 2 hours | Medium |
| ModelLibrary | 3 hours | Medium |
| Property3DViewer | 2 hours | High |
| View3D page & routing | 1 hour | High |
| Integration & testing | 3 hours | High |
| **Total** | **~20 hours** | |

---

## Next Actions

1. **Update the worktree branch** with latest from main
2. **Install dependencies** in the worktree
3. **Create type definitions** as the foundation
4. **Build components incrementally**, starting with SceneControls
5. **Test frequently** to catch issues early
6. **Commit often** with clear messages
7. **Merge to main** when Phase 3 is complete

---

*Plan Created: January 24, 2026*
*Worktree: /Users/danielconnolly/Projects/PropertyManager-3d*
*Branch: feature/3d-viewer*
