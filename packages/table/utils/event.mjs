/** @import { EventContext, Listen, Listener, Emit, EmitOption } from '../types/index.mjs' */

/**
 * @param {Record<string | symbol, Set<(v: any, ctx: EventContext) => void>>} events
 * @param {any} key
 * @returns {Set<(v: any, ctx: EventContext) => void>}
 */
function get(events, key) {
	let set = key in events && events[key];
	if (set instanceof Set) { return set; }
	set = new Set();
	events[key] = set;
	return set;
}
/**
 * @template {object} T
 * @param {Record<string | symbol, Set<(v: any, ctx: EventContext) => void>>} events
 * @returns {Listen<T>}
 */
export function createListen(events) {
	/**
	 * 
	 * @param {any} key 
	 * @param {Listener<any>} fn 
	 * @returns 
	 */
	return (key, fn) => {
		const set = get(events, key);
		/** @type {(v: any, ctx: EventContext) => void} */
		const f = (...v) => fn(...v);
		set.add(f);
		return () => { set.delete(f); };
	};
}

/**
 * @template {object} T
 * @param {Record<string | symbol, Set<(v: any, ctx: EventContext) => boolean>>} events
 * @returns {Emit<T>}
 */
export function createEmit(events) {
	/**
	 * 
	 * @param {any} key 
	 * @param {any} value 
	 * @param {EmitOption} [opt] 
	 * @returns 
	 */
	return (key, value, opt) => {
		const set = key in events && events[key];
		if (!(set instanceof Set)) { return true; }

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
