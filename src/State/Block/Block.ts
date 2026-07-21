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
	area_steradians: number
	area_plate_carree: number
	block_label: number
	euler_lon_err: number
	euler_lat_err: number
	euler_rate: number
	euler_rate_err: number
	rotation_rms_velocity_flag_sigma: number
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
	'strain_rate_flag',
	'area_steradians',
	'area_plate_carree',
	'block_label',
	'euler_lon_err',
	'euler_lat_err',
	'euler_rate',
	'euler_rate_err',
	'rotation_rms_velocity_flag_sigma'
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
	euler_lon_sig: 1,
	euler_lat: 0,
	euler_lat_sig: 1,
	rotation_rate: 0,
	rotation_rate_sig: 1,
	rotation_flag: 0,
	apriori_flag: 0,
	strain_rate: 0,
	strain_rate_sig: 1,
	strain_rate_flag: 0,
	area_steradians: 0,
	area_plate_carree: 0,
	block_label: 0,
	euler_lon_err: 1,
	euler_lat_err: 1,
	euler_rate: 0,
	euler_rate_err: 1,
	rotation_rms_velocity_flag_sigma: 1
}

export function createBlock(partial?: Partial<Block>): Block {
	const block = partial
		? ({ ...defaultBlock, ...partial } as unknown as Block)
		: { ...defaultBlock }
	return block
}
