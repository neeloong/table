/** @import { GanttHeader } from './types.mjs' */

import date2n from './date2n.mjs';
import n2date from './n2date.mjs';

/**
 * 
 * @param {GanttHeader} get 
 * @param {Date} start 
 * @param {Date} end 
 * @returns 
 */
export default function getBgGroup(get, start, end) {
	let key = '';
	let length = 0;
	/** @type {number[]} */
	let widths = [];
	const s = Math.floor(date2n(start));
	const e = Math.floor(date2n(end));
	for (let d = s; d <= e; d++) {
		const date = n2date(d);
		const newKey = get(date);
		if (newKey !== key && length) {
			widths.push(length);
			length = 0;
		}
		key = newKey;
		length++;
	}
	if (length) { widths.push(length); }
	return widths;

}
