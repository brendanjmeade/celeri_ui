import { createAction, createReducer } from '@reduxjs/toolkit'
import type { LoadMeshLineDataAction } from './LoadMeshLineData'
import { LoadMeshLineData } from './LoadMeshLineData'
import type { MeshLine } from './MeshLine'

export type MeshLineState = MeshLine[]

export const initialState: MeshLineState = []

export const loadMeshLineData =
	createAction<LoadMeshLineDataAction>('loadMeshLineData')

export const MeshLineReducer = createReducer(initialState, builder =>
	builder.addCase(loadMeshLineData, (state, action) =>
		LoadMeshLineData(state, action.payload)
	)
)
