/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'

export interface VelocitiesDisplaySettings {
	color: string
	scale: number
	width: number
	arrowHead: number
}

const defaultVelocityDisplaySettings: VelocitiesDisplaySettings = {
	color: '#ffff00',
	scale: 0.02,
	width: 1,
	arrowHead: 1
}

export const initialVelocityDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	(JSON.parse(
		window.localStorage.getItem('velocityDisplaySettings') ?? 'false'
	) as VelocitiesDisplaySettings) || defaultVelocityDisplaySettings

function VelocitiesPanel({
	settings,
	setSettings
}: {
	settings: VelocitiesDisplaySettings
	setSettings: (settings: VelocitiesDisplaySettings) => void
}): ReactElement {
	const set = (s: VelocitiesDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('velocityDisplaySettings', JSON.stringify(s))
	}
	return (
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
	)
}

export default VelocitiesPanel
