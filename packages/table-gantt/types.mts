import type { CellUpdate, Key } from '@neeloong/table';

export interface GanttHeader {
	(date: Date, type?: 'title' | 'text'): string;
}

export interface LineMeta {
	name?: string;
	[k: string]: any;
}

export interface LineGet<T = string> {
	(data: CellUpdate, index: number, date: ([Date, Date | null, LineMeta?] | null)[]): T;
}


export interface DateGetter {
	(v: any, dates: Record<string, Date | undefined>, endDates: Record<string, Date | undefined>): Date | null | undefined
}
export type DateKey = string
| ((v: object, dates: Record<string, Date | undefined>, endDates: Record<string, Date | undefined>) => Date | string | null | undefined)
export interface Line {
	start: DateKey;
	end: DateKey;
	position: number;
	width: number;
	meta?: LineMeta;
	className?: LineGet;
	color?: LineGet;
	borderColor?: LineGet;
	title?: LineGet;
}

export interface DotGet<T = string> {
	(data: CellUpdate, index: number, date: (Date | null)[]): T;
}

export interface Dot {
	date: DateKey;
	icon?: DotGet<SVGElement | HTMLElement | undefined> | SVGElement | HTMLElement | string;
	position: number;
	size?: string | number;
	color?: DotGet | string;
}

export interface Options {
	dateFields?: Record<string, string | ((v: object) => Date | string | undefined)>;
	endDateFields?: Record<string, string | ((v: object) => Date | string | undefined)>;
	lines?: Line[];
	dots?: Dot[];
	summarize?: Key<boolean>;
	margin?: number;
	dayWidth?: number;
	headers?: GanttHeader[],
	tooltip?(v: any, dates: ([Date, Date | null, (LineMeta | undefined)?] | null)[]): string;
	bg?: GanttHeader;
	showDate?(start: Date, end: Date): [Date, Date]
	onChange?(today: number, dayWidth: number, p: {
		today: Date;
		start: Date;
		end: Date;
		days: number;
	}): void
}
