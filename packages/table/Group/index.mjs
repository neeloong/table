/** @import { Row } from '../types/Row.mjs' */
/** @import { Api, ColumnCell, ColumnOptions, RowValue } from '../types/index.mjs' */
/** @import Source from '../Source/index.mjs' */

import Body from '../Body/index.mjs';
import Header from '../Header/index.mjs';

import updateColumn from './updateColumn.mjs';
import createColumns from './createColumns.mjs';


export default class Group {
	/** @type {Api} */
	#api;
	#startFixed = 0;
	get startFixed() { return this.#startFixed; }
	set startFixed(v) {
		if (this.#destroyed) { return; }
		this.#startFixed = v;
		this.requestRender();
	}
	/** @type {() => void} */
	#remove;
	/** @type {() => readonly RowValue[]} */
	#getData;
	/** @type {() => void} */
	#requestRender;
	/**
	 * 
	 * @param {Source} source 
	 * @param {() => readonly RowValue[]} getData 
	 * @param {() => void} remove 
	 */
	constructor(
		source,
		getData,
		remove,
	) {
		this.#remove = remove;
		this.#getData = getData;
		this.#requestRender = () => source.requestRender(this);
		this.#api = {
			toggleSelected: id => source.toggleSelected(id),
			setCollapse: (k, c) => source.setCollapse(k, c),
			isCollapsed: k => source.isCollapsed(k),
			setChecked: (k, v) => source.setChecked(k, v),
			isChecked: k => source.isChecked(k),
			isAllChecked: () => source.isAllChecked(),
			hasChecked: () => source.hasChecked(),
			checkedAll: () => source.checkedAll(),
			cleanChecked: () => source.cleanChecked(),

			emit: source.emit,
			listen: source.listen,
			emitRow: source.emitRow,
			listenRow: source.listenRow,
			setStyleVar: (k, v) => this.setStyleVar(k, v),
			removeStyleVar: k => this.removeStyleVar(k),
		};
	}
	/**
	 * 
	 * @param {HTMLElement} [root] 
	 * @returns 
	 */
	createHeader(root) {
		const header = new Header(root, this, () => {
			this.#headers.delete(header);
		});

		header.requestRender = () => this.requestRender(header);
		this.#headers.add(header);
		if (this.#destroyed) {
			header.destroy();
		} else {
			header._updateColumns(this.#columns);
			for (const [k, v] of this.#styles) {
				header.root.style.setProperty(k, v);
			}
		}
		this.requestRender(header);
		return header;
	}
	/**
	 * 
	 * @param {HTMLElement} [root] 
	 * @param {number} [rowHeight] 
	 * @returns 
	 */
	createBody(root, rowHeight) {
		const area = new Body(root, this, () => {
			this.#bodies.delete(area);
		});
		if (rowHeight && rowHeight > 0) {
			area.rowHeight = rowHeight;
		}

		area.requestRender = () => this.requestRender(area);
		this.#bodies.add(area);
		if (this.#destroyed) {
			area.destroy();
		} else {
			area._updateColumns(this.#columns);
			for (const [k, v] of this.#styles) {
				area.root.style.setProperty(k, v);
			}
		}
		this.requestRender(area);
		return area;
	}
	/** @type {ColumnCell[]} */
	#columns = [];
	get columns() { return this.#columns; }
	/**
	 * 
	 * @param {RowValue[]} data 
	 */
	_updateData(data) {
		this.#hide();
		for (const column of this.#columns) {
			column.updateData(data);
		}
	}
	/**
	 * 
	 * @param {ColumnOptions[]} [v] 
	 * @returns 
	 */
	setColumns(v) {
		if (this.#destroyed) { return; }
		const columns = createColumns(
			() => this.requestRender(),
			this.#api,
			this.#columns,
			this.#getData(),
			v || [],
		);
		this.#columns = columns;
		for (const header of this.#headers) {
			header._updateColumns(columns);
		}
		for (const area of this.#bodies) {
			area._updateColumns(columns);
		}
		this.requestRender();
	}

	#hide() {
		for (const header of this.#headers) {
			header._hide();
		}
		for (const area of this.#bodies) {
			area._hide();
		}
	}
	paused = false;
	#renderSet = new Set();
	#renderAll = false;
	/**
	 * 
	 * @param {any} [p] 
	 * @returns 
	 */
	requestRender(p) {
		if (this.#destroyed) { return; }
		this.#requestRender();
		if (p) {
			this.#renderSet.add(p);
		} else {
			this.#renderAll = true;
		}
	}
	#destroyed = false;
	destroy() {
		if (this.#destroyed) { return; }
		this.#destroyed = true;
		this.#remove();
		this.#hide();
		for (const c of [...this.#headers]) {
			c.destroy();
		}
		for (const c of [...this.#bodies]) {
			c.destroy();
		}
		for (const c of this.#columns) {
			c.destroy();
		}
		this.#columns = [];

	}
	/** @type {Set<Body>} */
	#bodies = new Set();
	/** @type {Set<Header>} */
	#headers = new Set();
	/**
	 * 
	 * @param {Row[]} rowData 
	 * @param {Map<string | number | symbol, Row>} rowMap 
	 * @param {number[]} visibleRowIndexes 
	 * @param {string | number | undefined} hoverId 
	 * @param {string | number | symbol | undefined} selectedId 
	 * @param {Set<string | number | symbol>} checkedSet 
	 * @param {boolean} [force] 
	 * @returns 
	 */
	_render(
		rowData,
		rowMap,
		visibleRowIndexes,
		hoverId,
		selectedId,
		checkedSet,
		force = this.#renderAll,
	) {
		if (this.#destroyed) { return; }
		this.setStyleVar('row-visible', `${visibleRowIndexes.length}`);

		const { startFixed } = this;
		const columns = this.#columns;
		const separate = updateColumn(columns, startFixed);
		const width = separate[separate.length - 1];
		this.setStyleVar('width', `${width}px`);
		const s = startFixed < separate.length && separate[startFixed] || 0;
		this.setStyleVar('fixed-start-width', `${s > 0 ? s : -100}px`);
		if (this.paused) { return; }
		this.#renderAll = false;
		const set = new Set(this.#renderSet);
		this.#renderSet.clear();


		for (const header of this.#headers) {
			header._render(
				columns,
				force || set.has(header),
			);
		}
		for (const body of this.#bodies) {
			body._render(
				columns,
				rowData,
				rowMap,
				visibleRowIndexes,
				hoverId,
				selectedId,
				checkedSet,
				separate,
				startFixed,
				force || set.has(body),
			);
		}
	}
	/** @type {Map<string, string>} */
	#styles = new Map();
	/**
	 * 
	 * @param {string} k 
	 * @param {string} v 
	 */
	setStyleVar(k, v) {
		const key = `--neeloong-table-${k}`;
		this.#styles.set(key, v);
		for (const area of this.#headers) {
			area.root.style.setProperty(key, v);
		}
		for (const area of this.#bodies) {
			area.root.style.setProperty(key, v);
		}
	}
	/**
	 * 
	 * @param {string} k 
	 */
	removeStyleVar(k) {
		const key = `--neeloong-table-${k}`;
		this.#styles.delete(key);
		for (const area of this.#headers) {
			area.root.style.removeProperty(key);
		}
		for (const area of this.#bodies) {
			area.root.style.removeProperty(key);
		}
	}
}
