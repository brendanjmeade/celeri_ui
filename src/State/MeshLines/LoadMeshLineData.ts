import type { MeshLine, MeshParameters } from './MeshLine'
import { defaultMeshParameters } from './MeshLine'
import type { MeshLineState } from './State'

export interface LoadMeshLineDataAction {
	mesh: string
	data: MeshLine[]
	parameters?: MeshParameters
}

export function LoadMeshLineData(
	state: MeshLineState,
	action: LoadMeshLineDataAction
): MeshLineState {
	return {
		...state,
		[action.mesh]: {
			parameters: action.parameters ?? defaultMeshParameters,
			line: action.data
		}
	}
}
