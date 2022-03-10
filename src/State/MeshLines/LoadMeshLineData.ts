import type { MeshLine } from './MeshLine'
import type { MeshLineState } from './State'

export interface LoadMeshLineDataAction {
	mesh: string
	data: MeshLine[]
}

export function LoadMeshLineData(
	state: MeshLineState,
	action: LoadMeshLineDataAction
): MeshLineState {
	return { ...state, [action.mesh]: action.data }
}
