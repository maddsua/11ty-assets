//	This test should be run with Deno
//	I'm to lazy to adapt this nonsence for nodeJS
//
//	This is not an automated test, it's used to verify image source generation,
//	but that is not needed to be tested on each build

import { mapSources } from '../../components/index.ts';

const assertEqual = (a: any, b: any) => {
	if (JSON.stringify(a) === JSON.stringify(b)) return;
	console.error('\r\nAssert arguments did not match:', '\r\nArgument A:', a, '\r\nArgument B:', b, '\r\n');
	throw new Error('Assertion failed');
};

const allTests: (() => void)[] = [

	/**
	 * Test 1
	 * Generate source context and transform image src for:
	 * 	Single adaptive mode
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': 'orientation: portrait',
						'modifier': '.mobile'
					}
				]
			}
		}
	
		const outputSources = mapSources(input.url, undefined, input.adaptive);
	
		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			}
		];
	
		assertEqual(outputSources, expectSources);
	}),

	/**
	 * Test 2
	 * Generate source context and transform image src for:
	 * 	Single adaptive mode
	 * 	Single image format
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': 'orientation: portrait',
						'modifier': '.mobile'
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			}
		];

		assertEqual(outputSources, expectSources);
	}),

	/**
	 * Test 3
	 * Generate source context and transform image src for:
	 * 	Multiple adaptive mode
	 * 	Multiple image format
	 */
	(() => {

		const input = {
			url: '/cats/image.png',
			adaptive: {
				variants: [
					{
						'media': 'orientation: landscape',
						'modifier': null
					},
					{
						'media': 'orientation: portrait',
						'modifier': '.mobile'
					}
				]
			},
			formats: ['webp', 'avif']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: landscape)',
				source: '/cats/image.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: landscape)',
				source: '/cats/image.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.avif',
				type: 'image/avif'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.webp',
				type: 'image/webp'
			},
			{
				media: '(orientation: portrait)',
				source: '/cats/image.mobile.png',
				type: 'image/png'
			}
		];

		assertEqual(outputSources, expectSources);
	}),

	/**
	 * Test 4
	 * Generate source context and transform image src for:
	 * 	Single adaptive mode
	 * 	Single image format
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannners/base_name_default_modifier.jpg',
			adaptive: {
				baseModifier: '_default_modifier',
				variants: [
					{
						media: 'orientation: portrait',
						modifier: '_mobile',
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources = [
			{
				media: '(orientation: portrait)',
				source: '/bannners/base_name_mobile.webp',
				type: 'image/webp'
			},
			{
				media: "(orientation: portrait)",
				source: "/bannners/base_name_mobile.jpg",
				type: "image/jpg"
			}
		];

		assertEqual(outputSources, expectSources);

	}),

	/**
	 * Test 5
	 * Generate source context and transform image src for:
	 * 	Multiple adaptive modes
	 * 	Multiple image formats
	 * With:
	 * 	Replacing part of image file name
	 */
	(() => {

		const input = {
			url: '/bannner/id/en_desktop.jpg',
			adaptive: {
				baseModifier: '_desktop',
				variants: [
					{
						media: 'orientation: landscape',
						modifier: '_desktop',
					},
					{
						media: 'orientation: portrait',
						modifier: '_mobile',
					}
				]
			},
			formats: ['webp']
		}

		const outputSources = mapSources(input.url, input.formats, input.adaptive);

		const expectSources =  [
			{
				media: "(orientation: landscape)",
				source: "/bannner/id/en_desktop.webp",
				type: "image/webp"
			},
			{
				media: "(orientation: portrait)",
				source: "/bannner/id/en_mobile.webp",
				type: "image/webp"
			},
			{
				media: "(orientation: portrait)",
				source: "/bannner/id/en_mobile.jpg",
				type: "image/jpg"
			}
		];

		assertEqual(outputSources, expectSources);

	})
];

allTests.forEach((testCallback, index) => {
	try {
		testCallback();
		console.log(`Test ${index + 1} OK`);
	} catch (error) {
		console.error(`Test ${index + 1} FAILED:`)
		console.error(error);
	}
});
