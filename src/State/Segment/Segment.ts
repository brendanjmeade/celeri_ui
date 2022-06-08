export interface Segment {
	name: string
	dip: number
	res: number
	other3: number
	other6: number
	other7: number
	other8: number
	other9: number
	other10: number
	other11: number
	create_ribbon_mesh: number
	locking_depth: number
	locking_depth_sig: number
	locking_depth_flag: number
	dip_sig: number
	dip_flag: number
	ss_rate: number
	ss_rate_sig: number
	ss_rate_flag: number
	ds_rate: number
	ds_rate_sig: number
	ds_rate_flag: number
	ts_rate: number
	ts_rate_sig: number
	ts_rate_flag: number
	burial_depth: number
	burial_depth_sig: number
	burial_depth_flag: number
	resolution_override: number
	resolution_other: number
	patch_file_name: number
	patch_flag: number
	patch_slip_file: number
	patch_slip_flag: number
}

export type FileSegment = Segment & {
	lon1: number
	lat1: number
	lon2: number
	lat2: number
}

export type InMemorySegment = Segment & {
	start: number
	end: number
}

export const fieldNames = [
	'name',
	'lon1',
	'lat1',
	'lon2',
	'lat2',
	'dip',
	'res',
	'other3',
	'other6',
	'other7',
	'other8',
	'other9',
	'other10',
	'other11',
	'create_ribbon_mesh',
	'locking_depth',
	'locking_depth_sig',
	'locking_depth_flag',
	'dip_sig',
	'dip_flag',
	'ss_rate',
	'ss_rate_sig',
	'ss_rate_flag',
	'ds_rate',
	'ds_rate_sig',
	'ds_rate_flag',
	'ts_rate',
	'ts_rate_sig',
	'ts_rate_flag',
	'burial_depth',
	'burial_depth_sig',
	'burial_depth_flag',
	'resolution_override',
	'resolution_other',
	'patch_file_name',
	'patch_flag',
	'patch_slip_file',
	'patch_slip_flag'
]

export const defaultSegment: FileSegment = {
	name: 'new_segment',
	lon1: 0,
	lat1: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lon2: 10,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	lat2: 10,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	dip: 90,
	res: 0,
	other3: 0,
	other6: 0,
	other7: 0,
	other8: 0,
	other9: 0,
	other10: 0,
	other11: 0,
	create_ribbon_mesh: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	locking_depth: 15,
	locking_depth_sig: 0,
	locking_depth_flag: 0,
	dip_sig: 0,
	dip_flag: 0,
	ss_rate: 0,
	ss_rate_sig: 0,
	ss_rate_flag: 0,
	ds_rate: 0,
	ds_rate_sig: 0,
	ds_rate_flag: 0,
	ts_rate: 0,
	ts_rate_sig: 0,
	ts_rate_flag: 0,
	burial_depth: 0,
	burial_depth_sig: 0,
	burial_depth_flag: 0,
	resolution_override: 0,
	resolution_other: 0,
	patch_file_name: 0,
	patch_flag: 0,
	patch_slip_file: 0,
	patch_slip_flag: 0
}
