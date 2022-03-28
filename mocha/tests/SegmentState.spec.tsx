/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import {
	FaultDipProjection,
	initialState,
	SegmentReducer
} from '../../src/State/Segment/State'

describe('Segment Actions mutate state as expected', () => {
	it('Can load new data into the segment state', () => {
		const state = SegmentReducer(initialState, {
			type: 'loadNewSegmentData',
			payload: {
				vertecies: { 0: { lon: 0, lat: 0 } },
				segments: [],
				vertexDictionary: {},
				lastIndex: 0
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
				payload: { a: 0, b: 1 }
			}
		)
		expect(state.segments).to.have.length(1)
		expect(state.segments[0].start).to.equal(0)
		expect(state.segments[0].end).to.equal(1)
	})
	it('Can create segments', () => {
		const state = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
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
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(firstSegment, {
			type: 'createSegmet',
			payload: {
				start: { lon: 1, lat: 1 },
				end: { lon: 2, lat: 2 }
			}
		})
		expect(state.segments).to.have.length(2)
		expect(state.vertecies[state.segments[1].start].lat).to.equal(1)
		expect(state.vertecies[state.segments[1].end].lat).to.equal(2)
		expect(state.segments[1].start).to.equal(state.segments[0].end)
	})
	it('Can delete a segment', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment, {
			type: 'deleteSegment',
			payload: { index: [0] }
		})
		expect(state.segments).to.have.length(0)
	})
	it('Can delete a segment', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment, {
			type: 'deleteSegment',
			payload: { index: [0] }
		})
		expect(state.segments).to.have.length(0)
		expect(state.vertecies).to.be.empty
	})
	it('Can delete a segment sharing a vertex with another segment', () => {
		const firstSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const secondSegment = SegmentReducer(firstSegment, {
			type: 'createSegmet',
			payload: {
				start: { lon: 1, lat: 1 },
				end: { lon: 2, lat: 2 }
			}
		})
		const state = SegmentReducer(secondSegment, {
			type: 'deleteSegment',
			payload: { index: [1] }
		})
		expect(state.segments).to.have.length(1)
		expect(Object.keys(state.vertecies)).to.have.length(2)
	})
	it('Can edit a segments data', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const createSegment2 = SegmentReducer(createSegment, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment2, {
			type: 'editSegmentData',
			payload: {
				indices: [0, 1],
				data: { dip: 80 }
			}
		})
		expect(state.segments[0].dip).to.equal(80)
		expect(state.segments[0].locking_depth).to.equal(15)
		expect(state.segments[1].dip).to.equal(80)
		expect(state.segments[1].locking_depth).to.equal(15)
	})
	it('Can extrude a segments', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment, {
			type: 'extrudeSegment',
			payload: {
				index: 0,
				targetPoint: { lon: 2, lat: 2 }
			}
		})
		expect(state.segments[1].start).to.equal(0)
		expect(state.segments[1].end).to.equal(2)
		expect(state.vertecies[2].lon).to.equal(2)
	})
	it('can merge vertices', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const createSegment2 = SegmentReducer(createSegment, {
			type: 'createSegmet',
			payload: {
				start: { lon: 1, lat: 1 },
				end: { lon: 2, lat: 2 }
			}
		})
		const state = SegmentReducer(createSegment2, {
			type: 'mergeVertices',
			payload: {
				a: 0,
				b: 1
			}
		})
		expect(state.vertecies[0]).to.exist
		expect(state.vertecies[1]).to.not.exist
		expect(state.segments).to.have.length(1)
		expect(state.segments[0].start).to.equal(0)
		expect(state.segments[0].end).to.equal(2)
		expect(state.vertecies[0].lat).to.equal(0)
	})
	it('merging a vertex with itself doesnt change the state', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment, {
			type: 'mergeVertices',
			payload: {
				a: 0,
				b: 0
			}
		})
		expect(state.vertecies[0]).to.exist
		expect(state.vertecies[1]).to.exist
		expect(state.segments).to.have.length(1)
		expect(state.segments[0].start).to.equal(0)
		expect(state.segments[0].end).to.equal(1)
		expect(state.vertecies[0].lat).to.equal(0)
	})
	it('can move vertices', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const state = SegmentReducer(createSegment, {
			type: 'moveVertex',
			payload: {
				index: 0,
				vertex: { lon: 2, lat: 2 }
			}
		})
		expect(state.vertecies[0].lon).to.equal(2)
	})
	it('can split segments', () => {
		const createSegment = SegmentReducer(initialState, {
			type: 'createSegmet',
			payload: {
				start: { lon: 0, lat: 0 },
				end: { lon: 1, lat: 1 }
			}
		})
		const setData = SegmentReducer(createSegment, {
			type: 'editSegmentData',
			payload: {
				indices: [0],
				data: { name: 'test_name' }
			}
		})
		const state = SegmentReducer(setData, {
			type: 'splitSegment',
			payload: [0]
		})
		expect(state.segments[0].start).to.equal(0)
		expect(state.segments[0].end).to.equal(2)
		expect(state.segments[0].name).to.equal('test_name_a')
		expect(state.segments[1].start).to.equal(2)
		expect(state.segments[1].end).to.equal(1)
		expect(state.segments[1].name).to.equal('test_name_b')
		expect(state.vertecies[2].lon).to.equal(0.5)
	})
	describe('can calculate fault dip projections', () => {
		it('fault dip projections ignore a locking depth less than or equal to zero', () => {
			const state = SegmentReducer(initialState, {
				type: 'createSegmet',
				payload: {
					start: { lon: 0, lat: 0 },
					end: { lon: 1, lat: 1 },
					locking_depth: 0,
					dip: 50
				}
			})
			const projection = FaultDipProjection(state)
			expect(projection).to.have.length(0)
		})
		it('fault dip projections ignore a dip of 90 degrees', () => {
			const state = SegmentReducer(initialState, {
				type: 'createSegmet',
				payload: {
					start: { lon: 0, lat: 0 },
					end: { lon: 1, lat: 1 },
					locking_depth: 10,
					dip: 90
				}
			})
			const projection = FaultDipProjection(state)
			expect(projection).to.have.length(0)
		})
		it('projects a segment with a dip of 45 & depth of 1 correctly', () => {
			const state = SegmentReducer(initialState, {
				type: 'createSegmet',
				payload: {
					start: { lon: 0, lat: 0 },
					end: { lon: 0, lat: 1 },
					locking_depth: 1,
					dip: 45
				}
			})
			const projection = FaultDipProjection(state)
			expect(projection).to.have.length(1)
			const rect = projection[0]

			expect(rect[0].lon).to.be.closeTo(0, 0.001)
			expect(rect[0].lat).to.be.closeTo(0, 0.001)

			expect(rect[1].lon).to.be.closeTo(0.008_993_203_637_245_385, 0.001)
			expect(rect[1].lat).to.be.closeTo(0, 0.001)

			expect(rect[2].lon).to.be.closeTo(0.008_993_203_637_245_385, 0.001)
			expect(rect[2].lat).to.be.closeTo(1, 0.001)

			expect(rect[3].lon).to.be.closeTo(0, 0.001)
			expect(rect[3].lat).to.be.closeTo(1, 0.001)
		})
	})
})
