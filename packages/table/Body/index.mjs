/** @import { Row, RowDataProxy } from '../types/Row.mjs' */
/** @import { ColumnCell, CustomizeComponent } from '../types/index.mjs' */
/** @import Group from '../Group/index.mjs' */

import { defaultRowHeight } from '../defaultConfig.mjs';
import { verticalWritingMode } from '../verticalWritingMode.mjs';

import render from './render.mjs';
import hideAll from './hideAll.mjs';
import findRow from './findRow.mjs';
import findCol from './findCol.mjs';


/**
 * 
 * @param {HTMLElement} root 
 * @param {() => Iterable<DOMRect>} getClientRects 
 * @returns {[[number, number, number], [number, number, number]]}
 */
function getBoundingClientRect(root, getClientRects) {
	/** @type {[number, number, number, number]} */
	let view = [0, 0, window.innerWidth, window.innerHeight];
	for (const { left, top, right, bottom } of getClientRects()) {
		view = [
			Math.max(view[0], left),
			Math.max(view[1], top),
			Math.min(view[2], right),
			Math.min(view[3], bottom),
		];
	}
	const { left, top, width, height } = root.getBoundingClientRect();
	const right = view[2] - left - width;
	const bottom = view[3] - top - height;
	return [
		[-left + view[0], width, -right],
		[-top + view[1], height, -bottom],
	];

}
/**
 * @typedef {object} ColumnState
 * @property {boolean} fixed
 * @property {boolean} hidden
 * @property {number} [start]
 * @property {number} [width]
 */
/**
 * 
 * @param {ColumnCell} column 
 * @returns {[CustomizeComponent, ColumnState]?}
 */
function createCustomize(column) {
	const customizeComponent = column.customize({ column: column.options }) || null;
	if (!customizeComponent) { return null; }
	if (customizeComponent) {
		customizeComponent.root.classList.add('neeloong-table-customize');
	}
	return [customizeComponent, { fixed: false, hidden: false }];
}
export default class Body {
	/** @readonly @type {HTMLElement} */
	root;
	/** @readonly @type {HTMLElement} */
	#main = document.createElement('tbody');
	/** @returns {Iterable<DOMRect>} */
	#getClientRects = () => [];
	get getClientRects() { return this.#getClientRects; }
	set getClientRects(v) {
		if (this.#destroyed) { return; }
		this.#getClientRects = v;
		this.requestRender();
	}
	/** @type {number} */
	#rowHeight = 0;
	get rowHeight() { return this.#rowHeight; }
	set rowHeight(v) {
		if (this.#destroyed) { return; }
		this.#rowHeight = v;
		this.root.style.setProperty('--neeloong-table-row-height', `${v}px`);
		this.requestRender();
	}
	/** @type {Group} */
	#group;
	/** @type {() => void} */
	#remove;
	/**
	 * 
	 * @param {HTMLElement | undefined} root 
	 * @param {Group} group 
	 * @param {() => void} remove 
	 */
	constructor(root, group, remove) {
		this.#remove = remove;
		this.#group = group;
		const body = root || document.createElement('table');
		this.root = body;
		const main = body.appendChild(this.#main);
		body.classList.add('neeloong-table', 'neeloong-table-body');
		main.classList.add('neeloong-table-main');
		this.rowHeight = defaultRowHeight;
	}
	/** @type {RowDataProxy[]} */
	#shownRows = [];

	/** @type {Map<ColumnCell, [CustomizeComponent, ColumnState] | null>} */
	#customizeMap = new Map();
	/** @type {([CustomizeComponent, ColumnState] | null)[]} */
	#customizeList = [];
	/**
	 * 
	 * @param {ColumnCell[]} columns 
	 */
	_updateColumns(columns) {
		const oldMap = this.#customizeMap;
		/** @type {Map<ColumnCell, [CustomizeComponent, ColumnState] | null>} */
		const newMap = new Map();
		/** @type {([CustomizeComponent, ColumnState] | null)[]} */
		const list = [];
		this.#customizeList = list;
		this.#customizeMap = newMap;
		const body = this.root;
		for (const column of columns) {
			const c = oldMap.get(column);
			oldMap.delete(column);
			const cs = c === undefined ? createCustomize(column) : c;
			newMap.set(column, cs);
			list.push(cs);
			if (!cs) { continue; }
			const [component] = cs;
			body.appendChild(component.root);
			component.update?.(column.options);
		}
		for (const c of oldMap.values()) {
			if (!c) { continue; }
			const [component] = c;
			component.root.remove();
			component.destroy();
		}

	}
	_hide() {
		this.#shownRows = hideAll(this.#shownRows);
	}
	#destroyed = false;
	destroy() {
		if (this.#destroyed) { return; }
		this.#destroyed = true;
		this.#remove();
		this._hide();
		for (const c of this.#customizeList) {
			if (!c) { continue; }
			const [component] = c;
			component.root.remove();
			component.destroy();
		}
		// TODO:
	}
	#lastSize = '';
	paused = false;
	requestRender() {
		if (this.#destroyed) { return; }
		this.#lastSize = '';
		this.#group.requestRender(this);
	}
	/**
	 * 
	 * @param {ColumnCell[]} columns 
	 * @param {Row[]} rowData 
	 * @param {Map<string | number | symbol, Row>} rowMap 
	 * @param {number[]} visibleRowIndexes 
	 * @param {string | number | undefined} hoverId 
	 * @param {string | number | symbol | undefined} selectedId 
	 * @param {Set<string | number | symbol>} checkedSet 
	 * @param {number[]} separate 
	 * @param {number} startFixed 
	 * @param {boolean} [force] 
	 * @returns 
	 */
	_render(
		columns,
		rowData,
		rowMap,
		visibleRowIndexes,
		hoverId,
		selectedId,
		checkedSet,
		separate,
		startFixed,
		force = false,
	) {
		if (this.#destroyed) { return; }
		if (this.paused) { return; }
		const { root } = this;
		const style = getComputedStyle(root);
		const writingMode = style.writingMode?.toLowerCase();
		const vertical = verticalWritingMode.has(writingMode);
		const size = getBoundingClientRect(root, this.getClientRects);
		if (vertical) { size.reverse(); }
		if (['vertical-rl', 'sideways-rl'].includes(writingMode)) {
			size[1].reverse();
		}
		const rtl =
			(style.direction.toLowerCase() === 'rtl')
			!== (writingMode === 'sideways-lr');
		if (rtl) { size[0].reverse(); }

		const lastSize = size.toString();
		if (!force && this.#lastSize === lastSize) { return; }
		this.#lastSize = lastSize;

		const [c, r] = size;
		const rowHeight = this.#rowHeight;
		const row = findRow(rowHeight, r[0], r[1] - r[2], rowData.length);
		if (!row) { return this._hide(); }
		renderCustomize(columns, this.#customizeList);


		const col = findCol(separate, c[0], c[1] - c[2]);

		if (!col) { return this._hide(); }

		this.#shownRows = render(
			row,
			col,
			rowData,
			rowMap,
			visibleRowIndexes,
			startFixed,
			this.#shownRows,
			hoverId,
			selectedId,
			checkedSet,
			rowHeight,
			columns,
			this.#main,
		);
	}
}
/**
 * 
 * @param {ColumnCell[]} columns 
 * @param {([CustomizeComponent, ColumnState] | null)[]} list 
 */
function renderCustomize(columns, list) {
	let i = 0;
	for (const { width, hidden, start, fixed } of columns) {
		const item = list[i];
		i++;
		if (!item) { continue; }
		const [{ root }, state] = item;

		if (fixed !== state.fixed) {
			state.fixed = fixed;
			if (fixed) {
				root.classList.add('neeloong-table-customize-fixed');
			} else {
				root.classList.remove('neeloong-table-customize-fixed');
			}
		}
		if (hidden !== state.hidden) {
			state.hidden = hidden;
			root.hidden = hidden;
		}
		if (hidden) { continue; }
		if (state.start !== start) {
			state.start = start;
			root.style.setProperty('--neeloong-table-column-start', `${start}px`);
		}
		if (state.width !== width) {
			state.width = width;
			root.style.inlineSize = `${width}px`;
		}
	}
}
