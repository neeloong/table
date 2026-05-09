import type { Api } from './Api.mjs';
import type { Emit, Listen, RowEventMap } from "./event.mjs";
import type { Id } from './options.mjs';

export interface RowApi {
	listen: Listen<RowEventMap>;
	emit: Emit<RowEventMap>;
	setCollapse(closed?: boolean): void;
	collapsed: boolean;
	setChecked(checked?: boolean): void;
	checked: boolean;
	addClass(...tokens: string[]): void
	removeClass(...tokens: string[]): void
	hasClass(token: string): boolean
}

export interface RowValue {
	id: Id;
	data: any;
	parentId: Id | undefined
	level: number;
	children: RowValue[];
}

export interface CellUpdate extends RowValue {
	value: any;
}

export interface CellParam extends CellUpdate {
	api: Api;
	column: ColumnInfo;
	rowApi: RowApi;
	meta: any;
}

export interface ColumnUpdatable {
	resizable: boolean;
	minWidth: number;
	maxWidth: number;
	width: number;
	hidden: boolean;
}
export interface ColumnOptions extends ColumnInfo {
	readonly spillable?: boolean;
	readonly extensions?: ExtensionOption[];

	update?(data: RowValue[]): void;
	header?(param: ColumnParam): ColumnComponent;
	render?(param: CellParam): CellComponent;
	// readonly filter?: (param: CellParam) => ColumnComponent;
	// readonly sortable?: boolean;
}


export interface Extension<T extends Record<string, any> = Record<string, any>> {
	(
		options: T,
		update: (v: Partial<ColumnUpdatable>) => void,
		api: Api,
		next: (update: (v: Partial<ColumnUpdatable>) => void) => ColumnDefine,
		columnOptions: ColumnOptions,
	): Column<T>;
}
export type ExtensionOption<T extends Record<string, any> = Record<string, any>>
	= Extension<T> | Record<'extension', Extension<T>> & T;

export interface ColumnComponent {
	root: HTMLElement;
	update?(columnOptions: ColumnOptions): void
	destroy(): void;
}

export interface ColumnDefine {
	readonly width?: number;
	readonly title?: string;
	readonly field?: string | symbol | (string | symbol)[];
	readonly meta?: any;
	readonly resizable?: boolean;
	readonly minWidth?: number;
	readonly maxWidth?: number;
	readonly spillable?: boolean;
	readonly hidden?: boolean;

	updateData(data: RowValue[]): void;
	header(param: ColumnParam): ColumnComponent;
	customize(param: CustomizeParam): CustomizeComponent | void;
	render(param: CellParam): CellComponent;
}


export interface NextColumn {
	(update: (v: Partial<ColumnUpdatable>) => void): ColumnDefine;

}


export interface ColumnParam {
	column: ColumnOptions;
}

export interface CustomizeComponent {
	root: HTMLElement;
	update?(columnOptions: ColumnOptions): void;
	destroy(): void;
}

export interface ColumnInfo {
	readonly key?: any;
	readonly meta?: any;
	readonly field?: string | symbol | (string | symbol)[];
	readonly title?: string;
	readonly width?: number;
	readonly minWidth?: number;
	readonly maxWidth?: number;
	readonly resizable?: boolean;
	readonly hidden?: boolean;

	// TODO:
	// readonly editable?: boolean;
}
export interface CellComponent {
	root: HTMLElement;
	destroy(): void;
	setHidden(h: boolean): void;
	update(row: CellUpdate): void;
}

export interface CustomizeParam {
	column: ColumnOptions;
}

export interface Column<T extends Record<string, any> = Record<string, any>> {
	readonly width?: number;
	readonly title?: string;
	readonly field?: string | symbol | (string | symbol)[];
	readonly meta?: any;
	readonly resizable?: boolean;
	readonly minWidth?: number;
	readonly maxWidth?: number;
	readonly spillable?: boolean;
	readonly hidden?: boolean;

	updateData?(data: readonly RowValue[]): void
	updateOptions?(options: T, columnOptions: ColumnOptions): void
	header(param: ColumnParam): ColumnComponent;
	customize?(param: CustomizeParam): CustomizeComponent | void;
	render(param: CellUpdate, rowApi: RowApi): CellComponent;
	destroy?(): void
}
