import type { ReactElement } from 'react'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { Vertex } from 'State/Segment/Vertex'
import type { EditMode } from '../Utilities/EditMode'
import { editModes } from '../Utilities/EditMode'

export default function EditModePanel({
	selectionMode,
	setSelectionMode,
	hoverPoint,
	editMode,
	setEditMode,
	hiddenState
}: {
	selectionMode: SelectionMode
	setSelectionMode: (mode: SelectionMode) => void
	hoverPoint: Vertex
	editMode: EditMode
	setEditMode: (mode: EditMode) => void
	hiddenState: Record<string, { state: boolean; change: () => void }>
}): ReactElement {
	return (
		<div className='absolute bottom-0 left-0 flex flex-col bg-black  p-2 gap-5 shadow-sm z-50'>
			<div className='flex flex-row items-center justify-between gap-5'>
				<span className='p-1 text-sm text-center'>
					<button
						type='button'
						className={`${
							selectionMode !== 'normal' && selectionMode.mode === 'lasso'
								? 'bg-gray-700'
								: 'bg-black'
						} p-2 shaddow-inner hover:bg-gray-800 `}
						onClick={(): void => {
							setSelectionMode({ mode: 'lasso', polygon: [] })
						}}
					>
						Lasso Selection
					</button>
				</span>
			</div>
			<div className='flex flex-row items-center justify-start gap-5'>
				<span className='p-1 text-sm font-bold text-center'>Coordinates: </span>
				<span>
					{Math.floor(hoverPoint.lon * 1000) / 1000},{' '}
					{Math.floor(hoverPoint.lat * 1000) / 1000}
				</span>
			</div>
			<div className='flex flex-row items-center justify-start gap-5'>
				<span className='p-1 text-sm font-bold text-center'>Editing: </span>
				{Object.keys(editModes).map(label => {
					const mode = editModes[label]
					return (
						<button
							key={label}
							type='button'
							className={`${
								editMode === mode ? 'bg-gray-700' : 'bg-black'
							} p-2 shaddow-inner hover:bg-gray-800 `}
							onClick={(): void => {
								setEditMode(mode)
							}}
						>
							{label}
						</button>
					)
				})}
			</div>
			<div className='flex flex-row items-center justify-start gap-5'>
				<span className='p-1 text-sm font-bold text-center'>Displaying: </span>

				{Object.keys(hiddenState).map(label => {
					const state = hiddenState[label]
					return (
						<button
							key={label}
							type='button'
							className={`${
								!state.state ? 'bg-gray-700' : 'bg-black'
							} p-2 shaddow-inner hover:bg-gray-800 `}
							onClick={(): void => {
								state.change()
							}}
						>
							{label}
						</button>
					)
				})}
			</div>
		</div>
	)
}
