/**
 * 
 * @param {number[]} bgGroup 
 * @param {number} dayWidth 
 * @returns {string}
 */
export default function getBg(bgGroup, dayWidth) {
	if (!bgGroup.length) {
		/** @type {string[]} */
		const colors = [];
		if (dayWidth >= 10) {
			colors.push(
				`transparent`, `transparent ${dayWidth - 1}px`,
				`#E7E7E7 ${dayWidth - 1}px`, `#E7E7E7 ${dayWidth}px`
			);
		} else {
			colors.push(
				`transparent`, `transparent ${dayWidth}px`,
				`#E7E7E7 ${dayWidth}px`, `#E7E7E7 ${dayWidth * 2}px`
			);
		}
		return `repeating-linear-gradient(to right,${colors.join(',')})`;
	}
	let [min] = bgGroup;
	for (const v of bgGroup) { if (v < min) { min = v; } }
	let begin = 0;
	/** @type {string[]} */
	const colors = [];
	if (min * dayWidth >= 10) {
		for (const v of bgGroup) {
			const t = v * dayWidth;
			colors.push(`<rect x="${begin + t - 1}" fill="#ddd" width="1" height="100" />`);
			begin += t;
		}
	} else {
		let isTransparent = true;
		for (const v of bgGroup) {
			const t = v * dayWidth;
			if (!isTransparent) {
				colors.push(`<rect x="${begin}" fill="#ddd" width="${t}" height="100" />`);
			}
			begin += t;
			isTransparent = !isTransparent;
		}
	}
	colors.unshift(`<svg viewBox="0 0 ${begin} 100" xmlns="http://www.w3.org/2000/svg">`);
	colors.push(`</svg>`);
	return `url("data:image/svg+xml;base64,${btoa(colors.join(''))}")`;


}
