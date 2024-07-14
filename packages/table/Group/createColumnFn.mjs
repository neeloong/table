import noop from '../utils/noop.mjs';
/**
 * 
 * @param {import('../types/index.mjs').ColumnParam} param 
 * @returns {import('../types/index.mjs').ColumnComponent}
 */
const defaultHeaderRenderer = ({ column: { title = '' } }) => {
	const root = document.createElement('div');

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
 * @param {import('../types/index.mjs').CellParam} param 
 * @returns {import('../types/index.mjs').CellComponent}
 */
const defaultRenderer = ({ value }) => {
	const root = document.createElement('div');

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
	 * @param {import('../types/index.mjs').CellUpdate} row 
	 * @returns 
	 */
	const update = (row) => setValue(row.value);

	return { root, destroy() { }, setHidden() { }, update };
};

const noopRender = () => ({
	root: document.createElement('div'),
	destroy: noop,
	setHidden: noop,
	update: noop,
});
/** @returns {import('../types/index.mjs').ColumnDefine} */
const createNoop = () => ({ updateData: noop, render: noopRender, header: noopRender, customize: noop });
/**
 * 
 * @param {import('../types/index.mjs').ColumnOptions} column 
 * @param {import('../types/index.mjs').Extension[]} exFns 
 * @param {Record<string, any>} exOptions 
 * @param {import('../types/index.mjs').Api} api 
 * @returns {[import('../types/index.mjs').NextColumn, (allOptions: Record<string, any>[], opt: import('../types/index.mjs').ColumnOptions) => void, () => void]}
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
	/** @type {((options: Record<string, any>, columnOptions: import('../types/index.mjs').ColumnOptions) => void)[]} */
	const rootUpdates = [];
	/** @type {import('../types/index.mjs').NextColumn} */
	let fn = u => {
		if (destroyed) { return createNoop(); }
		rootUpdates.push((_, v) => u(v));
		return ({ ...column, render, header, updateData:noop, customize: noop });
	};
	/** @type {((options: Record<string, any>, columnOptions: import('../types/index.mjs').ColumnOptions) => void)[][]} */
	const updates = [];
	updates[exFns.length] = rootUpdates;
	/** @type {(() => void)[]} */
	const destroys = [];
	for (let i = exFns.length - 1; i >= 0; i--) {
		/** @type {((options: Record<string, any>, columnOptions: import('../types/index.mjs').ColumnOptions) => void)[]} */
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
			return /** @type {import('../types/index.mjs').ColumnDefine} */({ ...r,
				updateData: typeof updateData === 'function' ? updateData : noop,
				customize: typeof customize === 'function' ? customize : noop,
			});
		};
	}
	/**
	 * 
	 * @param {Record<string, any>[]} allOptions 
	 * @param {import('../types/index.mjs').ColumnOptions} opt 
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
