/** @import { DateGetter, Line, LineMeta } from './types.mjs' */

/**
 * @typedef {Line & {	start: DateGetter; end: DateGetter; }} LineInfo
 */
/**
 * 
 * @param {any} data 
 * @param {Record<string, Date | undefined>} dateDate 
 * @param {Record<string, Date | undefined>} endDateDate 
 * @param {LineInfo[]} lines 
 * @returns 
 */
export default function getLineDates(data, dateDate, endDateDate, lines) {
	/** @type {([Date, Date | null, LineMeta?] | null)[]} */
	const dates = lines.map(({ start, end, meta }) => {
		let s = start(data, dateDate, endDateDate);
		if (!s) { return null; }
		return [s, end(data, dateDate, endDateDate) || null, meta];
	});
	return dates;

}
