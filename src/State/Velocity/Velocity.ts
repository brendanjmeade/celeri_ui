export interface Velocity {
	lon: number
	lat: number
	corr: number
	other1: number
	name: string
	east_vel: number
	north_vel: number
	east_sig: number
	north_sig: number
	flag: number
	up_vel: number
	up_sig: number
	east_adjust: number
	north_adjust: number
	up_adjust: number
}

export const fieldNames = [
	'lon',
	'lat',
	'corr',
	'other1',
	'name',
	'east_vel',
	'north_vel',
	'east_sig',
	'north_sig',
	'flag',
	'up_vel',
	'up_sig',
	'east_adjust',
	'north_adjust',
	'up_adjust'
]

export const defaultVelocity: Velocity = {
	lon: 0,
	lat: 0,
	corr: 0,
	other1: 0,
	name: '',
	east_vel: 0,
	north_vel: 0,
	east_sig: 0,
	north_sig: 0,
	flag: 0,
	up_vel: 0,
	up_sig: 0,
	east_adjust: 0,
	north_adjust: 0,
	up_adjust: 0
}

export function createVelocity(partial: Partial<Velocity>): Velocity {
	const velocity = { ...defaultVelocity, ...partial } as unknown as Velocity
	return velocity
}
