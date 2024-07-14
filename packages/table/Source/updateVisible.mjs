import { rowVisible } from './updateCollapse.mjs';

/**
 * 
 * @param {import('../types/Row.mjs').Row[]} rowData 
 * @param {Map<string | number | symbol, import('../types/Row.mjs').Row>} rowMap 
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
