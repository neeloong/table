/** @import { Dot } from './types.mjs' */

import date2n from './date2n.mjs';

/**
 * 
 * @param {false | SVGElement | HTMLElement | string} [icon] 
 * @returns {HTMLElement | SVGSVGElement | undefined}
 */
function getIcon(icon) {
	if (!icon) { return; }
	if (typeof icon === 'string') {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('fill', 'currentColor');
		path.setAttribute('d', icon);
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '1em');
		svg.setAttribute('height', '1em');
		svg.setAttribute('viewBox', '0 0 20 20');
		svg.appendChild(path);
		return svg;
	}
	if (icon instanceof SVGElement) {
		if (icon instanceof SVGSVGElement) {
			const svg = /** @type {SVGSVGElement} */(icon.cloneNode(true));
			svg.setAttribute('width', '1em');
			svg.setAttribute('height', '1em');
			return svg;
		}
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.appendChild(icon.cloneNode(true));
		svg.setAttribute('width', '1em');
		svg.setAttribute('height', '1em');
		return svg;
	}
	if (icon instanceof HTMLElement) {
		return /** @type {HTMLElement} */(icon.cloneNode(true));
	}
}
/**
 * 
 * @param {any} data 
 * @param {(Date | null)[]} allDates 
 * @param {Dot} dot 
 * @param {number} index 
 * @param {number} todayN 
 * @param {string} prefix 
 * @returns 
 */
export default function renderDot(data, allDates, { color, icon }, index, todayN, prefix) {

	const date = allDates[index];
	if (!date) { return; }

	const el = getIcon(typeof icon === 'function' ? icon(data, index, allDates) : icon);
	if (!el) { return; }
	// 计算开始位置及总长度

	const startN = date2n(date);
	const begin = startN - todayN;

	el.classList.add('neeloong-table-gantt-dot');
	el.style.setProperty('--neeloong-table-gantt-dot-begin', `${begin}`);
	el.style.setProperty('--neeloong-table-gantt-dot-position', `var(${prefix}-dot-position-${index})`);
	el.style.setProperty('--neeloong-table-gantt-dot-size', `var(${prefix}-dot-size-${index})`);

	const c = typeof color === 'function' ? color(data, index, allDates) : color;
	if (c) { el.style.color = c; }
	return el;
}
