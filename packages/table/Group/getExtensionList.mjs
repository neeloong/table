/** @typedef {[import('../types/index.mjs').Extension, Record<string, any>][]} ExtensionList */
/**
 * 
 * @param {import('../types/index.mjs').ExtensionOption | import('../types/index.mjs').ExtensionOption[]} [extensions] 
 * @returns {ExtensionList}
 */
export default function getExtensionList(extensions) {
	if (!extensions) { return []; }
	if (!Array.isArray(extensions)) {
		return getExtensionList([extensions]);
	}
	/** @type {ExtensionList} */
	const list = [];
	for (const extension of extensions) {
		if (typeof extension === 'function') {
			list.push([extension, {}]);
			continue;
		}
		const { extension: e } = extension;
		if (typeof e !== 'function') { continue; }
		list.push([e, extension]);
	}
	return list;
}
