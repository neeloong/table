/**
 * @template {{ el: Element; index: number; }} T
 * @param {Element} root 
 * @param {T[]} newList 
 * @param {T[]} oldList 
 * @param {(v: T) => void} show 
 * @param {(v: T) => void} hide 
 * @returns {T[]}
 */
export default function replaceShow(root, newList, oldList, show, hide) {
	const list = [...newList];
	const old = [...oldList];
	for (; old.length + list.length;) {
		if (!old.length) {
			for (const n of list) {
				root.appendChild(n.el);
				show(n);
			}
			break;
		}
		if (!list.length) {
			for (const n of old) {
				n.el.remove();
				hide(n);
			}
			break;
		}
		const [o] = old;
		const [l] = list;
		if (o.el === l.el) {
			old.shift();
			list.shift();
			show(l);
			continue;
		}
		if (l.index <= o.index) {
			root.insertBefore(l.el, o.el);
			show(l);
			list.shift();
		}
		if (o.index <= l.index) {
			o.el.remove();
			hide(o);
			old.shift();
		}
	}
	return newList;
}
