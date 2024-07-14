/**
 * 
 * @param {import('../types/Row.mjs').Row} row 
 * @returns 
 */
function getElMap(row) {
	let { elMap } = row;
	if (elMap) { return elMap; }
	elMap = new Map();
	row.elMap = elMap;
	return elMap;
}
/**
 * 
 * @param {import('../types/Row.mjs').Row} row 
 * @param {any} key 
 * @returns 
 */
function getProxy(row, key) {
	const elMap = getElMap(row);
	const proxy = elMap.get(key);
	if (proxy) {
		proxy.index = row.index;
		return proxy;
	}
	/** @type {import('../types/Row.mjs').RowDataProxy} */
	const elProxy = row.createProxy();
	elMap.set(key, elProxy);
	return elProxy;
}
/**
 * 
 * @param {import('../types/Row.mjs').Row[]} list 
 * @param {Map<string | number | symbol, import('../types/Row.mjs').Row>} map 
 * @param {number[]} visible 
 * @param {number} rStart 
 * @param {number} rEnd 
 * @param {any} key 
 * @returns 
 */
export default function getRow(list, map, visible, rStart, rEnd, key) {
	/** @type {Set<import('../types/Row.mjs').RowDataProxy>} */
	const needShowRow = new Set();
	for (let i = rStart; i <= rEnd; i++) {
		let index = visible[i];
		if (typeof index !== 'number') { continue; }
		const row = list[index];
		if (!row) { continue; }
		const elProxy = getProxy(row, key);
		if (needShowRow.has(elProxy)) { continue; }
		needShowRow.add(elProxy);
		// 需要显示浮动的行首和行尾部
		const { parentId } = row;
		if (parentId === undefined) { continue; }
		let parent = map.get(parentId);
		while (parent) {
			const elMap = getElMap(parent);
			let proxy = elMap.get(key);
			if (!proxy) {
				proxy = parent.createProxy();
				elMap.set(key, proxy);
			} else if (needShowRow.has(proxy)) {
				break;
			}
			needShowRow.add(proxy);
			const { parentId } = parent;
			if (parentId === undefined) { break; }
			parent = map.get(parentId);
		}
	}
	return [...needShowRow].sort(({ index: a }, { index: b }) => a - b);

}
