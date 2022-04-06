/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { Velocity } from '../State/Velocity/Velocity'
import EditableItem from './EditableItem'

export interface VelocitiesDisplaySettings {
	color: string
	scale: number
	width: number
	arrowHead: number
	selectedColor: string
	hide: boolean
}

const defaultVelocityDisplaySettings: VelocitiesDisplaySettings = {
	color: '#ffffff',
	scale: 0.02,
	width: 1,
	arrowHead: 1,
	selectedColor: '#aaaaaa',
	hide: false
}

export const initialVelocityDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	(JSON.parse(
		window.localStorage.getItem('velocityDisplaySettings') ?? 'false'
	) as VelocitiesDisplaySettings) || defaultVelocityDisplaySettings

function VelocitiesPanel({
	settings,
	setSettings,
	selected,
	velocitys,
	setVelocityData,
	addNewVelocity,
	save,
	fileName,
	changeFileName
}: {
	settings: VelocitiesDisplaySettings
	setSettings: (settings: VelocitiesDisplaySettings) => void
	selected: number[]
	velocitys: Velocity[]
	setVelocityData: (indices: number[], data?: Partial<Velocity>) => void
	addNewVelocity: () => void
	save: () => void
	fileName: string
	changeFileName: (name: string) => void
}): ReactElement {
	const set = (s: VelocitiesDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('velocityDisplaySettings', JSON.stringify(s))
	}

	const selectedVelocities: Velocity[] = selected
		.map(v => velocitys[v])
		.filter(v => v)

	const selectedDisplay =
		selectedVelocities.length > 0 ? (
			<EditableItem
				title={
					selectedVelocities.length === 1
						? selectedVelocities[0].name
						: 'Edit Selected Velocities'
				}
				items={selectedVelocities}
				deletable
				setItems={(partial): void => setVelocityData(selected, partial)}
				fieldDefinitions={{
					name: {
						order: 0,
						name: 'Name',
						description: 'The Velocity Name',
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
					<span className='text-l font-bold flex-grow'>Display</span>
					<span className='w-2/5 flex-shrink'>
						<input
							className='form-check-input appearance-none w-9 -ml-10 -full float-left h-5 align-top bg-black bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm'
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
					<input
						type='text'
						className='bg-gray-800 flex-grow'
						value={fileName}
						onChange={(event): void => {
							changeFileName(event.target.value)
						}}
					/>
					<button
						type='button'
						className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
						onClick={save}
					>
						Save Velocities
					</button>
				</div>
				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Color</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='bg-gray-800 w-full'
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
							className='bg-gray-800 w-full'
							type='color'
							value={settings.selectedColor}
							onChange={(event): void => {
								set({ ...settings, selectedColor: event.target.value })
							}}
						/>
					</span>
				</div>

				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Scale</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className=' w-full'
							type='range'
							min='0.001'
							max='0.1'
							step='0.001'
							value={settings.scale}
							onChange={(event): void => {
								set({
									...settings,
									scale: Number.parseFloat(event.target.value)
								})
							}}
						/>
					</span>
				</div>

				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Width</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className=' w-full'
							type='range'
							min='0.1'
							max='2'
							step='0.1'
							value={settings.width}
							onChange={(event): void => {
								set({
									...settings,
									width: Number.parseFloat(event.target.value)
								})
							}}
						/>
					</span>
				</div>

				<div className='flex flex-row justify-between items-center'>
					<span className='text-l font-bold'>Arrow Head Size</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className=' w-full'
							type='range'
							min='0.5'
							max='5'
							step='0.1'
							value={settings.arrowHead}
							onChange={(event): void => {
								set({
									...settings,
									arrowHead: Number.parseFloat(event.target.value)
								})
							}}
						/>
					</span>
				</div>
			</div>
			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Add New Velocity</span>
				<button
					type='button'
					className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
					onClick={addNewVelocity}
				>
					New Velocity
				</button>
			</div>
			{selectedDisplay}
		</>
	)
}

export default VelocitiesPanel
