import { createAction, createReducer } from '@reduxjs/toolkit'
import type { LoadMeshLineDataAction } from './LoadMeshLineData'
import { LoadMeshLineData } from './LoadMeshLineData'
import type { MeshData } from './MeshLine'
import type { RemoveMeshAction } from './RemoveMesh'
import { RemoveMesh } from './RemoveMesh'

export type MeshLineState = Record<string, MeshData>

export const initialState: MeshLineState = {}

export const loadMeshLineData =
	createAction<LoadMeshLineDataAction>('loadMeshLineData')
export const removeMesh = createAction<RemoveMeshAction>('removeMesh')
export const clearMeshes = createAction('clearMeshes')

export const MeshLineReducer = createReducer(initialState, builder =>
	builder
		.addCase(loadMeshLineData, (state, action) =>
			LoadMeshLineData(state, action.payload)
		)
		.addCase(removeMesh, (state, action) => RemoveMesh(state, action.payload))
		.addCase(clearMeshes, () => initialState)
)
