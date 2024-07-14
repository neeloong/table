import createKey, { createIdKey } from '../createKey.mjs';

/** @typedef {[string | number, any, string | number | undefined]} RowInfo */
/**
 * 
 * @param {any[]} rows 
 * @param {(v: any) => string | number} idKey 
 * @param {(v: any) => string | number | undefined} parentKey 
 * @returns {RowInfo[]}
 */
function unique(rows, idKey, parentKey) {
	/** @type {RowInfo[]} */
	const list = [];
	/** @type {Map<string | number, RowInfo>} */
	const map = new Map();
	for (const value of rows || []) {
		const id = idKey(value);
		let row = map.get(id);
		if (row) {
			row[1] = value;
			continue;
		}
		row = [id, value, parentKey(value)];
		map.set(id, row);
		list.push(row);
	}
	return list;
}

/**
 * 
 * @param {RowInfo[]} rows 
 * @returns {RowInfo[]}
 */
function toTree(rows) {
	const ids = new Set(rows.map(v => v[0]));
	/** @type {RowInfo[]} */
	const root = [];
	/** @type {Map<string | number, RowInfo[]>} */
	const map = new Map();
	for (const row of rows) {
		const parentId = row[2];
		if (parentId === undefined || !ids.has(parentId)) {
			root.push(row);
			continue;
		}
		const list = map.get(parentId);
		if (list) {
			list.push(row);
			continue;
		}
		map.set(parentId, [row]);
	}

	/**
	 * 
	 * @param {RowInfo[]} list 
	 * @returns {Iterable<RowInfo>}
	 */
	function* get(list) {
		for (const row of list) {
			yield row;
			const id = row[0];
			const list = map.get(id);
			if (!list) { continue; }
			map.delete(id);
			yield* get(list);
		}
	}
	/** @type {RowInfo[]} */
	const list = [...get(root)];
	while (map.size) {
		const [id] = map.keys();
		const l = map.get(id);
		map.delete(id);
		if (!l) { continue; }
		for (const v of get(l)) {
			list.push(v);
		}
	}
	return list;
}
/**
 * 
 * @param {() => void} setSelected 
 * @returns 
 */
function createRowEl(setSelected) {
	const el = document.createElement('div');
	el.className = 'neeloong-table-row';
	el.addEventListener('click', e => {
		for (const v of e.composedPath()) {
			if (v === el) { break; }
			if (!(v instanceof Element)) { continue; }
			if (v.classList.contains('neeloong-table-selectable')) { return; }
		}
		setSelected();
	});
	el.appendChild(document.createElement('div')).className = 'neeloong-table-fixed-line';
	return el;
}

/**
 * 
 * @param {import('./index.mjs').default} source 
 * @param {string | number} id 
 * @param {HTMLDivElement} el 
 * @param {import('../types/index.mjs').Listen<import('../types/index.mjs').RowEventMap>} listen 
 * @param {import('../types/index.mjs').Emit<import('../types/index.mjs').RowEventMap>} emit 
 * @returns {import('../types/index.mjs').RowApi}
 */
function createRowApi(source, id, el, listen, emit) {
	return {
		emit, listen,
		setCollapse: v => source.setCollapse(id, v),
		get collapsed() { return source.isCollapsed(id); },
		set collapsed(v) { source.setCollapse(id, v); },
		setChecked: v => { source.setChecked(id, v); },
		get checked() { return source.isChecked(id); },
		set checked(v) { source.setChecked(id, v); },
		addClass(...c) { el.classList.add(...c); },
		removeClass(...c) { el.classList.remove(...c); },
		hasClass(c) { return el.classList.contains(c); },
	};
}

/**
 * @template {object} T
 * @param {import('./index.mjs').default} source 
 * @param {object[]} rows 
 * @param {(id?: string | number) => void} setHover 
 * @param {Map<string | number | symbol, import('../types/Row.mjs').Row>} oldMap 
 * @param {import('../types/index.mjs').IdKey<T>} [idKey] 
 * @param {import('../types/index.mjs').Key<string | number, T>} [parentKey] 
 * @returns {[import('../types/Row.mjs').Row[], Map<string | number | symbol, import('../types/Row.mjs').Row>]}
 */
export default function setValue(source, rows, setHover, oldMap, idKey, parentKey) {
	const infoList = toTree(unique(rows, createIdKey(idKey), createKey(parentKey)));
	/** @type {import('../types/Row.mjs').Row[]} */
	const list = [];
	/** @type {Map<string | number | symbol, import('../types/Row.mjs').Row>} */
	const map = new Map();

	/** @type {Set<import('../types/Row.mjs').Row>} */
	const updatedRow = new Set();
	/** @type {(string | number)[]} */
	const ancestorIds = [];
	/** @type {import('../types/Row.mjs').Row[]} */
	const ancestors = [];
	let index = 0;
	for (const [id, data, parentId] of infoList) {
		let row = map.get(id);
		if (row) {
			row.value.data = data;
			continue;
		}
		row = oldMap.get(id);
		const level = parentId === undefined ? 0 : ancestorIds.lastIndexOf(parentId) + 1;
		ancestorIds.length = level;
		ancestors.length = level;
		if (row) {
			oldMap.delete(id);
			updatedRow.add(row);
			row.index = index;
			row.parentId = level ? parentId : undefined;
			row.value = { id, data, parentId, level, children: [] };
			row.descendants = [];
			row.children = [];
		} else {

			const emit = source.emitRow.bind(null, id);
			const listen = source.listenRow.bind(null, id);
			row = {
				index, parentId,
				emit,
				listen,
				value: { id, data, parentId: level ? parentId : undefined, level, children: [] },
				id,
				descendants: [],
				children: [],
				createProxy() {
					const el = createRowEl(() => source.toggleSelected(this.id));
					el.addEventListener('pointerenter', () => { setHover(id); });
					el.addEventListener('pointerleave', () => { setHover(); });
					/** @type {import('../types/Row.mjs').RowDataProxy} */
					const elProxy = {
						el, index: this.index, row: this, cells: new Map(), shown: [],
						api: createRowApi(source, id, el, listen, emit),
					};
					return elProxy;
				},
			};
		}
		index++;
		const last = ancestors[ancestors.length - 1];
		if (last) {
			last.value.children.push(row.value);
			last.children.push(row);
		}
		for (const a of ancestors) {
			a.descendants.push(row);
		}
		ancestors.push(row);
		ancestorIds.push(id);
		map.set(id, row);
		list.push(row);
	}
	for (const row of updatedRow) {
		const { value, elMap } = row;
		if (!elMap) { continue; }
		for (const cell of [...elMap.values()].flatMap(e => [...e.cells.values()])) {
			if (!cell) { continue; }
			cell.update(value);
		}
	}
	for (const row of oldMap.values()) {
		const { elMap } = row;
		if (!elMap) { continue; }
		for (const cell of [...elMap.values()].flatMap(e => [...e.cells.values()])) {
			if (!cell) { continue; }
			cell.destroy();
		}
	}
	return [list, map];
}
