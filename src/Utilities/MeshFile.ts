/* eslint-disable unicorn/prefer-at */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { MeshLine } from '../State/MeshLines/MeshLine'
import type { Vertex } from '../State/Segment/Vertex'
import { parse } from './CsvUtils'
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

export function ParseNodeSection(section: string): Vertex[] {
	const matches = [
		...section.matchAll(/^\s*\d+\s+(-?\d+\.?\d+)\s+(-?\d+\.?\d+)/gm)
	]
	const vertices = matches.map((line): Vertex => {
		const lon = Number.parseFloat(line[1])
		const lat = Number.parseFloat(line[2])
		return { lon, lat }
	})
	vertices.splice(0, 0, { lon: 0, lat: 0 })
	return vertices
}

const elementTypes: Record<string, (line: string[]) => [number, number][]> = {
	'1': line => {
		const a = Number.parseInt(line[line.length - 2] ?? '', 10)
		const b = Number.parseInt(line[line.length - 1] ?? '', 10)
		if (!Number.isNaN(a) && !Number.isNaN(b)) {
			return [[a, b]]
		}
		return false as unknown as [number, number][]
	},
	'2': line => {
		const a = Number.parseInt(line[line.length - 3] ?? '', 10)
		const b = Number.parseInt(line[line.length - 2] ?? '', 10)
		const c = Number.parseInt(line[line.length - 1] ?? '', 10)
		if (!Number.isNaN(a) && !Number.isNaN(b) && !Number.isNaN(c)) {
			return [
				[a, b],
				[b, c],
				[c, a]
			]
		}
		return false as unknown as [number, number][]
	}
}

export function ParseElementSection(section: string): [number, number][] {
	return section
		.split(/\n/)
		.map(line => line.trim())
		.map(line => line.split(/\s+/))
		.filter(line => line.length > 2)
		.map(line => {
			const type =
				elementTypes[line[1]] ??
				((): [number, number][] => false as unknown as [number, number][])
			return type(line)
		})
		.filter(v => v)
		.flat()
}

export function BuildMeshLines(
	vertices: Vertex[],
	elements: [number, number][]
): MeshLine[] {
	return elements
		.map(([a, b]): [Vertex, Vertex] =>
			a !== b && a > -1 && a < vertices.length && b > -1 && b < vertices.length
				? [vertices[a], vertices[b]]
				: (false as unknown as [Vertex, Vertex])
		)
		.filter(l => l)
}

export function ParseMeshFileV2(file: string): MeshLine[] {
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

export class MeshFile implements ParsedFile<MeshLine[]> {
	public data: MeshLine[] | undefined

	public handle: File

	public startLonColumn: string

	public endLonColumn: string

	public startLatColumn: string

	public endLatColumn: string

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
		this.startLonColumn = ''
		this.endLonColumn = ''
		this.startLatColumn = ''
		this.endLatColumn = ''
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		if (contents.startsWith('$')) {
			this.data = ParseMeshFileV2(contents)
		} else {
			const parser = parse(contents)
			this.data = parser.map((row): MeshLine => {
				const start: Vertex = { lon: 0, lat: 0 }
				const end: Vertex = { lon: 0, lat: 0 }
				console.log('parsing row', row)
				if (typeof row[this.startLonColumn] === 'number') {
					start.lon = row[this.startLonColumn] as number
				}
				if (typeof row[this.startLatColumn] === 'number') {
					start.lat = row[this.startLatColumn] as number
				}
				if (typeof row[this.endLonColumn] === 'number') {
					end.lon = row[this.endLonColumn] as number
				}
				if (typeof row[this.endLatColumn] === 'number') {
					end.lat = row[this.endLatColumn] as number
				}
				const keys = Object.keys(row).filter(
					k =>
						k !== this.startLatColumn &&
						k !== this.endLatColumn &&
						k !== this.startLonColumn &&
						k !== this.endLonColumn
				)
				if (keys.length > 0) {
					const data: Record<string, number | string> = {}
					for (const key of keys) {
						data[key] = row[key]
					}
					return [start, end, data]
				}
				return [start, end]
			})
		}
	}

	// eslint-disable-next-line class-methods-use-this
	public async save(): Promise<void> {
		console.log('Mesh files do not get saved')
	}
}

export default MeshFile
