/** @import { Key } from '@neeloong/table' */
/** @import { DateGetter, DateKey } from './types.mjs' */
const regex = /^(?<Y>\d+)-(?<M>\d{1,2})-(?<D>\d{1,2})(?:(?: +|[Tt])(?<h>[0-1]?\d|2[0-3])(?::(?<m>[0-5]?\d)(?::(?<s>[0-5]?\d)(?:.(?:(?<ms>\d+))?)?)?)?(?<z>z|Z|[+-]\d{1,2}:\d{1,2}|[+-]\d{2}(:?\d{2})?)?)?$/;
/**
 * 
 * @param {string | Date | null} [v] 
 * @returns 
 */
function parse(v) {
	if (!v) { return; }
	if (v instanceof Date) { return Number(v) ? v : undefined; }
	if (typeof v !== 'string') { return; }
	const r = regex.exec(v)?.groups;
	if (!r) { return; }
	const Y = parseInt(r.Y);
	const M = parseInt(r.M) - 1;
	const D = parseInt(r.D);
	if (!r.h) {
		const date = new Date(Y, M, D, 23, 59, 59, 999);
		return Number(date) ? date : undefined;
	}
	const h = parseInt(r.h || '23');
	const m = parseInt(r.m || '59');
	const s = parseInt(r.s || '59');
	const ms = parseFloat(`0.${r.ms || '999'}`) * 1000;
	const date = new Date(Y, M, D, h, m, s, ms);
	const z = r.z;
	if (!z) { return Number(date) ? date : undefined; }
	let t = Number(date);
	t -= date.getTimezoneOffset() * 60000;
	if (z.includes(':')) {
		const [h, m] = z.split(':');
		const offset = parseInt(h) * 60 + parseInt(m);
		t -= offset * 60000;
	} else if (z !== 'z' && z !== 'Z') {
		const h = z.slice(0, 3);
		const m = z.slice(3) || '0';
		const offset = parseInt(h) * 60 + parseInt(m);
		t -= offset * 60000;
	}
	return t ? new Date(t) : undefined;

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
