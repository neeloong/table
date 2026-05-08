/** @import { ColumnCell } from '../types/index.mjs' */

/**
 * 
 * @param {ColumnCell[]} columns 
 * @param {number} startFixed 
 * @returns 
 */
export default function updateColumn(columns, startFixed) {
	let start = 0;
	let separate = [start];
	let i = 0;
	for (const c of columns) {
		const { width, hidden } = c;
		const fixed = i < startFixed;
		c.fixed = fixed;
		i++;
		c.start = start;
		if (!hidden) {
			start += width;
		}
		c.end = start;
		separate.push(start);
	}
	return separate;
}
