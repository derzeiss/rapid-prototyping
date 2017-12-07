const Util = {
    extend: function () {
        let target = arguments[0],
            obj, propName, prop;

        if (typeof target !== 'object') {
            target = {};
        }

        for (let i = 1; i < arguments.length; i++) {

            // extend one object
            obj = arguments[i];

            for (propName in obj) {
                if (!obj.hasOwnProperty(propName)) continue;
                prop = obj[propName];

                // recurse if prop is an object // else set primitive prop directly
                if (typeof prop === 'object') {
                    if (!target[propName]) target[propName] = new prop.constructor();
                    Util.extend(target[propName], prop)
                } else {
                    target[propName] = prop;
                }
            }
        }
        return target;
    }
};
