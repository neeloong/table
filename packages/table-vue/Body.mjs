import { computed, ref, watch, h } from 'vue';

import useBody from './useBody.mjs';

/**
 * @typedef {object} BodyProps
 * @property {import('@neeloong/table').Group} [group]
 * @property {number} [rowHeight]
 */
/** @type {import('vue').Component<BodyProps>} */
const Body = {
	props: ['group', 'rowHeight'],
	setup(props) {
		const root = ref();
		const current = useBody(root, computed(() => props.group));

		watch([current, () => props.rowHeight], ([current, rowHeight]) => {
			if (!current || !rowHeight) { return; }
			current.rowHeight = rowHeight;
		});
		return () => h('div', { ref: root });
	},
};

export default Body;
