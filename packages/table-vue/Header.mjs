import { computed, ref, h } from 'vue';

import useHeader from './useHeader.mjs';

/**
 * @typedef {object} HeaderProps
 * @property {import('@neeloong/table').Group} [group]
 */
/** @type {import('vue').Component<HeaderProps>} */
const Header = {
	props: ['group'],
	setup(props) {
		const root = ref();
		useHeader(root, computed(() => props.group));

		return () => h('div', { ref: root });
	},
};

export default Header;
