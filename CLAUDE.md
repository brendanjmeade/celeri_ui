# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

celeri_ui is a React/TypeScript frontend for preprocessing kinematic earthquake cycle models. It provides a map-based interface for editing geological features (segments, blocks, velocities, meshes) used by the [celeri](https://github.com/brendanjmeade/celeri) modeling system.

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000/)
npm run build        # TypeScript check + Vite build
npm run test         # Run Mocha tests
npm run lint         # Run tsc, eslint, and stylelint in parallel
npm run format       # Format all files with Prettier
```

Run a single test file:

```bash
cross-env TS_NODE_PROJECT="mocha/tsconfig.json" mocha --exit -r ts-node/register -r global-jsdom/register 'mocha/tests/SpecificTest.spec.ts'
```

## Environment Setup

Requires a `.env` file in the project root with a Mapbox token:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Architecture

### State Management (Redux Toolkit + redux-undo)

State is organized in `src/State/` with feature-based slices that support undo/redo:

- **Segment**: Fault segments with start/end vertices (graph structure with shared vertices)
- **Block**: Tectonic blocks with interior coordinates and properties
- **Velocity**: GPS velocity vectors with position and velocity components
- **MeshLines**: Mesh geometry for subsurface modeling
- **GenericSegments**: Additional line-based data overlays
- **Command**: Model configuration parameters
- **FileHandles**: File system state for saving/loading

Each slice follows a pattern: `State.ts` (reducer + actions), plus separate files for each action handler (e.g., `CreateSegment.tsx`, `DeleteSegment.tsx`).

### Map Visualization (Mapbox GL)

`src/Components/Map/` handles rendering:

- `CeleriMap.tsx`: Main map component
- Sources for different data types: `MapPoints.ts`, `MapLineSegments.ts`, `MapArrows.ts`, `MapPolygonSources.ts`

### Data Flow

1. User loads a folder via File System Access API
2. CSV files are parsed in `src/Utilities/*File.ts` (SegmentFile, BlockFile, VelocityFile, etc.)
3. Data populates Redux store
4. `SetupXxxSources.tsx` utilities transform Redux state into Mapbox sources
5. Map renders sources based on display settings in `*Panel.tsx` components

### Edit Modes

Four editing modes in `src/Utilities/EditMode.tsx`:

- **Vertex**: Edit segment endpoints
- **Block**: Edit tectonic block interior points
- **Velocity**: Edit GPS velocity markers
- **Segment**: Edit fault segment properties

Selection modes include normal click, multi-select, and lasso selection for bulk operations.

### File Formats

The app works with CSV files containing geological data. Key file types:

- Segment files: fault geometry with vertices and properties (dip, locking depth, slip rates)
- Block files: tectonic block definitions
- Velocity files: GPS velocity observations
- Command files: model configuration

## Testing

Tests are in `mocha/tests/` using Mocha, Chai, and Sinon. Tests cover state reducers and React components using @testing-library/react.
