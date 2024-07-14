/**
 * @template T
 * @param {(event: PointerEvent) => T} downFn 
 * @param {(event: PointerEvent, value: T) => void} moveFn 
 * @returns {[(event: PointerEvent) => void, (event: PointerEvent) => void, (event: PointerEvent) => void]}
 */
export default function pointerCapture(downFn, moveFn) {
	/** @type {any} */
	let state;
	let captured = false;
	/** @param {PointerEvent} e */
	function begin(e) {
		if (captured) { return; }
		state = downFn(e);
		/** @type {Element} */(e.currentTarget).setPointerCapture(e.pointerId);
		captured = true;
	}
	/** @param {PointerEvent} e */
	function move(e) {
		const el = /** @type {Element} */(e.currentTarget);
		if (!el.hasPointerCapture(e.pointerId)) { return; }
		moveFn(e, state);
	}
	/** @param {PointerEvent} e */
	function end(e) {
		const { pointerId } = e;
		try {
			const el = /** @type {Element} */(e.currentTarget);
			el.releasePointerCapture(pointerId);
		} catch (e) {
			console.error(e);
		}
		captured = false;
	}
	return [begin, move, end];
}
