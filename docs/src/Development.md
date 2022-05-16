# Development

[Open a GitPod Workspace](https://gitpod.io/#https://github.com/brendanjmeade/celeri_ui)

## Pre-requisites

Celeri UI is built using a few well-established tools.

The following are the foundational tools for working in the codebase - you'd need at least a basic understanding of these to be able to contribute to the code:

- [Git](https://git-scm.com/) - this is the source code management toolset.
- [Typescript](https://www.typescriptlang.org/) - this is the programming language we use.
- [React](https://reactjs.org/docs/getting-started.html) - a library that makes it easier to generate & interact with the html in the page, by creating a set of components that manage their own display.
- [Redux](https://redux.js.org/introduction/getting-started) - a library that handles state management, and makes it easier to have deterministic & testable state changes.
- [Mocha](https://mochajs.org/) - a library to enable testing in Javascript/Typescript in a fairly isolated fashion.
- [NodeJs](https://nodejs.org/en/) - this is used to manage the packages we utilize, and execute the tests & build processes.

If you need to make adjustments to how the map is drawn, or the items displayed on top of the map, you will need to work with [MapBox](https://docs.mapbox.com/mapbox-gl-js/example/) & [MapBox Draw](https://github.com/mapbox/mapbox-gl-draw) - however, it might be enough to look at things as you go.

The development server & build pipeline are based on [Vite](https://vitejs.dev/), and the actual build is deployed with github actions, which run the automated tests & a code quality check, before building and publishing the built version. We are using [mdBook](https://rust-lang.github.io/mdBook/) for the docs.

We recommend using [GitPod](https://gitpod.io) for development, rather than setting up a local development environment, since it handles all the complexity of that for you. You can open a workspace by using the link above.

### Set Up (Optional)

If you wish to set up a local development enviroment, you will need to install NodeJS on your machine, clone the git repository, and run `npm install` within it.

## Development Command Line Commands

- If you are running in a local environment, or if you changed the dependencies (in the package.json file), you will need to run `npm install` to ensure all the correct packages are installed.
- To start the development server, you can run `npm run dev` in the command line.
- To run the tests, run `npm run test` in the commad line
- To start the documentation server (so you can view the docs, or your changes to them in real time), run `npm run docs:dev`
- While developing, you will need to use `git commit`, `git pull` & `git push`
