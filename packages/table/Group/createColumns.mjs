import getExtensionList from './getExtensionList.mjs';
import createColumn from './createColumn.mjs';

/**
 * 
 * @param {() => void} requestRender 
 * @param {import('../types/index.mjs').Api} api 
 * @param {import('../types/index.mjs').ColumnCell[]} oldColumns 
 * @param {readonly import('../types/index.mjs').RowValue[]} data 
 * @param {import('../types/index.mjs').ColumnOptions[]} [columns] 
 * @returns 
 */
export default function createColumns(
	requestRender,
	api,
	oldColumns,
	data,
	columns = [],
) {
	/** @type {import('../types/index.mjs').ColumnCell[]} */
	const list = [];

	for (const c of columns) {
		const extensions = getExtensionList(c.extensions);
		const exFns = extensions.map(v => v[0]);
		const exOptions = extensions.map(v => v[1]);
		const {field} = c;
		const {meta} = c;
		const key = c.key || field;
		const {length} = exFns;
		const index = oldColumns.findIndex(c => {
			if (c.meta !== meta) { return; }
			if (c.field !== field) { return; }
			if (c.key !== key) { return; }
			const {extensions} = c;
			if (c.extensions.length !== exFns.length) { return; }
			for (let i = 0; i < length; i++) {
				if (extensions[i] !== exFns[i]) { return; }
			}
			return true;
		});
		const col = index < 0
			? createColumn(api, c, exFns, exOptions, requestRender)
			: oldColumns.splice(index, 1)[0];
		list.push(col);
		if (index >= 0) {
			col.update(c, exOptions);
		} else {
			col.updateData(data);
		}


	}
	for (const c of oldColumns) {
		c.destroy();
	}
	return list;
}
