/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'

export interface BlockDisplaySettings {
	color: string
	radius: number
}

const defaultBlockDisplaySettings: BlockDisplaySettings = {
	color: '#0000ff',
	radius: 6
}

export const initialBlockDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	(JSON.parse(
		window.localStorage.getItem('blockDisplaySettings') ?? 'false'
	) as BlockDisplaySettings) || defaultBlockDisplaySettings

function BlockPanel({
	settings,
	setSettings
}: {
	settings: BlockDisplaySettings
	setSettings: (settings: BlockDisplaySettings) => void
}): ReactElement {
	const set = (s: BlockDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('blockDisplaySettings', JSON.stringify(s))
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
	)
}

export default BlockPanel
