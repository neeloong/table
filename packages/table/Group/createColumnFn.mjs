/** @import { Api, CellComponent, CellParam, CellUpdate, ColumnDefine, ColumnComponent, ColumnOptions, ColumnParam, Extension, NextColumn } from '../types/index.mjs' */

import noop from '../utils/noop.mjs';
/**
 * 
 * @param {ColumnParam} param 
 * @returns {ColumnComponent}
 */
const defaultHeaderRenderer = ({ column: { title = '' } }) => {
	const root = document.createElement('th');

	root.innerText = title;
	return {
		root,
		destroy() { },
		update(c) {
			root.innerText = c.title || '';
		},
	};
};
/**
 * 
 * @param {CellParam} param 
 * @returns {CellComponent}
 */
const defaultRenderer = ({ value }) => {
	const root = document.createElement('td');

	/**
	 * 
	 * @param {any} v 
	 */
	function setValue(v) {
		root.innerText = v === undefined || v === null ? '' : v;
	}
	setValue(value);
	/**
	 * 
	 * @param {CellUpdate} row 
	 * @returns 
	 */
	const update = (row) => setValue(row.value);

	return { root, destroy() { }, setHidden() { }, update };
};

const noopRender = () => ({
	root: document.createElement('td'),
	destroy: noop,
	setHidden: noop,
	update: noop,
});
/** @returns {ColumnDefine} */
const createNoop = () => ({ updateData: noop, render: noopRender, header: noopRender, customize: noop });
/**
 * 
 * @param {ColumnOptions} column 
 * @param {Extension[]} exFns 
 * @param {Record<string, any>} exOptions 
 * @param {Api} api 
 * @returns {[NextColumn, (allOptions: Record<string, any>[], opt: ColumnOptions) => void, () => void]}
 */
export default function createColumnFn(
	column,
	exFns,
	exOptions,
	api,
) {
	const render = typeof column.render === 'function' ? column.render : defaultRenderer;
	const header = typeof column.header === 'function' ? column.header : defaultHeaderRenderer;

	let destroyed = false;
	/** @type {((options: Record<string, any>, columnOptions: ColumnOptions) => void)[]} */
	const rootUpdates = [];
	/** @type {NextColumn} */
	let fn = u => {
		if (destroyed) { return createNoop(); }
		rootUpdates.push((_, v) => u(v));
		return ({ ...column, render, header, updateData:noop, customize: noop });
	};
	/** @type {((options: Record<string, any>, columnOptions: ColumnOptions) => void)[][]} */
	const updates = [];
	updates[exFns.length] = rootUpdates;
	/** @type {(() => void)[]} */
	const destroys = [];
	for (let i = exFns.length - 1; i >= 0; i--) {
		/** @type {((options: Record<string, any>, columnOptions: ColumnOptions) => void)[]} */
		const update = [];
		updates[i] = update;
		const exFn = exFns[i];
		const f = fn;
		fn = u => {
			if (destroyed) { return createNoop(); }
			const { updateData, updateOptions, destroy, customize, ...r } = exFn(exOptions[i] || {}, u, api, f, column);
			if (typeof updateOptions === 'function') {
				update.push(updateOptions);
			}
			if (typeof destroy === 'function') {
				destroys.push(destroy);
			}
			return /** @type {ColumnDefine} */({ ...r,
				updateData: typeof updateData === 'function' ? updateData : noop,
				customize: typeof customize === 'function' ? customize : noop,
			});
		};
	}
	/**
	 * 
	 * @param {Record<string, any>[]} allOptions 
	 * @param {ColumnOptions} opt 
	 * @returns 
	 */
	function updateExtensions(allOptions, opt) {
		if (destroyed) { return; }
		exOptions = allOptions;
		const allUpdates = updates.map(v => [...v]);
		for (let i = 0; i < allUpdates.length; i++) {
			const o = exOptions[i] || {};
			for (const update of allUpdates[i]) {
				update(o, opt);
			}
		}
	}
	function destroy() {
		if (destroyed) { return; }
		destroyed = true;
		for (const destroy of destroys) {
			destroy();
		}
	}
	return [fn, updateExtensions, destroy];
}
