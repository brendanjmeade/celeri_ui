import { createAction, createReducer } from '@reduxjs/toolkit'
import type { Block } from './Block'
import type { CreateBlockAction } from './CreateBlock'
import CreateBlock from './CreateBlock'
import type { DeleteBlockAction } from './DeleteBlock'
import DeleteBlock from './DeleteBlock'
import type { EditBlockDataAction } from './EditBlockData'
import EditBlockData from './EditBlockData'
import type { LoadNewBlockDataAction } from './LoadNewBlockData'
import { LoadNewBlockData } from './LoadNewBlockData'
import type { MoveBlockAction } from './MoveBlock'
import MoveBlock from './MoveBlock'

export type BlockState = Block[]

export const initialState: BlockState = []

export const createBlock = createAction<CreateBlockAction>('createBlock')
export const editBlockData = createAction<EditBlockDataAction>('editBlock')
export const deleteBlock = createAction<DeleteBlockAction>('deleteBlock')
export const loadNewBlockData =
	createAction<LoadNewBlockDataAction>('loadNewBlockData')
export const moveBlock = createAction<MoveBlockAction>('moveBlock')

export const BlockReducer = createReducer(initialState, builder => {
	builder
		.addCase(createBlock, (state, action) => CreateBlock(state, action.payload))
		.addCase(editBlockData, (state, action) =>
			EditBlockData(state, action.payload)
		)
		.addCase(deleteBlock, (state, action) => DeleteBlock(state, action.payload))
		.addCase(loadNewBlockData, (state, action) =>
			LoadNewBlockData(state, action.payload)
		)
		.addCase(moveBlock, (state, action) => MoveBlock(state, action.payload))
})
