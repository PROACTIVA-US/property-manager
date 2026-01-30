# UX Validation Worktree for PropertyManager

**⚠️ YOU ARE IN A WORKTREE - NOT THE MAIN REPO**

This worktree was created for CC4's UX validation pipeline.
Changes here will be validated and can be submitted as a PR.

## Validation API

The CC4 backend is running at: http://localhost:8001

To run validation (dry run - no fixes):
```bash
curl -X POST "http://localhost:8001/api/v1/ux-pipeline/run" \
  -H "Content-Type: application/json" \
  -d '{"project_path": "/Users/danielconnolly/Projects/PropertyManager", "dry_run": true}'
```

To run validation WITH autonomous fixes:
```bash
curl -X POST "http://localhost:8001/api/v1/ux-pipeline/run" \
  -H "Content-Type: application/json" \
  -d '{"project_path": "/Users/danielconnolly/Projects/PropertyManager", "dry_run": false, "max_fix_iterations": 3}'
```

## After Validation

If fixes were made, commit and push:
```bash
git add -A
git commit -m "fix(ux): apply UX validation fixes"
git push -u origin ux-validation-20260129-1539
```

Then create a PR from the original repo.

## Pipeline Stages

1. **Research** - Searches for patterns from analogous products
2. **Understand** - Extracts personas, features, routes from PRD/code
3. **Validate** - Runs UX gates against all components
4. **Fix** - Claude Code fixes violations (if dry_run=false)
5. **Revalidate** - Confirms fixes resolved violations

## Worktree Info

- Main repo: /Users/danielconnolly/Projects/PropertyManager
- Worktree: /Users/danielconnolly/Projects/CC4-external-worktrees/PropertyManager
- Branch: ux-validation-20260129-1539
- Default branch: main
