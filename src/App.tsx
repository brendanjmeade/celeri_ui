/* eslint-disable unicorn/no-nested-ternary */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BlockDisplaySettings } from 'Components/BlockPanel'
import BlockPanel, { initialBlockDisplaySettings } from 'Components/BlockPanel'
import CommandPanel from 'Components/CommandPanel'
import FileExplorer from 'Components/FileExplorer'
import type { GenericSegmentDisplaySettings } from 'Components/GenericSegmentPanel'
import GenericSegmentPanel, {
	initialGenericSegmentDisplaySettings
} from 'Components/GenericSegmentPanel'
import InspectorPanel from 'Components/InspectorPanel'
import CeleriMap from 'Components/Map/CeleriMap'
import type {
	ArrowSource,
	DrawnPointSource,
	LineSource,
	PointSource,
	PolygonSource
} from 'Components/Map/Sources'
import type { MapSettings } from 'Components/MapSettingsPanel'
import {
	initialMapSettings,
	MapSettingsPanel
} from 'Components/MapSettingsPanel'
import type { MeshDisplaySettings } from 'Components/MeshPanel'
import MeshPanel, { initialMeshDisplaySettings } from 'Components/MeshPanel'
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
import type { SelectionMode } from 'Selectors/SelectionMode'
import { SelectionModeSelector } from 'Selectors/SelectionMode'
import {
	createBlock,
	deleteBlock,
	editBlockData,
	loadNewBlockData,
	moveBlock
} from 'State/Block/State'
import { editCommandData, loadCommandData } from 'State/Command/State'
import { openFile, setRootFolder } from 'State/FileHandles/State'
import {
	loadNewGenericCollectionData,
	setGenericSegmentPositionKeys
} from 'State/GenericSegments/State'
import { useAppDispatch, useAppSelector } from 'State/Hooks'
import { clearMeshes, loadMeshLineData } from 'State/MeshLines/State'
import {
	bridgeVertices,
	createSegment,
	deleteSegment,
	editSegmentData,
	extrudeSegment,
	FaultDipProjection,
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
import { GenerateBlockFileString, LoadBlockFileData } from 'Utilities/BlockFile'
import { OpenCommandFile, OpenMeshParametersFile } from 'Utilities/FileOpeners'
import FSOpenDirectory from 'Utilities/FileSystem'
import type { Directory, File } from 'Utilities/FileSystemInterfaces'
import OpenDirectory, {
	GetProjectPath,
	SetDirectoryHandle
} from 'Utilities/FileSystemInterfaces'
import GenericSegmentFile from 'Utilities/GenericSegmentFile'
import MeshFile from 'Utilities/MeshFile'
import { PointsInPolygon } from 'Utilities/PointUtilities'
import {
	GenerateSegmentFileString,
	LoadSegmentFile
} from 'Utilities/SegmentFile'
import {
	GenerateVelocityFileString,
	LoadVelocityFile
} from 'Utilities/VelocityFile'

if (!window.location.search.includes('fake-dir')) {
	SetDirectoryHandle(FSOpenDirectory)
}

enum EditMode {
	Vertex = 'vertex',
	Block = 'block',
	Velocity = 'velocities',
	Segments = 'segment'
}

const editModes: Record<string, EditMode> = {
	Block: EditMode.Block,
	Vertex: EditMode.Vertex,
	Velocity: EditMode.Velocity,
	Segment: EditMode.Segments
}

const windows = {
	command: 'Command',
	segment: 'Segment',
	vertex: 'Vertices',
	block: 'Block',
	velocities: 'Velocities',
	mesh: 'Mesh',
	csv: 'Generic Segments',
	map: 'Map'
}

export default function App(): ReactElement {
	const dispatch = useAppDispatch()
	const folderHandle = useAppSelector<Directory | undefined>(
		state => state.main.present.fileHandles.rootFolder
	)
	const [fileOpenCallback, setFileOpenCallback] = useState<
		| false
		| {
				callback: (file: File, path: string[]) => void
				extension: string
				isSaveFile?: boolean
		  }
	>(false)

	const [activeTab, setActiveTab] = useState<string>('command')

	const segmentFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.segment)
	const blockFile = useAppSelector<{ path: string[]; file: File } | undefined>(
		state => state.main.present.fileHandles.files.block
	)
	const velocityFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.velocity)
	const commandFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.command)
	const meshParametersFile = useAppSelector<
		{ path: string[]; file: File } | undefined
	>(state => state.main.present.fileHandles.files.mesh_params)

	const segments = useAppSelector(state => state.main.present.segment)
	const blocks = useAppSelector(state => state.main.present.block)
	const velocities = useAppSelector(state => state.main.present.velocity)
	const meshLines = useAppSelector(state => state.main.present.meshLine)
	const genericSegments = useAppSelector(
		state => state.main.present.genericSegments
	)
	const command = useAppSelector(state => state.main.present.command)

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
	const [meshLineSettings, setMeshLineSettings] = useState<MeshDisplaySettings>(
		initialMeshDisplaySettings
	)
	const [genericSegmentSettings, setGenericSegmentSettings] =
		useState<GenericSegmentDisplaySettings>(
			initialGenericSegmentDisplaySettings
		)
	const [mapSettings, setMapSettings] =
		useState<MapSettings>(initialMapSettings)

	const [selectionMode, setSelectionMode] = useState<SelectionMode>('normal')
	const [editMode, setEditMode] = useState<EditMode>(EditMode.Vertex)

	const [selectedBlock, setSelectedBlock] = useState<number[]>([])
	const [selectedSegment, setSelectedSegment] = useState<number[]>([])
	const [selectedVelocity, setSelectedVelocity] = useState<number[]>([])
	const [selectedVertex, setSelectedVertex] = useState<number[]>([])

	const [select, setSelect] = useState<{
		select: (type: string, indices: number[]) => void
	}>({
		select: SelectionModeSelector({
			mode: selectionMode,
			setSelectedBlock,
			setSelectedSegment,
			setSelectedVelocity,
			setSelectedVertex,
			setActiveTab
		})
	})

	const [pointSources, setPointSources] = useState<PointSource[]>([])
	const [arrowSources, setArrowSources] = useState<ArrowSource[]>([])
	const [lineSources, setLineSources] = useState<LineSource[]>([])
	const [polygonSources, setPolygonSources] = useState<PolygonSource[]>([])
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
		select.select = SelectionModeSelector({
			mode: selectionMode,
			setSelectedBlock,
			setSelectedSegment,
			setSelectedVelocity,
			setSelectedVertex,
			setActiveTab
		})
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
					index,
					label:
						blockSettings.plottableKey in block
							? `${
									(block as unknown as Record<string, number | string>)[
										blockSettings.plottableKey
									]
							  }`
							: ``
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
		if (selectionMode !== 'normal' && selectionMode.mode === 'lasso') {
			sources.push({
				name: 'selection',
				color: '#fff',
				selectedColor: '#fff',
				radius: 1.5,
				points: selectionMode.polygon.map((point, index) => ({
					longitude: point.lon,
					latitude: point.lat,
					name: '',
					description: ``,
					index
				}))
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
		segments.vertecies,
		selectionMode
	])

	useEffect(() => {
		const sources: LineSource[] = []
		if (!segmentSettings.hide) {
			sources.push({
				name: 'segments',
				color: segmentSettings.color,
				selectedColor: segmentSettings.activeColor,
				width: segmentSettings.width,
				selectedWidth: segmentSettings.activeWidth,
				lines: segments.segments.map((segment, index) => {
					const start = segments.vertecies[segment.start] ?? DEFAULT_VERTEX
					const end = segments.vertecies[segment.end] ?? DEFAULT_VERTEX
					const [[startLongitude, startLatitude], [endLongitude, endLatitude]] =
						GetShortestLineCoordinates(start, end)
					return {
						startLongitude,
						startLatitude,
						endLongitude,
						endLatitude,
						name: segment.name,
						description: `${start.lon},${start.lat} to ${end.lon},${end.lat}`,
						index,
						label:
							segmentSettings.plottableKey in segment
								? `${
										(segment as unknown as Record<string, number | string>)[
											segmentSettings.plottableKey
										]
								  }`
								: ``
					}
				}),
				click: (index): void => {
					select.select('segment', [index])
				}
			})
		}
		if (!meshLineSettings.hide) {
			for (const key of Object.keys(meshLines)) {
				const mesh = meshLines[key].line
				sources.push({
					name: `mesh:${key}`,
					color: meshLineSettings.color,
					selectedColor: meshLineSettings.activeColor,
					width: meshLineSettings.width,
					selectedWidth: meshLineSettings.activeWidth,
					lines:
						mesh.map((line, index) => {
							const start = line[0]
							const end = line[1]
							const [
								[startLongitude, startLatitude],
								[endLongitude, endLatitude]
							] = GetShortestLineCoordinates(start, end)
							return {
								startLongitude,
								startLatitude,
								endLongitude,
								endLatitude,
								name: '',
								description: '',
								index
							}
						}) || []
				})
			}
		}
		if (!genericSegmentSettings.hide) {
			for (const key of Object.keys(genericSegments)) {
				const {
					startLat,
					startLon,
					endLat,
					endLon,
					plot,
					segments: availableSegments
				} = genericSegments[key]
				if (
					startLat in availableSegments[0] &&
					endLat in availableSegments[0] &&
					startLon in availableSegments[0] &&
					endLon in availableSegments[0]
				) {
					sources.push({
						name: `generic_segment:${key}`,
						color: genericSegmentSettings.color,
						selectedColor: genericSegmentSettings.activeColor,
						width: genericSegmentSettings.width,
						selectedWidth: genericSegmentSettings.activeWidth,
						lines:
							availableSegments
								.map((line, index) => {
									const start = { lat: line[startLat], lon: line[startLon] }
									const end = { lat: line[endLat], lon: line[endLon] }
									if (
										typeof start.lat !== 'number' ||
										typeof start.lon !== 'number' ||
										typeof end.lat !== 'number' ||
										typeof end.lon !== 'number'
									)
										return false as unknown as {
											startLongitude: number
											startLatitude: number
											endLongitude: number
											endLatitude: number
											name: string
											description: string
											index: number
										}
									const [
										[startLongitude, startLatitude],
										[endLongitude, endLatitude]
									] = GetShortestLineCoordinates(start as Vertex, end as Vertex)
									return {
										startLongitude,
										startLatitude,
										endLongitude,
										endLatitude,
										name: '',
										description: '',
										index,
										label: plot && plot in line ? `${line[plot]}` : ''
									}
								})
								.filter(v => v) || []
					})
				}
			}
		}
		setLineSources(sources)
	}, [
		segments,
		segmentSettings,
		genericSegmentSettings,
		genericSegments,
		meshLineSettings,
		meshLines,
		select
	])

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
								index,
								label:
									blockSettings.plottableKey in block
										? `${
												(block as unknown as Record<string, number | string>)[
													blockSettings.plottableKey
												]
										  }`
										: ``
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
		velocities,
		blockSettings.plottableKey
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
							index,
							label:
								velocitiesSettings.plottableKey in velocity
									? `${
											(velocity as unknown as Record<string, number | string>)[
												velocitiesSettings.plottableKey
											]
									  }`
									: ``
						}
					}),
					click: (index): void => {
						select.select('velocities', [index])
					}
				}
			])
		}
	}, [select, velocitiesSettings, velocities])

	useEffect(() => {
		const polygons: PolygonSource[] = []
		if (selectionMode !== 'normal' && selectionMode.mode === 'lasso') {
			polygons.push({
				name: 'selection_polygon',
				color: '#ffffff',
				borderColor: '#ffffff',
				borderRadius: 0.5,
				polygons: [
					{
						polygon: selectionMode.polygon,
						index: 0,
						name: '',
						description: ''
					}
				]
			})
		}
		if (!segmentSettings.hideProjection && !segmentSettings.hide) {
			polygons.push({
				name: 'fault_dip_projections',
				color: segmentSettings.projectionColor,
				borderColor: segmentSettings.projectionColor,
				borderRadius: 0.5,
				polygons: FaultDipProjection(segments).map((poly, index) => ({
					polygon: poly,
					index,
					name: '',
					description: ''
				}))
			})
		}
		setPolygonSources(polygons)
	}, [segmentSettings, segments, selectionMode])

	let view = <span />

	switch (activeTab) {
		case 'velocities':
			view = (
				<VelocitiesPanel
					open={(): void => {
						console.log('opening velocities file')
						setFileOpenCallback({
							extension: 'csv',
							callback: async (file): Promise<void> => {
								const velocity = await LoadVelocityFile(file)
								dispatch(loadNewVelocityData(velocity))
								dispatch(
									openFile({
										file,
										key: 'velocity',
										path: file.path
									})
								)
							}
						})
					}}
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
					save={async (saveAs): Promise<void> => {
						if (saveAs) {
							setFileOpenCallback({
								extension: '.csv',
								isSaveFile: true,
								callback: async (file): Promise<void> => {
									dispatch(
										openFile({
											file,
											key: 'velocity',
											path: file.path
										})
									)
									await file.setContents(GenerateVelocityFileString(velocities))
								}
							})
						} else if (velocityFile) {
							await velocityFile.file.setContents(
								GenerateVelocityFileString(velocities)
							)
						}
					}}
				/>
			)
			break
		case 'block':
			view = (
				<BlockPanel
					open={(): void => {
						console.log('opening block file')
						setFileOpenCallback({
							extension: 'csv',
							callback: async (file): Promise<void> => {
								const block = await LoadBlockFileData(file)
								dispatch(loadNewBlockData(block))
								dispatch(
									openFile({
										file,
										key: 'block',
										path: file.path
									})
								)
							}
						})
					}}
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
					save={async (saveAs): Promise<void> => {
						if (saveAs) {
							setFileOpenCallback({
								extension: '.csv',
								isSaveFile: true,
								callback: async (file): Promise<void> => {
									dispatch(
										openFile({
											file,
											key: 'block',
											path: file.path
										})
									)
									await file.setContents(GenerateBlockFileString(blocks))
								}
							})
						} else if (blockFile) {
							await blockFile.file.setContents(GenerateBlockFileString(blocks))
						}
					}}
				/>
			)
			break
		case 'segment':
			view = (
				<SegmentsPanel
					open={(): void => {
						console.log('opening segment file')
						setFileOpenCallback({
							extension: 'csv',
							callback: async (file): Promise<void> => {
								const segment = await LoadSegmentFile(file)
								dispatch(loadNewSegmentData(segment))
								dispatch(
									openFile({
										file,
										key: 'segment',
										path: file.path
									})
								)
							}
						})
					}}
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
					save={async (saveAs): Promise<void> => {
						if (saveAs) {
							setFileOpenCallback({
								extension: '.csv',
								isSaveFile: true,
								callback: async (file): Promise<void> => {
									dispatch(
										openFile({
											file,
											key: 'segment',
											path: file.path
										})
									)
									await file.setContents(GenerateSegmentFileString(segments))
								}
							})
						} else if (segmentFile) {
							await segmentFile.file.setContents(
								GenerateSegmentFileString(segments)
							)
						}
					}}
				/>
			)
			break
		case 'vertex':
			view = (
				<VerticesPanel
					open={(): void => {
						console.log('opening segment file')
						setFileOpenCallback({
							extension: 'csv',
							callback: async (file): Promise<void> => {
								const segment = await LoadSegmentFile(file)
								dispatch(loadNewSegmentData(segment))
								dispatch(
									openFile({
										file,
										key: 'segment',
										path: file.path
									})
								)
							}
						})
					}}
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
					save={async (): Promise<void> => {
						if (segmentFile) {
							await segmentFile.file.setContents(
								GenerateSegmentFileString(segments)
							)
						}
					}}
				/>
			)
			break
		case 'mesh':
			view = (
				<MeshPanel
					open={(): void => {
						console.log('opening mesh file')
						setFileOpenCallback({
							extension: 'msh',
							callback: async (file): Promise<void> => {
								const mesh = new MeshFile(file)
								await mesh.initialize()
								if (mesh.data) {
									dispatch(
										loadMeshLineData({ mesh: file.name, data: mesh.data })
									)
								}
							}
						})
					}}
					openMultiple={(): void => {
						console.log('opening mesh file')
						setFileOpenCallback({
							extension: 'json',
							callback: async (file): Promise<void> => {
								if (folderHandle) {
									dispatch(clearMeshes())
									const result = await OpenMeshParametersFile(
										file,
										folderHandle
									)
									dispatch(
										openFile({ file, key: 'mesh_params', path: file.path })
									)
									for (const data of result) {
										dispatch(
											loadMeshLineData({
												mesh: data.parameters.mesh_filename,
												parameters: data.parameters,
												data: data.line
											})
										)
									}
								}
							}
						})
					}}
					settings={meshLineSettings}
					setSettings={setMeshLineSettings}
				/>
			)
			break
		case 'csv':
			view = (
				<GenericSegmentPanel
					open={(): void => {
						console.log('opening generic segment file')
						setFileOpenCallback({
							extension: 'csv',
							callback: async (file): Promise<void> => {
								const mesh = new GenericSegmentFile(file)
								await mesh.initialize()
								if (mesh.data) {
									dispatch(
										loadNewGenericCollectionData({
											name: file.name,
											data: mesh.data
										})
									)
								}
							}
						})
					}}
					settings={genericSegmentSettings}
					setSettings={setGenericSegmentSettings}
					setCollectionVertexKeys={(value): void => {
						dispatch(setGenericSegmentPositionKeys(value))
					}}
					collections={genericSegments}
				/>
			)
			break
		case 'map':
			view = (
				<MapSettingsPanel settings={mapSettings} setSettings={setMapSettings} />
			)
			break
		case 'command':
			view = (
				<CommandPanel
					command={command}
					setCommandData={(partial): void => {
						dispatch(editCommandData(partial))
					}}
					open={(): void => {
						console.log('opening command file')
						setFileOpenCallback({
							extension: 'json',
							callback: async (file): Promise<void> => {
								if (folderHandle) {
									const { command: loadedCommand, files } =
										await OpenCommandFile(folderHandle, file)
									dispatch(loadCommandData(loadedCommand))
									dispatch(openFile({ file, key: 'command', path: file.path }))

									if (files.blocks) {
										const block = await LoadBlockFileData(files.blocks)
										dispatch(loadNewBlockData(block))
										dispatch(
											openFile({
												file: files.blocks,
												key: 'block',
												path: files.blocks.path
											})
										)
									}

									if (files.segments) {
										const segment = await LoadSegmentFile(files.segments)
										dispatch(loadNewSegmentData(segment))
										dispatch(
											openFile({
												file: files.segments,
												key: 'segment',
												path: files.segments.path
											})
										)
									}

									if (files.velocities) {
										const velocity = await LoadVelocityFile(files.velocities)
										dispatch(loadNewVelocityData(velocity))
										dispatch(
											openFile({
												file: files.velocities,
												key: 'velocity',
												path: files.velocities.path
											})
										)
									}

									if (files.mesh && folderHandle) {
										dispatch(clearMeshes())
										const result = await OpenMeshParametersFile(
											files.mesh,
											folderHandle
										)
										dispatch(
											openFile({
												file: files.mesh,
												key: 'mesh_params',
												path: files.mesh.path
											})
										)
										for (const data of result) {
											dispatch(
												loadMeshLineData({
													mesh: data.parameters.mesh_filename,
													parameters: data.parameters,
													data: data.line
												})
											)
										}
									}
								}
							}
						})
					}}
					save={async (saveAs): Promise<void> => {
						const updatedCommand = { ...command }
						if (segmentFile) {
							updatedCommand.segment_file_name = GetProjectPath(
								segmentFile.file
							)
						}
						if (blockFile) {
							updatedCommand.block_file_name = GetProjectPath(blockFile.file)
						}
						if (velocityFile) {
							updatedCommand.station_file_name = GetProjectPath(
								velocityFile.file
							)
						}
						if (meshParametersFile) {
							updatedCommand.mesh_parameters_file_name = GetProjectPath(
								meshParametersFile.file
							)
						}
						if (saveAs) {
							setFileOpenCallback({
								extension: '.json',
								isSaveFile: true,
								callback: async (file): Promise<void> => {
									dispatch(
										openFile({
											file,
											key: 'command',
											path: file.path
										})
									)
									dispatch(editCommandData({ file_name: file.name }))
									updatedCommand.file_name = file.name
									await file.setContents(JSON.stringify(updatedCommand))
								}
							})
						} else if (commandFile) {
							await commandFile.file.setContents(JSON.stringify(updatedCommand))
						}
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
		},
		Mesh: {
			state: meshLineSettings.hide,
			change: () => {
				setMeshLineSettings({
					...meshLineSettings,
					hide: !meshLineSettings.hide
				})
			}
		},
		GenericSegments: {
			state: genericSegmentSettings.hide,
			change: () => {
				setGenericSegmentSettings({
					...genericSegmentSettings,
					hide: !genericSegmentSettings.hide
				})
			}
		}
	}

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<div
			role='document'
			className='w-screen h-screen flex flex-col text-white'
			onKeyDown={(event): void => {
				if (event.key === 'Escape') {
					setSelectionMode('normal')
				} else if (
					event.key === 'Enter' &&
					selectionMode !== 'normal' &&
					selectionMode.mode === 'lasso'
				) {
					if (selectionMode.polygon.length > 2) {
						let selectableItems: { point: Vertex; id: number }[] = []
						const selectionType = editMode

						switch (selectionType) {
							case EditMode.Block:
								selectableItems = blocks.map((value, index) => ({
									point: { lon: value.interior_lon, lat: value.interior_lat },
									id: index
								}))
								break
							case EditMode.Velocity:
								selectableItems = velocities.map((value, index) => ({
									point: { lon: value.lon, lat: value.lat },
									id: index
								}))
								break
							case EditMode.Vertex:
								selectableItems = Object.keys(segments.vertecies).map(
									index => ({
										point: segments.vertecies[index as unknown as number],
										id: index as unknown as number
									})
								)
								break
							case EditMode.Segments:
								selectableItems = segments.segments.map((value, index) => {
									const start = segments.vertecies[value.start]
									const end = segments.vertecies[value.end]
									return {
										point: {
											lon: (start.lon + end.lon) / 2,
											lat: (start.lat + end.lat) / 2
										},
										id: index
									}
								})
								break
							default:
								setSelectionMode('normal')
								return
						}

						const { polygon } = selectionMode

						const selectedItems = PointsInPolygon(selectableItems, polygon)
						select.select(selectionType, selectedItems)
					}
					setSelectionMode('normal')
				}
			}}
		>
			<TopBar
				filesOpen={folderHandle !== undefined}
				saveFiles={async (): Promise<void> => {
					// if (commandFile) await commandFile.save()
					if (segmentFile) {
						await segmentFile.file.setContents(
							GenerateSegmentFileString(segments)
						)
					}
					if (blockFile) {
						await blockFile.file.setContents(GenerateBlockFileString(blocks))
					}
					if (velocityFile) {
						await velocityFile.file.setContents(
							GenerateVelocityFileString(velocities)
						)
					}
				}}
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					dispatch(setRootFolder(directory))
					setActiveTab('command')
				}}
			/>
			{selectionMode !== 'normal' ? (
				<div className='fixed top-12 z-10 left-10 right-10 flex flex-row justify-center'>
					<div className='flex flex-col justify-center items-center bg-black p-3 gap-1 '>
						<span className='text-lg font-semibold'>
							{selectionMode.mode === 'lasso' ? 'lasso' : selectionMode.label}
						</span>
						{selectionMode.mode === 'lasso' || selectionMode.subtitle ? (
							<span className='text-md font-thin text-gray-500'>
								{selectionMode.mode === 'lasso'
									? 'Press Enter to Select'
									: selectionMode.subtitle}
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
			<div className='absolute bottom-0 left-0 flex flex-col bg-black  p-2 gap-5 shadow-sm z-50'>
				<div className='flex flex-row items-center justify-between gap-5'>
					<span className='p-1 text-sm text-center'>
						<button
							type='button'
							className={`${
								selectionMode !== 'normal' && selectionMode.mode === 'lasso'
									? 'bg-gray-700'
									: 'bg-black'
							} p-2 shaddow-inner hover:bg-gray-800 `}
							onClick={(): void => {
								setSelectionMode({ mode: 'lasso', polygon: [] })
							}}
						>
							Lasso Selection
						</button>
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
									editMode === mode ? 'bg-gray-700' : 'bg-black'
								} p-2 shaddow-inner hover:bg-gray-800 `}
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
									!state.state ? 'bg-gray-700' : 'bg-black'
								} p-2 shaddow-inner hover:bg-gray-800 `}
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
				key={`${mapSettings.currentStyle.user}:${mapSettings.currentStyle.styleId}`}
				pointSources={pointSources}
				arrowSources={arrowSources}
				lineSources={lineSources}
				drawnPointSource={drawnPointSource}
				polygonSources={polygonSources}
				selections={{
					segments: selectedSegment,
					blocks: selectedBlock,
					velocities: selectedVelocity,
					vertices: selectedVertex,
					draw:
						editMode === EditMode.Block
							? selectedBlock
							: editMode === EditMode.Velocity
							? selectedVelocity
							: editMode === EditMode.Vertex
							? selectedVertex
							: []
				}}
				displayGrid={displayGrid ? 10 : -1}
				click={(point): void => {
					if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'mapClick'
					) {
						selectionMode.callback(point)
					} else if (
						typeof selectionMode !== 'string' &&
						selectionMode.mode === 'lasso'
					) {
						setSelectionMode({
							mode: 'lasso',
							polygon: [...selectionMode.polygon, point]
						})
					}
				}}
				mouseMove={(point): void => {
					setHoverPoint(point)
				}}
				styleUri={`mapbox://styles/${mapSettings.currentStyle.user}/${mapSettings.currentStyle.styleId}`}
			/>
			{folderHandle ? (
				<InspectorPanel
					view={view}
					buttons={windows}
					active={activeTab}
					setActive={(active): void => setActiveTab(active)}
				/>
			) : (
				<></>
			)}
			{folderHandle && fileOpenCallback ? (
				<FileExplorer
					root={folderHandle}
					chooseFile={(file, path): void => {
						fileOpenCallback.callback(file, path)
						setFileOpenCallback(false)
					}}
					close={(): void => {
						setFileOpenCallback(false)
					}}
					extension={fileOpenCallback.extension}
					isSaveDialog={fileOpenCallback.isSaveFile === true}
				/>
			) : (
				<></>
			)}
		</div>
	)
}
