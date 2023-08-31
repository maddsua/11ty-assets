import Img from './Img';
import { PictireProps, mapSources, adaptBaseImageUrl, classToString, styleToString, getDOMRoot } from '../common/setup';

/**
 * Advanced \<picture\> component
 */
export default (props: PictireProps, useDOMRoot?: Document) => {

	const { domRoot, isNativeDOM } = getDOMRoot(useDOMRoot);
	
	const classString = classToString(props.class);
	const styleString = styleToString(props.style);

	const pictureElement = domRoot.createElement('picture');
	pictureElement.setAttribute('data-component-id', 'ssga:picture:dom');
	styleString && pictureElement.setAttribute('style', styleString);

	if (isNativeDOM) {
		classString && (pictureElement.className = classString);
	} else {
		classString && pictureElement.setAttribute('class', classString);
	}
	
	mapSources(props.src, props.formats, props.adaptiveModes).forEach(source => {
		const sourceElement = domRoot.createElement('source');
		sourceElement.srcset = source.source;
		sourceElement.type = source.type;
		source.media ? sourceElement.media = source.media : undefined;
		pictureElement.appendChild(sourceElement);
	});
	
	const imgComponent = Img({
		src: adaptBaseImageUrl(props.src, props.adaptiveModes),
		alt: props.alt,
		draggable: props.draggable,
		lazy: props.lazy,
		sizes: props.sizes,
		class: props.imgClass,
		style: props.imgStyle
	}, useDOMRoot);

	pictureElement.appendChild(imgComponent);

	return pictureElement;
};
