/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { initialState, MeshLineReducer } from '../../src/State/MeshLines/State'

describe('Mesh Lines', () => {
	it('Can load new data into a keyed mesh line list', () => {
		const state = MeshLineReducer(initialState, {
			type: 'loadMeshLineData',
			payload: {
				mesh: 'mesh',
				data: [
					[
						{ lon: 0, lat: 0 },
						{ lon: 1, lat: 1 }
					]
				]
			}
		})

		expect(state.mesh).to.exist
		expect(state.mesh.line[0]).to.have.length(2)
		expect(state.mesh.line[0][0].lon).to.equal(0)
	})
	it('Can load new data with parameters into a keyed mesh line list', () => {
		const state = MeshLineReducer(initialState, {
			type: 'loadMeshLineData',
			payload: {
				mesh: 'mesh',
				data: [
					[
						{ lon: 0, lat: 0 },
						{ lon: 1, lat: 1 }
					]
				],
				parameters: {
					mesh_filename: 'test',
					smoothing_weight: 3,
					edge_constraints: [0, 1, 0],
					n_eigenvalues: 20,
					a_priori_slip_filename: 'me'
				}
			}
		})

		expect(state.mesh).to.exist
		expect(state.mesh.line[0]).to.have.length(2)
		expect(state.mesh.line[0][0].lon).to.equal(0)
		expect(state.mesh.parameters.mesh_filename).to.equal('test')
	})
	it('Can remove a mesh from state', () => {
		let state = MeshLineReducer(initialState, {
			type: 'loadMeshLineData',
			payload: {
				mesh: 'mesh',
				data: [
					[
						{ lon: 0, lat: 0 },
						{ lon: 1, lat: 1 }
					]
				]
			}
		})
		state = MeshLineReducer(state, {
			type: 'removeMesh',
			payload: 'mesh'
		})

		expect(state.mesh).to.not.exist
	})
})
