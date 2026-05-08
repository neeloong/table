/** @import { Ref, Component, ComputedRef, ShallowReactive, VNode } from 'vue' */
/** @import { CellComponent, CellParam, ColumnOptions } from '@neeloong/table' */
/** @import { VueColumn } from './types.mjs' */

import { computed, shallowReactive, unref, Teleport, h, KeepAlive, ref } from 'vue';


/**
 * 
 * @param {VNode[]} list 
 * @param {any} component 
 * @param {CellParam} param 
 * @param {string} key 
 * @param {string} [className] 
 * @returns {CellComponent}
 */
function create(
	list,
	component,
	{ column, value, data, level, children, meta },
	key,
	className,
) {
	const root = document.createElement('td');
	if (className) {
		root.className += ` ${className}`;
	}
	const attrs = shallowReactive({ meta, value, column, data, level, children });
	let hiddenValue = false;
	const hidden = ref(false);
	const render = () => h(Teleport, { to: root },
		h(KeepAlive, hidden.value ? undefined : h(component, { ...attrs })),
	);
	const node = h({ render }, { key });
	list.push(node);
	return {
		root,
		destroy() {
			const index = list.indexOf(node);
			if (index < 0) { return; }
			list.splice(index, 1);
		},
		setHidden(v) {
			if (hiddenValue === v) { return; }
			hiddenValue = v;
			hidden.value = v;
		},
		update(row) {
			attrs.value = row.value;
			attrs.data = row.data;
			attrs.level = row.level;
			attrs.children = row.children;
		},
	};
}
/**
 * 
 * @param {VueColumn[] | undefined | Ref<VueColumn[] | undefined>} [columns] 
 * @returns {[ComputedRef<ColumnOptions[]>, Component]}
 */
export default function useColumns(columns) {
	let id = 0;
	/** @type {ShallowReactive<VNode[]>} */
	const list = shallowReactive([]);
	const renderTo = document.createElement('tbody');
	/**
	 * 
	 * @param {VueColumn} column 
	 * @returns {ColumnOptions}
	 */
	function toColumnOptions({ render, component, class: className, ...v }) {
		return {
			...v,
			render: component
				? p => create(list, component, p, `c${id++}`, className)
				: render,
		};
	}
	/** @type {ComputedRef<ColumnOptions[]>} */
	const data = computed(() => unref(columns)?.map(toColumnOptions) || []);
	function render() {
		return h(Teleport, { to: renderTo }, [...list]);
	}
	return [data, { render, inheritAttrs: false }];
}
