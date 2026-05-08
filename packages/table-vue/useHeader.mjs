/** @import { Ref } from 'vue' */
/** @import { Group } from '@neeloong/table' */

import { onActivated, onDeactivated, ref, watch, unref } from 'vue';

import useDestroyable from './useDestroyable.mjs';

/**
 * 
 * @param {Ref<HTMLElement | undefined | null> | HTMLElement | undefined | null} [root] 
 * @param {Ref<Group | undefined> | Group | undefined} [group] 
 * @returns 
 */
export default function useHeader(root, group) {
	const paused = ref(false);
	onActivated(() => { paused.value = false; });
	onDeactivated(() => { paused.value = true; });

	const current = useDestroyable(() => {
		const g = unref(group);
		if (!g) { return; }
		const r = unref(root);
		if (!r) { return; }
		return g.createHeader(r);
	});

	watch([current, paused], ([current, paused]) => {
		if (!current) { return; }
		current.paused = paused;
	}, { immediate: true });
	return current;
}
