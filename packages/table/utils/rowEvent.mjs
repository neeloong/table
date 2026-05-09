/** @import { EmitOption, EventContext, RowEmit, RowListen, Listener, Id } from '../types/index.mjs' */

/**
 * @param {Map<Id, Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>>} events
 * @param {Id} row
 * @returns {Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>}
 */
function getRow(events, row) {
	let rowEvents = events.get(row);
	if (rowEvents) { return rowEvents; }
	rowEvents = new Map();
	events.set(row, rowEvents);
	return rowEvents;

}
/**
 * @param {Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>} rowEvents
 * @param {any} key
 * @returns {Set<(v: any, ctx: EventContext) => void>}
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
 * @param {Map<Id, Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>>} events
 * @returns {RowListen<T>}
 */
export function createListenRow(events) {
	/**
	 * @param {Id} row
	 * @param {any} key
	 * @param {Listener<any>} fn
	 */
	return (row, key, fn) => {
		const rowEvents = getRow(events, row);
		const set = get(rowEvents, key);
		/** @type {(v: any, ctx: EventContext) => void} */
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
 * @param {Map<Id, Map<string | symbol, Set<(v: any, ctx: EventContext) => void>>>} events
 * @returns {RowEmit<T>}
 */
export function createEmitRow(events) {
	/**
	 * @param {Id} row
	 * @param {any} key
	 * @param {any} value
	 * @param {EmitOption} [opt]
	 */
	return (row, key, value, opt) => {
		const set = events.get(row)?.get(key);
		if (!set) { return true; }

		let prevented = true;
		let stop = false;
		const cancelable = Boolean(opt?.cancelable);
		/** @type {EventContext} */
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
