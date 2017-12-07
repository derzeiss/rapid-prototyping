'use strict';

var SpinCount = function () {
    SpinCount.defaultOptions = {
        endValues: [0, 0, 4, 0, 4],
        color: '#fff',
        background: ['#222', '#222', '#222', '#222', '#f00']
    };

    function SpinCount(selector, options) {
        var self = this;
        self.node = document.querySelector(selector);
        if (!this.node) throw new Error('Invalid SpinCount selector "' + selector + '"');
        self.node.classList.add('spin-count');

        self.options = Object.assign({}, SpinCount.defaultOptions, options);
        self.init();
    }

    SpinCount.prototype.init = function () {
        var self = this;
        self.options.endValues.forEach(function (val, index) {
            var container = document.createElement('div'),
                numbers = document.createElement('div'),
                color = self.getStyleSettingFor('color', index),
                bg = self.getStyleSettingFor('background', index);

            container.classList.add('spin-count__col');
            numbers.classList.add('spin-count__numbers');
            numbers.style.animation = getAnimationString(val, index);
            container.appendChild(numbers);

            for (var i = 0; i < 10; i++) {
                var number = document.createElement('div');
                number.classList.add('spin-count__number');
                number.style.color = color;
                number.style.background = bg;
                number.appendChild(document.createTextNode(i));

                numbers.appendChild(number);
            }
            self.node.appendChild(container);
        });
    };

    SpinCount.prototype.getStyleSettingFor = function (prop, index) {
        var self = this;
        var col = self.options[prop];
        return Array.isArray(col) ? col[index] : col;
    };

    function getAnimationString(targetVal, index) {
        var animationDuration = .2 - index * .015,
            animationRunCount = 6 + index * 3,
            stopAnimationDuration = .4 + .05 * targetVal,
            stopAnimationDelay = animationDuration * animationRunCount;

        return animationDuration + 's linear ' + animationRunCount + ' spin-count, \n        ' + stopAnimationDuration + 's ease-out 1 ' + stopAnimationDelay + 's forwards spin-count-to-' + targetVal;
    }

    return SpinCount;
}();