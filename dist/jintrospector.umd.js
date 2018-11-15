(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.jintrospector = factory());
}(this, (function () { 'use strict';

	var jintrospector = {};

	return jintrospector;

})));
