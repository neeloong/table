import hideCell from './hideCell.mjs';
/**
 * 
 * @param {import('../types/Row.mjs').RowDataProxy} row 
 */
export default function hideRow(row) {
	for (const c of row.shown) {
		c.el.remove();
		hideCell(c);
	}
	row.shown = [];
}
