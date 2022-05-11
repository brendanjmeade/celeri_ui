import { createSelector } from '@reduxjs/toolkit'
import type { Vertex } from '../State/Segment/Vertex'

export type SelectionMode =
	| 'normal'
	| { mode: 'lasso'; polygon: Vertex[] }
	| ({ label: string; subtitle?: string } & (
			| {
					mode: 'override'
					type: string
					callback: (indices: number[]) => void
			  }
			| { mode: 'mapClick'; callback: (point: Vertex) => void }
	  ))

export interface SelectionModeState {
	mode: SelectionMode
	setSelectedBlock: (value: number[]) => void
	setSelectedSegment: (value: number[]) => void
	setSelectedVelocity: (value: number[]) => void
	setSelectedVertex: (value: number[]) => void
	setActiveTab: (tab: string) => void
	setLassoSelection: (value: number[]) => void
}

const selectCurrentMode = (state: SelectionModeState): SelectionMode =>
	state.mode

const selectSelectedBlockSetter = (
	state: SelectionModeState
): ((value: number[]) => void) => state.setSelectedBlock
const selectSelectedSegmentSetter = (
	state: SelectionModeState
): ((value: number[]) => void) => state.setSelectedSegment
const selectSelectedVelocitySetter = (
	state: SelectionModeState
): ((value: number[]) => void) => state.setSelectedVelocity
const selectSelectedVertexSetter = (
	state: SelectionModeState
): ((value: number[]) => void) => state.setSelectedVertex
const selectActiveTabSetter = (
	state: SelectionModeState
): ((value: string) => void) => state.setActiveTab
const selecetLassoSelectionSetter = (
	state: SelectionModeState
): ((value: number[]) => void) => state.setLassoSelection

export const SelectionModeSelector = createSelector(
	selectCurrentMode,
	selectSelectedBlockSetter,
	selectSelectedSegmentSetter,
	selectSelectedVelocitySetter,
	selectSelectedVertexSetter,
	selectActiveTabSetter,
	selecetLassoSelectionSetter,
	(
		currentMode,
		setSelectedBlock,
		setSelectedSegment,
		setSelectedVelocity,
		setSelectedVertex,
		setActiveTab,
		setLassoSelection
	) => {
		if (currentMode === 'normal' || currentMode.mode === 'lasso') {
			return (type: string, indices: number[]): void => {
				setSelectedBlock(type === 'block' ? indices : [])
				setSelectedSegment(type === 'segment' ? indices : [])
				setSelectedVelocity(type === 'velocities' ? indices : [])
				setSelectedVertex(type === 'vertex' ? indices : [])
				if (currentMode !== 'normal' && currentMode.mode === 'lasso') {
					setLassoSelection(indices)
				}
				setActiveTab(type)
			}
		}
		if (currentMode.mode === 'override') {
			return (type: string, indices: number[]): void => {
				if (type === currentMode.type) {
					currentMode.callback(indices)
				}
			}
		}
		return (): void => {}
	}
)
