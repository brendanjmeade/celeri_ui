import { createAction, createReducer } from '@reduxjs/toolkit'
import type { BridgeVerticesAction } from './BridgeVertices'
import BridgeVertices from './BridgeVertices'
import type { CreateSegmentAction } from './CreateSegment'
import CreateSegment from './CreateSegment'
import type { DeleteSegmentAction } from './DeleteSegment'
import DeleteSegment from './DeleteSegment'
import type { EditSegmentDataAction } from './EditSegmentData'
import EditSegmentData from './EditSegmentData'
import type { ExtrudeSegmentAction } from './ExtrudeSegment'
import ExtrudeSegment from './ExtrudeSegment'
import type { LoadNewSegmentDataAction } from './LoadNewSegmentData'
import LoadNewSegmentData from './LoadNewSegmentData'
import type { MergeVerticesAction } from './MergeVertices'
import MergeVertices from './MergeVertices'
import type { MoveVertexAction } from './MoveVertex'
import MoveVertex from './MoveVertex'
import type { InMemorySegment } from './Segment'
import type { SplitSegmentAction } from './SplitSegment'
import SplitSegment from './SplitSegment'
import type { Vertex } from './Vertex'

export interface SegmentState {
	vertecies: Record<number, Vertex>
	lastIndex: number
	segments: InMemorySegment[]
	vertexDictionary: Record<string, number>
}

export const initialState: SegmentState = {
	vertecies: {},
	lastIndex: 0,
	segments: [],
	vertexDictionary: {}
}

export const bridgeVertices =
	createAction<BridgeVerticesAction>('bridgeVertices')
export const createSegment = createAction<CreateSegmentAction>('createSegmet')
export const deleteSegment = createAction<DeleteSegmentAction>('deleteSegment')
export const editSegmentData =
	createAction<EditSegmentDataAction>('editSegmentData')
export const extrudeSegment =
	createAction<ExtrudeSegmentAction>('extrudeSegment')
export const loadNewSegmentData =
	createAction<LoadNewSegmentDataAction>('loadNewSegmentData')
export const mergeVertices = createAction<MergeVerticesAction>('mergeVertices')
export const moveVertex = createAction<MoveVertexAction>('moveVertex')
export const splitSegment = createAction<SplitSegmentAction>('splitSegment')

export const SegmentReducer = createReducer(initialState, builder => {
	builder
		.addCase(bridgeVertices, (state, action) =>
			BridgeVertices(state, action.payload)
		)
		.addCase(createSegment, (state, action) =>
			CreateSegment(state, action.payload)
		)
		.addCase(deleteSegment, (state, action) =>
			DeleteSegment(state, action.payload)
		)
		.addCase(editSegmentData, (state, action) =>
			EditSegmentData(state, action.payload)
		)
		.addCase(extrudeSegment, (state, action) =>
			ExtrudeSegment(state, action.payload)
		)
		.addCase(loadNewSegmentData, (state, action) =>
			LoadNewSegmentData(state, action.payload)
		)
		.addCase(mergeVertices, (state, action) =>
			MergeVertices(state, action.payload)
		)
		.addCase(moveVertex, (state, action) => MoveVertex(state, action.payload))
		.addCase(splitSegment, (state, action) =>
			SplitSegment(state, action.payload)
		)
})