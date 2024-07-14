import hideRow from './hideRow.mjs';

/**
 * 
 * @param {import('../types/Row.mjs').RowDataProxy[]} list 
 * @returns 
 */
export default function hideAll(list) {
	for (const r of list) {
		r.el.remove();
		hideRow(r);
	}
	return [];
}
