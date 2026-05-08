/** @import { Row } from '../types/Row.mjs' */

import { rowVisible } from './updateCollapse.mjs';

/**
 * 
 * @param {Row[]} rowData 
 * @param {Map<string | number | symbol, Row>} rowMap 
 * @param {Set<string | number>} expanded 
 * @returns 
 */
export default function updateVisible(rowData, rowMap, expanded) {

	const visible = [];
	const { length } = rowData;
	for (let i = 0; i < length; i++) {
		if (rowVisible(rowData[i], rowMap, expanded)) {
			visible.push(i);
		}
	}
	return visible;
}
