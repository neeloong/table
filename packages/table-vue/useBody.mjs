import { onActivated, onDeactivated, ref, watch, unref } from 'vue';


import useDestroyable from './useDestroyable.mjs';

/**
 * 
 * @param {import('vue').Ref<HTMLElement | undefined | null> | HTMLElement | undefined | null} [root] 
 * @param {import('vue').Ref<import('@neeloong/table').Group | undefined> | import('@neeloong/table').Group | undefined} [group] 
 * @param {number | undefined} [rowHeight] 
 * @returns {import('vue').ComputedRef<import('@neeloong/table').Body | undefined>}
 */
export default function useBody(root, group, rowHeight) {
	const paused = ref(false);
	onActivated(() => { paused.value = false; });
	onDeactivated(() => { paused.value = true; });
	const current = useDestroyable(() => {
		const g = unref(group);
		if (!g) { return; }
		const r = unref(root);
		if (!r) { return; }
		return g.createBody(r, rowHeight);
	});

	watch([current, paused], ([current, paused]) => {
		if (!current) { return; }
		current.paused = paused;
	}, { immediate: true });
	return current;
}
