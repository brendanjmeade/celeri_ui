/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { Block } from 'Utilities/BlockFile'
import EditableItem from './EditableItem'

export interface BlockDisplaySettings {
	color: string
	selectedColor: string
	radius: number
}

const defaultBlockDisplaySettings: BlockDisplaySettings = {
	color: '#0000ff',
	selectedColor: '#ff0000',
	radius: 6
}

export const initialBlockDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	(JSON.parse(
		window.localStorage.getItem('blockDisplaySettings') ?? 'false'
	) as BlockDisplaySettings) || defaultBlockDisplaySettings

function BlockPanel({
	settings,
	setSettings,
	selected,
	blocks,
	setBlockData
}: {
	selected: number
	blocks: Block[]
	setBlockData: (index: number, data: Partial<Block>) => void
	settings: BlockDisplaySettings
	setSettings: (settings: BlockDisplaySettings) => void
}): ReactElement {
	const set = (s: BlockDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('blockDisplaySettings', JSON.stringify(s))
	}

	const selectedBlock: Block | undefined = blocks[selected]

	const selectedDisplay = selectedBlock ? (
		<EditableItem
			title={selectedBlock.name}
			item={selectedBlock}
			setItem={(partial): void => setBlockData(selected, partial)}
			fieldDefinitions={{
				name: {
					order: 0,
					name: 'Name',
					description: 'The Block Name',
					type: 'string'
				}
			}}
		/>
	) : (
		<></>
	)

	return (
		<>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Color</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='rounded w-full'
							type='color'
							value={settings.color}
							onChange={(event): void => {
								set({ ...settings, color: event.target.value })
							}}
						/>
					</span>
				</div>
				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Selected Color</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='rounded w-full'
							type='color'
							value={settings.selectedColor}
							onChange={(event): void => {
								set({ ...settings, selectedColor: event.target.value })
							}}
						/>
					</span>
				</div>

				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Radius</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='rounded w-full'
							type='range'
							min='2'
							max='10'
							step='0.5'
							value={settings.radius}
							onChange={(event): void => {
								set({
									...settings,
									radius: Number.parseFloat(event.target.value)
								})
							}}
						/>
					</span>
				</div>
			</div>
			{selectedDisplay}
		</>
	)
}

export default BlockPanel
