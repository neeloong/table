/** @import { GanttHeader } from './types.mjs' */

import date2n from './date2n.mjs';
import n2date from './n2date.mjs';

/**
 * 
 * @param {GanttHeader[]} gets 
 * @param {HTMLElement[]} headers 
 * @param {Date} start 
 * @param {Date} end 
 */
export default function renderHeaders(gets, headers, start, end) {

	/**
	 * @typedef {object} Item
	 * @property {HTMLElement[]} roots
	 * @property {string | number} key
	 * @property {number} length
	 * @property {Date} [date]
	 * @property {GanttHeader} get
	 */
	for (const el of headers) {
		el.innerHTML = '';

	}
	/** @type {Item[]} */
	const list = gets.map(get => ({
		roots: headers.map(header => header.appendChild(document.createElement('div'))),
		key: '',
		length: 0,
		get,
	}));

	/**
	 * 
	 * @param {Item} it 
	 * @returns 
	 */
	function add(it) {
		const { length } = it;
		if (!length) { return; }
		const { date } = it;
		const text = date ? it.get(date, 'text') : '';
		const title = date ? it.get(date, 'title') : '';
		for (const root of it.roots) {
			const el = root.appendChild(document.createElement('span'));
			el.style.setProperty('--neeloong-table-gantt-header-size', `${length}`);
			el.appendChild(document.createTextNode(`${text}`));
			if (title) { el.title = `${title}`; }
		}
	}
	const s = Math.floor(date2n(start));
	const e = Math.floor(date2n(end));
	for (let d = s; d <= e; d++) {
		const date = n2date(d);
		for (const it of list) {
			const newKey = it.get(date);
			if (newKey !== it.key && it.length) {
				add(it);
				it.length = 0;
			}
			it.date = date;
			it.key = newKey;
			it.length++;
		}
	}
	for (const it of list) {
		if (!it.length) { continue; }
		add(it);
	}

}
