/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { Vertex } from 'State/Segment/Vertex'
import EditableItem from './EditableItem'

export interface VerticesDisplaySettings {
	color: string
	activeColor: string
	radius: number
	activeRadius: number
	hide: boolean
}

const defaultVertexDisplaySettings: VerticesDisplaySettings = {
	color: '#ffff00',
	activeColor: '#00ffff',
	radius: 3,
	activeRadius: 3,
	hide: false
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
	setSelectionMode,
	mergeVertices,
	bridgeVertices,
	extrudeVertex,
	save
}: {
	settings: VerticesDisplaySettings
	setSettings: (settings: VerticesDisplaySettings) => void
	vertices: Record<number, Vertex>
	selected: number[]
	setVertexData: (index: number, data?: Vertex) => void
	setSelectionMode: (mode: SelectionMode) => void
	mergeVertices: (a: number, b: number) => void
	bridgeVertices: (a: number, b: number) => void
	extrudeVertex: (start: number, end: Vertex) => void
	save: (file?: File) => void
}): ReactElement {
	const set = (s: VerticesDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('vertexDisplaySettings', JSON.stringify(s))
	}

	const selectedVertices: { selectedVertex: Vertex; index: number }[] = selected
		.map((v): { selectedVertex: Vertex; index: number } => ({
			selectedVertex: vertices[v],
			index: v
		}))
		.filter(v => v.selectedVertex)

	const selectedDisplay = selectedVertices.map(({ selectedVertex, index }) => (
		<EditableItem
			key={index}
			title='Selected Vertex'
			items={[selectedVertex]}
			ignoreFields={[]}
			deletable={false}
			setItems={(partial): void =>
				setVertexData(index, { ...selectedVertex, ...partial })
			}
			fieldDefinitions={{}}
			controls={
				<>
					<button
						type='button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
						onClick={(): void => {
							setSelectionMode({
								type: 'vertex',
								mode: 'override',
								label: 'Merge Vertices',
								subtitle: 'Click the vertex you want to merge with',
								callback: callIndex => {
									mergeVertices(index, callIndex[0])
									setSelectionMode('normal')
								}
							})
						}}
					>
						Merge
					</button>
					<button
						type='button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
						onClick={(): void => {
							setSelectionMode({
								type: 'vertex',
								mode: 'override',
								label: 'Bridge Vertices',
								subtitle: 'Click the vertex you want to bridge to',
								callback: callIndex => {
									bridgeVertices(index, callIndex[0])
									setSelectionMode('normal')
								}
							})
						}}
					>
						Bridge
					</button>
					<button
						type='button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
						onClick={(): void => {
							setSelectionMode({
								mode: 'mapClick',
								label: 'Extrude Segment From Vertex',
								subtitle: 'Click the point you want to extrude to',
								callback: (point): void => {
									extrudeVertex(index, point)
									setSelectionMode('normal')
								}
							})
						}}
					>
						Extrude
					</button>
				</>
			}
		/>
	))

	return (
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
				<button
					type='button'
					className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
					onClick={(): void => save()}
				>
					Save Segments & Vertices
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
				<span className='text-l font-bold'>Radius</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='bg-gray-800 w-full'
						type='range'
						min='0.1'
						max='5'
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
						className='bg-gray-800 w-full'
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
						className='bg-gray-800 w-full'
						type='range'
						min='0.1'
						max='5'
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
			{selectedDisplay}
		</div>
	)
}

export default VerticesPanel
