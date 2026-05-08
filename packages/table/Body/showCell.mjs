/** @import { Cell } from '../types/Row.mjs' */

/**
 * 
 * @param {Cell} c 
 */
export default function showCell(c) {
	const {column} = c;
	const {el} = c;
	el.style.setProperty('--neeloong-table-column-start', `${column.start}px`);
	el.style.inlineSize = `${column.width}px`;
	if (column.spillable) {
		el.classList.remove('neeloong-table-cell-ellipsis');
	} else {
		el.classList.add('neeloong-table-cell-ellipsis');

	}
	c.setHidden(false);
}
