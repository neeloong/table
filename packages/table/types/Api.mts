import type {RowEventMap, Emit, Listen, RowEmit, EventMap, RowListen} from "./event.mjs";
import type { Id } from './options.mjs';

export interface Api {
	toggleSelected(id: Id): void;
	setCollapse(k: Id, closed?: boolean): void;
	isCollapsed(k: Id): boolean;
	setChecked(k: Id, checked?: boolean): boolean;
	isChecked(k: Id): boolean;
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
