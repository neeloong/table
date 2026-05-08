/** @import { RowDataProxy } from '../types/Row.mjs' */

import hideCell from './hideCell.mjs';
/**
 * 
 * @param {RowDataProxy} row 
 */
export default function hideRow(row) {
	for (const c of row.shown) {
		c.el.remove();
		hideCell(c);
	}
	row.shown = [];
}
