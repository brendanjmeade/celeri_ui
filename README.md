# celeri_ui

![test workflow](https://github.com/brendanjmeade/celeri_ui/actions/workflows/publish-pages.yml/badge.svg)

Front end for and pre-processing of kinematic earthquake cycle models associated with [celeri](https://github.com/brendanjmeade/celeri)

**Online version**: [celeri_ui](https://brendanjmeade.github.io/celeri_ui/)

**To run locally**:
- Install `npm` and `vite`
- Clone the repo.
- Create a file named `.env` in the base folder.
- Create a mapbox token and add it to the `.env` file as: `VITE_MAPBOX_TOKEN=your__mapbox_token_here`.
- Start a local server from the base folder: `npm run dev`[^1].
- Point browser[^2] to: `http://localhost:3000/`
- Enjoy.

**Docs**: [celeri_ui](https://brendanjmeade.github.io/celeri_ui/docs/index.html)

[^1]: If you get the error `Error: Cannot find module '@nabla/vite-plugin-eslint'`, try `rm -rf node_modules package-lock.json; npm install`
[^2]: Use a Chrome-based browser to write updated files.
