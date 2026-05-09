export type Id = string | number | symbol;
export type Key<R, T extends object = object> = (string | symbol)[] | (string | symbol) | ((v: T) => R | undefined);
export type IdKey<T extends object = object> = (string | symbol)[] | (string | symbol) | ((v: T) => Id);

export interface Options<T extends object = object> {
	parentKey?: Key<Id, T>;
	idKey?: IdKey<T>;

	// TODO:
	// groupKey?: string;
}
