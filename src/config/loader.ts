import { cliArguments } from './cli';
import { normalizePath, fix_relative_glob } from '../paths';

import { readFileSync } from 'fs';
import process from 'process';
import path from 'path';

import chalk from 'chalk';

import type { Config } from '../types';
import * as defaults from './defaults';

//	Default config
export const configEntries: Config = {
	projectConfig: 'ssgassets.config.json',
	assetDirConfig: '',
	verbose: false,
	silent: false,
	nocache: false,
	formats: ['original', 'webp', 'avif'],
	exclude: [],
	include: [],
	outputDir: '',
	inputDir: '',
	quality: Object.assign({}, defaults.outputQuality)
};

export const configEntriesMask = {
	globalFile: ['projectConfig', 'assetDirConfig'],
	localFile: ['projectConfig', 'assetDirConfig', 'inputDir', 'outputDir']
};

export const loadConfig = () => {

	//	load options from cli argumets
	const optionsMap = Object.entries(cliArguments).map(item => item[1].argName.map(pfx => [pfx, item[0]])).flat();
	process.argv.slice(2).forEach(arg => {

		const argName = arg.split('=')[0];

		const optionId = optionsMap.find(item => item[0] === argName);
		if (!optionId) {
			console.warn(chalk.yellow(`⚠  Unknown option '${argName}'`), '(cli)');
			return;
		}

		const configEntry = optionId[1];

		const option = cliArguments[configEntry];
		if (!option) {
			console.warn(chalk.yellow(`⚠  Unmatched option '${arg}'`), '(cli)');
			return;
		}

		let temp: any = undefined;
		for (let action of option.actions) {

			switch (action) {

				case 'impl_bool': {
					temp = true;
				} break;

				case 'get_value': {
					temp = arg.split('=')?.at(1);
					if (!temp) {
						console.warn(chalk.yellow(`⚠  Empty option '${arg}'`));
						return;
					}
				} break;

				case 'to_string_array': {
					temp = temp.split(',');
				} break;
			
				default: break;
			}
		}

		configEntries[configEntry] = temp;
	});

	//	load project config file
	try {
		const configFileContents = readFileSync(path.join(process.cwd(), configEntries.projectConfig));
		const importedConfig = JSON.parse(configFileContents.toString());

		for (let key in importedConfig) {

			if (configEntriesMask.globalFile.some(item => item === key)) {
				console.warn(chalk.yellow(`⚠  Option '${key}' cannot be set from ${configEntries.projectConfig}`));
				continue;
			}

			if (!(key in configEntries)) {
				console.warn(chalk.yellow(`⚠  Unknown key '${key}'`), `(${configEntries.projectConfig})`);
				continue;
			}

			if (typeof configEntries[key] !== typeof importedConfig[key]) {
				console.warn(chalk.yellow(`⚠  Key '${key}' type invalid`), `(${configEntries.projectConfig})`);
				continue;
			}

			configEntries[key] = importedConfig[key];
		}

	} catch (_error) {
		//	oops, no global config file. ok, it's fine
	}

	//	set default paths if not provided
	if (!configEntries.inputDir.length) {
		configEntries.inputDir = 'assets';
		console.log(`Using default input directory: '${configEntries.inputDir}'`);
	}
	if (!configEntries.outputDir.length) {
		configEntries.outputDir = 'dist/assets';
		console.log(`Using default output directory: '${configEntries.outputDir}'`);
	}

	//	ensure that we don't write output to the source directory
	if (typeof configEntries.inputDir === 'string' && configEntries.inputDir === configEntries.outputDir) {
		console.error(chalk.red(`⚠  Input directory is the same as the output.`));
		process.exit(0);
	}
	
	//	load config from asset source directory
	try {
		configEntries.assetDirConfig = path.join(configEntries.inputDir, 'ssgassets.config.json');
		const configFileContents = readFileSync(path.join(process.cwd(), configEntries.assetDirConfig));
		const importedConfig = JSON.parse(configFileContents.toString());

		for (let key in importedConfig) {

			if (configEntriesMask.localFile.some(item => item === key)) {
				console.warn(chalk.yellow(`⚠  Option '${key}' cannot be set from ${configEntries.assetDirConfig}`));
				continue;
			}

			if (!(key in configEntries)) {
				console.warn(chalk.yellow(`⚠  Unknown key '${key}'`), `(${configEntries.assetDirConfig})`);
				continue;
			}

			if (typeof configEntries[key] !== typeof importedConfig[key]) {
				console.warn(chalk.yellow(`⚠  Key '${key}' type invalid`), `(${configEntries.assetDirConfig})`);
				continue;
			}

			let value = importedConfig[key];

			if (key === 'exclude' || key === 'include') {
				value = (value as string[]).map(item => path.join(configEntries.inputDir, item));
			}

			configEntries[key] = value;
		}

	} catch (error) {
		//	oops, no config file hire. ok, it's fine too
		configEntries.assetDirConfig = undefined;
	}

	//	normalize paths to forward slash
	configEntries.inputDir = normalizePath(configEntries.inputDir);
	configEntries.outputDir = normalizePath(configEntries.outputDir);
	configEntries.exclude = configEntries.exclude.map(item => normalizePath(item));
	configEntries.include = configEntries.include.map(item => normalizePath(item));

	//	fix  glob patterns
	configEntries.exclude = configEntries.exclude.map(item => fix_relative_glob(item));
	configEntries.include = configEntries.include.map(item => fix_relative_glob(item));

	//	double-check flags
	if (configEntries.silent && configEntries.verbose) {
		configEntries.verbose = false;
		console.warn(chalk.yellow(`⚠  Both 'silent' and 'verbose' flags are specified, 'verbose' will be suppressed.`));
	}

	//	check for unknown output formats
	configEntries.formats.forEach(item => {
		if (!defaults.outputFormats.some(item1 => item === item1)) {
			console.warn(chalk.yellow(`⚠  Unknown output format '${item}'`));
		}
	})
	
	//console.log(configEntries);

	return configEntries;
};

export default loadConfig;
