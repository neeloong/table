import binarySearch from '../utils/binarySearch.mjs';
import replaceShow from './replaceShow.mjs';
import createCell from './createCell.mjs';
import showCell from './showCell.mjs';
import hideCell from './hideCell.mjs';

/**
 * 
 * @param {import('../types/Row.mjs').RowDataProxy} r 
 * @param {string | number | symbol | undefined} hoverId 
 * @param {string | number | symbol | undefined} selectedId 
 * @param {Set<string | number | symbol>} checkedSet 
 * @param {number} startFixed 
 * @param {number[]} visible 
 * @param {number} rowHeight 
 * @param {import('../types/index.mjs').ColumnCell[]} columns 
 * @param {number} cStart 
 * @param {number} cEnd 
 */
export default function showRow(
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
) {
	// 计算出在显示的项目当中的编号
	const showIndex = binarySearch(r.index, visible, 0, visible.length - 1);
	const { el, row: { id }, cells, api } = r;
	if (hoverId === id) {
		el.classList.add('neeloong-table-row-hover');
	} else {
		el.classList.remove('neeloong-table-row-hover');
	}
	if (selectedId === id) {
		el.classList.add('neeloong-table-row-selected');
	} else {
		el.classList.remove('neeloong-table-row-selected');
	}
	if (checkedSet.has(id)) {
		el.classList.add('neeloong-table-row-checked');
	} else {
		el.classList.remove('neeloong-table-row-checked');
	}
	el.style.insetBlockStart = `${rowHeight * showIndex}px`;
	el.style.blockSize = `${rowHeight}px`;

	/** @type {Set<import('../types/Row.mjs').Cell>} */
	const needCells = new Set();
	const startFixedMax = Math.min(startFixed, cStart);
	/**
	 * 
	 * @param {number} i 
	 * @returns 
	 */
	function add(i) {
		const column = columns[i];
		if (column.hidden) { return; }
		const index = column.start;
		let cell = cells.get(column);

		if (cell) {
			cell.index = index;
		} else {
			let destroyed = false;
			function destroy() {
				if (destroyed) { return; }
				destroyed = true;
				if (cells.get(column) !== cell) { return; }
				cells.delete(column);
			}
			cell = createCell(api, r.row.value, column, index, destroy);
			if (!destroyed) {
				cells.set(column, cell);
			}
		}
		needCells.add(cell);
		if (i < startFixed) {
			cell.el.classList.add('neeloong-table-cell-fixed');
		} else {
			cell.el.classList.remove('neeloong-table-cell-fixed');
		}
	}
	for (let i = 0; i < startFixedMax; i++) {
		add(i);
	}
	for (let i = cStart; i <= cEnd; i++) {
		add(i);
	}
	r.shown = replaceShow(
		el,
		[...needCells].sort(({ index: a }, { index: b }) => a - b),
		r.shown,
		showCell,
		hideCell,
	);
}
