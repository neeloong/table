/** @import { Extension, ExtensionOption, Id, RowValue } from '@neeloong/table' */
/** @import { DotInfo } from './getDotData.mjs' */
/** @import { LineInfo } from './getLineDates.mjs' */
/** @import { Options, LineMeta } from './types.mjs' */

/* eslint-disable prefer-destructuring */
import { createKey } from '@neeloong/table';

import date2n from './date2n.mjs';
import renderHeaders from './renderHeaders.mjs';
import getBgGroup from './getBgGroup.mjs';
import getBg from './getBg.mjs';
import getLineDates from './getLineDates.mjs';
import getLineData from './getLineData.mjs';
import renderLine from './renderLine.mjs';
import getDotData, { getDotDate } from './getDotData.mjs';
import renderDot from './renderDot.mjs';
import getDateData, { getDate } from './getDateData.mjs';
import createDateKey, { createDateGetter } from './createDateKey.mjs';


/** @type {Extension<Options>} */
const Gantt = (options, update, api, next, colOpt) => {
	const summarize = createKey(options.summarize);
	const todayStart = new Date();
	const todayEnd = new Date();
	let { tooltip, bg, showDate } = options;
	todayStart.setHours(0, 0, 0, 0);
	todayEnd.setHours(23, 59, 59, 999);
	const todayN = date2n(todayStart);

	let lineStartDate = todayStart;
	let lineEndDate = todayEnd;
	let dotStartDate = todayStart;
	let dotEndDate = todayEnd;
	let startDate = todayStart;
	let endDate = todayEnd;

	// TODO: 默认值
	let headerGets = options?.headers || [];
	let dateFields = Object.entries(options.dateFields || {}).map(
		([k, d]) => /** @type {[string, (v: any) => Date | undefined]} */([k, createDateKey(d)]),
	) || [];
	let endDateFields = Object.entries(options.endDateFields || {}).map(
		([k, d]) => /** @type {[string, (v: any) => Date | undefined]} */([k, createDateKey(d, true)]),
	) || [];
	/** @type {LineInfo[]} */
	let lines = options.lines?.map(({ start, end, ...line }) => ({
		start: createDateGetter(start),
		end: createDateGetter(end, true),
		...line,
	})) || [];
	/** @type {DotInfo[]} */
	let dots = options.dots?.map(({ date, ...l }) => ({
		date: createDateGetter(date), ...l,
	})) || [];
	let onChange = options.onChange;

	/** @type {Set<HTMLElement>} */
	const headers = new Set();
	/** @type {Set<() => void>} */
	const cells = new Set();
	/** @type {Map<Id, ([Date, Date | null, LineMeta?] | null)[]>} */
	let allLineData = new Map();
	/** @type {Map<Id, Record<string, Date | undefined>>} */
	let allDateData = new Map();
	/** @type {Map<Id, Record<string, Date | undefined>>} */
	let allEndDateData = new Map();
	/** @type {Map<Id, (Date | null)[]>} */
	let allDotData = new Map();

	// const varPrefix = `gantt-${`${Math.random()}`.substring(2)}`
	const varPrefix = `gantt`;
	const prefix = `--neeloong-table-${varPrefix}`;
	let dayWidth = options.dayWidth || 10;
	/** @type {number[]} */
	let bgGroup = [];
	/** @type {readonly RowValue[]} */
	let allData = [];

	function updateSize() {
		const s = Math.floor(date2n(startDate));
		const e = Math.floor(date2n(endDate));
		const n = Math.max(todayN - s, 0);
		api.setStyleVar(`${varPrefix}-start`, `${n}`);
		update({ width: Math.max((e - s + 1) * dayWidth, 0) });
	}

	function updateBg() {
		api.setStyleVar(`${varPrefix}-background`, getBg(bgGroup, dayWidth));
	}
	function updateDayWidth() {
		api.setStyleVar(`${varPrefix}-day-width`, `${dayWidth}px`);
		updateBg();
		updateSize();
	}
	function updateBgGroup() {
		bgGroup = bg ? getBgGroup(bg, startDate, endDate) : [];
		updateBg();
	}
	function renderAllHeaders() {
		if (!headerGets.length) { return; }
		renderHeaders(headerGets, [...headers], startDate, endDate);
	}
	function updateHeaders() {
		if (!headerGets.length) {
			update({ width: 0 });
			api.setStyleVar(`${varPrefix}-start`, `0`);
		}
		api.setStyleVar(`${varPrefix}-header-lines`, `${headerGets.length}`);
		renderAllHeaders();
	}
	function updateDateRange() {
		startDate = lineStartDate < dotStartDate ? lineStartDate : dotStartDate;
		endDate = lineEndDate < dotEndDate ? dotEndDate : lineEndDate;
		if (showDate) { [startDate, endDate] = showDate(startDate, endDate); }
		updateSize();
		updateBgGroup();
		renderAllHeaders();
		for (const f of [...cells]) { f(); }
	}
	function updateDateData() {
		allDateData = getDateData(allData, dateFields);
		allEndDateData = getDateData(allData, endDateFields);
	}
	function updateLineData() {
		[lineStartDate, lineEndDate, allLineData]
			= getLineData(allData, allDateData, allEndDateData, lines, summarize, todayStart, todayEnd);
		lines.map(({ width: height, position }, index) => {
			api.setStyleVar(`${varPrefix}-line-position-${index}`, `${position}px`);
			api.setStyleVar(`${varPrefix}-line-height-${index}`, `${height}px`);
		});
	}
	function updateDotData() {
		[dotStartDate, dotEndDate, allDotData]
			= getDotData(allData, allDateData, allEndDateData, dots, todayStart, todayEnd);
		dots.map(({ size, position }, index) => {
			api.setStyleVar(`${varPrefix}-dot-position-${index}`, `${position}px`);
			if (!size) { return; }
			const v = typeof size === 'number' ? `${size}px` : size;
			api.setStyleVar(`${varPrefix}-dot-size-${index}`, v);
		});
	}
	function updateAll() {
		updateDateData();
		updateLineData();
		updateDotData();
		updateDateRange();
		if (typeof onChange !== 'function') {
			return;
		}
		const s = Math.floor(date2n(startDate));
		const e = Math.floor(date2n(endDate));
		onChange(todayN - s, dayWidth, {
			today: new Date(todayStart),
			start: new Date(startDate),
			end: new Date(endDate),
			days: e - s + 1,
		});
	}

	updateAll();
	updateDayWidth();
	updateHeaders();
	return {
		hidden: colOpt.hidden,
		width: 200,
		updateOptions(options, colOpt) {
			update({ hidden: colOpt.hidden });
			showDate = options.showDate;
			bg = options.bg;
			headerGets = options.headers || [];
			dateFields = Object.entries(options.dateFields || {})
				.map(([k, d]) => [k, createDateKey(d)]) || [];
			endDateFields = Object.entries(options.endDateFields || {})
				.map(([k, d]) => [k, createDateKey(d, true)]) || [];
			dots = options.dots?.map(({ date, ...l }) => ({
				date: createDateGetter(date), ...l,
			})) || [];
			lines = options.lines?.map(({ start, end, ...line }) => ({
				start: createDateGetter(start),
				end: createDateGetter(end, true),
				...line,
			})) || [];
			onChange = options.onChange;
			dayWidth = options.dayWidth || 10;
			updateAll();
			updateDayWidth();
			updateHeaders();
		},
		updateData(list) {
			allData = list;
			updateAll();
		},
		render: p => {
			let { id, data } = p;
			const root = document.createElement('td');
			// root.style.setProperty('--neeloong-table-gantt-start', `var(${prefix}-start)`);
			// root.style.setProperty('--neeloong-table-gantt-day-width', `var(${prefix}-day-width)`);
			root.classList.add('neeloong-table-gantt-cell');
			function update() {
				root.innerHTML = '';
				const lineDates = allLineData.get(id)
					|| getLineDates(data, getDate(data, dateFields), getDate(data, endDateFields), lines);
				for (const [index, line] of lines.entries()) {
					const el = renderLine(p, lineDates, line, index, todayN, prefix);
					if (el) { root.appendChild(el); }
				}
				const dotDates = allDotData.get(id)
					|| getDotDate(data, getDate(data, dateFields), getDate(data, endDateFields), dots);
				for (const [index, dot] of dots.entries()) {
					const el = renderDot(p, dotDates, dot, index, todayN, prefix);
					if (el) { root.appendChild(el); }
				}
				root.title = typeof tooltip === 'function' && tooltip(data, lineDates) || '';
			}
			update();

			cells.add(update);
			return {
				root,
				destroy() { cells.delete(update); },
				setHidden() { },
				update(row) {
					if (data === row.data) { return; }
					data = row.data;
					update();
				},
			};
		},
		customize() {
			const root = document.createElement('div');
			root.classList.add('neeloong-table-gantt-customize');

			// root.style.setProperty('--neeloong-table-gantt-day-width', `var(${prefix}-day-width)`)
			// root.style.setProperty('--neeloong-table-gantt-start', `var(${prefix}-start)`)
			const today = root.appendChild(document.createElement('div'));
			today.classList.add('neeloong-table-gantt-today');
			return { root, destroy() { } };
		},
		header: () => {
			const root = document.createElement('th');
			headers.add(root);
			root.classList.add('neeloong-table-gantt-header');
			// root.style.setProperty('--neeloong-table-gantt-header-lines', `var(${prefix}-header-lines)`)
			// root.style.setProperty('--neeloong-table-gantt-day-width', `var(${prefix}-day-width)`);


			if (headerGets.length) {
				renderHeaders(headerGets, [root], startDate, endDate);
			}
			return {
				root,
				destroy() { headers.delete(root); },
			};
		},
	};
};

/**
 * @param {Options} options
 * @returns {ExtensionOption<Options>}
 */
export default (options) => ({ ...options, extension: Gantt });
