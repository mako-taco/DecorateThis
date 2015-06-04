'use strict';

import param from 'param';
import {Any} from 'typedefs';

export default class WeakCompositeKeyMap {
	constructor() {
		this.weakMap = new WeakMap();
	}

	@param(Array, Any)
	set(keys, val) {
		let map = this.weakMap;
		for (let i = 0; i < keys.length - 1; i++) {
			let nextMap = map.get(keys[i]);
			if (!nextMap) {
				nextMap = new Map();
				map.set(keys[i], nextMap);
			}

			map = nextMap;
		}

		map.set(keys.length - 1, val);
	}

	@param(Array)
	get(keys) {
		let next = this.weakMap;
		for (let i = 0; i < keys.length; i++) {
			next = next.get(keys[i]);
			if (next === undefined) {
				break;
			}
		}

		return next;
	}
}
