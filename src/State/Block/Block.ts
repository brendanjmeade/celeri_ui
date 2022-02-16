export interface Block {
	other1: number
	other2: number
	other3: number
	other4: number
	other5: number
	other6: number
	name: string
	interior_lon: number
	interior_lat: number
	euler_lon: number
	euler_lon_sig: number
	euler_lat: number
	euler_lat_sig: number
	rotation_rate: number
	rotation_rate_sig: number
	rotation_flag: number
	apriori_flag: number
	strain_rate: number
	strain_rate_sig: number
	strain_rate_flag: number
}

export const fieldNames = [
	'other1',
	'other2',
	'other3',
	'other4',
	'other5',
	'other6',
	'name',
	'interior_lon',
	'interior_lat',
	'euler_lon',
	'euler_lon_sig',
	'euler_lat',
	'euler_lat_sig',
	'rotation_rate',
	'rotation_rate_sig',
	'rotation_flag',
	'apriori_flag',
	'strain_rate',
	'strain_rate_sig',
	'strain_rate_flag'
]

export const defaultBlock: Block = {
	other1: 0,
	other2: 0,
	other3: 0,
	other4: 0,
	other5: 0,
	other6: 0,
	name: '',
	interior_lon: 0,
	interior_lat: 0,
	euler_lon: 0,
	euler_lon_sig: 0,
	euler_lat: 0,
	euler_lat_sig: 0,
	rotation_rate: 0,
	rotation_rate_sig: 0,
	rotation_flag: 0,
	apriori_flag: 0,
	strain_rate: 0,
	strain_rate_sig: 0,
	strain_rate_flag: 0
}

export function createBlock(partial?: Partial<Block>): Block {
	const block = partial
		? ({ ...defaultBlock, ...partial } as unknown as Block)
		: { ...defaultBlock }
	return block
}
