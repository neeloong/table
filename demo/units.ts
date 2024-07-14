import type { GanttHeader } from "@neeloong/table-gantt";

function getYearWeek(date: Date) {
	for (let year = date.getFullYear() + 1; ; year--) {
		const start = new Date(year, 0, 1);
		const d = Math.floor((Number(date) - Number(start)) / 86400000);
		const n = Math.ceil((d + ((start.getDay() + 1) - 1)) / 7);
		if (n > 0) { return [n, year]; }
	}
}
const DayX = 1000 * 60 * 60 * 24;
export const units: Record<string, {
	label: string;
	headers: GanttHeader[];
	width: number;
	bg?: GanttHeader;
	showDate?(start: Date, end: Date): [Date, Date]
}> = {
	'day': {
		label: '日',
		width: 30,
		headers: [
			(v, t) => t === 'title'
				? `${v.getFullYear()}-${v.getMonth() + 1}`
				: `${v.getFullYear()}, ${v.getMonth() + 1}`,
			(v, t) => t === 'title'
				? `${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`
				: `${v.getDate()}`,
		],
		showDate(start, end) {
			let s = new Date(start);
			let e = new Date(end);
			const l = Math.floor(Number(e) / DayX) - Math.floor(Number(s) / DayX) + 1;
			const v = 20 - l;
			if (v > 0) {
				s = new Date(Number(s) - Math.floor(v / 2) * DayX);
				e = new Date(Number(e) + Math.ceil(v / 2) * DayX);
			}
			return [s, e];
		},
	},
	'week': {
		label: '周',
		width: 20,
		headers: [
			(v, t) => t === 'title'
				? `${v.getFullYear()}-${v.getMonth() + 1}`
				: `${v.getFullYear()}, ${v.getMonth() + 1}`,
			(v, t) => t === 'title'
				? getYearWeek(v).reverse().join('-')
				: `${getYearWeek(v)[0]}`,
		],
		showDate(start, end) {
			let s = new Date(Number(start) - ((start.getDay() || 7) - 1) * DayX);
			let e = new Date(Number(end) - ((end.getDay() || 7) - 7) * DayX);
			const l = (Math.floor(Number(e) / DayX) - Math.floor(Number(s) / DayX) + 1) / 7;
			const v = 10 - l;
			if (v > 0) {
				s = new Date(Number(s) - Math.floor(v / 2) * DayX * 7);
				e = new Date(Number(e) + Math.ceil(v / 2) * DayX * 7);
			}
			return [s, e];
		},
	},
	'month': {
		label: '月',
		width: 10,
		headers: [
			(v, t) => t === 'title'
				? `${v.getFullYear()}-${v.getMonth() + 1}`
				: `${v.getFullYear()}, ${v.getMonth() + 1}`,
		],
		showDate(start, end) {
			const s = new Date(start);
			const e = new Date(end);
			e.setDate(1);
			s.setDate(1);

			const l = (e.getFullYear() * 12 + e.getMonth())
				- (s.getFullYear() * 12 + s.getMonth())
				+ 1;
			const v = 2 - l;
			if (v > 0) {
				s.setMonth(s.getMonth() - Math.floor(v / 2));
				e.setMonth(e.getMonth() + Math.ceil(v / 2));
			}

			const em = e.getMonth();
			if ([3, 5, 8, 10].includes(em)) {
				e.setDate(30);
			} else if (em !== 1) {
				e.setDate(31);
			} else {
				const y = e.getFullYear();
				if ((y % 4) || !(y % 100) && (y % 400)) {
					e.setDate(28);
				} else {
					e.setDate(29);
				}
			}
			return [s, e];
		},
	},
	'year': {
		label: '年',
		width: 1,
		headers: [v => `${v.getFullYear()}`],
		bg: v => `${v.getMonth()}`,
		showDate(start, end) {
			const s = new Date(start);
			const e = new Date(end);
			s.setMonth(0, 1);
			e.setMonth(11, 31);
			const l = e.getFullYear() - s.getFullYear() + 1;
			const v = 2 - l;
			if (v > 0) {
				s.setFullYear(s.getFullYear() - Math.floor(v / 2));
				e.setFullYear(e.getFullYear() + Math.ceil(v / 2));
			}
			return [s, e];
		},
	},
	'year2': {
		label: '年(紧凑)',
		width: 0.25,
		headers: [v => `${v.getFullYear()}`],
		bg: v => `${v.getFullYear()}`,
		showDate(start, end) {
			const s = new Date(start);
			const e = new Date(end);
			s.setMonth(0, 1);
			e.setMonth(11, 31);
			const l = e.getFullYear() - s.getFullYear() + 1;
			const v = 8 - l;
			if (v > 0) {
				s.setFullYear(s.getFullYear() - Math.floor(v / 2));
				e.setFullYear(e.getFullYear() + Math.ceil(v / 2));
			}
			return [s, e];
		},
	},
};
export default units
