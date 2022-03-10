import type { MeshLineState } from './State'

export type RemoveMeshAction = string

export function RemoveMesh(
	state: MeshLineState,
	action: RemoveMeshAction
): MeshLineState {
	const result: MeshLineState = {}
	for (const key of Object.keys(state)) {
		if (key !== action) {
			result[key] = state[key]
		}
	}
	return result
}
