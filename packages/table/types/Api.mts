import type {RowEventMap, Emit, Listen, RowEmit, EventMap, RowListen} from "./event.mjs";

export interface Api {
	toggleSelected(id: number | string): void;
	setCollapse(k: number | string, closed?: boolean): void;
	isCollapsed(k: number | string): boolean;
	setChecked(k: number | string, checked?: boolean): boolean;
	isChecked(k: number | string): boolean;
	checkedAll(): void;
	cleanChecked(): void;
	isAllChecked(): boolean;
	hasChecked(): boolean;
	setStyleVar(k: string, v: string): void;
	removeStyleVar(k: string): void;
	emit: Emit<EventMap>;
	listen: Listen<EventMap>;
	emitRow: RowEmit<RowEventMap>;
	listenRow: RowListen<RowEventMap>;
}
