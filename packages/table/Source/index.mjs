/** @import { Row } from '../types/Row.mjs' */
/** @import { ColumnOptions, Emit, EventContext, EventMap, IdKey, Key, Listen, Options, RowEmit, RowEventMap, RowListen, RowValue } from '../types/index.mjs' */

import Group from '../Group/index.mjs';
import { isEq } from '../utils/isEq.mjs';
import { createEmit, createListen } from '../utils/event.mjs';
import { createEmitRow, createListenRow } from '../utils/rowEvent.mjs';

import updateCollapse from './updateCollapse.mjs';
import updateVisible from './updateVisible.mjs';
import setValue from './setValue.mjs';
export default class Source {
	/** @type {Row[]} */
	#rowData = [];
	/** @type {Map<string | number | symbol, Row>} */
	#rowMap = new Map();
	/** @type {IdKey<object> | undefined} */
	#idKey;
	/** @type {Key<string | number, object> | undefined} */
	#parentKey;
	/** @type {number[]} */
	#visibleRowIndexes = [];

	/** @type {Map<string | number, Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>>} */
	#rowEvents = new Map();
	/** @readonly @type {RowEmit<RowEventMap>} */
	emitRow = createEmitRow(this.#rowEvents);
	/** @readonly @type {RowListen<RowEventMap>} */
	listenRow = createListenRow(this.#rowEvents);

	/** @type {Record<any, Set<(v: any, ctx: EventContext) => boolean>>} */
	#events = {};
	/** @readonly @type {Emit<EventMap>} */
	emit = createEmit(this.#events);
	/** @readonly @type {Listen<EventMap>} */
	listen = createListen(this.#events);

	#selectable = false;
	/** @type {boolean} */
	get selectable() { return this.#selectable; }
	set selectable(v) {
		if (v) {
			this.#selectable = true;
			return;
		}
		this.#selectable = false;
		const old = this.#selectedId;
		if (old === undefined) { return; }
		this.#selectedId = undefined;
		this.requestRender();
		this.emit('selectedChange', undefined);
		this.emitRow(old, 'selectedChange', false);

	}
	paused = false;
	/** @type {number | string | symbol | undefined} */
	#selectedId;
	get selectedId() { return this.#selectedId; }
	set selectedId(v) {
		if (!this.#selectable) { return; }
		const old = this.#selectedId;
		if (v === old) { return; }
		this.#selectedId = v;
		this.requestRender();
		this.emit('selectedChange', v);
		if (old !== undefined) {
			this.emitRow(old, 'selectedChange', false);
		}
		if (v !== undefined) {
			this.emitRow(v, 'selectedChange', true);
		}
	}
	/**
	 * 
	 * @param {number | string | symbol} id 
	 * @returns 
	 */
	toggleSelected(id) {
		if (!this.#selectable) { return; }
		const old = this.#selectedId;
		const selectedId = old === id ? undefined : id;
		this.#selectedId = selectedId;
		this.requestRender();
		this.emit('selectedChange', selectedId);
		if (old !== undefined && old !== id) {
			this.emitRow(old, 'selectedChange', false);
		}
		if (id !== undefined) {
			this.emitRow(id, 'selectedChange', true);
		}
	}


	/** @type {(number | string | symbol)[]} */
	#checkedList = [];
	/** @type {Set<number | string | symbol>} */
	#checkedSet = new Set();
	#allChecked = false;
	get checked() { return [...this.#checkedList]; }
	set checked(v) {
		/** @type {Set<number | string | symbol>} */
		const had = new Set();
		const rowMap = this.#rowMap;
		/** @type {(number | string | symbol)[]} */
		const newList = [];
		for (const k of v) {
			if (had.has(k)) { continue; }
			if (!rowMap.has(k)) { continue; }
			had.add(k);
			newList.push(k);
		}
		if (isEq(this.#checkedList, newList)) { return; }
		const oldSet = this.#checkedSet;
		const checkedSet = new Set(newList);
		this.#checkedList = newList;
		this.#checkedSet = checkedSet;
		this.#allChecked = checkedSet.size === rowMap.size;
		this.requestRender();
		this.emit('checkedChange', [...newList]);
		for (const v of checkedSet) {
			if (oldSet.has(v)) { continue; }
			this.emitRow(v, 'checkedChange', true);
		}
		for (const v of oldSet) {
			if (checkedSet.has(v)) { continue; }
			this.emitRow(v, 'checkedChange', false);
		}
	}
	/**
	 * 
	 * @param {string | number} id 
	 * @returns 
	 */
	isChecked(id) {
		return this.#checkedSet.has(id);
	}
	/**
	 * 
	 * @param {string | number} id 
	 * @param {boolean} [checked] 
	 * @returns 
	 */
	setChecked(id, checked) {
		const rowMap = this.#rowMap;
		if (!rowMap.has(id)) { return false; }
		const checkedSet = this.#checkedSet;
		if (typeof checked === 'boolean') {
			if (checked === checkedSet.has(id)) { return checked; }
		} else {
			checked = !checkedSet.has(id);
		}
		const checkedList = this.#checkedList;
		if (checked) {
			checkedList.push(id);
			checkedSet.add(id);
			this.#allChecked = checkedSet.size === rowMap.size;
		} else {
			const index = checkedList.indexOf(id);
			if (index >= 0) { checkedList.splice(index, 1); }
			checkedSet.delete(id);
			this.#allChecked = false;
		}
		this.requestRender();
		this.emit('checkedChange', [...this.#checkedList]);
		this.emitRow(id, 'checkedChange', checked);
		return checked;
	}
	get allChecked() { return this.#allChecked; }
	checkedAll() {
		const newList = this.#rowData.map(v => v.id);
		if (isEq(this.#checkedList, newList)) { return; }
		const oldChecked = this.#checkedSet;
		const checkedSet = new Set(newList);
		this.#checkedList = newList;
		this.#checkedSet = checkedSet;
		this.#allChecked = true;
		this.requestRender();
		this.emit('checkedChange', [...this.#checkedList]);
		for (const v of checkedSet) {
			if (oldChecked.has(v)) { continue; }
			this.emitRow(v, 'checkedChange', true);
		}
	}
	cleanChecked() {
		const checkedList = this.#checkedList;
		if (!checkedList.length) { return; }
		this.#checkedList = [];
		this.#checkedSet = new Set();
		this.#allChecked = false;
		this.requestRender();
		this.emit('checkedChange', [...this.#checkedList]);
		for (const v of checkedList) {
			this.emitRow(v, 'checkedChange', false);
		}
	}

	/** @type {Set<number | string>} */
	#expanded = new Set();
	/** @type {(string | number)[]} */
	get expanded() { return [...this.#expanded]; }
	set expanded(list) {
		const nl = [...list];
		const expanded = this.#expanded;
		if (nl.length === expanded.size && nl.findIndex(v => !expanded.has(v)) < 0) { return; }
		const rowMap = this.#rowMap;
		const rowData = this.#rowData;
		const oldExpanded = new Set(expanded);
		/** @type {Set<Row>} */
		const newExpanded = new Set();
		expanded.clear();
		for (const k of nl) {
			const row = rowMap.get(k);
			if (!row) { continue; }
			expanded.add(k);
			if (!oldExpanded.delete(k)) {
				newExpanded.add(row);
			}
		}
		for (const k of oldExpanded) {
			rowMap.get(k)?.emit('collapseChange', true);
		}
		for (const row of newExpanded) {
			row.emit('collapseChange', false);
		}

		this.#visibleRowIndexes = updateVisible(rowData, rowMap, expanded);
		this.requestRender();
	}
	/**
	 * 
	 * @param {string | number} k 
	 * @returns 
	 */
	isCollapsed(k) { return !this.#expanded.has(k); }
	/**
	 * 
	 * @param {number | string} k 
	 * @param {boolean} [closed] 
	 * @returns 
	 */
	setCollapse(k, closed) {
		const rowMap = this.#rowMap;
		const row = rowMap.get(k);
		if (!row) { return; }
		const expanded = this.#expanded;
		const c = typeof closed === 'boolean' ? closed : expanded.has(k);
		if (expanded.has(k) !== c) { return; }
		expanded[c ? 'delete' : 'add'](k);
		const visible = this.#visibleRowIndexes;
		if (updateCollapse(row, c, rowMap, expanded, visible)) {
			this.requestRender();
		}
		row.emit('collapseChange', c);
		this.emit('collapseChange', [...this.#expanded]);
	}
	isAllChecked() {
		return this.#allChecked;
	}
	hasChecked() {
		return this.#checkedSet.size > 0;
	}
	/**
	 * 
	 * @param {Options} options 
	 */
	constructor({
		idKey,
		parentKey,
	} = {}) {
		this.#idKey = idKey;
		this.#parentKey = parentKey;
	}

	/**
	 * 
	 * @param {ColumnOptions[]} [columns] 
	 * @param {number} [startFixed] 
	 * @returns 
	 */
	createGroup(columns, startFixed) {
		const area = new Group(
			this,
			() => this.#data,
			() => { this.#groups.delete(area); },
		);
		area.startFixed = startFixed || 0;
		area.requestRender = () => this.requestRender(area);
		this.requestRender(area);
		this.#groups.add(area);
		area.setColumns(columns);
		return area;
	}
	/** @type {Set<Group>} */
	#groups = new Set();
	#renderId = requestAnimationFrame(() => { this.#render(); });
	#renderSet = new Set();
	#renderAll = false;
	/**
	 * 
	 * @param {any} [p] 
	 */
	requestRender(p) {
		if (p) {
			this.#renderSet.add(p);
		} else {
			this.#renderAll = true;
		}
	}
	/**
	 * 
	 * @returns {Iterable<[Group, boolean]>}
	 * @yields {[Group, boolean]}
	 */
	*#getNeedRender() {
		const areas = [...this.#groups];
		if (this.#renderAll) {
			this.#renderAll = false;
			this.#renderSet.clear();
			for (const area of areas) {
				yield [area, true];
			}
			return;
		}
		const set = new Set(this.#renderSet);
		this.#renderSet.clear();
		for (const area of areas) {
			yield [area, set.has(area)];
		}
	}
	#destroyed = false;
	destroy() {
		if (this.#destroyed) { return; }
		this.#destroyed = true;
		cancelAnimationFrame(this.#renderId);
		for (const c of [...this.#groups]) {
			c.destroy();
		}
	}
	/** @type {string | number | undefined} */
	#hoverId;
	#render() {
		if (this.#destroyed) { return; }
		this.#renderId = requestAnimationFrame(() => { this.#render(); });
		if (this.paused) { return; }
		const needRenderList = [...this.#getNeedRender()];

		const visibleRowIndexes = this.#visibleRowIndexes;
		const selectedId = this.#selectedId;
		const checkedSet = this.#checkedSet;
		const rowMap = this.#rowMap;
		const rowData = this.#rowData;
		const hoverId = this.#hoverId;

		for (let [area, force] of needRenderList) {
			area._render(
				rowData,
				rowMap,
				visibleRowIndexes,
				hoverId,
				selectedId,
				checkedSet,
				force,
			);
		}
	}
	/** @type {readonly RowValue[]} */
	#data = [];
	/**
	 * 
	 * @param {object[]} rows 
	 * @returns 
	 */
	setValue(rows) {
		const oldMap = this.#rowMap;
		const [list, map] = setValue(
			this,
			rows,
			id => { this.#hoverId = id; this.requestRender(); },
			oldMap,
			this.#idKey,
			this.#parentKey,
		);
		this.#rowData = list;
		this.#rowMap = map;
		const data = list.map(v => v.value);
		this.#data = Object.freeze(data);
		for (const area of this.#groups) {
			area._updateData(data);
		}

		// TODO: 折叠处理
		const expanded = this.#expanded;
		this.#visibleRowIndexes = updateVisible(list, map, expanded);
		this.requestRender();

		/** @type {(number | string | symbol)[]} */
		const newList = [];
		for (const k of this.#checkedList) {
			if (!map.has(k)) { continue; }
			newList.push(k);
		}
		if (isEq(this.#checkedList, newList)) { return; }
		const checkedSet = new Set(newList);
		this.#checkedList = newList;
		this.#checkedSet = checkedSet;
		this.#allChecked = checkedSet.size === map.size;
		this.requestRender();
		this.emit('checkedChange', [...this.#checkedList]);
	}
}
