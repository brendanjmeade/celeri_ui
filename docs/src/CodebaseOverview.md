# Codebase Overview

When you first look at a new codebase it can be a bit confusing, so here we'll go over the major areas of the codebase to help you understand what's what:

- `./.github/workflows` - this folder contains the test & build workflows that are run by github. The `test.yml` & `codeql-analysis.yml` workflows are run on every commit to either main or a Pull Request targeting main - these run the tests and ensure the code is in a good place. The `publish-pages.yml` runs on every commit to main, but only if both the tests & code quality analysis pass, and it deploys a new build to [github.io](https://brendanjmeade.github.io/celeri_ui/). It can be useful to look at the results of the workflows - which can be found here: https://github.com/brendanjmeade/celeri_ui/actions

- `./.husky` - this folder contains a simple command that runs before you can commit - it ensures the code is properly formatted, and runs all the tests locally.

- `./docs/src` - this folder contains the documentation sources - mdBook have a nice [overview of how the folder is structured](https://rust-lang.github.io/mdBook/guide/creating.html), as well as an [overview of markdown](https://rust-lang.github.io/mdBook/format/markdown.html) - the format used for writing the docs themselves.

- `./mocha/tests` - this folder contains the automated tests - tests that don't involve visible components have the `.spec.ts` extension, while those that do involve visible components have the `spec.tsx` extension

- `./public` - this folder contains static assets published alongside the app - for example the icon

- `./src` - this is where the bulk of the app's code is located

  - `Components` - this is where we define the various visible components used by the UI - such as the various inspector panels, the top bar & the file explorer
    - `Map` - this is where we define the Celeri Map - this is the most complex component in the app, and is used to wrap the MapBox api's and provide an interface for the kinds of data we care about.
  - `Selectors` - this is where we define more complex selectors - functions that take in some state and create a derived value, and remember the result in case the state hasn't changed - see [createSelector](https://redux-toolkit.js.org/api/createSelector) for an overview
  - `State` - this is where we define and store the main state structures & the actions that can transform the state. Each sub-directory contains a separate "domain", where we can define the types we care about and the operations available to change it. For example - the "Block" directory defines what a block looks like in terms of the available properties, and provides operations for loading new block data (for example, from a file), creating blocks, editing blocks, moving blocks, and deleting them.
  - `Utilities` - this is where we have utility functions/classes that don't particularly fit anywhere else. For example, the interface for handling the file system or the parsers for different file types (the various CSV, .json & .msh files).
  - `main.tsx` - this file just loads the app, it is unlikely to need to change
  - `index.css` - this file defines the styles we use - notice that it uses `@tailwind` to load the styles from [TailwindCSS](https://tailwindcss.com/docs)
  - `App.tsx` - this is the core of the App - this file coordinates the global state & various top-level components

- `./index.html` - this is the main HTML file for the UI. You are unlikely to need to make changes here, but it is where things like the title of the tab are set

- `./package.json` - this is where we define the dependencies, development dependencies & runnable scripts for the develoment of celeri ui. The scripts are run using `npm run {script name}` - for example, `npm run test` runs the test script.
