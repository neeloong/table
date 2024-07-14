import replaceShow from './replaceShow.mjs';
import getRow from './getRow.mjs';
import hideRow from './hideRow.mjs';
import showRow from './showRow.mjs';
/**
 * 
 * @param {[number, number]} rowRange 
 * @param {[number, number]} colRange 
 * @param {import('../types/Row.mjs').Row[]} rowData 
 * @param {Map<string | number | symbol, import('../types/Row.mjs').Row>} rowMap 
 * @param {number[]} visible 
 * @param {number} startFixed 
 * @param {import('../types/Row.mjs').RowDataProxy[]} shownRows 
 * @param {string | number | undefined} hoverId 
 * @param {string | number | symbol | undefined} selectedId 
 * @param {Set<string | number | symbol>} checkedSet 
 * @param {number} rowHeight 
 * @param {import('../types/index.mjs').ColumnCell[]} columns 
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
