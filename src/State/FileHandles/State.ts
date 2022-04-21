import { createAction, createReducer } from '@reduxjs/toolkit'
import type { Directory, File } from '../../Utilities/FileSystemInterfaces'

export interface FileHandlesState {
	rootFolder: Directory | undefined
	files: Record<string, { path: string[]; file: File }>
}

export const setRootFolder = createAction<Directory>('setRootFolder')
export const openFile =
	createAction<{ file: File; key: string; path: string[] }>('openFile')
export const closeFile = createAction<string>('closeFile')

export const initialState: FileHandlesState = {
	rootFolder: undefined,
	files: {}
}

export const FileHandlesReducer = createReducer(initialState, builder => {
	builder
		.addCase(setRootFolder, (state, action) => ({
			rootFolder: action.payload,
			files: {}
		}))
		.addCase(openFile, (state, action) => {
			const files: Record<string, { file: File; path: string[] }> = {
				...state.files
			}
			files[action.payload.key] = {
				path: action.payload.path,
				file: action.payload.file
			}
			return {
				...state,
				files
			}
		})
		.addCase(closeFile, (state, action) => {
			const files: Record<string, { file: File; path: string[] }> = {}
			Object.keys(state.files)
				.filter(key => key !== action.payload)
				.map(key => {
					files[key] = state.files[key]
					return true
				})
			return {
				...state,
				files
			}
		})
})
