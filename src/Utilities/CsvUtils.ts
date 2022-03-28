/* eslint-disable @typescript-eslint/no-magic-numbers */
export function parse(contents: string): Record<string, number | string>[] {
	const rows = contents.split(/\n/g)
	const headers = rows[0].split(',').map(h => h.trim())
	const remaining = rows.slice(1)
	const items: Record<string, number | string>[] = []
	for (const row of remaining) {
		if (row.trim() !== '') {
			const rowSplit = row.split(/\s*,\s*/)
			const item: Record<string, number | string> = {}
			// eslint-disable-next-line unicorn/no-for-loop
			for (let index = 0; index < headers.length; index += 1) {
				let value: number | string = rowSplit[index]
				const header = headers[index]
				const number = Number.parseFloat(value)
				value = Number.isNaN(number) ? value : number
				if (typeof value === 'string') {
					value =
						value.startsWith(`"`) && value.endsWith(`"`)
							? value.slice(1, -1).trim()
							: value.trim()
				}
				item[header] = value
			}
			items.push(item)
		}
	}
	return items
}

export function stringify<T>(array: T[], headers: string[]): string {
	const rows = [headers.join(',')]
	for (const item of array) {
		const record = item as unknown as Record<string, number | string>
		rows.push(
			headers
				.map(key => {
					if (key in record) {
						const value = record[key]
						return typeof value === 'string' && /\s/.test(`${value}`)
							? `"${value.trim()}"`
							: `${
									typeof value === 'number' &&
									(key.includes('lon') || key.includes('lat'))
										? value.toFixed(6)
										: value
							  }`
					}
					return ''
				})
				.join(',')
		)
	}
	return rows.join('\n')
}
