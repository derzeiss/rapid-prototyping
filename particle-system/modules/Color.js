const Color = (function () {
    function Color(hex) {
        const self = this;
        self.hex = hex;
        self.rgb = Color.toRGB(hex);

        self.alpha = 1;
    }

    Color.toRGB = function (hex) {
        // remove starting #
        hex = hex.charAt(0) === '#' ? hex.substr(1) : hex;
        // convert 3 char code to 6 char code
        if (hex.length === 3) {
            let h = '';
            for (let i = 0; i < hex.length; i++) {
                h += hex[i] + hex[i];
            }
            hex = h;
        }
        if (hex.length === 6) {
            return [
                parseInt(hex.substr(0, 2), 16),
                parseInt(hex.substr(2, 2), 16),
                parseInt(hex.substr(4, 2), 16)
            ]
        }
        return [];
    };

    Color.prototype.toRGBAString = function() {
        const self = this;
        return `rgba(${self.rgb.join(', ')}, ${self.alpha})`;
    };

    return Color;
})();