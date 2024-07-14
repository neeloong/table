
/**
 * @param {Map<string | number, Map<string | symbol, Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>>>} events
 * @param {string | number} row
 * @returns {Map<string | symbol, Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>>}
 */
function getRow(events, row) {
	let rowEvents = events.get(row);
	if (rowEvents) { return rowEvents; }
	rowEvents = new Map();
	events.set(row, rowEvents);
	return rowEvents;

}
/**
 * @param {Map<string | symbol, Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>>} rowEvents
 * @param {any} key
 * @returns {Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>}
 */
function get(rowEvents, key) {
	let set = rowEvents.get(key);
	if (set) { return set; }
	set = new Set();
	rowEvents.set(key, set);
	return set;
}
/**
 * @template {object} T
 * @param {Map<string | number, Map<string | symbol, Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>>>} events
 * @returns {import('../types/index.mjs').RowListen<T>}
 */
export function createListenRow(events) {
	/**
	 * @param {string | number} row
	 * @param {any} key
	 * @param {import('../types/index.mjs').Listener<any>} fn
	 */
	return (row, key, fn) => {
		const rowEvents = getRow(events, row);
		const set = get(rowEvents, key);
		/** @type {(v: any, ctx: import('../types/index.mjs').EventContext) => void} */
		const f = (...v) => fn(...v);
		set.add(f);
		return () => {
			set.delete(f);
			if (set.size) { return; }
			rowEvents.delete(key);
			if (rowEvents.size) { return; }
			events.delete(row);
		};
	};
}

/**
 * @template {object} T
 * @param {Map<string | number | symbol, Map<string | symbol, Set<(v: any, ctx: import('../types/index.mjs').EventContext) => void>>>} events
 * @returns {import('../types/index.mjs').RowEmit<T>}
 */
export function createEmitRow(events) {
	/**
	 * @param {string | number | symbol} row
	 * @param {any} key
	 * @param {any} value
	 * @param {import('../types/index.mjs').EmitOption} [opt]
	 */
	return (row, key, value, opt) => {
		const set = events.get(row)?.get(key);
		if (!set) { return true; }

		let prevented = true;
		let stop = false;
		const cancelable = Boolean(opt?.cancelable);
		/** @type {import('../types/index.mjs').EventContext} */
		const ctx = {
			stop() { stop = true; },
			prevent() { prevented = true; },
			get cancelable() { return cancelable; },
			get prevented() { return prevented; },
		};
		for (const f of [...set]) {
			f(value, ctx);
			if (stop) { break; }
		}
		return !prevented;
	};
}
