import { createAction, createReducer } from '@reduxjs/toolkit'
import type { GenericSegmentCollection } from './GenericSegmentCollection'
import type { LoadNewGenericCollectionDataAction } from './LoadNewGenericCollectionData'
import { LoadNewGenericCollectionData } from './LoadNewGenericCollectionData'
import type { RemoveGenericCollectionAction } from './RemoveGenericSegmentCollection'
import { RemoveGenericCollection } from './RemoveGenericSegmentCollection'
import type { SetGenericSegmentPositionKeysAction } from './SetGenericSegmentPositionKeys'
import { SetGenericSegmentPositionKeys } from './SetGenericSegmentPositionKeys'

export type GenericSegmentState = Record<string, GenericSegmentCollection>

export const initialState: GenericSegmentState = {}

export const loadNewGenericCollectionData =
	createAction<LoadNewGenericCollectionDataAction>(
		'loadNewGenericCollectionData'
	)
export const setGenericSegmentPositionKeys =
	createAction<SetGenericSegmentPositionKeysAction>(
		'setGenericSegmentPositionKeys'
	)
export const removeGenericSegmentCollection =
	createAction<RemoveGenericCollectionAction>('removeGenericSegmentCollection')

export const GenericSegmentReducer = createReducer(initialState, builder =>
	builder
		.addCase(loadNewGenericCollectionData, (state, action) =>
			LoadNewGenericCollectionData(state, action.payload)
		)
		.addCase(setGenericSegmentPositionKeys, (state, action) =>
			SetGenericSegmentPositionKeys(state, action.payload)
		)
		.addCase(removeGenericSegmentCollection, (state, action) =>
			RemoveGenericCollection(state, action.payload)
		)
)
