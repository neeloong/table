/**
 * 
 * @param {unknown[]} a 
 * @param {unknown[]} b 
 * @returns 
 */
export function isEq(a, b) {
	const { length } = a;
	if (length !== b.length) { return false; }
	for (let i = 0; i < length; i++) {
		if (a[i] === b[i]) { continue; }
		return false;
	}
	return true;
}
