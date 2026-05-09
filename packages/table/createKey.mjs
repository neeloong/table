/** @import { Id, IdKey, Key } from './types/index.mjs' */

/**
 * 
 * @param {string | symbol | (string | symbol)[]} [key] 
 * @returns {((v: any) => any)?}
 */
function createBaseKey(key) {
	if (!key) { return null; }
	const keys = [key].flat()
		.filter(v => typeof v === 'symbol' || typeof v === 'string' && v);
	if (!keys.length) { return null; }
	return v => {
		for (const k of keys) {
			if (!v || typeof v !== 'object') { return; }
			v = v[k];
		}
		return v;
	};
}
/**
 * 
 * @param {any} [data] 
 * @param {string | symbol | (string | symbol)[]} [key] 
 * @returns {any}
 */
export function getKey(data, key) {
	if (!key) { return undefined; }
	const keys = [key].flat()
		.filter(v => typeof v === 'symbol' || typeof v === 'string' && v);
	if (!keys.length) { return undefined; }
	let v = data;
	for (const k of keys) {
		if (!v || typeof v !== 'object') { return; }
		v = v[k];
	}
	return v;
}

/**
 * @template {object} [T=object]
 * @param {IdKey<T>} [idKey] 
 * @returns {(v: any) => Id}
 */
export function createIdKey(idKey) {
	if (typeof idKey === 'function') {
		return idKey;
	}
	return createBaseKey(idKey) || (v => v.id);
}


/**
 * @template R
 * @template {object} [T=object]
 * @param {Key<R, T>} [key] 
 * @returns {(v: any) => R | undefined}
 */
export default function createKey(key) {
	if (typeof key === 'function') {
		return key;
	}
	return createBaseKey(key) || (() => undefined);
}
/**
 * 
 * @param {string | Date | undefined} date 
 * @returns 
 */
function toDate(date) {
	if (!date) { return undefined; }
	if (!(date instanceof Date)) {
		const d = new Date(Date.parse(date));
		date = new Date(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds(),
			d.getUTCMilliseconds()
		);
	}
	return Number(date) ? date : undefined;
}
/**
 * 
 * @template {object} [T=object]
 * @param {Key<Date | string | undefined, T>} [key] 
 * @returns {(v: any) => Date | undefined}
 */
export function createDateKey(key) {
	if (typeof key === 'function') {
		return v => toDate(key(v));
	}
	if (typeof key === 'string' && key) {
		return v => toDate(v[key]);
	}
	return v => undefined;
}
