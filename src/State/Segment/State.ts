/* eslint-disable @typescript-eslint/no-magic-numbers */
import { createAction, createReducer } from '@reduxjs/toolkit'
import { along, lineString } from '@turf/turf'
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

function projectSegment(
	startVertex: Vertex,
	endVertex: Vertex,
	segment: InMemorySegment
): false | [Vertex, Vertex, Vertex, Vertex] {
	if (segment.dip === 90 || segment.locking_depth <= 0) return false
	const dipAngle = (90 - segment.dip) * (Math.PI / 180)
	const projectionDistance = Math.abs(
		Math.tan(dipAngle) * segment.locking_depth
	)

	const [start, end] =
		startVertex.lon >= endVertex.lon
			? [startVertex, endVertex]
			: [endVertex, startVertex]

	const normal = {
		lon: end.lat - start.lat,
		lat: -(end.lon - start.lon)
	}

	const pointA = along(
		lineString([
			[start.lon, start.lat],
			[start.lon + normal.lon, start.lat + normal.lat]
		]),
		projectionDistance,
		{ units: 'kilometers' }
	)
	const pointB = along(
		lineString([
			[end.lon, end.lat],
			[end.lon + normal.lon, end.lat + normal.lat]
		]),
		projectionDistance,
		{ units: 'kilometers' }
	)

	return [
		start,
		{
			lon: pointA.geometry.coordinates[0],
			lat: pointA.geometry.coordinates[1]
		},
		{
			lon: pointB.geometry.coordinates[0],
			lat: pointB.geometry.coordinates[1]
		},
		end
	]
}

export function FaultDipProjection(
	state: SegmentState
): [Vertex, Vertex, Vertex, Vertex][] {
	return state.segments
		.map(segment =>
			projectSegment(
				state.vertecies[segment.start],
				state.vertecies[segment.end],
				segment
			)
		)
		.filter(v => v) as [Vertex, Vertex, Vertex, Vertex][]
}

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
