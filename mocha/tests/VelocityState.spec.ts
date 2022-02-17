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
		const state = VelocityReducer(state1, {
			type: 'editVelocity',
			payload: { index: 0, data: { name: 'test2' } }
		})
		expect(state.length).to.equal(1)
		expect(state[0].name).to.equal('test2')
	})
	it('Can delete a velocity', () => {
		const state1 = VelocityReducer([], {
			type: 'createVelocity',
			payload: { data: { name: 'test' } }
		})
		const state = VelocityReducer(state1, {
			type: 'deleteVelocity',
			payload: 0
		})
		expect(state.length).to.equal(0)
	})
})
