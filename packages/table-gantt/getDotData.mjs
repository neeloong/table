/**
 * @typedef {import('./types.mjs').Dot & {date: import('./types.mjs').DateGetter;}} DotInfo
 */
/**
 * 
 * @param {any} data 
 * @param {Record<string, Date | undefined>} dateDate 
 * @param {Record<string, Date | undefined>} endDateDate 
 * @param {DotInfo[]} dots 
 * @returns {(Date | null)[]}
 */
export function getDotDate(data, dateDate, endDateDate, dots) {
	return dots.map(({ date }) => date(data, dateDate, endDateDate) || null);
}
/**
 * 
 * @param {readonly import('@neeloong/table').RowValue[]} allData 
 * @param {Map<string | number, Record<string, Date | undefined>>} allDateData 
 * @param {Map<string | number, Record<string, Date | undefined>>} allEndDateData 
 * @param {DotInfo[]} dots 
 * @param {Date} todayStart 
 * @param {Date} todayEnd 
 * @returns {[Date, Date, Map<number | string, (Date | null)[]>]}
 */
export default function getDotData(
	allData,
	allDateData,
	allEndDateData,
	dots,
	todayStart,
	todayEnd,
) {
	let dotStartDate = todayStart;
	let dotEndDate = todayEnd;
	/** @type {Map<number | string, (Date | null)[]>} */
	const allDotData = new Map();
	for (const { id, data } of allData) {
		const dates = getDotDate(data, allDateData.get(id) || {}, allEndDateData.get(id) || {}, dots);
		for (const date of dates) {
			if (!date) { continue; }
			if (dotStartDate > date) { dotStartDate = date; }
			if (dotEndDate < date) { dotEndDate = date; }
		}
		allDotData.set(id, dates);
	}
	return [dotStartDate, dotEndDate, allDotData];
}
