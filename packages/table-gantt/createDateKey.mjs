/** @import { Key } from '@neeloong/table' */
/** @import { DateGetter, DateKey } from './types.mjs' */
const regex = /^(\d+)-(\d{1,2})-(\d{1,2})(?:(?: +|[Tt])([0-1]?\d|2[0-3])(?::([0-5]?\d)(?::([0-5]?\d)(?:.(?:(\d+))?)?)?)?)?$/;
/**
 * 
 * @param {string | Date | null} [v] 
 * @returns 
 */
function parse(v) {
	if (!v) { return; }
	if (v instanceof Date) { return Number(v) ? v : undefined; }
	if (typeof v !== 'string') { return; }
	const r = regex.exec(v);
	if (!r) { return; }
	const Y = parseInt(r[1]);
	const M = parseInt(r[2]) - 1;
	const D = parseInt(r[3]);
	const h = parseInt(r[4] || '23');
	const m = parseInt(r[5] || '59');
	const s = parseInt(r[6] || '59');
	const ms = parseFloat(`0.${r[7] || '999'}`) * 1000;
	const date = new Date(Y, M, D, h, m, s, ms);
	return Number(date) ? date : undefined;

}
/**
 * 
 * @param {string | Date | null | undefined} [date] 
 * @param {boolean} [end] 
 * @returns 
 */
function toDate(date, end) {
	if (!date) { return; }
	if (end && typeof date === 'string') {
		return parse(date);
	}
	if (!(date instanceof Date)) {
		const d = new Date(Date.parse(date));
		// eslint-disable-next-line no-param-reassign
		date = new Date(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds(),
			d.getUTCMilliseconds(),
		);
	}
	return Number(date) ? date : undefined;
}

/**
 * @template {object} [T=object]
 * @param {Key<Date | string | undefined, T>} [key] 
 * @param {boolean} [end] 
 * @returns {(v: any) => Date | undefined}
 */
export default function createDateKey(key, end) {
	if (typeof key === 'function') {
		return v => toDate(key(v), end);
	}
	if (typeof key === 'string' && key) {
		return v => toDate(v[key], end);
	}
	return () => undefined;
}
/**
 * 
 * @param {DateKey} [key] 
 * @param {boolean} [end] 
 * @returns {DateGetter}
 */
export function createDateGetter(key, end) {
	if (typeof key === 'function') {
		return (v, dates, endDates) => toDate(key(v, dates, endDates));
	}
	if (typeof key === 'string' && key) {
		return (v, dates, endDates) => {
			const all = end ? endDates : dates;
			return key in all ? all[key] : undefined;
		};
	}
	return () => undefined;
}
