import type { CacheItem, CacheIndex, AssetsListItem, CacheDiff } from '../types';
import { existsSync, readFileSync, createReadStream } from 'fs';

import { createHash } from 'crypto';
import chalk from 'chalk';

const createFileHash = async (filepath: string, verbose?: boolean): Promise<string | null> => new Promise(async (resolve) => {

	try {

		if (!existsSync(filepath)) {
			resolve(null);
			return;
		}

		const readStream = createReadStream(filepath);

		//	using md5 for the speeeeeed!
		const hash = createHash('md5');
		const takeOutput = () => hash.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

		readStream.on('error', () => {
			if (verbose) console.error(chalk.red(`⚠  Error hashing file: ${filepath}`));
			resolve(null);
		});

		readStream.on('data', (chunk) => hash.update(chunk));
		readStream.on('end', () => resolve(takeOutput()));

	} catch (error) {
		resolve(null);
		if (verbose) console.error(chalk.red(`⚠  Error hashing file: ${filepath}`));
	}
});

export class AssetsCacheIndex {

	cacheFile: string;
	data: Map<string, string>;
	verbose = false;

	constructor(assetsDir: string, verbose?: boolean) {

		this.verbose = verbose;
		this.cacheFile = assetsDir + '/.cache.json';
		this.data = new Map();

		try {

			if (!existsSync(this.cacheFile)) return;
			
			const cacheFileContent = readFileSync(this.cacheFile).toString();
			const cacheIndex = JSON.parse(cacheFileContent) as CacheIndex;
			cacheIndex.entries.forEach(item => this.data.set(item.fileName, item.contentHash));

		} catch (error) {
			console.error(chalk.red(`⚠  Failed to load cache index:`), error);
		}
	};

	async diff(assets: AssetsListItem[]): Promise<CacheDiff> {

		const diffResult: CacheDiff = {
			added: [],
			removed: [],
			changed: []
		};

		await Promise.all(assets.map(asset => new Promise<void>(async (resolve) => {

			const filename = asset.input;
			const hash = await createFileHash(filename, this.verbose);

			if (!hash) {

				diffResult.removed.push(filename);
				this.data.delete(filename);
				if (this.verbose) console.log(` File: '${filename}': removed`);

			} else if (this.data.has(filename)) {

				if (this.data.get(filename) !== hash) {

					this.data.set(filename, hash);
					diffResult.changed.push(filename);
					if (this.verbose) console.log(` File: '${filename}': updated`);

				} else if (this.verbose)  {
					console.log(` File: '${filename}': not changed`);
				}

			} else {

				this.data.set(filename, hash);
				diffResult.added.push(filename);
				if (this.verbose) console.log(` File: '${filename}': added`);
			}

			resolve();
		})));

		return diffResult;
	};

	save() {
		try {
			
		} catch (error) {
			console.error(chalk.red(`⚠  Failed to save cache index:`), error);
		}
	}

};