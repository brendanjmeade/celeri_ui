/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ParsedFile } from './FileOpeners'
import type { File } from './FileSystemInterfaces'

const defaultCommand = {
	file_name: 'basic_command_default_values.json',
	reuse_elastic: 'no',
	reuse_elastic_file: './celeri_elastic_operators.hdf5',
	save_elastic: 'yes',
	save_elastic_file: './celeri_elastic_operators.hdf5',
	material_lambda: 3e10,
	material_mu: 3e10,
	unit_sigmas: 'no',
	locking_depth_flag2: 0,
	locking_depth_flag3: 0,
	locking_depth_flag4: 0,
	locking_depth_flag5: 0,
	locking_depth_override_flag: 'no',
	locking_depth_overide_value: 0,
	apriori_block_name: '',
	tri_smooth: 10_000,
	pmag_tri_smooth: 0,
	smooth_type: 1,
	n_iterations: 1,
	tri_edge: [0, 0, 0],
	tri_depth_tolerance: 0,
	tri_con_weight: 1,
	strain_method: 0,
	sar_file_name: '',
	sar_ramp: 0,
	sar_weight: 0,
	tri_slip_constraint_type: 0,
	inversion_type: 'standard',
	inversion_param01: 0,
	inversion_param02: 0,
	inversion_param03: 0,
	inversion_param04: 0,
	inversion_param05: 0,
	save_all: 'yes',
	mogi_file_name: '',
	solution_method: 'backslash',
	ridge_param: 0,
	tri_full_coupling: 'no',
	tvr_lambda: 1,
	tri_slip_sign: [0, 0],
	n_eigs: 0,
	segment_file_name: '',
	station_file_name: '',
	block_file_name: '',
	mesh_parameters_file_name: '',
	fault_resolution: 1,
	station_data_weight: 1,
	station_data_weight_min: 1,
	station_data_weight_max: 1,
	station_data_weight_steps: 1,
	slip_constraint_weight: 1,
	slip_constraint_weight_min: 1,
	slip_constraint_weight_max: 1,
	slip_constraint_weight_steps: 1,
	block_constraint_weight: 1,
	block_constraint_weight_min: 1,
	block_constraint_weight_max: 1,
	block_constraint_weight_steps: 1,
	slip_file_names: ''
}

export type Command = typeof defaultCommand

export function createCommand(partial: Partial<Command>): Command {
	const command = { ...defaultCommand, ...partial } as unknown as Command
	return command
}

export class CommandFile implements ParsedFile<Command> {
	public handle: File

	public data: Command | undefined

	public constructor(handle: File) {
		this.handle = handle
		this.data = undefined
	}

	public async initialize(): Promise<void> {
		const contents = await this.handle.getContents()
		const commandContents = JSON.parse(contents) as Partial<Command>
		this.data = createCommand(commandContents)
	}

	public async save(): Promise<void> {
		if (this.data) {
			const contents = JSON.stringify(this.data)
			await this.handle.setContents(contents)
		}
	}
}
