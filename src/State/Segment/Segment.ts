export interface Segment {
	name: string
	dip: number
	create_ribbon_mesh: number
	locking_depth: number
	locking_depth_flag: number
	ss_rate: number
	ss_rate_sig: number
	ss_rate_flag: number
	ds_rate: number
	ds_rate_sig: number
	ds_rate_flag: number
	ts_rate: number
	ts_rate_sig: number
	ts_rate_flag: number
	patch_file_name: number
	patch_flag: number
	ss_rate_bound_flag : number
  ss_rate_bound_min : number
  ss_rate_bound_max : number
  ds_rate_bound_flag : number
  ds_rate_bound_min : number
  ds_rate_bound_max : number
  ts_rate_bound_flag : number
  ts_rate_bound_min : number
  ts_rate_bound_max : number
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
	'create_ribbon_mesh',
	'locking_depth',
	'locking_depth_flag',
	'ss_rate',
	'ss_rate_sig',
	'ss_rate_flag',
	'ds_rate',
	'ds_rate_sig',
	'ds_rate_flag',
	'ts_rate',
	'ts_rate_sig',
	'ts_rate_flag',
	'patch_file_name',
	'patch_flag',
	'ss_rate_bound_flag',
  'ss_rate_bound_min',
  'ss_rate_bound_max',
  'ds_rate_bound_flag',
  'ds_rate_bound_min',
  'ds_rate_bound_max',
  'ts_rate_bound_flag',
  'ts_rate_bound_min',
  'ts_rate_bound_max'
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
	create_ribbon_mesh: 0,
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	locking_depth: 15,
	locking_depth_flag: 0,
	ss_rate: 0,
	ss_rate_sig: 0,
	ss_rate_flag: 0,
	ds_rate: 0,
	ds_rate_sig: 0,
	ds_rate_flag: 0,
	ts_rate: 0,
	ts_rate_sig: 0,
	ts_rate_flag: 0,
	patch_file_name: -1,
	patch_flag: 0,
	ss_rate_bound_flag: 0,
  ss_rate_bound_min: -1.0,
  ss_rate_bound_max: 1.0,
  ds_rate_bound_flag: 0,
  ds_rate_bound_min: -1.0,
  ds_rate_bound_max: 1.0,
  ts_rate_bound_flag: 0,
  ts_rate_bound_min: -1.0,
  ts_rate_bound_max: 1.0
}
