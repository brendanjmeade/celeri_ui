import { createAction, createReducer } from '@reduxjs/toolkit'
import type { Command } from './Command'
import { defaultCommand } from './Command'

export type CommandState = Command
export const initialState: Command = { ...defaultCommand }

export const loadCommandData = createAction<Command>('loadNewCommandData')
export const createCommandFile = createAction('newCommandFile')
export const editCommandData = createAction<Partial<Command>>('editCommandData')

export const CommandReducer = createReducer(initialState, builder => {
	builder
		.addCase(loadCommandData, (state, action) => action.payload)
		.addCase(createCommandFile, () => ({ ...defaultCommand }))
		.addCase(editCommandData, (state, action) => ({
			...state,
			...action.payload
		}))
})
