/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { createBlock } from '../../src/State/Block/Block'
import { BlockReducer, initialState } from '../../src/State/Block/State'

describe('Block actions mutate state as expected', () => {
	it('Can load new data into the block state', () => {
		const state = BlockReducer(initialState, {
			type: 'loadNewBlockData',
			payload: [createBlock({ name: 'test' })]
		})
		expect(state.length).to.equal(1)
		expect(state[0].name).to.equal('test')
	})
	it('Can create a new block', () => {
		const state = BlockReducer([], {
			type: 'createBlock',
			payload: { data: { name: 'test' } }
		})
		expect(state.length).to.equal(1)
		expect(state[0].name).to.equal('test')
	})
	it('Can edit block data', () => {
		const state1 = BlockReducer([], {
			type: 'createBlock',
			payload: { data: { name: 'test' } }
		})
		const state2 = BlockReducer(state1, {
			type: 'createBlock',
			payload: { data: { name: 'test' } }
		})
		const state = BlockReducer(state2, {
			type: 'editBlock',
			payload: { indices: [0, 1], data: { name: 'test2' } }
		})
		expect(state.length).to.equal(2)
		expect(state[0].name).to.equal('test2')
		expect(state[1].name).to.equal('test2')
	})
	it('Can delete a block', () => {
		const state1 = BlockReducer([], {
			type: 'createBlock',
			payload: { data: { name: 'test' } }
		})
		const state = BlockReducer(state1, {
			type: 'deleteBlock',
			payload: [0]
		})
		expect(state.length).to.equal(0)
	})
	it('Can move a block', () => {
		const state1 = BlockReducer([], {
			type: 'createBlock',
			payload: { data: { name: 'test' } }
		})
		const state = BlockReducer(state1, {
			type: 'moveBlock',
			payload: { index: 0, position: { lat: 1, lon: 1 } }
		})
		expect(state.length).to.equal(1)
		expect(state[0].interior_lat).to.equal(1)
		expect(state[0].interior_lon).to.equal(1)
	})
})
