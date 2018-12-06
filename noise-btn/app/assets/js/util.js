'use strict';

const Util = (() => {

    // @formatter:off
    function isNull(val) { return val === null || val === undefined }
    function isObject(val) { return typeof val === 'object' && val !== null }
    function isArray(val) { return Array.isArray(val) }
    function isFunction(val) { return typeof val === 'function' }
    function isString(val) { return typeof val === 'string' }
    function isNumber(val) { return !isNaN(parseFloat(val)) && isFinite(val) }
    function isJQuery(val) { return !Util.isNull(val) && val.constructor.name === 'jQuery' }

    function getBEM(block, el, mod) { return `.${block}` + (el ? `__${el}` : '') + (mod ? `_${mod}` : '') }
    function cls(sel) { return sel.substr(1); }
    // @formatter:on

    function toInt(val) {
        let parsed = parseInt(val);
        return isNumber(parsed) ? parsed : 0
    }

    return {
        isNull,
        isObject,
        isArray,
        isFunction,
        isString,
        isNumber,
        isJQuery,
        getBEM,
        cls,
        toInt,
    }

})();