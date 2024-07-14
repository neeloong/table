import { defaultWidth } from '../defaultConfig.mjs';
import noop from '../utils/noop.mjs';

import createColumnFn from './createColumnFn.mjs';

/**
 * 
 * @param {import('../types/index.mjs').Api} api 
 * @param {import('../types/index.mjs').ColumnOptions} options 
 * @param {import('../types/index.mjs').Extension[]} exFns 
 * @param {Record<string, any>} exOptions 
 * @param {() => void} requestRender 
 * @returns 
 */
export default function createColumn(api, options, exFns, exOptions, requestRender) {
	const [fn, updateExtensions, destroyExt] = createColumnFn(options, exFns, exOptions, api);

	/** @type {import('../types/index.mjs').ColumnUpdatable} */
	const columnValue = {
		width: 0, hidden: false,
		resizable: false,
		minWidth: 0,
		maxWidth: Infinity,
	};
	const col = fn(({ width, minWidth, maxWidth, resizable, hidden }) => {
		if (width) {
			columnValue.width = Math.max(width, 1);
			requestRender();
		}
		if (typeof hidden === 'boolean') {
			columnValue.hidden = hidden;
			requestRender();
		}
		if (typeof minWidth === 'number' && Number.isFinite(minWidth) && minWidth > 0) {
			columnValue.minWidth = minWidth;
		}
		if (typeof maxWidth === 'number' && !Number.isNaN(minWidth) && maxWidth > 0) {
			columnValue.maxWidth = maxWidth;
		}
		if (typeof resizable === 'boolean') {
			columnValue.resizable = resizable;
			requestRender();
		}
	});

	const { updateData, header, width, render, customize, field } = col;
	let {title} = col;
	const { meta, resizable, minWidth, maxWidth, spillable, hidden } = col;
	if (!columnValue.width) { columnValue.width = Math.max(1, width || defaultWidth); }
	if (typeof hidden === 'boolean') { columnValue.hidden = hidden; }
	if (typeof resizable === 'boolean') { columnValue.resizable = resizable; }
	if (minWidth) { columnValue.minWidth = minWidth; }
	if (maxWidth) { columnValue.maxWidth = maxWidth; }

	const {key} = options;
	/** @type {import('../types/index.mjs').ColumnInfo} */
	const info = {
		get key() { return key; },
		get meta() { return meta; },
		get field() { return field; },

		get title() { return title; },
		get width() { return columnValue.width; },
		get minWidth() { return columnValue.minWidth; },
		get maxWidth() { return columnValue.maxWidth; },
		get resizable() { return columnValue.resizable; },
		get hidden() { return columnValue.hidden; },

	};
	/** @type {import('../types/index.mjs').ColumnCell} */
	const column = {
		fixed: false,
		options: options,
		key,
		extensions: exFns,
		start: 0,
		end: 0,
		updateData: updateData || noop,
		update(opt, extensions) {
			const t = opt.title;
			title = typeof t === 'string' ? title : '';
			updateExtensions(extensions, opt);
		},
		destroy() {
			destroyExt();
		},
		get width() { return columnValue.width; },
		set width(v) { columnValue.width =v; },
		get minWidth() { return columnValue.minWidth; },
		get maxWidth() { return columnValue.maxWidth; },
		get resizable() { return columnValue.resizable; },
		get hidden() { return columnValue.hidden; },
		title,
		render: (p, rowApi) => render({...p, rowApi, api, column: info, meta}),
		header: p => header(p),
		customize: p => customize(p),
		field,
		meta,
		spillable,
	};
	return column;
}
