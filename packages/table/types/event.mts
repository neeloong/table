export interface EmitOption {
	cancelable?: boolean;
}

export interface Emit<T extends object> {
	<K extends keyof T>(k: K, value: T[K], opt?: EmitOption): boolean;
}

export interface EventContext {
	stop(): void;
	prevent(): void;
	readonly cancelable: boolean;
	readonly prevented: boolean;
}
export interface RowEventMap {
	collapseChange: boolean;
	selectedChange: boolean;
	checkedChange: boolean;
}

export interface Listener<T> {
	(v: T, ctx: EventContext): void;
}


export interface Listen<T extends object> {
	<K extends keyof T>(k: K, fn: Listener<T[K]>): () => void;
}


export interface RowEmit<T extends object> {
	<K extends keyof T>(row: string | number | symbol, k: K, value: T[K], opt?: EmitOption): boolean;
}
export interface EventMap {
	collapseChange: (string | number | symbol)[];
	selectedChange: string | number | symbol | undefined;
	checkedChange: (string | number | symbol)[];
}


export interface RowListen<T extends object> {
	<K extends keyof T>(row: string | number, k: K, fn: Listener<T[K]>): () => void;
}
