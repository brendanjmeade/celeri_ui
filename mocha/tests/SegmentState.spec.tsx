/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { initialState, SegmentReducer } from '../../src/State/Segment/State'

describe('Segment Actions mutate state as expected', () => {
	it('Can load new data into the segment state', () => {
		const state = SegmentReducer(initialState, {
			type: 'loadNewData',
			data: {
				vertecies: { 0: { lon: 0, lat: 0 } },
				segments: [],
				vertexDictionary: {}
			}
		})
		expect(state.segments).to.have.length(0)
		expect(state.vertexDictionary).to.be.empty
		expect(state.vertecies[0]).to.exist
		expect(state.vertecies[0].lon).to.equal(0)
	})
	it('Can bridge vertices', () => {
		const state = SegmentReducer(
			{
				...initialState,
				vertecies: { 0: { lon: 0, lat: 0 }, 1: { lon: 1, lat: 1 } }
			},
			{
				type: 'bridgeVertices',
				a: 0,
				b: 1
			}
		)
		expect(state.segments).to.have.length(1)
		expect(state.segments[0].start).to.equal(0)
		expect(state.segments[0].end).to.equal(1)
	})
	it('Can create segments', () => {
		const state = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		expect(state.segments).to.have.length(1)
		expect(state.segments[0].dip).to.equal(90)
		expect(state.segments[0].locking_depth).to.equal(15)
		expect(state.vertecies[state.segments[0].start].lat).to.equal(0)
		expect(state.vertecies[state.segments[0].end].lat).to.equal(1)
	})
	it('Can create 2 segments that share a vertex', () => {
		const firstSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		const state = SegmentReducer(firstSegment, {
			type: 'createSegmet',
			start: { lon: 1, lat: 1 },
			end: { lon: 2, lat: 2 }
		})
		expect(state.segments).to.have.length(2)
		expect(state.vertecies[state.segments[1].start].lat).to.equal(1)
		expect(state.vertecies[state.segments[1].end].lat).to.equal(2)
		expect(state.segments[1].start).to.equal(state.segments[0].end)
	})
	it('Can delete a segment', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		const state = SegmentReducer(createSegment, {
			type: 'deleteSegment',
			index: 0
		})
		expect(state.segments).to.have.length(0)
	})
	it('Can delete a segment', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		const state = SegmentReducer(createSegment, {
			type: 'deleteSegment',
			index: 0
		})
		expect(state.segments).to.have.length(0)
		expect(state.vertecies).to.be.empty
	})
	it('Can delete a segment sharing a vertex with another segment', () => {
		const firstSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		const secondSegment = SegmentReducer(firstSegment, {
			type: 'createSegmet',
			start: { lon: 1, lat: 1 },
			end: { lon: 2, lat: 2 }
		})
		const state = SegmentReducer(secondSegment, {
			type: 'deleteSegment',
			index: 1
		})
		expect(state.segments).to.have.length(1)
		expect(Object.keys(state.vertecies)).to.have.length(2)
	})
	it('Can edit a segments data', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			start: { lon: 0, lat: 0 },
			end: { lon: 1, lat: 1 }
		})
		const state = SegmentReducer(createSegment, {
			type: 'editSegmentData',
			index: 0,
			data: { dip: 80 }
		})
		expect(state.segments[0].dip).to.equal(80)
		expect(state.segments[0].locking_depth).to.equal(15)
	})
})
