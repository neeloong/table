/** @import { Cell } from '../types/Row.mjs' */
/** @import { ColumnCell, RowValue, Listener, RowApi } from '../types/index.mjs' */

import noop from '../utils/noop.mjs';

/**
 * 
 * @param {RowApi} rowApi 
 * @param {RowValue} row 
 * @param {ColumnCell} column 
 * @param {number} index 
 * @param {() => void} destroy 
 * @returns {Cell}
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
		 * @param {Listener<any>} fn 
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
