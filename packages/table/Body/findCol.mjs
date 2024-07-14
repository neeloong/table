/**
 * 
 * @param {number[]} separate 
 * @param {number} start 
 * @param {number} end 
 * @returns {[number, number]?}
 */
export default function findCol(separate, start, end) {
	if (start >= end) { return null; }
	const startIndex = separate.findIndex(v => v > start);
	if (startIndex < 0) { return null; }
	const sIndex = Math.max(startIndex - 1, 0);
	const endIndex = separate.findIndex(v => v > end, startIndex);
	const eIndex = endIndex < 0 ? separate.length - 2 : Math.max(endIndex - 1, 0);
	if (sIndex > eIndex) { return null; }
	return [sIndex, eIndex];
}
