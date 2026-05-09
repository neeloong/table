import type { RowApi, RowValue } from './column.mjs';
import type {Emit, Listen, RowEventMap} from "./event.mjs";

import type {Column} from './column.mjs';
import type {ColumnCell} from './ColumnCell';
import type { Id } from './options.mjs';

export interface Cell {
	el: HTMLElement;
	index: number;
	destroy(): void;
	update(data: RowValue): void;
	setHidden(h: boolean): void;
	column: ColumnCell;
}

export interface RowDataProxy {
	el: HTMLElement;
	index: number;
	row: Row;
	shown: Cell[];
	cells: Map<Column, Cell>;
	api: RowApi;
}

export interface Row {
	elMap?: Map<any, RowDataProxy>,
	index: number;
	parentId: Id | undefined;
	value: RowValue;
	listen: Listen<RowEventMap>;
	emit: Emit<RowEventMap>;

	id: Id;
	children: Row[];
	descendants: Row[];
	createProxy(): RowDataProxy;
};
