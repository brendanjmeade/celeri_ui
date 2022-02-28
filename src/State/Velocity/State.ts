import { createAction, createReducer } from '@reduxjs/toolkit'
import type { CreateVelocityAction } from './CreateVelocity'
import CreateVelocity from './CreateVelocity'
import type { DeleteVelocityAction } from './DeleteVelocity'
import DeleteVelocity from './DeleteVelocity'
import type { EditVelocityDataAction } from './EditVelocityData'
import EditVelocityData from './EditVelocityData'
import type { LoadNewVelocityDataAction } from './LoadNewVelocityData'
import { LoadNewVelocityData } from './LoadNewVelocityData'
import type { MoveVelocityAction } from './MoveVelocity'
import MoveVelocity from './MoveVelocity'
import type { Velocity } from './Velocity'

export type VelocityState = Velocity[]

export const initialState: VelocityState = []

export const createVelocity =
	createAction<CreateVelocityAction>('createVelocity')
export const editVelocityData =
	createAction<EditVelocityDataAction>('editVelocity')
export const deleteVelocity =
	createAction<DeleteVelocityAction>('deleteVelocity')
export const loadNewVelocityData = createAction<LoadNewVelocityDataAction>(
	'loadNewVelocityData'
)
export const moveVelocity = createAction<MoveVelocityAction>('moveVelocity')

export const VelocityReducer = createReducer(initialState, builder => {
	builder
		.addCase(createVelocity, (state, action) =>
			CreateVelocity(state, action.payload)
		)
		.addCase(editVelocityData, (state, action) =>
			EditVelocityData(state, action.payload)
		)
		.addCase(deleteVelocity, (state, action) =>
			DeleteVelocity(state, action.payload)
		)
		.addCase(loadNewVelocityData, (state, action) =>
			LoadNewVelocityData(state, action.payload)
		)
		.addCase(moveVelocity, (state, action) =>
			MoveVelocity(state, action.payload)
		)
})
