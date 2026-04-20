# Obsidian Community Plugin Submission Notes

Use this as a working template when submitting ReadFlow to the
`obsidianmd/obsidian-releases` repository.

## Preconditions

- Public GitHub repository is ready
- GitHub release exists for the exact plugin version tag
- Release contains:
  - `manifest.json`
  - `main.js`
  - `styles.css`

## Repository checklist

- README is public-facing
- License is present
- Latest release version matches `manifest.json`
- `versions.json` maps plugin versions to `minAppVersion`

## Likely review checklist

- Plugin has a stable manifest ID
- Plugin description is clear
- Installation assets are attached to the release
- Screenshots are present in README
- No private vault-specific data remains in the published repository
