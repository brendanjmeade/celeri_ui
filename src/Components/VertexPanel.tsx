/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { Vertex } from 'Utilities/SegmentFile'
import EditableItem from './EditableItem'

export interface VerticesDisplaySettings {
	color: string
	activeColor: string
	radius: number
	activeRadius: number
}

const defaultVertexDisplaySettings: VerticesDisplaySettings = {
	color: '#ffff00',
	activeColor: '#00ffff',
	radius: 3,
	activeRadius: 3
}

export const initialVertexDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	{
		...defaultVertexDisplaySettings,
		...(JSON.parse(
			window.localStorage.getItem('vertexDisplaySettings') ?? '{}'
		) as VerticesDisplaySettings)
	}

function VerticesPanel({
	settings,
	setSettings,
	vertices,
	selected,
	setVertexData,
	addNewVertex,
	splitVertex
}: {
	settings: VerticesDisplaySettings
	setSettings: (settings: VerticesDisplaySettings) => void
	vertices: Record<number, Vertex>
	selected: number
	setVertexData: (index: number, data?: Partial<Vertex>) => void
	addNewVertex: () => void
	splitVertex: (index: number) => void
}): ReactElement {
	const set = (s: VerticesDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('vertexDisplaySettings', JSON.stringify(s))
	}

	const selectedVertex: Vertex | undefined = vertices[selected]

	const selectedDisplay = selectedVertex ? (
		<EditableItem
			title='Selected Vertex'
			item={selectedVertex}
			ignoreFields={[]}
			deletable={false}
			setItem={(partial): void => setVertexData(selected, partial)}
			fieldDefinitions={{}}
			controls={
				<button
					type='button'
					className='rounded bg-white hover:bg-gray-200 p-2'
					onClick={(): void => splitVertex(selected)}
				>
					Split Vertex
				</button>
			}
		/>
	) : (
		<></>
	)

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
						min='0.1'
						max='2'
						step='0.1'
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

			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Active Color</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='rounded w-full'
						type='color'
						value={settings.activeColor}
						onChange={(event): void => {
							set({ ...settings, activeColor: event.target.value })
						}}
					/>
				</span>
			</div>

			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Active Radius</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='rounded w-full'
						type='range'
						min='0.1'
						max='2'
						step='0.1'
						value={settings.activeRadius}
						onChange={(event): void => {
							set({
								...settings,
								activeRadius: Number.parseFloat(event.target.value)
							})
						}}
					/>
				</span>
			</div>
			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Add New Vertex</span>
				<button
					type='button'
					className='rounded bg-white hover:bg-gray-200 p-2'
					onClick={addNewVertex}
				>
					New Vertex
				</button>
			</div>
			{selectedDisplay}
		</div>
	)
}

export default VerticesPanel
