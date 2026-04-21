# Support

If you run into problems with ReadFlow:

## Before opening an issue

- Rebuild the plugin with `npm run build`
- Run `python3 check_release.py`
- Re-test in a clean vault if the problem may be vault-specific
- Check the Obsidian developer console for `ReadFlow` logs

## Good issue reports include

- Obsidian version
- Plugin version
- Desktop OS
- Whether the issue happens in a clean vault
- Steps to reproduce
- Relevant console logs

## WeRead-specific caveat

ReadFlow depends on WeRead web endpoints and cookie-based authentication.
If WeRead changes its web behavior, some sync or login flows may need plugin updates.
