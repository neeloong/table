/** @import { Component } from 'vue' */
/** @import { Group } from '@neeloong/table' */

import { computed, ref, h } from 'vue';

import useHeader from './useHeader.mjs';

/**
 * @typedef {object} HeaderProps
 * @property {Group} [group]
 */
/** @type {Component<HeaderProps>} */
const Header = {
	props: ['group'],
	setup(props) {
		const root = ref();
		useHeader(root, computed(() => props.group));

		return () => h('tr', { ref: root });
	},
};

export default Header;
