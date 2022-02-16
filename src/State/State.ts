import { combineReducers, configureStore } from '@reduxjs/toolkit'
import undoable from 'redux-undo'
import { SegmentReducer } from './Segment/State'

export const store = configureStore({
	reducer: {
		main: undoable(combineReducers({ segment: SegmentReducer }))
	}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
