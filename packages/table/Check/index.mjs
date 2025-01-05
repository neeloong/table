

const styles = {
	selectable: 'neeloong-table-selectable',
	checkable: 'neeloong-table-checkable',
};
/**
 * 
 * @param {(param: import('../types/index.mjs').CellParam) => import('../types/index.mjs').CellComponent} render 
 * @returns {(param: import('../types/index.mjs').CellParam) => import('../types/index.mjs').CellComponent}
 */
function createCell(render) {
	return p => {
		const { rowApi } = p;
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		const root = document.createElement('td');
		root.appendChild(checkbox);
		root.classList.add(styles.checkable);
		root.classList.add(styles.selectable);
		checkbox.checked = rowApi.checked;
		checkbox.addEventListener('change', () => {
			rowApi.checked = checkbox.checked;
		});
		const cel = rowApi.listen('checkedChange', checked => {
			checkbox.checked = checked;
		});

		const comp = render(p);
		root.appendChild(comp.root);
		let destroyed = false;
		return {
			root,
			destroy() {
				if (destroyed) { return; }
				destroyed = true;
				cel();
				comp.destroy();
			},
			setHidden: comp.setHidden.bind(comp),
			update: comp.update.bind(comp),
		};
	};
}
/**
 * 
 * @param {import('../types/index.mjs').Api} api 
 * @param {(param: import('../types/index.mjs').ColumnParam) => import('../types/index.mjs').ColumnComponent} header 
 * @returns {(param: import('../types/index.mjs').ColumnParam) => import('../types/index.mjs').ColumnComponent}
 */
function createHeader(api, header) {
	return p => {

		const root = document.createElement('th');
		const headerCheck = document.createElement('input');
		headerCheck.type = 'checkbox';
		headerCheck.checked = false;
		root.appendChild(headerCheck);
		root.classList.add(styles.checkable);


		headerCheck.addEventListener('change', () => {
			if (headerCheck.checked) {
				api.checkedAll();
			} else {
				api.cleanChecked();
			}
		});

		const selected = api.isAllChecked();
		headerCheck.checked = selected;
		headerCheck.indeterminate = !selected && api.hasChecked();
		const cel = api.listen('checkedChange', () => {
			const selected = api.isAllChecked();
			headerCheck.checked = selected;
			headerCheck.indeterminate = !selected && api.hasChecked();
		});

		const comp = header(p);
		root.appendChild(comp.root);
		return {
			...comp,
			root,
			destroy() {
				cel();
				comp.destroy();
			},
		};
	};
}

/** @type {import('../types/index.mjs').Extension} */
const Check = (_, update, api, next) => {
	const c = next(({...v}) => {
		if (typeof v.width === 'number') { v.width += 30; }
		update(v);
	});
	return {
		...c,
		width: (c.width || 0) + 30,
		render: createCell(c.render),
		header: createHeader(api, c.header),
	};
};

export default Check;
