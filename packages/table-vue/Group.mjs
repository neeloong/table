import { onActivated, h, onDeactivated, ref, toRef, watch, unref } from 'vue';


import useGroup from './useGroup.mjs';
import useColumns from './useColumns.mjs';
import Header from './Header.mjs';
import Body from './Body.mjs';

/**
 * @typedef {object} GroupProps
 * @property {import('./types.mjs').VueColumn[]} [columns]
 * @property {import('@neeloong/table').Source} [source]
 * @property {number} [startFixed]
 */
/** @type {import('vue').Component<GroupProps>} */
const Group = {
	props: ['columns', 'startFixed', 'source'],
	setup(props, ctx) {
		const [columns, CellRenderer] = useColumns(toRef(props, 'columns'));
		const group = useGroup(toRef(props, 'source'), columns, toRef(props, 'startFixed'));

		const paused = ref(false);
		onActivated(() => { paused.value = false; });
		onDeactivated(() => { paused.value = true; });
		watch([group, () => props.startFixed], ([group, startFixed]) => {
			if (!group) { return; }
			if (typeof startFixed !== 'number') { return; }
			if (!Number.isSafeInteger(startFixed)) { return; }
			group.startFixed = startFixed;
		});
		watch([group, paused], ([group, paused]) => {
			if (!group) { return; }
			group.paused = paused;
		});
		return () => [
			ctx.slots.default?.({ group: unref(group) }) || h('div', [
				h(Header, { group: unref(group) }),
				h(Body, { group: unref(group) }),
			]),
			h(CellRenderer),
		];
	},
};

export default Group;
