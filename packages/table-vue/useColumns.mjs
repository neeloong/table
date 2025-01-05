import { computed, shallowReactive, unref, Teleport, h, KeepAlive, ref } from 'vue';


/**
 * 
 * @param {import('vue').VNode[]} list 
 * @param {any} component 
 * @param {import('@neeloong/table').CellParam} param 
 * @param {string} key 
 * @param {string} [className] 
 * @returns {import('@neeloong/table').CellComponent}
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
 * @param {import('./types.mjs').VueColumn[] | undefined | import('vue').Ref<import('./types.mjs').VueColumn[] | undefined>} [columns] 
 * @returns {[import('vue').ComputedRef<import('@neeloong/table').ColumnOptions[]>, import('vue').Component]}
 */
export default function useColumns(columns) {
	let id = 0;
	/** @type {import('vue').ShallowReactive<import('vue').VNode[]>} */
	const list = shallowReactive([]);
	const renderTo = document.createElement('tbody');
	/**
	 * 
	 * @param {import('./types.mjs').VueColumn} column 
	 * @returns {import('@neeloong/table').ColumnOptions}
	 */
	function toColumnOptions({ render, component, class: className, ...v }) {
		return {
			...v,
			render: component
				? p => create(list, component, p, `c${id++}`, className)
				: render,
		};
	}
	/** @type {import('vue').ComputedRef<import('@neeloong/table').ColumnOptions[]>} */
	const data = computed(() => unref(columns)?.map(toColumnOptions) || []);
	function render() {
		return h(Teleport, { to: renderTo }, [...list]);
	}
	return [data, { render, inheritAttrs: false }];
}
