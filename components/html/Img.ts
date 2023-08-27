import { ImageProps, getImageSize, classToString, styleToString, composeAttributesHTML } from '../common/setup';

export default (props: ImageProps) => {

	const size = getImageSize(props.sizes);

	const attrList = {
		src: props.src,
		alt: props.alt,
		width: size?.width,
		height: size?.height,
		draggable: props.draggable === true ? 'true' : 'false',
		loading: props.lazy !== false ? 'lazy' : undefined,
		class: classToString(props.class),
		style: styleToString(props.style)
	};

	return `<img ${composeAttributesHTML(attrList)} data-component-id="ssga:img:html" />`;
};
