import date2n from './date2n.mjs';
/**
 * 
 * @param {any} data 
 * @param {([Date, Date | null, (import('./types.mjs').LineMeta | undefined)?] | null)[]} allDates 
 * @param {import('./types.mjs').Line} line 
 * @param {number} index 
 * @param {number} todayN 
 * @param {string} prefix 
 * @returns {HTMLDivElement | undefined}
 */
export default function renderLine(
	data,
	allDates,
	{ color, className, title, borderColor },
	index,
	todayN,
	prefix) {

	const date = allDates[index];
	if (!date) { return; }
	const [start, end] = date;
	// 计算开始位置及总长度
	const startN = date2n(start);
	const endN = date2n(end || new Date);
	const width = endN - startN;
	const left = startN - todayN;

	const el = document.createElement('div');
	el.className = 'neeloong-table-gantt-line';
	el.style.setProperty('--neeloong-table-gantt-line-begin', `${left}`);
	el.style.setProperty('--neeloong-table-gantt-line-size', `${width}`);
	el.style.setProperty('--neeloong-table-gantt-line-position', `var(${prefix}-line-position-${index})`);
	el.style.setProperty('--neeloong-table-gantt-line-weight', `var(${prefix}-line-height-${index})`);
	if (typeof color === 'function') {
		const c = color(data, index, allDates);
		if (c) { el.style.background = c; }
	}
	if (typeof borderColor === 'function') {
		const c = borderColor(data, index, allDates);
		if (c) { el.style.borderColor = c; }
	}
	if (typeof className === 'function') {
		const v = className(data, index, allDates);
		if (v) { el.className += ` ${v}`; }
	}
	if (typeof title === 'function') {
		const v = title(data, index, allDates);
		if (v) { el.title += title; }
	}
	return el;
}
