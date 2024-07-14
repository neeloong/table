import getDate from './getDate.mjs';
import getLineDates from './getLineDates.mjs';

/**
 * 
 * @param {any} data 
 * @param {Record<string, Date | undefined>} dateDate 
 * @param {Record<string, Date | undefined>} endDateData 
 * @param {import('./getLineDates.mjs').LineInfo[]} lines 
 * @param {WeakMap<any, [([Date, Date | null, import('./types.mjs').LineMeta?] | null)[], Date, Date]>} dateMap 
 * @returns {[([Date, Date | null, import('./types.mjs').LineMeta?] | null)[], Date, Date]}
 */
function toLineData(
	data,
	dateDate,
	endDateData,
	lines,
	dateMap,
) {
	const val = dateMap.get(data);
	if (val) { return val; }
	const dates = getLineDates(data, dateDate, endDateData, lines);
	let startDate = new Date();
	let endDate = new Date();
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);
	for (const date of dates) {
		if (!date) { continue; }
		const [s, e] = date;
		if (startDate > s) { startDate = s; }
		if (e && endDate < e) { endDate = e; }
	}
	dateMap.set(data, [dates, startDate, endDate]);
	return [dates, startDate, endDate];
}
/**
 * 
 * @param {readonly import('@neeloong/table').RowValue[]} allData 
 * @param {Map<string | number, Record<string, Date | undefined>>} allDateData 
 * @param {Map<string | number, Record<string, Date | undefined>>} allEndDateData 
 * @param {import('./getLineDates.mjs').LineInfo[]} lines 
 * @param {(v: any) => boolean | undefined} summarize 
 * @param {Date} todayStart 
 * @param {Date} todayEnd 
 * @returns {[Date, Date, Map<number | string, ([Date, Date | null, import('./types.mjs').LineMeta?] | null)[]>]}
 */
export default function getLineData(
	allData,
	allDateData,
	allEndDateData,
	lines,
	summarize,
	todayStart,
	todayEnd,
) {
	let lineStartDate = todayStart;
	let lineEndDate = todayEnd;
	/** @type {Map<number | string, ([Date, Date | null, import('./types.mjs').LineMeta?] | null)[]>} */
	const allLineData = new Map();
	/** @type {WeakMap<any, [([Date, Date | null, import('./types.mjs').LineMeta?] | null)[], Date, Date]>} */
	const baseDates = new WeakMap();

	/**
	 * 
	 * @param {import('@neeloong/table').RowValue} v 
	 * @returns 
	 */
	function getShownDate(v) {
		const { id, data } = v;
		const val = allLineData.get(id);
		if (val) { return val; }

		const [dates, start, end] = toLineData(
			data,
			allDateData.get(id) || {},
			allEndDateData.get(id) || {},
			lines,
			baseDates,
		);
		allLineData.set(id, dates);
		if (lineStartDate > start) { lineStartDate = start; }
		if (lineEndDate < end) { lineEndDate = end; }
		const children = summarize(data)
			&& v.children.map(v => getShownDate(v)) || [];
		if (!children.length) { return dates; }
		/** @type {typeof dates} */
		const shown = lines.map(({ meta }, i) => {
			const s = getDate(children.map(v => v[i]?.[0]));
			if (!s) { return null; }
			return [s, getDate(children.map(v => v[i]?.[1]), true), meta];
		});
		allLineData.set(id, shown);
		return shown;
	}
	for (const v of allData) {
		getShownDate(v);
	}
	return [lineStartDate, lineEndDate, allLineData];
}
