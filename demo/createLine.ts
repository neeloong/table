import type { Line, LineMeta } from '@neeloong/table-gantt';

export const minRowHeight = 24;
export interface GanttLine {
	label?: string;
	start: string;
	end: string;
	position: number;
	width: number;
	color?: string;
	borderColor?: string;
	key?: string;
	reference?: string;
	processingColor?: string;
	processingBorderColor?: string;
	processingOverdueColor?: string;
	processingOverdueBorderColor?: string;
	completeColor?: string;
	completeBorderColor?: string;
	completeOverdueColor?: string;
	completeOverdueBorderColor?: string;
}


function getColor(
	dates: ([Date, Date | null, LineMeta?] | null)[],
	index: number,
	refer: string,
	colors: (string | undefined)[],
): string | undefined | null {
	const current = dates[index];
	if (!current) { return null; }
	const reference = dates.find(v => v?.[2]?.name === refer);
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	// 是否已完成
	const [, end] = current;
	const ended = end && end <= today || false;
	// 是否超期
	const planEnd = reference?.[1];
	const overdue = planEnd && planEnd < (ended && end || today) || false;
	const k = ended ? 2 : 0;
	return overdue && colors[k + 1] || colors[k];
}

export default function createLine(v: GanttLine, index: number): Line {
	const { width, position, start, end, reference, color, borderColor } = v;
	const name = v.key || `${index + 1}`;
	if (!reference) {
		return {
			meta: { name },
			width, position, start, end,
			color: () => color || '', borderColor: () => borderColor || '',
		};
	}
	const c1 = [
		v.processingColor, v.processingOverdueColor,
		v.completeColor, v.completeOverdueColor,
	];
	const c2 = [
		v.processingBorderColor, v.processingOverdueBorderColor,
		v.completeBorderColor, v.completeOverdueBorderColor,
	];
	return {
		meta: { name },
		width, position, start, end,
		color: (v, i, d) => getColor(d, i, reference, c1) || color || '',
		borderColor: (v, i, d) => getColor(d, i, reference, c2) || borderColor || '',
	};
}
