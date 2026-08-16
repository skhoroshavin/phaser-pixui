# Release process

Releases are fully automated via the `Release` workflow
(`.github/workflows/release.yml`), triggered manually with `workflow_dispatch`.

## Before releasing

- All changes merged into `main`, CI green
- `CHANGELOG.md` has a section for the new version (## x.y.z heading)

## Releasing

```sh
gh workflow run release.yml \
  -f bump=patch \
  -f title="v0.3.1 - GameObjectMount fixes" \
  -f description="$(cat <<'EOF'
## Fixed

- What was broken; what happens now
EOF
)"
```

- `bump`: `patch` | `minor` | `major` — passed to `npm version`
- `title`: `v<version> - <short summary>`
- `description`: release notes body, usually mirroring the changelog section
  with `##` level headers

## What the workflow does

1. Lint, format check, build, E2E tests
2. `npm version <bump>`, regenerate E2E screenshots, commit "Bump version to
   x.y.z" and tag `vx.y.z`, pushed directly to `main`
3. Publish to npm
4. Create the GitHub release from `title`/`description`
5. Publish the example to itch.io

Note: screenshots are regenerated with `--update-snapshots` during the release,
so any visual drift on `main` is silently absorbed into the bump commit.
