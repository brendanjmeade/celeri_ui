import type { ReactElement } from 'react'
import type { Command } from 'State/Command/Command'
import EditableItem from './EditableItem'

export default function CommandPanel({
	command,
	save,
	open,
	setCommandData
}: {
	command: Command
	save: (saveAs?: boolean) => void
	open: () => void
	setCommandData: (changes: Partial<Command>) => void
}): ReactElement {
	return (
		<>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-row justify-between items-center'>
					<button
						type='button'
						className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
						onClick={(): void => open()}
					>
						Open Command File
					</button>
					<button
						type='button'
						className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
						onClick={(): void => save()}
					>
						Save Command File
					</button>
					<button
						type='button'
						className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
						onClick={async (): Promise<void> => {
							save(true)
						}}
					>
						Save As
					</button>
				</div>
			</div>
			<EditableItem
				title={command.file_name}
				items={[command]}
				deletable={false}
				setItems={(partial): void => partial && setCommandData(partial)}
				fieldDefinitions={{}}
				ignoreFields={[
					'segment_file_name',
					'station_file_name',
					'block_file_name',
					'mesh_parameters_file_name',
					'file_name'
				]}
			/>
		</>
	)
}
