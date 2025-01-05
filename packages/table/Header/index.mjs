import createHeader from './createHeader.mjs';


export default class Header {
	/** @readonly @type {HTMLElement} */
	root;
	/** @type {import('../Group/index.mjs').default} */
	#group;
	/** @type {() => void} */
	#remove;
	/**
	 * 
	 * @param {HTMLElement | undefined} root 
	 * @param {import('../Group/index.mjs').default} group 
	 * @param {() => void} remove 
	 */
	constructor(root, group, remove) {
		this.#remove = remove;
		this.#group = group;
		const header = root || document.createElement('tr');
		this.root = header;
		header.classList.add('neeloong-table', 'neeloong-table-headers');
		header.appendChild(document.createElement('span')).className = 'neeloong-table-fixed-line';
	}
	/** @type {Map<import('../types/index.mjs').ColumnCell, [import('../types/index.mjs').ColumnComponent, HTMLElement, import('./createHeader.mjs').ColumnState]>} */
	#headerMap = new Map();
	/** @type {[import('../types/index.mjs').ColumnComponent, HTMLElement, import('./createHeader.mjs').ColumnState][]} */
	#headerList = [];
	/**
	 * 
	 * @param {import('../types/index.mjs').ColumnCell[]} columns 
	 */
	_updateColumns(columns) {
		const oldMap = this.#headerMap;
		/** @type {Map<import('../types/index.mjs').ColumnCell, [import('../types/index.mjs').ColumnComponent, HTMLElement, import('./createHeader.mjs').ColumnState]>} */
		const newMap = new Map();
		/** @type {[import('../types/index.mjs').ColumnComponent, HTMLElement, import('./createHeader.mjs').ColumnState][]} */
		const list = [];
		const requestRender = () => {
			this.#group.requestRender();
		};
		this.#headerList = list;
		this.#headerMap = newMap;
		const header = this.root;
		for (const column of columns) {
			const c = oldMap.get(column) || createHeader(requestRender, header, column);
			oldMap.delete(column);
			newMap.set(column, c);
			list.push(c);
			const [component, resize] = c;
			header.appendChild(component.root);
			header.appendChild(resize);
			component.update?.(column.options);
		}
		for (const c of oldMap.values()) {
			if (!c) { continue; }
			const [component, resize] = c;
			component.root.remove();
			resize.remove();
			component.destroy();
		}

	}


	_hide() {
	}
	#destroyed = false;
	destroy() {
		if (this.#destroyed) { return; }
		this.#destroyed = true;
		this.#remove();
		this._hide();
		for (const c of this.#headerList) {
			if (!c) { continue; }
			const [component, resize] = c;
			component.root.remove();
			resize.remove();
			component.destroy();
		}
		// TODO:
	}
	paused = false;
	requestRender() {
		if (this.#destroyed) { return; }
		this.#group.requestRender(this);
	}
	/**
	 * 
	 * @param {import('../types/index.mjs').ColumnCell[]} columns 
	 * @param {boolean} [force] 
	 * @returns 
	 */
	_render(columns, force = false) {
		if (this.#destroyed) { return; }

		const list = this.#headerList;


		let i = 0;
		for (const { width, hidden, start, fixed, resizable, end } of columns) {
			const item = list[i];
			i++;
			if (!item) { continue; }
			const [{ root }, resize, state] = item;

			if (fixed !== state.fixed) {
				state.fixed = fixed;
				if (fixed) {
					root.classList.add('neeloong-table-header-fixed');
					resize.classList.add('neeloong-table-resize-fixed');
				} else {
					root.classList.remove('neeloong-table-header-fixed');
					resize.classList.remove('neeloong-table-resize-fixed');
				}
			}
			if (hidden !== state.hidden) {
				state.hidden = hidden;
				root.hidden = hidden;
				resize.hidden = hidden;
			}
			if (hidden) { continue; }
			if (state.start !== start) {
				state.start = start;
				root.style.setProperty('--neeloong-table-column-start', `${start}px`);
			}
			if (state.end !== end) {
				state.end = end;
				resize.style.setProperty('--neeloong-table-column-start', `${end}px`);
			}
			if (resizable !== state.resizable) {
				state.resizable = resizable;
				if (resizable) {
					resize.classList.add('neeloong-table-resize-resizable');
				} else {
					resize.classList.remove('neeloong-table-resize-resizable');
				}
			}
			if (state.width !== width) {
				state.width = width;
				root.style.inlineSize = `${width}px`;
			}

		}


	}
}
