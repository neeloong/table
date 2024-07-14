import type { Dot } from '@neeloong/table-gantt';

export interface GanttDot {
	date: string;
	icon: string;
	size?: number;
	color?: string;
	position: number;
}
const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const p = s.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
p.setAttribute('fill', 'currentColor');
p.setAttribute('d', 'M5 0 L 0 5 L 5 10 L 10 5 Z');
s.setAttribute('viewBox', '0 0 11 11');
function getIcon(icon: string) {
	// TODO:
	return s;
}
export default function createDot({ date, icon, size, color, position }: GanttDot): Dot {
	return { date, icon: getIcon(icon), size, color, position, };

}
