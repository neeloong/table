/** @import { Row } from '../types/Row.mjs' */
/** @import { Id } from '../types/options.mjs' */

import { rowVisible } from './updateCollapse.mjs';

/**
 * 
 * @param {Row[]} rowData 
 * @param {Map<Id, Row>} rowMap 
 * @param {Set<Id>} expanded 
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
