/**
 * @template {object} [T=object]
 * @param {import('./types/index.mjs').IdKey<T>} [idKey] 
 * @returns {(v: any) => string | number}
 */
export function createIdKey(idKey) {
	if (typeof idKey === 'function') {
		return idKey;
	}
	if (typeof idKey === 'string' && idKey) {
		return v => v[idKey];
	}
	return v => v.id;
}

/**
 * @template R
 * @template {object} [T=object]
 * @param {import('./types/index.mjs').Key<R, T>} [key] 
 * @returns {(v: any) => R | undefined}
 */
export default function createKey(key) {
	if (typeof key === 'function') {
		return key;
	}
	if (typeof key === 'string' && key) {
		return v => v[key];
	}
	return () => undefined;
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
 * @param {import('./types/index.mjs').Key<Date | string | undefined, T>} [key] 
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
