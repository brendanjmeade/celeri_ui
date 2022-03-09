/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { MeshLineState } from '../State/MeshLines/State'
import type { Vertex } from '../State/Segment/Vertex'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export function ParseNodeSection(section: string): Vertex[] {
	const matches = [
		...section.matchAll(/^\s*\d+\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)/gm)
	]
	const vertices = matches.map((line): Vertex => {
		const lon = Number.parseFloat(line[1])
		const lat = Number.parseFloat(line[2])
		return { lon, lat }
	})
	vertices.splice(0, 0, { lon: 0, lat: 0 })
	return vertices
}

export function ParseElementSection(section: string): [number, number][] {
	return section
		.split(/\n/)
		.map(line => line.split(/\s+/))
		.filter(line => line.length > 2)
		.map(line => {
			const tagCount = Number.parseInt(line[2], 10)
			const startNodeList = tagCount + 3
			const vertexCount = line.length - startNodeList
			console.log('line:', line, vertexCount, tagCount)
			if (line.length >= startNodeList + 2) {
				const lines: [number, number][] = []
				for (let index = startNodeList + 1; index < line.length; index += 1) {
					const a = Number.parseInt(line[index - 1], 10)
					const b = Number.parseInt(line[index], 10)
					if (!Number.isNaN(a) && !Number.isNaN(b)) {
						lines.push([a, b])
					}
				}
				if (vertexCount > 2) {
					console.log('closing stuff')
					const a = Number.parseInt(line[startNodeList], 10)
					const b = Number.parseInt(line[-1], 10)
					if (!Number.isNaN(a) && !Number.isNaN(b)) {
						lines.push([a, b])
					}
				}
				return lines
			}
			return false as unknown as [number, number][]
		})
		.filter(v => v)
		.flat()
}

export function BuildMeshLines(
	vertices: Vertex[],
	elements: [number, number][]
): MeshLineState {
	return elements
		.map(([a, b]): [Vertex, Vertex] =>
			a !== b && a > -1 && a < vertices.length && b > -1 && b < vertices.length
				? [vertices[a], vertices[b]]
				: (false as unknown as [Vertex, Vertex])
		)
		.filter(l => l)
}

export function ParseMeshFileV2(file: string): MeshLineState {
	const sections = file.split('$')
	let vertices: Vertex[] = []
	let elements: [number, number][] = []

	for (const section of sections) {
		if (section.startsWith('Nodes')) {
			vertices = ParseNodeSection(section)
		} else if (section.startsWith('Elements')) {
			elements = ParseElementSection(section)
		}
	}
	console.log('mesh file:', vertices, elements)

	return BuildMeshLines(vertices, elements)
}

export class MeshFile implements ParsedFile<MeshLineState> {
	public data: MeshLineState | undefined

	public handle: File

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		this.data = ParseMeshFileV2(contents)
	}

	// eslint-disable-next-line class-methods-use-this
	public async save(): Promise<void> {
		console.log('Mesh files do not get saved')
	}
}

export default MeshFile
