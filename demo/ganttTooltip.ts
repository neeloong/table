import formatDate from './formatDate';
import type { LineMeta } from '@neeloong/table-gantt';

export default function ganttTooltip(lines: any, v: any, dates: ([Date, Date | null, LineMeta?] | null)[]) {
	const list: string[] = [];
	for (let index = 0; index < dates.length; index++) {
		const date = dates[index];
		const line = lines[index];
		if (!line) { continue; }
		const { reference, label } = line;
		if (!label) { continue; }
		if (date) {
			const start = formatDate(date[0]);
			const end = date[1]
				? formatDate(date[1])
				: reference
					? formatDate(new Date())
					: '';
			list.push(`${label}:${start}►${end}`);
			continue;
		}
		if (reference) {
			const plan = dates.find(v => v?.[2]?.name === reference);
			const today = formatDate(new Date());
			if (plan && plan[1] && today > formatDate(plan[0])) {
				list.push(`延期开始`);
				continue;
			}
			list.push(`未开始`);
			continue;
		}
	}
	return list.filter(Boolean).join('\n');
}
