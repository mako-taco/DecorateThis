import {AnyOf, ObjectOf, ArrayOf, Shape, Optional, Any, returns, param} from 'param';
import {enumerable, writable, configurable} from 'properties';
import memoize from 'memoize';

module.exports = {
	/* Type Validators */
	AnyOf,
	ObjectOf,
	ArrayOf,
	Shape,
	Optional,
	Any,

	/* Properties */
	enumerable,
	writable,
	configurable,

	memoize,
	returns,
	param
};
