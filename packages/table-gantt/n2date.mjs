/**
 * 
 * @param {number} n 
 * @returns 
 */
export default function n2date(n) {
	const date = new Date(n * 24 * 60 * 60 * 1000);
	return new Date(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
		date.getUTCMilliseconds()
	);

}
