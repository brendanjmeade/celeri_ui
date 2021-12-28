import { expect } from 'chai'
import { BlockFile, createBlock } from '../../src/Utilities/BlockFile'
import type { FileName } from '../../src/Utilities/FileSystemInterfaces'
import OpenDirectory from '../../src/Utilities/InMemoryFileSystem'
import { createSegment, SegmentFile } from '../../src/Utilities/SegmentFile'
import { createVelocity, VelocityFile } from '../../src/Utilities/VelocityFile'

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
			expect(segment.data[0].name).to.contain('BRa')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data[1].name).to.contain('BRb')
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			expect(segment.data).to.have.length(2)
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
			expect(segment.data).to.have.length(0)
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const test = createSegment({ name: 'test', lon1: 100 })
			segment.data = [test]
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
})
