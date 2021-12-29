/* eslint-disable @typescript-eslint/no-unused-vars */
import type { OpenableFile } from 'Components/Files'
import Files from 'Components/Files'
import InspectorPanel from 'Components/InspectorPanel'
import Map from 'Components/Map'
import TopBar from 'Components/TopBar'
import type { ReactElement } from 'react'
import { useState } from 'react'
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

const windows = {
	files: 'Files',
	segment: 'Segment',
	block: 'Block',
	velocities: 'Velocities',
	mesh: 'Mesh'
}

export default function App(): ReactElement {
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
									setSegmentFile(await OpenSegmentFile(handle))
									break
								case 'block':
									setBlockFile(await OpenBlockFile(handle))
									break
								case 'velocity':
									setVelocityFile(await OpenVelocityFile(handle))
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
									setBlockFile(commandResult.blocks)
									setVelocityFile(commandResult.velocities)
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
		default:
			break
	}

	return (
		<div className='w-screen h-screen flex flex-col'>
			<TopBar
				folder={folderHandle}
				openFolder={async (): Promise<void> => {
					const directory = await OpenDirectory()
					setFolderHandle(directory)
					setActiveTab('files')
				}}
			/>
			<Map
				pointSources={[
					{
						name: 'blocks',
						color: 'blue',
						points: blockFile?.data
							? blockFile.data.map(block => ({
									longitude: block.interior_lon,
									latitude: block.interior_lat,
									name: block.name,
									description: ``
							  }))
							: [],
						clickPoint: (index, name): void =>
							console.log(`Clicked ${index}: ${name}`)
					}
				]}
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
