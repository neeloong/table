/**
 * 
 * @param {number} rowHeight 
 * @param {number} start 
 * @param {number} end 
 * @param {number} max 
 * @returns {[number, number]?}
 */
export default function findRow(rowHeight, start, end, max) {
	const sIndex = Math.max(0, Math.floor(start / rowHeight));
	const eIndex = Math.min(max, Math.ceil(end / rowHeight));
	if (sIndex > eIndex) { return null; }
	return [sIndex, eIndex];
}
