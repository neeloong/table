/**
 * @overload
 * @param {(Date | undefined | null)[]} list 
 * @param {boolean} end 
 * @param {Date} def 
 * @returns {Date}
 */
/**
 * @overload
 * @param {(Date | undefined | null)[]} list 
 * @param {boolean} [end] 
 * @param {Date?} [def] 
 * @returns {Date?}
 */
/**
 * 
 * @param {(Date | undefined | null)[]} list 
 * @param {boolean} [end] 
 * @param {Date?} [def] 
 * @returns {Date?}
 */
function getDate(list, end, def = null) {
	/** @type {Date[]} */
	const dates = list.filter(/** @type {any} */(Boolean));
	if (!dates.length) { return def; }
	if (end) { return new Date(Math.max(.../** @type {any} */(dates))); }
	return new Date(Math.min(.../** @type {any} */(dates)));
}
export default getDate;
