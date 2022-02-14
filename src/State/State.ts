import { configureStore } from '@reduxjs/toolkit'
import { SegmentReducer } from './Segment/State'

export const store = configureStore({
	reducer: {
		segments: SegmentReducer
	}
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
