import { configureStore } from '@reduxjs/toolkit'
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
import type { LoadNewDataAction } from './LoadNewData'
import LoadNewData from './LoadNewData'
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
	segments: InMemorySegment[]
	vertexDictionary: Record<string, number>
}

export const initialState: SegmentState = {
	vertecies: {},
	segments: [],
	vertexDictionary: {}
}
export type SegmentAction =
	| BridgeVerticesAction
	| CreateSegmentAction
	| DeleteSegmentAction
	| EditSegmentDataAction
	| ExtrudeSegmentAction
	| LoadNewDataAction
	| MergeVerticesAction
	| MoveVertexAction
	| SplitSegmentAction

export function SegmentReducer(
	// eslint-disable-next-line @typescript-eslint/default-param-last
	state: SegmentState = initialState,
	action: SegmentAction
): SegmentState {
	let updatedState = state
	switch (action.type) {
		case 'loadNewData':
			updatedState = LoadNewData(state, action)
			break
		case 'bridgeVertices':
			updatedState = BridgeVertices(state, action)
			break
		case 'createSegmet':
			updatedState = CreateSegment(state, action)
			break
		case 'deleteSegment':
			updatedState = DeleteSegment(state, action)
			break
		case 'editSegmentData':
			updatedState = EditSegmentData(state, action)
			break
		case 'extrudeSegment':
			updatedState = ExtrudeSegment(state, action)
			break
		case 'mergeVertices':
			updatedState = MergeVertices(state, action)
			break
		case 'moveVertex':
			updatedState = MoveVertex(state, action)
			break
		case 'splitSegment':
			updatedState = SplitSegment(state, action)
			break
		default:
			break
	}
	return updatedState
}

export const store = configureStore({
	reducer: SegmentReducer
})

export type SegmentDispatch = typeof store.dispatch
