/** @import { Ref, ComputedRef } from 'vue' */
/** @import { Group, Source } from '@neeloong/table' */
/** @import { VueColumn } from './types.mjs' */


import { unref, watch } from 'vue';

import useDestroyable from './useDestroyable.mjs';

/**
 * 
 * @param {Source | Ref<Source | undefined | null>} [source] 
 * @param {VueColumn[] | Ref<VueColumn[]>} [columns] 
 * @param {number | Ref<number | undefined>} [startFixed] 
 * @returns {ComputedRef<Group | undefined>}
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
