/** @import { Id, RowValue } from '@neeloong/table' */

/**
 * 
 * @param {any} data 
 * @param {[string, (v: any) => Date | undefined][]} dateFields 
 * @returns {Record<string, Date | undefined>}
 */
export function getDate(data, dateFields) {
	return Object.fromEntries(dateFields.map(([s, v]) => [s, v(data)]));
}

/**
 * 
 * @param {readonly RowValue[]} allData 
 * @param {[string, (v: any) => Date | undefined][]} dateFields 
 * @returns {Map<Id, Record<string, Date | undefined>>}
 */
export default function getDateData(
	allData,
	dateFields,
) {
	/** @type {Map<Id, Record<string, Date | undefined>>} */
	const allLineData = new Map();

	for (const { id, data } of allData) {
		allLineData.set(id, getDate(data, dateFields));
	}
	return allLineData;
}
