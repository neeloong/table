export type Key<R, T extends object = object> = string | ((v: T) => R | undefined);
export type IdKey<T extends object = object> = string | ((v: T) => string | number);

export interface Options<T extends object = object> {
	parentKey?: Key<string | number, T>;
	idKey?: IdKey<T>;

	// TODO:
	// groupKey?: string;
}
