import type { BlockDisplaySettings } from 'Components/BlockPanel'
import BlockPanel from 'Components/BlockPanel'
import CommandPanel from 'Components/CommandPanel'
import type { GenericSegmentDisplaySettings } from 'Components/GenericSegmentPanel'
import GenericSegmentPanel from 'Components/GenericSegmentPanel'
import type { MapSettings } from 'Components/MapSettingsPanel'
import { MapSettingsPanel } from 'Components/MapSettingsPanel'
import type { MeshDisplaySettings } from 'Components/MeshPanel'
import MeshPanel from 'Components/MeshPanel'
import type { SegmentsDisplaySettings } from 'Components/SegmentsPanel'
import SegmentsPanel from 'Components/SegmentsPanel'
import type { VelocitiesDisplaySettings } from 'Components/VelocitiesPanel'
import VelocitiesPanel from 'Components/VelocitiesPanel'
import type { VerticesDisplaySettings } from 'Components/VertexPanel'
import VerticesPanel from 'Components/VertexPanel'
import type { ReactElement } from 'react'
import type { SelectionMode } from 'Selectors/SelectionMode'
import type { BlockState } from 'State/Block/State'
import {
	createBlock,
	deleteBlock,
	editBlockData,
	loadNewBlockData
} from 'State/Block/State'
import type { Command } from 'State/Command/Command'
import { editCommandData, loadCommandData } from 'State/Command/State'
import { openFile } from 'State/FileHandles/State'
import type { GenericSegmentState } from 'State/GenericSegments/State'
import {
	loadNewGenericCollectionData,
	setGenericSegmentPositionKeys
} from 'State/GenericSegments/State'
import { clearMeshes, loadMeshLineData } from 'State/MeshLines/State'
import type { SegmentState } from 'State/Segment/State'
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
import type { AppDispatch } from 'State/State'
import type { VelocityState } from 'State/Velocity/State'
import {
	createVelocity,
	deleteVelocity,
	editVelocityData,
	loadNewVelocityData
} from 'State/Velocity/State'
import type { Velocity } from 'State/Velocity/Velocity'
import { GenerateBlockFileString, LoadBlockFileData } from 'Utilities/BlockFile'
import { OpenCommandFile, OpenMeshParametersFile } from 'Utilities/FileOpeners'
import type { Directory, File } from 'Utilities/FileSystemInterfaces'
import { GetProjectPath } from 'Utilities/FileSystemInterfaces'
import GenericSegmentFile from 'Utilities/GenericSegmentFile'
import MeshFile from 'Utilities/MeshFile'
import {
	GenerateSegmentFileString,
	LoadSegmentFile
} from 'Utilities/SegmentFile'
import {
	GenerateVelocityFileString,
	LoadVelocityFile
} from 'Utilities/VelocityFile'
import InspectorPanelBase from './InspectorPanelBase'

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

export default function Inspector({
	activeTab,
	setActiveTab,
	setFileOpenCallback,
	dispatch,
	velocitiesSettings,
	setVelocitiesSettings,
	selectedVelocity,
	velocities,
	select,
	setSelectionMode,
	velocityFile,
	blockSettings,
	setBlockSettings,
	selectedBlock,
	blocks,
	blockFile,
	segmentSettings,
	setSegmentSettings,
	segments,
	selectedSegment,
	segmentFile,
	vertexSettings,
	setVertexSettings,
	selectedVertex,
	folderHandle,
	meshLineSettings,
	setMeshLineSettings,
	genericSegmentSettings,
	setGenericSegmentSettings,
	genericSegments,
	mapSettings,
	setMapSettings,
	command,
	meshParametersFile,
	commandFile
}: {
	activeTab: string
	setActiveTab: (tab: string) => void
	setFileOpenCallback: (
		callback:
			| false
			| {
					callback: (file: File, path: string[]) => void
					extension: string
					isSaveFile?: boolean
			  }
	) => void
	dispatch: AppDispatch
	velocitiesSettings: VelocitiesDisplaySettings
	setVelocitiesSettings: (settings: VelocitiesDisplaySettings) => void
	selectedVelocity: number[]
	velocities: VelocityState
	select: { select: (type: string, indices: number[]) => void }
	setSelectionMode: (mode: SelectionMode) => void
	velocityFile: { path: string[]; file: File } | undefined
	blockSettings: BlockDisplaySettings
	setBlockSettings: (settings: BlockDisplaySettings) => void
	selectedBlock: number[]
	blocks: BlockState
	blockFile: { path: string[]; file: File } | undefined
	segmentSettings: SegmentsDisplaySettings
	setSegmentSettings: (settings: SegmentsDisplaySettings) => void
	segments: SegmentState
	selectedSegment: number[]
	segmentFile: { path: string[]; file: File } | undefined
	vertexSettings: VerticesDisplaySettings
	setVertexSettings: (settings: VerticesDisplaySettings) => void
	selectedVertex: number[]
	folderHandle: Directory | undefined
	meshLineSettings: MeshDisplaySettings
	setMeshLineSettings: (settings: MeshDisplaySettings) => void
	genericSegmentSettings: GenericSegmentDisplaySettings
	setGenericSegmentSettings: (settings: GenericSegmentDisplaySettings) => void
	genericSegments: GenericSegmentState
	mapSettings: MapSettings
	setMapSettings: (settings: MapSettings) => void
	command: Command
	meshParametersFile: { path: string[]; file: File } | undefined
	commandFile: { path: string[]; file: File } | undefined
}): ReactElement {
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
	return (
		<InspectorPanelBase
			view={view}
			buttons={windows}
			active={activeTab}
			setActive={(active): void => setActiveTab(active)}
		/>
	)
}
