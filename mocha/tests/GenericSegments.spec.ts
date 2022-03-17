/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import {
	GenericSegmentReducer,
	initialState
} from '../../src/State/GenericSegments/State'

describe('Generic Segments', () => {
	it('Can load a collection of segments with generic data', () => {
		const state = GenericSegmentReducer(initialState, {
			type: 'loadNewGenericCollectionData',
			payload: {
				name: 'segments',
				data: [
					{
						lon: 0,
						lat: 0,
						elon: 1,
						elat: 1,
						some_string: 'test',
						some_value: 15
					}
				]
			}
		})

		expect(state.segments).to.exist
		expect(state.segments.segments[0].lon).to.equal(0)
		expect(state.segments.segments[0].elon).to.equal(1)
		expect(state.segments.segments[0].some_string).to.equal('test')
		expect(state.segments.segments[0].some_value).to.equal(15)
	})
	it('Can set a generic segments longitude and latitude keys', () => {
		let state = GenericSegmentReducer(initialState, {
			type: 'loadNewGenericCollectionData',
			payload: {
				name: 'segments',
				data: [
					{
						lon: 0,
						lat: 0,
						elon: 1,
						elat: 1,
						some_string: 'test',
						some_value: 15
					}
				]
			}
		})
		state = GenericSegmentReducer(state, {
			type: 'setGenericSegmentPositionKeys',
			payload: {
				collection: 'segments',
				startLon: 'lon',
				startLat: 'lat',
				endLon: 'elon',
				endLat: 'elat'
			}
		})
		expect(state.segments.startLon).to.equal('lon')
		expect(state.segments.startLat).to.equal('lat')
		expect(state.segments.endLon).to.equal('elon')
		expect(state.segments.endLat).to.equal('elat')
	})
	it('Can remove a collection of segments with generic data', () => {
		let state = GenericSegmentReducer(initialState, {
			type: 'loadNewGenericCollectionData',
			payload: {
				name: 'segments',
				data: [
					{
						lon: 0,
						lat: 0,
						elon: 1,
						elat: 1,
						some_string: 'test',
						some_value: 15
					}
				]
			}
		})
		state = GenericSegmentReducer(state, {
			type: 'removeGenericSegmentCollection',
			payload: 'segments'
		})
		expect(state.segments).to.not.exist
	})
})
