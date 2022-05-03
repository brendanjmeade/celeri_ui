/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Vertex } from '../Segment/Vertex'

export type MeshLine = [Vertex, Vertex]

export interface MeshParameters {
	smoothing_weight: number
	edge_constraints: number[]
	n_eigenvalues: number
	a_priori_slip_filename: string
	mesh_filename: string
}

export const defaultMeshParameters: MeshParameters = {
	mesh_filename: '',
	smoothing_weight: 1e7,
	edge_constraints: [0, 1, 0],
	n_eigenvalues: 20,
	a_priori_slip_filename: ''
}

export interface MeshData {
	parameters: MeshParameters
	line: MeshLine[]
}
