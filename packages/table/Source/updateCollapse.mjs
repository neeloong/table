/** @import { Row } from '../types/Row.mjs' */

import binarySearch from '../utils/binarySearch.mjs';
/**
 * 
 * @param {Row} row 
 * @param {Set<string | number | symbol>} expanded 
 * @returns {Iterable<number>}
 */
function* getList(row, expanded) {
	if (!expanded.has(row.id)) { return; }
	for (const r of row.children) {
		yield r.index;
		yield* getList(r, expanded);
	}
}
/**
 * 
 * @param {Row} row 
 * @param {Map<string | number | symbol, Row>} rowMap 
 * @param {Set<string | number | symbol>} expanded 
 * @returns 
 */
export function rowVisible(row, rowMap, expanded) {
	let parent = rowMap.get(/** @type {any} */(row.parentId));
	while (parent) {
		if (!expanded.has(parent.id)) { return false; }
		parent = rowMap.get(/** @type {any} */(parent.parentId));
	}
	return true;
}

/**
 * 
 * @param {Row} row 
 * @param {boolean} closed 
 * @param {Map<string | number | symbol, Row>} rowMap 
 * @param {Set<string | number>} expanded 
 * @param {number[]} visible 
 * @returns 
 */
export default function updateCollapse(row, closed, rowMap, expanded, visible) {
	if (!row.children.length) { return false; }
	if (!rowVisible(row, rowMap, expanded)) { return false; }
	// 找到第一个和最后一个 // this.rowData.indexOf(row);
	const { index } = row;
	let first = binarySearch(index + 1, visible, 0, visible.length - 1);
	if (first < 0) { return false; }
	let last = binarySearch(index + row.descendants.length, visible, 0, visible.length - 1);
	if (visible[last] > index + row.descendants.length) { last--; }
	const length = last - first + 1;
	visible.splice(first, length);
	if (closed) { return true; }
	let k = first;
	for (const index of getList(row, expanded)) {
		visible.splice(k, 0, index);
		k++;
	}
	return true;
}
