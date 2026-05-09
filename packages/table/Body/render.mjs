/** @import { Row, RowDataProxy } from '../types/Row.mjs' */
/** @import { ColumnCell, Id } from '../types/index.mjs' */

import replaceShow from './replaceShow.mjs';
import getRow from './getRow.mjs';
import hideRow from './hideRow.mjs';
import showRow from './showRow.mjs';
/**
 * 
 * @param {[number, number]} rowRange 
 * @param {[number, number]} colRange 
 * @param {Row[]} rowData 
 * @param {Map<Id, Row>} rowMap 
 * @param {number[]} visible 
 * @param {number} startFixed 
 * @param {RowDataProxy[]} shownRows 
 * @param {Id | undefined} hoverId 
 * @param {Id | undefined} selectedId 
 * @param {Set<Id>} checkedSet 
 * @param {number} rowHeight 
 * @param {ColumnCell[]} columns 
 * @param {HTMLElement} body 
 * @returns 
 */
export default function render(
	[rStart, rEnd],
	[cStart, cEnd],
	rowData,
	rowMap,
	visible,
	startFixed,
	shownRows,
	hoverId,
	selectedId,
	checkedSet,
	rowHeight,
	columns,
	body,
) {
	return replaceShow(
		body,
		getRow(rowData, rowMap, visible, rStart, rEnd, body),
		shownRows,
		r => showRow(
			r,
			hoverId,
			selectedId,
			checkedSet,
			startFixed,
			visible,
			rowHeight,
			columns,
			cStart,
			cEnd,
		),
		hideRow,
	);
}
