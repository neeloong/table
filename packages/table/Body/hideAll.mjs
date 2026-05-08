/** @import { RowDataProxy } from '../types/Row.mjs' */

import hideRow from './hideRow.mjs';

/**
 * 
 * @param {RowDataProxy[]} list 
 * @returns 
 */
export default function hideAll(list) {
	for (const r of list) {
		r.el.remove();
		hideRow(r);
	}
	return [];
}
