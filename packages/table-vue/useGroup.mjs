import { unref, watch } from 'vue';

import useDestroyable from './useDestroyable.mjs';

/**
 * 
 * @param {import('@neeloong/table').Source | import('vue').Ref<import('@neeloong/table').Source | undefined | null>} [source] 
 * @param {import('./types.mjs').VueColumn[] | import('vue').Ref<import('./types.mjs').VueColumn[]>} [columns] 
 * @param {number | import('vue').Ref<number | undefined>} [startFixed] 
 * @returns {import('vue').ComputedRef<import('@neeloong/table').Group | undefined>}
 */
export default function useGroup(source, columns, startFixed) {
	const group = useDestroyable(() => {
		const s = unref(source);
		if (!s) { return; }
		return s.createGroup([], unref(startFixed));
	});
	watch([group, () => unref(columns) || []], ([group, columns]) => {
		if (!group) { return; }
		group.setColumns(columns);
	});
	return group;
}
