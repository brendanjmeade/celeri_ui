/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockDisplaySettings } from 'Components/BlockPanel'
import BlockPanel, { initialBlockDisplaySettings } from 'Components/BlockPanel'
import type { OpenableFile } from 'Components/Files'
import Files from 'Components/Files'
import InspectorPanel from 'Components/InspectorPanel'
import CeleriMap from 'Components/Map/CeleriMap'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource
} from 'Components/Map/Sources'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import SegmentsPanel, {
	initialSegmentDisplaySettings
} from 'Components/SegmentsPanel'
import TopBar from 'Components/TopBar'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import VelocitiesPanel, {
	initialVelocityDisplaySettings
} from 'Components/VelocitiesPanel'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import VerticesPanel, {
	initialVertexDisplaySettings
} from 'Components/VertexPanel'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import {
	createBlock,
	deleteBlock,
	editBlockData,
	loadNewBlockData,
	moveBlock
} from 'State/Block/State'
import { useAppDispatch, useAppSelector } from 'State/Hooks'
import {
	bridgeVertices,
	createSegment,
	deleteSegment,
	editSegmentData,
	extrudeSegment,
	loadNewSegmentData,
	mergeVertices,
	moveVertex,
	splitSegment
} from 'State/Segment/State'
import type { Vertex } from 'State/Segment/Vertex'
import {
	DEFAULT_VERTEX,
	GetShortestLineCoordinates
} from 'State/Segment/Vertex'
import {
	createVelocity,
	deleteVelocity,
	editVelocityData,
	loadNewVelocityData,
	moveVelocity
} from 'State/Velocity/State'
import type { Velocity } from 'State/Velocity/Velocity'
import type { BlockFile } from 'Utilities/BlockFile'
import type { CommandFile } from 'Utilities/CommandFile'
import {
	OpenBlockFile,
	OpenCommandFile,
	OpenSegmentFile,
	OpenVelocityFile
} from 'Utilities/FileOpeners'
import FSOpenDirectory from 'Utilities/FileSystem'
import type { Directory } from 'Utilities/FileSystemInterfaces'
import OpenDirectory, {
	SetDirectoryHandle
} from 'Utilities/FileSystemInterfaces'
import type { SegmentFile } from 'Utilities/SegmentFile'
import type { VelocityFile } from 'Utilities/VelocityFile'

if (!window.location.search.includes('fake-dir')) {
	SetDirectoryHandle(FSOpenDirectory)
}

export type SelectionMode =
	| 'normal'
	| ({ label: string; subtitle?: string } & (
			| {
					mode: 'override'
					type: string
					callback: (indices: number[]) => void
			  }
			| { mode: 'mapClick'; callback: (point: Vertex) => void }
	  ))

enum EditMode {
	Vertex = 'Vertices',
	Block = 'Blocks',
	Velocity = 'Velocities'
}

const editModes: Record<string, EditMode> = {
	Block: EditMode.Block,
	Vertex: EditMode.Vertex,
	Velocity: EditMode.Velocity
}

const windows = {
	files: 'Files',
	segment: 'Segment',
	block: 'Block',
	velocities: 'Velocities',
	vertex: 'Vertices'
	//  mesh: 'Mesh'
}

export default function App(): ReactElement {
	const dispatch = useAppDispatch()
	const [folderHandle, setFolderHandle] = useState<Directory>()
	const [activeTab, setActiveTab] = useState<string>('')
	const [files, setFiles] = useState<Record<string, OpenableFile>>({
		command: {
			name: 'Command File',
			description: 'A file pointing to all the other relevant files',
			extension: '.json',
			currentFilePath: ''
		},
		segment: {
			name: 'Segment File',
			description: 'A CSV containing the details of fault locations',
			extension: '.csv',
			currentFilePath: ''
		},
		block: {
			name: 'Block File',
			description: 'A CSV containing information on blocks/plates',
			extension: '.csv',
			currentFilePath: ''
		},
		velocities: {
			name: 'Velocity Estimations',
			description:
				'A CSV containing velocity estimations for various points on the globe',
			extension: '.csv',
			currentFilePath: ''
		}
	})

	const [commandFile, setCommandFile] = useState<CommandFile>()
	const [segmentFile, setSegmentFile] = useState<SegmentFile>()
	const [blockFile, setBlockFile] = useState<BlockFile>()
	const [velocityFile, setVelocityFile] = useState<VelocityFile>()

	const segments = useAppSelector(state => state.main.present.segment)
	const blocks = useAppSelector(state => state.main.present.block)
	const velocities = useAppSelector(state => state.main.present.velocity)

	const [velocitiesSettings, setVelocitiesSettings] =
		useState<VelocitiesDisplaySettings>(initialVelocityDisplaySettings)
	const [blockSettings, setBlockSettings] = useState<BlockDisplaySettings>(
		initialBlockDisplaySettings
	)
	const [segmentSettings, setSegmentSettings] =
		useState<SegmentsDisplaySettings>(initialSegmentDisplaySettings)
	const [vertexSettings, setVertexSettings] = useState<VerticesDisplaySettings>(
		initialVertexDisplaySettings
	)

	const [selectionMode, setSelectionMode] = useState<SelectionMode>('normal')
	const [editMode, setEditMode] = useState<EditMode>(EditMode.Vertex)

	const [selectedBlock, setSelectedBlock] = useState<number[]>([])
	const [selectedSegment, setSelectedSegment] = useState<number[]>([])
	const [selectedVelocity, setSelectedVelocity] = useState<number[]>([])
	const [selectedVertex, setSelectedVertex] = useState<number[]>([])

	const [select, setSelect] = useState<{
		select: (type: string, indices: number[]) => void
	}>({
		select: (type: string, indices: number[]): void => {
			setSelectedBlock(type === 'block' ? indices : [])
			setSelectedSegment(type === 'segment' ? indices : [])
			setSelectedVelocity(type === 'velocities' ? indices : [])
			setSelectedVertex(type === 'vertex' ? indices : [])
			setActiveTab(type)
		}
	})

	const [pointSources, setPointSources] = useState<PointSource[]>([])
	const [arrowSources, setArrowSources] = useState<ArrowSource[]>([])
	const [lineSources, setLineSources] = useState<LineSource[]>([])
	const [drawnPointSource, setDrawnPointSource] = useState<DrawnPointSource>({
		color: vertexSettings.color,
		selectedColor: vertexSettings.activeColor,
		radius: vertexSettings.radius,
		selectedRadius: vertexSettings.activeRadius,
		points: []
	})

	const [hoverPoint, setHoverPoint] = useState<Vertex>({ lon: 0, lat: 0 })
	const [displayGrid, setDisplayGrid] = useState(false)

	useEffect(() => {
		if (selectionMode === 'normal') {
			select.select = (type: string, indices: number[]): void => {
				setSelectedBlock(type === 'block' ? indices : [])
				setSelectedSegment(type === 'segment' ? indices : [])
				setSelectedVelocity(type === 'velocities' ? indices : [])
				setSelectedVertex(type === 'vertex' ? indices : [])
				setActiveTab(type)
			}
		} else if (selectionMode.mode === 'override') {
			select.select = (type: string, indices: number[]): void => {
				if (type === selectionMode.type) {
					selectionMode.callback(indices)
				}
			}
		} else {
			select.select = (): void => {}
		}
	}, [selectionMode, select])

	useEffect(() => {
		const sources: PointSource[] = []
		if (editMode !== EditMode.Block && !blockSettings.hide) {
			sources.push({
				name: 'blocks',
				color: blockSettings.color,
				selectedColor: blockSettings.selectedColor,
				radius: blockSettings.radius,
				points: blocks.map((block, index) => ({
					longitude: block.interior_lon,
					latitude: block.interior_lat,
					name: block.name,
					description: ``,
					index
				})),
				click: (index): void => {
					select.select('block', [index])
				}
			})
		}
		if (editMode !== EditMode.Vertex && !vertexSettings.hide) {
			sources.push({
				name: 'vertices',
				color: vertexSettings.color,
				selectedColor: vertexSettings.activeColor,
				radius: vertexSettings.radius,
				click: (index): void => {
					select.select('vertex', [index])
				},
				points: Object.keys(segments.vertecies)
					.map(v => {
						const index = Number.parseInt(v, 10)
						const vert = segments.vertecies[index]
						if (vert) {
							return {
								longitude: vert.lon,
								latitude: vert.lat,
								index,
								name: '',
								description: ''
							}
						}
						return false
					})
					.filter(v => !!v) as unknown as {
					longitude: number
					latitude: number
					index: number
					name: ''
					description: ''
				}[]
			})
		}
		setPointSources(sources)
	}, [
		blockSettings,
		blocks,
		segmentSettings,
		select,
		editMode,
		vertexSettings.hide,
		vertexSettings.color,
		vertexSettings.activeColor,
		vertexSettings.radius,
		segments.vertecies
	])

	useEffect(() => {
		if (segmentSettings.hide) {
			setLineSources([])
		} else {
			setLineSources([
				{
					name: 'segments',
					color: segmentSettings.color,
					selectedColor: segmentSettings.activeColor,
					width: segmentSettings.width,
					selectedWidth: segmentSettings.activeWidth,
					lines: segments.segments.map((segment, index) => {
						const start = segments.vertecies[segment.start] ?? DEFAULT_VERTEX
						const end = segments.vertecies[segment.end] ?? DEFAULT_VERTEX
						const [
							[startLongitude, startLatitude],
							[endLongitude, endLatitude]
						] = GetShortestLineCoordinates(start, end)
						return {
							startLongitude,
							startLatitude,
							endLongitude,
							endLatitude,
							name: segment.name,
							description: `${start.lon},${start.lat} to ${end.lon},${end.lat}`,
							index
						}
					}),
					click: (index): void => {
						select.select('segment', [index])
					}
				}
			])
		}
	}, [segments, segmentSettings, select])

	useEffect(() => {
		switch (editMode) {
			case EditMode.Vertex: {
				setDrawnPointSource({
					color: vertexSettings.color,
					radius: vertexSettings.radius,
					selectedColor: vertexSettings.activeColor,
					selectedRadius: vertexSettings.activeRadius,
					points: vertexSettings.hide
						? []
						: (Object.keys(segments.vertecies)
								.map(v => {
									const index = Number.parseInt(v, 10)
									const vert = segments.vertecies[index]
									if (vert) {
										return {
											longitude: vert.lon,
											latitude: vert.lat,
											index
										}
									}
									return false
								})
								.filter(v => !!v) as unknown as {
								longitude: number
								latitude: number
								index: number
						  }[]),
					update: (index, vertex) => {
						dispatch(moveVertex({ index, vertex }))
					},
					select: index => {
						select.select('vertex', index)
					}
				})

				break
			}
			case EditMode.Block: {
				setDrawnPointSource({
					color: blockSettings.color,
					radius: blockSettings.radius,
					selectedColor: blockSettings.selectedColor,
					selectedRadius: blockSettings.radius,
					points: blockSettings.hide
						? []
						: blocks.map((block, index) => ({
								longitude: block.interior_lon,
								latitude: block.interior_lat,
								name: block.name,
								description: ``,
								index
						  })),
					update: (index, vertex) => {
						dispatch(moveBlock({ index, position: vertex }))
					},
					select: index => {
						select.select('block', index)
					}
				})

				break
			}
			case EditMode.Velocity: {
				setDrawnPointSource({
					color: velocitiesSettings.color,
					radius: velocitiesSettings.width,
					selectedColor: velocitiesSettings.selectedColor,
					selectedRadius: velocitiesSettings.width,
					points: velocitiesSettings.hide
						? []
						: velocities.map((velocity, index) => ({
								longitude: velocity.lon,
								latitude: velocity.lat,
								name: velocity.name,
								description: ``,
								index
						  })),
					update: (index, vertex) => {
						dispatch(moveVelocity({ index, position: vertex }))
					},
					select: index => {
						select.select('velocities', index)
					}
				})

				break
			}
			default:
				break
		}
	}, [
		vertexSettings,
		select,
		segments.vertecies,
		dispatch,
		editMode,
		blockSettings.color,
		blockSettings.radius,
		blockSettings.selectedColor,
		blockSettings.hide,
		blocks,
		velocitiesSettings.color,
		velocitiesSettings.width,
		velocitiesSettings.selectedColor,
		velocitiesSettings.hide,
		velocities
	])

	useEffect(() => {
		if (velocitiesSettings.hide) {
			setArrowSources([])
		} else {
			setArrowSources([
				{
					name: 'velocities',
					color: velocitiesSettings.color,
					selectedColor: velocitiesSettings.selectedColor,
					scale: velocitiesSettings.scale,
					arrowHeadScale: velocitiesSettings.arrowHead,
					width: velocitiesSettings.width,
					arrows: velocities.map((velocity, index) => {
						const scale = Math.sqrt(
							velocity.east_vel * velocity.east_vel +
								velocity.north_vel * velocity.north_vel
						)
						return {
							longitude: velocity.lon,
							latitude: velocity.lat,
							direction: [
								velocity.east_vel / scale,
								velocity.north_vel / scale
							],
							scale,
							name: velocity.name,
							description: `north: ${velocity.north_vel}, east: ${velocity.east_vel}`,
							index
						}
					}),
					click: (index): void => {
						select.select('velocities', [index])
					}
				}
			])
		}
	}, [select, velocitiesSettings, velocities])

	let view = <span />

	switch (activeTab) {
		case 'files':
			view = folderHandle ? (
				<Files
					folder={folderHandle}
					files={files}
					setFile={async (file, name, handle): Promise<void> => {
						if (handle) {
							let updated = { ...files }
							updated[file] = { ...updated[file], currentFilePath: name }
							switch (file) {
								case 'segment':
									// eslint-disable-next-line no-case-declarations
									const localSegmentFile = await OpenSegmentFile(handle)
									setSegmentFile(localSegmentFile)
									if (localSegmentFile.data) {
										dispatch(loadNewSegmentData(localSegmentFile.data))
									}
									break
								case 'block':
									// eslint-disable-next-line no-case-declarations
									const localBlockFile = await OpenBlockFile(handle)
									setBlockFile(localBlockFile)
									if (localBlockFile.data) {
										dispatch(loadNewBlockData(localBlockFile.data))
									}
									break
								case 'velocity':
									// eslint-disable-next-line no-case-declarations
									const localVelocityFile = await OpenVelocityFile(handle)
									setVelocityFile(localVelocityFile)
									if (localVelocityFile.data) {
										dispatch(loadNewVelocityData(localVelocityFile.data))
									}
									break
								case 'command':
									// eslint-disable-next-line no-case-declarations
									const commandResult = await OpenCommandFile(
										folderHandle,
										handle,
										files
									)
									setCommandFile(commandResult.commands)
									setSegmentFile(commandResult.segments)
									if (commandResult.segments.data) {
										dispatch(loadNewSegmentData(commandResult.segments.data))
									}
									setBlockFile(commandResult.blocks)
									if (commandResult.blocks.data) {
										dispatch(loadNewBlockData(commandResult.blocks.data))
									}
									setVelocityFile(commandResult.velocities)
									if (commandResult.velocities.data) {
										dispatch(loadNewVelocityData(commandResult.velocities.data))
									}
									updated = commandResult.openableFiles
									break
								default:
									break
							}
							setFiles(updated)
						}
					}}
				/>
			) : (
				<span />
			)
			break
		case 'velocities':
			view = (
				<VelocitiesPanel
					settings={velocitiesSettings}
					setSettings={setVelocitiesSettings}
					selected={selectedVelocity}
					velocitys={velocities}
					setVelocityData={(indices, data?: Partial<Velocity>): void => {
						if (data) {
							dispatch(editVelocityData({ indices, data }))
						} else {
							dispatch(deleteVelocity(indices))
							select.select('velocity', [])
						}
					}}
					addNewVelocity={(): void => {
						setSelectionMode({
							label: 'Click to place velocity estimate',
							mode: 'mapClick',
							callback: point => {
								setSelectionMode('normal')
								const id = velocities.length
								dispatch(
									createVelocity({ data: { lat: point.lat, lon: point.lon } })
								)
								select.select('velocity', [id])
							}
						})
					}}
				/>
			)
			break
		case 'block':
			view = (
				<BlockPanel
					settings={blockSettings}
					setSettings={setBlockSettings}
					selected={selectedBlock}
					blocks={blocks}
					addNewBlock={(): void => {
						setSelectionMode({
							label: 'Click to place new block',
							mode: 'mapClick',
							callback: point => {
								const id = blocks.length
								dispatch(
									createBlock({
										data: {
											name: 'New Block',
											interior_lon: point.lon,
											interior_lat: point.lat
										}
									})
								)
								select.select('block', [id])
								setSelectionMode('normal')
							}
						})
					}}
					setBlockData={(index, data): void => {
						if (data) {
							dispatch(editBlockData({ indices: selectedBlock, data }))
						} else {
							dispatch(deleteBlock(index))
							select.select('block', [])
						}
					}}
				/>
			)
			break
		case 'segment':
			view = (
				<SegmentsPanel
					settings={segmentSettings}
					setSettings={setSegmentSettings}
					segments={segments.segments ?? []}
					selected={selectedSegment}
					setSelectionMode={(mode): void => setSelectionMode(mode)}
					addNewSegment={(a, b): void => {
						const nextIndex = segments.segments.length
						dispatch(createSegment({ start: a, end: b }))
						select.select('segment', [nextIndex])
					}}
					setSegmentData={(index, data): void => {
						if (data) {
							dispatch(editSegmentData({ indices: index, data }))
						} else {
							dispatch(deleteSegment({ index }))
						}
					}}
					splitSegment={(index): void => {
						dispatch(splitSegment(index))
						select.select('segment', [])
					}}
				/>
			)
			break
		case 'vertex':
			view = (
				<VerticesPanel
					settings={vertexSettings}
					setSettings={setVertexSettings}
					vertices={segments.vertecies ?? {}}
					selected={selectedVertex}
					setVertexData={(index, data?: Vertex): void => {
						if (data) {
							dispatch(moveVertex({ index, vertex: data }))
						}
					}}
					setSelectionMode={(mode): void => setSelectionMode(mode)}
					mergeVertices={(a, b): void => {
						dispatch(mergeVertices({ a, b }))
					}}
					bridgeVertices={(a, b): void => {
						dispatch(bridgeVertices({ a, b }))
					}}
					extrudeVertex={(start, end): void => {
						dispatch(extrudeSegment({ index: start, targetPoint: end }))
					}}
				/>
			)
			break
		default:
			break
	}

	const hiddenState: Record<string, { state: boolean; change: () => void }> = {
		Block: {
			state: blockSettings.hide,
			change: () => {
				setBlockSettings({ ...blockSettings, hide: !blockSettings.hide })
			}
		},
		Vertex: {
			state: vertexSettings.hide,
			change: () => {
				setVertexSettings({ ...vertexSettings, hide: !vertexSettings.hide })
			}
		},
		Velocity: {
			state: velocitiesSettings.hide,
			change: () => {
				setVelocitiesSettings({
					...velocitiesSettings,
					hide: !velocitiesSettings.hide
				})
			}
		},
		Segment: {
			state: segmentSettings.hide,
			change: () => {
				setSegmentSettings({ ...segmentSettings, hide: !segmentSettings.hide })
			}
		},
		Grid: {
			state: !displayGrid,
			change: () => {
				setDisplayGrid(!displayGrid)
			}
		}
	}

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<div
			role='document'
			className='w-screen h-screen flex flex-col'
			onKeyDown={(event): void => {
				if (event.key === 'Escape') {
					setSelectionMode('normal')
				}
			}}
		>
			<TopBar
				filesOpen={(commandFile ?? segmentFile ?? blockFile) !== undefined}
				saveFiles={async (): Promise<void> => {
					if (commandFile) await commandFile.save()
					if (segmentFile) {
						segmentFile.data = segments
						await segmentFile.save()
					}
					if (blockFile) {
						blockFile.data = blocks
						await blockFile.save()
					}
					if (velocityFile) {
						velocityFile.data = velocities
						await velocityFile.save()
					}
				}}
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					setFolderHandle(directory)
					setActiveTab('files')
				}}
			/>
			{selectionMode !== 'normal' ? (
				<div className='fixed top-12 z-10 left-10 right-10 flex flex-row justify-center'>
					<div className='flex flex-col justify-center items-center bg-white p-3 gap-1 rounded'>
						<span className='text-lg font-semibold'>{selectionMode.label}</span>
						{selectionMode.subtitle ? (
							<span className='text-md font-thin text-gray-500'>
								{selectionMode.subtitle}
							</span>
						) : (
							<></>
						)}
						<span className='text-sm font-thin text-gray-500'>
							Press Escape to cancel
						</span>
					</div>
				</div>
			) : (
				<></>
			)}
			<div className='absolute bottom-0 left-2 flex flex-col bg-white rounded-t p-2 gap-5 shadow-sm z-50'>
				<div className='flex flex-row items-center justify-start gap-5'>
					<span className='p-1 text-sm text-center'>
						Hold <span className='font-bold'>Shift</span> to box select{' '}
						<span className='font-bold'>{editMode}</span>
					</span>
				</div>
				<div className='flex flex-row items-center justify-start gap-5'>
					<span className='p-1 text-sm font-bold text-center'>
						Coordinates:{' '}
					</span>
					<span>
						{Math.floor(hoverPoint.lon * 1000) / 1000},{' '}
						{Math.floor(hoverPoint.lat * 1000) / 1000}
					</span>
				</div>
				<div className='flex flex-row items-center justify-start gap-5'>
					<span className='p-1 text-sm font-bold text-center'>Editing: </span>
					{Object.keys(editModes).map(label => {
						const mode = editModes[label]
						return (
							<button
								key={label}
								type='button'
								className={`${
									editMode === mode ? 'bg-gray-200' : 'bg-white'
								} p-2 shaddow-inner hover:bg-gray-100 rounded`}
								onClick={(): void => {
									setEditMode(mode)
								}}
							>
								{label}
							</button>
						)
					})}
				</div>
				<div className='flex flex-row items-center justify-start gap-5'>
					<span className='p-1 text-sm font-bold text-center'>
						Displaying:{' '}
					</span>

					{Object.keys(hiddenState).map(label => {
						const state = hiddenState[label]
						return (
							<button
								key={label}
								type='button'
								className={`${
									!state.state ? 'bg-gray-200' : 'bg-white'
								} p-2 shaddow-inner hover:bg-gray-100 rounded`}
								onClick={(): void => {
									state.change()
								}}
							>
								{label}
							</button>
						)
					})}
				</div>
			</div>
			<CeleriMap
				pointSources={pointSources}
				arrowSources={arrowSources}
				lineSources={lineSources}
				drawnPointSource={drawnPointSource}
				selections={{
					segments: selectedSegment,
					blocks: selectedBlock,
					velocities: selectedVelocity,
					vertices: selectedVertex
				}}
				displayGrid={displayGrid ? 10 : -1}
				click={(point): void => {
					if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'mapClick'
					) {
						selectionMode.callback(point)
					}
				}}
				mouseMove={(point): void => {
					setHoverPoint(point)
				}}
			/>
			<InspectorPanel
				view={view}
				buttons={folderHandle ? windows : undefined}
				active={activeTab}
				setActive={(active): void => setActiveTab(active)}
			/>
		</div>
	)
}
