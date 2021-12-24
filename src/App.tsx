import type { OpenableFile } from 'Components/Files'
import Files from 'Components/Files'
import InspectorPanel from 'Components/InspectorPanel'
import Map from 'Components/Map'
import TopBar from 'Components/TopBar'
import type { ReactElement } from 'react'
import { useState } from 'react'
import FSOpenDirectory from 'Utilities/FileSystem'
import type { Directory } from 'Utilities/FileSystemInterfaces'
import OpenDirectory, {
	SetDirectoryHandle
} from 'Utilities/FileSystemInterfaces'
import type { InMemoryFS } from 'Utilities/InMemoryFileSystem'

const global = window as unknown as { FakeDirectory: InMemoryFS | undefined }
if (!global.FakeDirectory) {
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

	let view = <span />

	switch (activeTab) {
		case 'files':
			view = folderHandle ? (
				<Files
					folder={folderHandle}
					files={files}
					setFile={(file, name): void => {
						const updated = { ...files }
						updated[file] = { ...updated[file], currentFilePath: name }
						setFiles(updated)
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
			<Map />
			<InspectorPanel
				view={view}
				buttons={folderHandle ? windows : undefined}
				active={activeTab}
				setActive={(active): void => setActiveTab(active)}
			/>
		</div>
	)
}
