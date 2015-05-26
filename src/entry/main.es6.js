import {AnyOf, ObjectOf, ArrayOf, Shape, Optional, Any, returns, param} from 'param';
import {enumerable, writable, configurable} from 'properties';
import memoize from 'memoize';

module.exports = {
	types: {
		AnyOf,
		ObjectOf,
		ArrayOf,
		Shape,
		Optional,
		Any
	},
	enumerable,
	writable,
	configurable,
	memoize,
	returns,
	param
};
