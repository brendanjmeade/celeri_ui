/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { Block } from 'State/Block/Block'
import EditableItem from './EditableItem'

export interface BlockDisplaySettings {
	color: string
	selectedColor: string
	radius: number
	hide: boolean
}

const defaultBlockDisplaySettings: BlockDisplaySettings = {
	color: '#0000ff',
	selectedColor: '#ff0000',
	radius: 6,
	hide: false
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
	setBlockData,
	addNewBlock
}: {
	selected: number[]
	blocks: Block[]
	setBlockData: (index: number, data?: Partial<Block>) => void
	addNewBlock: () => void
	settings: BlockDisplaySettings
	setSettings: (settings: BlockDisplaySettings) => void
}): ReactElement {
	const set = (s: BlockDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('blockDisplaySettings', JSON.stringify(s))
	}

	const selectedBlocks: { selectedBlock: Block; index: number }[] = selected
		.map((v, index): { selectedBlock: Block; index: number } => ({
			selectedBlock: blocks[v],
			index
		}))
		.filter(v => v.selectedBlock)

	const selectedDisplay = selectedBlocks.map(({ selectedBlock, index }) => (
		<EditableItem
			key={index}
			title={selectedBlock.name}
			item={selectedBlock}
			deletable
			setItem={(partial): void => setBlockData(index, partial)}
			fieldDefinitions={{
				name: {
					order: 0,
					name: 'Name',
					description: 'The Block Name',
					type: 'string'
				}
			}}
		/>
	))

	return (
		<>
			<div className='flex flex-col gap-2'>
				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Display</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='form-check-input appearance-none w-9 -ml-10 rounded-full float-left h-5 align-top bg-white bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm'
							type='checkbox'
							role='switch'
							checked={!settings.hide}
							onChange={(): void => {
								set({ ...settings, hide: !settings.hide })
							}}
						/>
					</span>
				</div>
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
			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Add New Block</span>
				<button
					type='button'
					className='rounded bg-gray-700 text-white hover:bg-gray-800 p-2'
					onClick={addNewBlock}
				>
					New Block
				</button>
			</div>
			{selectedDisplay}
		</>
	)
}

export default BlockPanel
