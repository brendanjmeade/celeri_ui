import { combineReducers, configureStore } from '@reduxjs/toolkit'
import undoable from 'redux-undo'
import { BlockReducer } from './Block/State'
import { SegmentReducer } from './Segment/State'
import { VelocityReducer } from './Velocity/State'

export const store = configureStore({
	reducer: {
		main: undoable(
			combineReducers({
				segment: SegmentReducer,
				block: BlockReducer,
				velocity: VelocityReducer
			})
		)
	}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch