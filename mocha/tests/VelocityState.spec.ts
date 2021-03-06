/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { initialState, VelocityReducer } from '../../src/State/Velocity/State'
import { createVelocity } from '../../src/State/Velocity/Velocity'

describe('Velocity actions mutate state as expected', () => {
	it('Can load new data into the velocity state', () => {
		const state = VelocityReducer(initialState, {
			type: 'loadNewVelocityData',
			payload: [createVelocity({ name: 'test' })]
		})
		expect(state.length).to.equal(1)
		expect(state[0].name).to.equal('test')
	})
	it('Can create a new velocity', () => {
		const state = VelocityReducer([], {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		expect(state.length).to.equal(1)
		expect(state[0].name).to.equal('test')
	})
	it('Can edit velocity data', () => {
		const state1 = VelocityReducer([], {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state2 = VelocityReducer(state1, {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state = VelocityReducer(state2, {
			type: 'editVelocity',
			payload: { indices: [0, 1], data: { name: 'test2' } }
		})
		expect(state.length).to.equal(2)
		expect(state[0].name).to.equal('test2')
		expect(state[1].name).to.equal('test2')
	})
	it('Can delete a velocity', () => {
		const state1 = VelocityReducer([], {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state2 = VelocityReducer(state1, {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state = VelocityReducer(state2, {
			type: 'deleteVelocity',
			payload: [0]
		})
		expect(state.length).to.equal(1)
	})
	it('Can move a velocity', () => {
		const state1 = VelocityReducer([], {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state = VelocityReducer(state1, {
			type: 'moveVelocity',
			payload: { index: 0, position: { lat: 1, lon: 1 } }
		})
		expect(state.length).to.equal(1)
		expect(state[0].lat).to.equal(1)
		expect(state[0].lon).to.equal(1)
	})
})
