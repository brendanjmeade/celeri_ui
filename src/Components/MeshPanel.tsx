import type { ReactElement } from 'react'

/* eslint-disable @typescript-eslint/no-magic-numbers */
export interface MeshDisplaySettings {
	color: string
	width: number
	activeColor: string
	activeWidth: number
	vertexColor: string
	activeVertexColor: string
	vertexRadius: number
	activeVertexRadius: number
	hide: boolean
}

const defaultMeshDisplaySettings: MeshDisplaySettings = {
	color: '#ffffff',
	width: 0.1,
	activeColor: '#00ffff',
	activeWidth: 2,
	vertexColor: '#ffff00',
	activeVertexColor: '#00ffff',
	vertexRadius: 3,
	activeVertexRadius: 3,
	hide: false
}
export const initialMeshDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	{
		...defaultMeshDisplaySettings,
		...(JSON.parse(
			window.localStorage.getItem('meshDisplaySettings') ?? '{}'
		) as MeshDisplaySettings)
	}

function MeshPanel({
	settings,
	setSettings,
	open
}: {
	settings: MeshDisplaySettings
	setSettings: (settings: MeshDisplaySettings) => void
	open: () => void
}): ReactElement {
	const set = (s: MeshDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('meshDisplaySettings', JSON.stringify(s))
	}
	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Display</span>
				<span className='w-2/5 flex-shrink-0'>
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
				<button
					type='button'
					className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
					onClick={(): void => open()}
				>
					Open Mesh
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
				<span className='text-l font-bold'>Width</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='bg-gray-800 w-full'
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
		</div>
	)
}

export default MeshPanel
