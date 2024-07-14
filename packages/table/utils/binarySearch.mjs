/**
 * 
 * @param {number} target 
 * @param {number[]} list 
 * @param {number} start 
 * @param {number} end 
 * @returns {number}
 */
export default function binarySearch(target, list, start, end) {
	if (target < list[start]) { return start; }
	if (target > list[end]) { return end + 1; }
	const index = Math.floor((start + end) / 2);
	const value = list[index];
	if (value === target) { return index; }
	if (index === start) { return end; }
	if (value < target) {
		if (index + 1 >= end) { return index + 1; }
		return binarySearch(target, list, index + 1, end);
	}
	if (index - 1 < start) { return index; }
	return binarySearch(target, list, start, index - 1);
}
