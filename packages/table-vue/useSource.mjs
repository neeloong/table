import { markRaw } from 'vue';
import { unref, watch } from 'vue';

import { Source } from '@neeloong/table';

import useDestroyable from './useDestroyable.mjs';

/**
 * 
 * @param {object[] | import('vue').Ref<object[]>} [data] 
 * @param {object} [options] 
 * @param {boolean | import('vue').Ref<boolean>} [options.selectable] 
 * @returns {import('vue').ComputedRef<import('vue').Raw<Source> | undefined>}
 */
export default function useSource(data, options) {
	const source = useDestroyable(() => markRaw(new Source({
		idKey: 'name',
		parentKey: 'parent',
	})));
	watch([source, () => unref(data) || []], ([source, data]) => {
		if (!source) { return; }
		source.setValue(data);
	}, { immediate: true });
	watch([source, () => Boolean(unref(options?.selectable))], ([source, selectable]) => {
		if (!source) { return; }
		source.selectable = selectable;
	}, { immediate: true });

	return source;
}
