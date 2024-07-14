import type {
	Column,
	Extension,
	ColumnOptions,
	ColumnParam,
	CustomizeComponent,
	ColumnComponent,
	RowValue,
	CustomizeParam,
} from './column.mjs';


export interface ColumnCell<T extends Record<string, any> = Record<string, any>> extends Column<T> {
	key: any;
	customize(param: CustomizeParam): CustomizeComponent | void;
	header(param: ColumnParam): ColumnComponent;
	extensions: Extension[];
	start: number;
	end: number;
	fixed: boolean;
	readonly resizable: boolean;
	readonly minWidth: number;
	readonly maxWidth: number;
	width: number;
	readonly hidden: boolean;
	updateData(data: readonly RowValue[]): void;
	update(columnOptions: ColumnOptions, extensionOptions: Record<string, any>[]): void
	destroy(): void
	options: ColumnOptions
}
