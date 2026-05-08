/** @import { Api, CellComponent, CellParam, CellUpdate, ColumnComponent, ColumnParam, Extension } from '../types/index.mjs' */

const styles = {
	collapsible: 'neeloong-table-tree-collapsible',
	collapser: 'neeloong-table-tree-collapser',
	selectable: 'neeloong-table-selectable',
};
/**
 * 
 * @param {(param: CellParam) => CellComponent} render 
 * @returns {(param: CellParam) => CellComponent}
 */
function createRender(render) {
	return p => {
		const { rowApi } = p;
		const root = document.createElement('td');
		root.style.display = 'flex';
		root.classList.add('neeloong-table-tree');
		const collapser = root.appendChild(document.createElement('span'));
		collapser.className = styles.collapser;
		collapser.classList.add(styles.selectable);
		collapser.addEventListener('click', e => {
			rowApi.setCollapse();
		});
		rowApi.listen('collapseChange', c => {
			if (c) {
				root.classList.add('neeloong-table-tree-collapsed');
			} else {
				root.classList.remove('neeloong-table-tree-collapsed');
			}
		});
		if (rowApi.collapsed) {
			root.classList.add('neeloong-table-tree-collapsed');
		}

		/**
		 * 
		 * @param {CellUpdate} row 
		 */
		function updateCollapser(row) {
			root.style.setProperty(`--neeloong-table-tree-level`, String(row.level));
			if (row.children.length) {
				root.classList.add(styles.collapsible);
			} else {
				root.classList.remove(styles.collapsible);
			}
		}
		updateCollapser(p);
		const comp = render(p);
		root.appendChild(comp.root);
		return {
			...comp,
			root,
			destroy: comp.destroy.bind(comp),
			setHidden: comp.setHidden.bind(comp),
			update(row) { updateCollapser(row); return comp.update(row); },
		};
	};
}

/**
 * 
 * @param {Api} api 
 * @param {(param: ColumnParam) => ColumnComponent} header 
 * @returns {(param: ColumnParam) => ColumnComponent}
 */
function createHeader(api, header) {
	return p => {

		const root = document.createElement('th');
		root.style.display = 'flex';
		root.classList.add('neeloong-table-tree');
		const collapser = root.appendChild(document.createElement('span'));
		collapser.className = styles.collapser;
		collapser.classList.add(styles.selectable);


		const comp = header(p);
		root.appendChild(comp.root);
		return {
			...comp,
			root,
			destroy() {
				comp.destroy();
			},
		};
	};
}
/** @type {Extension} */
const Tree = (_, update, api, next) => {
	const cc = next(update);
	return {
		...cc,
		render: createRender(cc.render),
		header: createHeader(api, cc.header),
	};
};

export default Tree;
