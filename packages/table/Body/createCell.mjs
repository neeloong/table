import noop from '../utils/noop.mjs';

/**
 * 
 * @param {import('../types/index.mjs').RowApi} rowApi 
 * @param {import('../types/index.mjs').RowValue} row 
 * @param {import('../types/index.mjs').ColumnCell} column 
 * @param {number} index 
 * @param {() => void} destroy 
 * @returns {import('../types/Row.mjs').Cell}
 */
export default function createCell(rowApi, row, column, index, destroy) {
	const { render, field } = column;
	let destroyed = false;
	/** @type {Set<() => void>} */
	const cancelSet = new Set();
	const { listen } = rowApi;

	const comp = render({
		...row, value: field ? row.data?.[field] : undefined,
	}, Object.assign(Object.create(rowApi), {
		/**
		 * 
		 * @param {string | symbol} k 
		 * @param {import('../types/index.mjs').Listener<any>} fn 
		 * @returns 
		 */
		listen: (k, fn) => {
			if (destroyed) { return noop; }
			const c = listen(/** @type {any} */(k), fn);
			const cc = () => { c(); cancelSet.delete(cc); };
			cancelSet.add(cc);
			return cc;
		},
	}));
	const el = comp.root;
	el.classList.add('neeloong-table-cell');
	return {
		el, index, column,
		destroy() {
			if (destroyed) { return; }
			destroyed = true;
			comp.destroy();
			for (const k of [...cancelSet]) {
				k();
			}
			destroy();
		},
		setHidden: comp.setHidden.bind(comp),
		update(row) {
			comp.update({ ...row, value: field ? row.data?.[field] : undefined });
		},
	};
}
