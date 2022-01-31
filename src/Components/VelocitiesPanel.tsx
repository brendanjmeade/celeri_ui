/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { Velocity } from 'Utilities/VelocityFile'
import EditableItem from './EditableItem'

export interface VelocitiesDisplaySettings {
	color: string
	scale: number
	width: number
	arrowHead: number
	selectedColor: string
}

const defaultVelocityDisplaySettings: VelocitiesDisplaySettings = {
	color: '#ffffff',
	scale: 0.02,
	width: 1,
	arrowHead: 1,
	selectedColor: '#aaaaaa'
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
	addNewVelocity
}: {
	settings: VelocitiesDisplaySettings
	setSettings: (settings: VelocitiesDisplaySettings) => void
	selected: number
	velocitys: Velocity[]
	setVelocityData: (index: number, data?: Partial<Velocity>) => void
	addNewVelocity: () => void
}): ReactElement {
	const set = (s: VelocitiesDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('velocityDisplaySettings', JSON.stringify(s))
	}

	const selectedVelocity: Velocity | undefined = velocitys[selected]

	const selectedDisplay = selectedVelocity ? (
		<EditableItem
			title={selectedVelocity.name}
			item={selectedVelocity}
			deletable
			setItem={(partial): void => setVelocityData(selected, partial)}
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
					<span className='text-l font-bold'>Scale</span>
					<span className='w-2/5 flex-shrink-0'>
						<input
							className='rounded w-full'
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
							className='rounded w-full'
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
							className='rounded w-full'
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
					className='rounded bg-white hover:bg-gray-200 p-2'
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
