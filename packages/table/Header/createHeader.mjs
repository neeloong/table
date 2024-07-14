import { verticalWritingMode } from '../verticalWritingMode.mjs';

import pointerCapture from './pointerCapture.mjs';

/**
 * @typedef {object} ColumnState
 * @property {boolean} fixed
 * @property {boolean} hidden
 * @property {boolean} resizable
 * @property {number} [start]
 * @property {number} [end]
 * @property {number} [width]
 */
/**
 * 
 * @param {() => void} requestRender 
 * @param {HTMLElement} header 
 * @param {import('../types/index.mjs').ColumnCell} column 
 * @returns {[import('../types/index.mjs').ColumnComponent, HTMLElement, ColumnState]}
 */
export default function createHeader(requestRender, header, column) {
	const resize = document.createElement('div');
	resize.classList.add('neeloong-table-resize');
	const headerComponent = column.header({ column: column.options });
	const el = headerComponent.root;
	el.classList.add('neeloong-table-header');
	const [begin, move, end] = pointerCapture(
		e => {
			const style = getComputedStyle(resize);
			const writingMode = style.writingMode?.toLowerCase();
			const vertical = verticalWritingMode.has(writingMode);
			const rtl = style.direction.toLowerCase() === 'rtl';
			const secDir = rtl === (writingMode === 'sideways-lr') ? 1 : -1;
			return secDir * (vertical ? e.offsetY : e.offsetX);
		},
		(e, o) => {
			if (!column.resizable) { return; }
			const rect = header.getBoundingClientRect();
			const style = getComputedStyle(resize);
			const writingMode = style.writingMode?.toLowerCase();
			const vertical = verticalWritingMode.has(writingMode);
			const begin = vertical ? rect.y : rect.x;
			const size = vertical ? rect.height : rect.width;
			const client = vertical ? e.clientY : e.clientX;
			const rtl = style.direction.toLowerCase() === 'rtl';
			const secDir = rtl !== (writingMode === 'sideways-lr');
			const offset = secDir ? begin + size - (client + o) : (client - o) - begin;
			column.width = Math.max(
				1,
				column.minWidth || 0,
				Math.min(offset - column.start, column.maxWidth || Infinity),
			);
			requestRender();
		});
	resize.addEventListener('pointerdown', e => {
		if (!column.resizable) { return; }
		begin(e);
	});
	resize.addEventListener('pointermove', move);
	resize.addEventListener('pointercancel', end);
	resize.addEventListener('pointerup', end);
	return [headerComponent, resize, { fixed: false, hidden: false, resizable: false }];
}
