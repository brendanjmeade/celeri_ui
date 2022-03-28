/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai'
import { createBlock } from '../../src/State/Block/Block'
import type { InMemorySegment } from '../../src/State/Segment/Segment'
import { createVelocity } from '../../src/State/Velocity/Velocity'
import { BlockFile } from '../../src/Utilities/BlockFile'
import { CommandFile, createCommand } from '../../src/Utilities/CommandFile'
import { OpenCommandFile } from '../../src/Utilities/FileOpeners'
import type { FileName } from '../../src/Utilities/FileSystemInterfaces'
import { GenericSegmentFile } from '../../src/Utilities/GenericSegmentFile'
import OpenDirectory from '../../src/Utilities/InMemoryFileSystem'
import { MeshFile } from '../../src/Utilities/MeshFile'
import { createSegment, SegmentFile } from '../../src/Utilities/SegmentFile'
import { VelocityFile } from '../../src/Utilities/VelocityFile'

describe('File Openers Work as Expected', () => {
	it('Can Open Segment Files Properly', async () => {
		const directoryStructure = {
			root: {
				'segment.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,
BRa                                                                ,247.087,43.873,247.764,42.286,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
BRb                                                                ,245.927,44.722,247.087,43.873,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('segment.csv' as FileName)
		const segment = new SegmentFile(file)
		await segment.initialize()
		if (segment.data) {
			expect(segment.data.segments[0].name).to.contain('BRa')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data.segments[1].name).to.contain('BRb')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data.segments).to.have.length(2)
		} else {
			expect(segment.data).to.not.be.undefined
		}
	})
	it('Can Write Segment Files Properly', async () => {
		const directoryStructure = {
			root: {
				'segment.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('segment.csv' as FileName)
		const segment = new SegmentFile(file)
		await segment.initialize()
		if (segment.data) {
			expect(segment.data.segments).to.have.length(0)
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const test = createSegment({ name: 'test' }) as unknown as InMemorySegment
			test.start = 0
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			test.end = 1
			segment.data = {
				vertecies: [
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					{ lon: 100, lat: 0 },
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					{ lon: 100, lat: 100 }
				],
				segments: [test],
				vertexDictionary: {},
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				lastIndex: 1
			}
			await segment.save()
			expect(directoryStructure.root['segment.csv']).to.contain('test,100')
		} else {
			expect(segment.data).to.not.be.undefined
		}
	})
	it('Can Open Block Files Properly', async () => {
		const directoryStructure = {
			root: {
				'block.csv': `other1,other2,other3,other4,other5,other6,name,interior_lon,interior_lat,euler_lon,euler_lon_sig,euler_lat,euler_lat_sig,rotation_rate,rotation_rate_sig,rotation_flag,apriori_flag,strain_rate,strain_rate_sig,strain_rate_flag
0,0,0,0,0,0,"ele56         ",245.241,39.099,65.697,2.71,-49.701,2.084,0.222,0.013, 0, 0, 0, 0, 0`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('block.csv' as FileName)
		const block = new BlockFile(file)
		await block.initialize()
		if (block.data) {
			expect(block.data[0].name).to.contain('ele56')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(block.data).to.have.length(1)
		} else {
			expect(block.data).to.not.be.undefined
		}
	})
	it('Can Write Block Files Properly', async () => {
		const directoryStructure = {
			root: {
				'block.csv': `other1,other2,other3,other4,other5,other6,name,interior_lon,interior_lat,euler_lon,euler_lon_sig,euler_lat,euler_lat_sig,rotation_rate,rotation_rate_sig,rotation_flag,apriori_flag,strain_rate,strain_rate_sig,strain_rate_flag`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('block.csv' as FileName)
		const block = new BlockFile(file)
		await block.initialize()
		if (block.data) {
			expect(block.data).to.have.length(0)
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const test = createBlock({ name: 'test', interior_lat: 100 })
			block.data = [test]
			await block.save()
			expect(directoryStructure.root['block.csv']).to.contain('test')
			expect(directoryStructure.root['block.csv']).to.contain('100')
		} else {
			expect(block.data).to.not.be.undefined
		}
	})
	it('Can Open Velocity Files Properly', async () => {
		const directoryStructure = {
			root: {
				'velocity.csv': `lon,lat,corr,other1,name,east_vel,north_vel,east_sig,north_sig,flag,up_vel,up_sig,east_adjust,north_adjust,up_adjust,
183.434,-43.956,0.205,3,"BRAE_GPS",-38.713,50.072,0.461,0.48,1,0,1,0,0,0,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('velocity.csv' as FileName)
		const velocity = new VelocityFile(file)
		await velocity.initialize()
		if (velocity.data) {
			expect(velocity.data[0].name).to.contain('BRAE_GPS')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(velocity.data).to.have.length(1)
		} else {
			expect(velocity.data).to.not.be.undefined
		}
	})
	it('Can Write Velocity Files Properly', async () => {
		const directoryStructure = {
			root: {
				'velocity.csv': `lon,lat,corr,other1,name,east_vel,north_vel,east_sig,north_sig,flag,up_vel,up_sig,east_adjust,north_adjust,up_adjust,`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('velocity.csv' as FileName)
		const velocity = new VelocityFile(file)
		await velocity.initialize()
		if (velocity.data) {
			expect(velocity.data).to.have.length(0)
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const test = createVelocity({ name: 'test', lon: 100 })
			velocity.data = [test]
			await velocity.save()
			expect(directoryStructure.root['velocity.csv']).to.contain('test')
			expect(directoryStructure.root['velocity.csv']).to.contain('100')
		} else {
			expect(velocity.data).to.not.be.undefined
		}
	})
	it('Can Open Mesh Files Properly', async () => {
		const directoryStructure = {
			root: {
				'mesh.msh': `$MeshFormat
2 0 8
$EndMeshFormat
$Nodes
3
1 0.0 0.0 0.0
2 1.0 0.0 0.0
3 0.0 -1.0 0.0
$EndNodes
$Elements
3
1 1 2 3 0 1 2
1 1 1 0 2 3
1 2 3 3 0 0 1 3 2
$EndElements`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('mesh.msh' as FileName)
		const mesh = new MeshFile(file)
		await mesh.initialize()
		if (mesh.data) {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(mesh.data).to.have.length(5)

			expect(mesh.data[0][0].lon).to.equal(0)
			expect(mesh.data[0][0].lat).to.equal(0)
			expect(mesh.data[0][1].lon).to.equal(1)
			expect(mesh.data[0][1].lat).to.equal(0)

			expect(mesh.data[1][0].lon).to.equal(1)
			expect(mesh.data[1][0].lat).to.equal(0)
			expect(mesh.data[1][1].lon).to.equal(0)
			expect(mesh.data[1][1].lat).to.equal(-1)

			expect(mesh.data[2][0].lon).to.equal(0)
			expect(mesh.data[2][0].lat).to.equal(0)
			expect(mesh.data[2][1].lon).to.equal(0)
			expect(mesh.data[2][1].lat).to.equal(-1)

			expect(mesh.data[3][0].lon).to.equal(0)
			expect(mesh.data[3][0].lat).to.equal(-1)
			expect(mesh.data[3][1].lon).to.equal(1)
			expect(mesh.data[3][1].lat).to.equal(0)

			expect(mesh.data[4][0].lon).to.equal(1)
			expect(mesh.data[4][0].lat).to.equal(0)
			expect(mesh.data[4][1].lon).to.equal(0)
			expect(mesh.data[4][1].lat).to.equal(0)
		} else {
			expect(mesh.data).to.not.be.undefined
		}
	})
	it('Can open arbitrary CSV files properly', async () => {
		const directoryStructure = {
			root: {
				'test.csv': `lon1, lat1, lon2, lat2, some_strange_data
0, 0, 1, 1, 150
3, 2, 7, 8, 200`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('test.csv' as FileName)
		const content = new GenericSegmentFile(file)

		await content.initialize()
		if (content.data) {
			expect(content.data).to.have.length(2)

			expect(content.data[0].lon1).to.equal(0)
			expect(content.data[0].lat1).to.equal(0)
			expect(content.data[0].lon2).to.equal(1)
			expect(content.data[0].lat2).to.equal(1)

			expect(content.data[1].lon1).to.equal(3)
			expect(content.data[1].lat1).to.equal(2)
			expect(content.data[1].lon2).to.equal(7)
			expect(content.data[1].lat2).to.equal(8)
		} else {
			expect(content.data).to.not.be.undefined
		}
	})
	it('Can Open Command Files Properly', async () => {
		const directoryStructure = {
			root: {
				'mesh_parameters.json': `[
					{
							"mesh_filename": "slab_contours_GCS_WGS84-trench_LL.msh",
							"smoothing_weight": 1e7,
							"edge_constraints": [
									0,
									1,
									0
							],
							"n_eigenvalues": 20,
							"a_priori_slip_filename": ""
					}
			]`,
				'command.json': `{
					"file_name": "basic_command_default_values.json",
					"reuse_elastic": "no",
					"reuse_elastic_file": "./celeri_elastic_operators.hdf5",
					"save_elastic": "yes",
					"save_elastic_file": "./celeri_elastic_operators.hdf5",
					"material_lambda": 3.0E+10,
					"material_mu": 3.0E+10,
					"unit_sigmas": "no",
					"locking_depth_flag2": 0,
					"locking_depth_flag3": 0,
					"locking_depth_flag4": 0,
					"locking_depth_flag5": 0,
					"locking_depth_override_flag": "no",
					"locking_depth_overide_value": 0,
					"apriori_block_name": "",
					"tri_smooth": 10000,
					"pmag_tri_smooth": 0,
					"smooth_type": 1,
					"n_iterations": 1,
					"tri_edge": [
							0,
							0,
							0
					],
					"tri_depth_tolerance": 0,
					"tri_con_weight": 1,
					"strain_method": 0,
					"sar_file_name": "",
					"sar_ramp": 0,
					"sar_weight": 0,
					"tri_slip_constraint_type": 0,
					"inversion_type": "standard",
					"inversion_param01": 0,
					"inversion_param02": 0,
					"inversion_param03": 0,
					"inversion_param04": 0,
					"inversion_param05": 0,
					"save_all": "yes",
					"mogi_file_name": "",
					"solution_method": "backslash",
					"ridge_param": 0,
					"tri_full_coupling": "no",
					"tvr_lambda": 1,
					"tri_slip_sign": [
							0,
							0
					],
					"n_eigs": 0,
					"segment_file_name": "segment_file_name.csv",
					"station_file_name": "station_file_name.csv",
					"block_file_name": "block_file_name.csv",
					"mesh_parameters_file_name": "mesh_parameters.json",
					"fault_resolution": 1,
					"station_data_weight": 1,
					"station_data_weight_min": 1,
					"station_data_weight_max": 1,
					"station_data_weight_steps": 1,
					"slip_constraint_weight": 1,
					"slip_constraint_weight_min": 1,
					"slip_constraint_weight_max": 1,
					"slip_constraint_weight_steps": 1,
					"block_constraint_weight": 1,
					"block_constraint_weight_min": 1,
					"block_constraint_weight_max": 1,
					"block_constraint_weight_steps": 1,
					"slip_file_names": ""
			}`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('command.json' as FileName)
		const command = new CommandFile(file)
		await command.initialize()
		if (command.data) {
			expect(command.data.segment_file_name).to.contain('segment_file_name.csv')
		} else {
			expect(command.data).to.not.be.undefined
		}
	})
	it('Can Load data from command files', async () => {
		const directoryStructure = {
			root: {
				'mesh_parameters.json': `[
					{
							"mesh_filename": "slab_contours_GCS_WGS84-trench_LL.msh",
							"smoothing_weight": 1e7,
							"edge_constraints": [
									0,
									1,
									0
							],
							"n_eigenvalues": 20,
							"a_priori_slip_filename": ""
					}
			]`,
				'slab_contours_GCS_WGS84-trench_LL.msh': `$MeshFormat
			2 0 8
			$EndMeshFormat
			$Nodes
			3
			1 0.0 0.0 0.0
			2 1.0 0.0 0.0
			3 0.0 -1.0 0.0
			$EndNodes
			$Elements
			3
			1 1 2 3 0 1 2
			1 1 1 0 2 3
			1 2 3 3 0 0 1 3 2
			$EndElements`,
				'segment_file_name.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,
			BRa                                                                ,247.087,43.873,247.764,42.286,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			BRb                                                                ,245.927,44.722,247.087,43.873,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`,
				'block_file_name.csv': `other1,other2,other3,other4,other5,other6,name,interior_lon,interior_lat,euler_lon,euler_lon_sig,euler_lat,euler_lat_sig,rotation_rate,rotation_rate_sig,rotation_flag,apriori_flag,strain_rate,strain_rate_sig,strain_rate_flag
			0,0,0,0,0,0,"ele56         ",245.241,39.099,65.697,2.71,-49.701,2.084,0.222,0.013, 0, 0, 0, 0, 0`,
				'station_file_name.csv': `lon,lat,corr,other1,name,east_vel,north_vel,east_sig,north_sig,flag,up_vel,up_sig,east_adjust,north_adjust,up_adjust,
			183.434,-43.956,0.205,3,"BRAE_GPS",-38.713,50.072,0.461,0.48,1,0,1,0,0,0,`,

				'command.json': `{
					"file_name": "basic_command_default_values.json",
					"reuse_elastic": "no",
					"reuse_elastic_file": "./celeri_elastic_operators.hdf5",
					"save_elastic": "yes",
					"save_elastic_file": "./celeri_elastic_operators.hdf5",
					"material_lambda": 3.0E+10,
					"material_mu": 3.0E+10,
					"unit_sigmas": "no",
					"locking_depth_flag2": 0,
					"locking_depth_flag3": 0,
					"locking_depth_flag4": 0,
					"locking_depth_flag5": 0,
					"locking_depth_override_flag": "no",
					"locking_depth_overide_value": 0,
					"apriori_block_name": "",
					"tri_smooth": 10000,
					"pmag_tri_smooth": 0,
					"smooth_type": 1,
					"n_iterations": 1,
					"tri_edge": [
							0,
							0,
							0
					],
					"tri_depth_tolerance": 0,
					"tri_con_weight": 1,
					"strain_method": 0,
					"sar_file_name": "",
					"sar_ramp": 0,
					"sar_weight": 0,
					"tri_slip_constraint_type": 0,
					"inversion_type": "standard",
					"inversion_param01": 0,
					"inversion_param02": 0,
					"inversion_param03": 0,
					"inversion_param04": 0,
					"inversion_param05": 0,
					"save_all": "yes",
					"mogi_file_name": "",
					"solution_method": "backslash",
					"ridge_param": 0,
					"tri_full_coupling": "no",
					"tvr_lambda": 1,
					"tri_slip_sign": [
							0,
							0
					],
					"n_eigs": 0,
					"segment_file_name": "segment_file_name.csv",
					"station_file_name": "station_file_name.csv",
					"block_file_name": "block_file_name.csv",
					"mesh_parameters_file_name": "mesh_parameters.json",
					"fault_resolution": 1,
					"station_data_weight": 1,
					"station_data_weight_min": 1,
					"station_data_weight_max": 1,
					"station_data_weight_steps": 1,
					"slip_constraint_weight": 1,
					"slip_constraint_weight_min": 1,
					"slip_constraint_weight_max": 1,
					"slip_constraint_weight_steps": 1,
					"block_constraint_weight": 1,
					"block_constraint_weight_min": 1,
					"block_constraint_weight_max": 1,
					"block_constraint_weight_steps": 1,
					"slip_file_names": ""
			}`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('command.json' as FileName)
		const command = await OpenCommandFile(directory, file, {
			command: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			segment: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			block: { extension: '', name: '', description: '', currentFilePath: '' },
			velocities: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			mesh: { extension: '', name: '', description: '', currentFilePath: '' }
		})
		if (command.commands !== false && command.commands.data) {
			expect(command.commands.data.segment_file_name).to.contain(
				'segment_file_name.csv'
			)
		} else {
			expect(true).to.be.false
		}
		if (command.segments !== false && command.segments.data) {
			expect(command.segments.data.segments[0].name).to.equal('BRa')
		} else {
			expect(true).to.be.false
		}
	})
	it('Can Load data from command files with missing files', async () => {
		const directoryStructure = {
			root: {
				'mesh_parameters.json': `[
					{
							"mesh_filename": "slab_contours_GCS_WGS84-trench_LL.msh",
							"smoothing_weight": 1e7,
							"edge_constraints": [
									0,
									1,
									0
							],
							"n_eigenvalues": 20,
							"a_priori_slip_filename": ""
					}
			]`,

				'slab_contours_GCS_WGS84-trench_LL.msh': `$MeshFormat
			2 0 8
			$EndMeshFormat
			$Nodes
			3
			1 0.0 0.0 0.0
			2 1.0 0.0 0.0
			3 0.0 -1.0 0.0
			$EndNodes
			$Elements
			3
			1 1 2 3 0 1 2
			1 1 1 0 2 3
			1 2 3 3 0 0 1 3 2
			$EndElements`,

				'segment_file_name.csv': `name,lon1,lat1,lon2,lat2,dip,res,other3,other6,other7,other8,other9,other10,other11,other12,locking_depth,locking_depth_sig,locking_depth_flag,dip_sig,dip_flag,ss_rate,ss_rate_sig,ss_rate_flag,ds_rate,ds_rate_sig,ds_rate_flag,ts_rate,ts_rate_sig,ts_rate_flag,burial_depth,burial_depth_sig,burial_depth_flag,resolution_override,resolution_other,patch_file_name,patch_flag,patch_slip_file,patch_slip_flag,
			BRa                                                                ,247.087,43.873,247.764,42.286,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			BRb                                                                ,245.927,44.722,247.087,43.873,90,100,0,0,0,0,0,0,0,0,15,5,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`,

				'block_file_name.csv': `other1,other2,other3,other4,other5,other6,name,interior_lon,interior_lat,euler_lon,euler_lon_sig,euler_lat,euler_lat_sig,rotation_rate,rotation_rate_sig,rotation_flag,apriori_flag,strain_rate,strain_rate_sig,strain_rate_flag
			0,0,0,0,0,0,"ele56         ",245.241,39.099,65.697,2.71,-49.701,2.084,0.222,0.013, 0, 0, 0, 0, 0`,

				'command.json': `{
					"file_name": "basic_command_default_values.json",
					"reuse_elastic": "no",
					"reuse_elastic_file": "./celeri_elastic_operators.hdf5",
					"save_elastic": "yes",
					"save_elastic_file": "./celeri_elastic_operators.hdf5",
					"material_lambda": 3.0E+10,
					"material_mu": 3.0E+10,
					"unit_sigmas": "no",
					"locking_depth_flag2": 0,
					"locking_depth_flag3": 0,
					"locking_depth_flag4": 0,
					"locking_depth_flag5": 0,
					"locking_depth_override_flag": "no",
					"locking_depth_overide_value": 0,
					"apriori_block_name": "",
					"tri_smooth": 10000,
					"pmag_tri_smooth": 0,
					"smooth_type": 1,
					"n_iterations": 1,
					"tri_edge": [
							0,
							0,
							0
					],
					"tri_depth_tolerance": 0,
					"tri_con_weight": 1,
					"strain_method": 0,
					"sar_file_name": "",
					"sar_ramp": 0,
					"sar_weight": 0,
					"tri_slip_constraint_type": 0,
					"inversion_type": "standard",
					"inversion_param01": 0,
					"inversion_param02": 0,
					"inversion_param03": 0,
					"inversion_param04": 0,
					"inversion_param05": 0,
					"save_all": "yes",
					"mogi_file_name": "",
					"solution_method": "backslash",
					"ridge_param": 0,
					"tri_full_coupling": "no",
					"tvr_lambda": 1,
					"tri_slip_sign": [
							0,
							0
					],
					"n_eigs": 0,
					"segment_file_name": "segment_file_name.csv",
					"station_file_name": "station_file_name.csv",
					"block_file_name": "block_file_name.csv",
					"mesh_parameters_file_name": "mesh_parameters.json",
					"fault_resolution": 1,
					"station_data_weight": 1,
					"station_data_weight_min": 1,
					"station_data_weight_max": 1,
					"station_data_weight_steps": 1,
					"slip_constraint_weight": 1,
					"slip_constraint_weight_min": 1,
					"slip_constraint_weight_max": 1,
					"slip_constraint_weight_steps": 1,
					"block_constraint_weight": 1,
					"block_constraint_weight_min": 1,
					"block_constraint_weight_max": 1,
					"block_constraint_weight_steps": 1,
					"slip_file_names": ""
			}`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('command.json' as FileName)
		const command = await OpenCommandFile(directory, file, {
			command: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			segment: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			block: { extension: '', name: '', description: '', currentFilePath: '' },
			velocities: {
				extension: '',
				name: '',
				description: '',
				currentFilePath: ''
			},
			mesh: { extension: '', name: '', description: '', currentFilePath: '' }
		})
		if (command.commands !== false && command.commands.data) {
			expect(command.commands.data.segment_file_name).to.contain(
				'segment_file_name.csv'
			)
		} else {
			expect(true).to.be.false
		}
		if (command.segments !== false && command.segments.data) {
			expect(command.segments.data.segments[0].name).to.equal('BRa')
		} else {
			expect(true).to.be.false
		}
	})
	it('Can Write Command Files Properly', async () => {
		const directoryStructure = {
			root: {
				'command.json': `{
					"file_name": "basic_command_default_values.json",
					"reuse_elastic": "no",
					"reuse_elastic_file": "./celeri_elastic_operators.hdf5",
					"save_elastic": "yes",
					"save_elastic_file": "./celeri_elastic_operators.hdf5",
					"material_lambda": 3.0E+10,
					"material_mu": 3.0E+10,
					"unit_sigmas": "no",
					"locking_depth_flag2": 0,
					"locking_depth_flag3": 0,
					"locking_depth_flag4": 0,
					"locking_depth_flag5": 0,
					"locking_depth_override_flag": "no",
					"locking_depth_overide_value": 0,
					"apriori_block_name": "",
					"tri_smooth": 10000,
					"pmag_tri_smooth": 0,
					"smooth_type": 1,
					"n_iterations": 1,
					"tri_edge": [
							0,
							0,
							0
					],
					"tri_depth_tolerance": 0,
					"tri_con_weight": 1,
					"strain_method": 0,
					"sar_file_name": "",
					"sar_ramp": 0,
					"sar_weight": 0,
					"tri_slip_constraint_type": 0,
					"inversion_type": "standard",
					"inversion_param01": 0,
					"inversion_param02": 0,
					"inversion_param03": 0,
					"inversion_param04": 0,
					"inversion_param05": 0,
					"save_all": "yes",
					"mogi_file_name": "",
					"solution_method": "backslash",
					"ridge_param": 0,
					"tri_full_coupling": "no",
					"tvr_lambda": 1,
					"tri_slip_sign": [
							0,
							0
					],
					"n_eigs": 0,
					"segment_file_name": "segment_file_name.csv",
					"station_file_name": "station_file_name.csv",
					"block_file_name": "block_file_name.csv",
					"mesh_parameters_file_name": "mesh_parameters.json",
					"fault_resolution": 1,
					"station_data_weight": 1,
					"station_data_weight_min": 1,
					"station_data_weight_max": 1,
					"station_data_weight_steps": 1,
					"slip_constraint_weight": 1,
					"slip_constraint_weight_min": 1,
					"slip_constraint_weight_max": 1,
					"slip_constraint_weight_steps": 1,
					"block_constraint_weight": 1,
					"block_constraint_weight_min": 1,
					"block_constraint_weight_max": 1,
					"block_constraint_weight_steps": 1,
					"slip_file_names": ""
			}`
			}
		}
		const directory = await OpenDirectory(directoryStructure)
		const file = await directory.getFile('command.json' as FileName)
		const command = new CommandFile(file)
		await command.initialize()
		if (command.data) {
			const test = createCommand({
				segment_file_name: 'another_segment_file.csv'
			})
			command.data = test
			await command.save()
			expect(directoryStructure.root['command.json']).to.contain(
				'another_segment_file.csv'
			)
		} else {
			expect(command.data).to.not.be.undefined
		}
	})
})
