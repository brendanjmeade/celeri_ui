import type { ReactElement } from 'react'
import type { SetGenericSegmentPositionKeysAction } from 'State/GenericSegments/SetGenericSegmentPositionKeys'
import type { GenericSegmentState } from 'State/GenericSegments/State'
import EditableItem from './EditableItem'

/* eslint-disable @typescript-eslint/no-magic-numbers */
export interface GenericSegmentDisplaySettings {
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

const defaultGenericSegmentDisplaySettings: GenericSegmentDisplaySettings = {
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
export const initialGenericSegmentDisplaySettings =
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	{
		...defaultGenericSegmentDisplaySettings,
		...(JSON.parse(
			window.localStorage.getItem('genericSegmentDisplaySettings') ?? '{}'
		) as GenericSegmentDisplaySettings)
	}

function GenericSegmentPanel({
	settings,
	setSettings,
	collections,
	setCollectionVertexKeys
}: {
	settings: GenericSegmentDisplaySettings
	setSettings: (settings: GenericSegmentDisplaySettings) => void
	collections: GenericSegmentState
	setCollectionVertexKeys: (
		parameters: SetGenericSegmentPositionKeysAction
	) => void
}): ReactElement {
	const set = (s: GenericSegmentDisplaySettings): void => {
		setSettings(s)
		window.localStorage.setItem('meshDisplaySettings', JSON.stringify(s))
	}

	const collectionEditors = Object.keys(collections).map(key => {
		const { startLat, startLon, endLat, endLon, segments, plot } =
			collections[key]
		const collectionFields = Object.keys(segments[0]).map((field, index) => ({
			name: field,
			value: index
		}))
		return (
			<EditableItem
				key={key}
				title={key}
				items={[{ startLat, startLon, endLat, endLon, plot }]}
				deletable={false}
				setItems={(value): void => {
					setCollectionVertexKeys({
						collection: key,
						startLat,
						startLon,
						endLat,
						endLon,
						plot,
						...value
					})
				}}
				fieldDefinitions={{
					startLat: {
						order: 1,
						name: 'Start Latitude',
						description: 'the column containing the segment start latitude',
						type: 'select',
						items: collectionFields
					},
					startLon: {
						order: 0,
						name: 'Start Longitude',
						description: 'the column containing the segment start longitude',
						type: 'select',
						items: collectionFields
					},
					endLat: {
						order: 3,
						name: 'End Latitude',
						description: 'the column containing the segment end latitude',
						type: 'select',
						items: collectionFields
					},
					endLon: {
						order: 2,
						name: 'End Longitude',
						description: 'the column containing the segment end longitude',
						type: 'select',
						items: collectionFields
					},
					plot: {
						order: 3,
						name: 'Plot Key',
						description: 'the column to be plotted on the map',
						type: 'select',
						items: collectionFields
					}
				}}
			/>
		)
	})

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

			{collectionEditors}
		</div>
	)
}

export default GenericSegmentPanel
