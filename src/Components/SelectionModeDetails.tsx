import type { ReactElement } from 'react'
import type { SelectionMode } from '../Selectors/SelectionMode'

export default function SelectionModeDetails({
	selectionMode
}: {
	selectionMode: SelectionMode
}): ReactElement {
	return selectionMode !== 'normal' ? (
		<div className='fixed top-12 z-10 left-10 right-10 flex flex-row justify-center pointer-events-none'>
			<div className='flex flex-col justify-center items-center bg-black p-3 gap-1 '>
				<span className='text-lg font-semibold'>
					{selectionMode.mode === 'lasso' ? 'lasso' : selectionMode.label}
				</span>
				{selectionMode.mode === 'lasso' || selectionMode.subtitle ? (
					<span className='text-md font-thin text-gray-500'>
						{selectionMode.mode === 'lasso'
							? 'Press Enter to Select'
							: selectionMode.subtitle}
					</span>
				) : (
					<></>
				)}
				<span className='text-sm font-thin text-gray-500'>
					Press Escape to cancel
				</span>
			</div>
		</div>
	) : (
		<></>
	)
}
