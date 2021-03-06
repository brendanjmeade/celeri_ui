/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ReactElement } from 'react'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { Segment } from 'State/Segment/Segment'
import { fieldNames } from 'State/Segment/Segment'
import type { Vertex } from 'State/Segment/Vertex'
import EditableItem from './EditableItem'

export interface SegmentsDisplaySettings {
	color: string
	width: number
	activeColor: string
	activeWidth: number
	vertexColor: string
	activeVertexColor: string
	vertexRadius: number
	activeVertexRadius: number
	hide: boolean
	hideProjection: boolean
	projectionColor: string
	plottableKey: string
}

const defaultSegmentDisplaySettings: SegmentsDisplaySettings = {
	color: '#ffff00',
	width: 1,
	activeColor: '#00ffff',
	activeWidth: 2,
	vertexColor: '#ffff00',
	activeVertexColor: '#00ffff',
	vertexRadius: 3,
	activeVertexRadius: 3,
	hide: false,
	hideProjection: false,
	projectionColor: '#ffff00',
	plottableKey: ''
}

export const initialSegmentDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	{
		...defaultSegmentDisplaySettings,
		...(JSON.parse(
			window.localStorage.getItem('segmentDisplaySettings') ?? '{}'
		) as SegmentsDisplaySettings)
	}

const plotKeyOptions = ['', ...fieldNames]

function SegmentsPanel({
	settings,
	setSettings,
	segments,
	selected,
	setSegmentData,
	addNewSegment,
	splitSegment,
	setSelectionMode,
	save,
	open
}: {
	settings: SegmentsDisplaySettings
	setSettings: (settings: SegmentsDisplaySettings) => void
	segments: Segment[]
	selected: number[]
	setSegmentData: (index: number[], data?: Partial<Segment>) => void
	setSelectionMode: (mode: SelectionMode) => void
	addNewSegment: (a: Vertex, b: Vertex) => void
	splitSegment: (index: number[]) => void
	save: (saveAs?: boolean) => void
	open: () => void
}): ReactElement {
	const set = (s: SegmentsDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('segmentDisplaySettings', JSON.stringify(s))
	}

	const selectedSegments: Segment[] = selected
		.map((s): Segment => segments[s])
		.filter(s => s)

	const selectedDisplay =
		selectedSegments.length > 0 ? (
			<EditableItem
				title={
					selectedSegments.length === 1
						? selectedSegments[0].name
						: 'Edit Selected Segments'
				}
				items={selectedSegments}
				ignoreFields={['lon1', 'lat1', 'lon2', 'lat2', 'start', 'end']}
				deletable
				setItems={(partial): void => setSegmentData(selected, partial)}
				fieldDefinitions={{
					name: {
						order: 0,
						name: 'Name',
						description: 'The Segment Name',
						type: 'string'
					}
				}}
				controls={
					<button
						type='button'
						className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
						onClick={(): void => splitSegment(selected)}
					>
						Split Segment
					</button>
				}
			/>
		) : (
			<></>
		)

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-row justify-between items-center gap-1'>
				<span className='text-l font-bold flex-grow'>Display</span>
				<span className='w-2/5 flex-shrink'>
					<input
						className='form-check-input appearance-none w-9 float-left h-5 align-top bg-black bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm'
						type='checkbox'
						role='switch'
						checked={!settings.hide}
						onChange={(): void => {
							set({ ...settings, hide: !settings.hide })
						}}
					/>
				</span>
				<span className='text-l font-bold flex-grow'>Projection</span>
				<span className='w-2/5 flex-shrink'>
					<input
						className='form-check-input appearance-none w-9 float-left h-5 align-top bg-black bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm'
						type='checkbox'
						role='switch'
						checked={!settings.hideProjection}
						onChange={(): void => {
							set({ ...settings, hideProjection: !settings.hideProjection })
						}}
					/>
				</span>
			</div>
			<div className='flex flex-row justify-between items-center gap-1'>
				<button
					type='button'
					className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
					onClick={(): void => open()}
				>
					Open Segments
				</button>
				<button
					type='button'
					className='flex-grow-0 bg-gray-700 hover:bg-gray-800 p-2 shaddow-inner'
					onClick={(): void => save()}
				>
					Save Segments & Vertices
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
				<span className='text-l font-bold'>Active Width</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='bg-gray-800 w-full'
						type='range'
						min='0.1'
						max='2'
						step='0.1'
						value={settings.activeWidth}
						onChange={(event): void => {
							set({
								...settings,
								activeWidth: Number.parseFloat(event.target.value)
							})
						}}
					/>
				</span>
			</div>

			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Projection Color</span>
				<span className='w-2/5 flex-shrink-0'>
					<input
						className='bg-gray-800 w-full'
						type='color'
						value={settings.projectionColor}
						onChange={(event): void => {
							set({ ...settings, projectionColor: event.target.value })
						}}
					/>
				</span>
			</div>

			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Plotted Value</span>
				<span className='w-2/5 flex-shrink-0'>
					<select
						className='bg-gray-800 w-full'
						value={settings.plottableKey}
						onChange={(event): void => {
							set({ ...settings, plottableKey: event.currentTarget.value })
						}}
					>
						{plotKeyOptions.map(key => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</select>
				</span>
			</div>

			<div className='flex flex-row justify-between items-center'>
				<span className='text-l font-bold'>Add New Segment</span>
				<button
					type='button'
					className=' bg-gray-700 text-white hover:bg-gray-800 p-2'
					onClick={(): void => {
						setSelectionMode({
							mode: 'mapClick',
							label: 'Select Segment Starting Point',
							callback: (a): void => {
								setSelectionMode({
									mode: 'mapClick',
									label: 'Select Segment End point',
									callback: (b): void => {
										addNewSegment(a, b)
										setSelectionMode('normal')
									}
								})
							}
						})
					}}
				>
					New Segment
				</button>
			</div>
			{selectedDisplay}
		</div>
	)
}

export default SegmentsPanel
