const Vector2 = (function () {
    function Vector2(x, y) {
        const self = this;
        self.x = x || 0;
        self.y = y || 0;
    }

    Vector2.prototype.set = function (v2) {
        const self = this;
        self.x = v2.x;
        self.y = v2.y;
    };

    /**
     * Adds either another Vector or two plain numbers to self
     * @param v2 {Vector2|int} - vector or plain x value
     * @param [y] {int} - plain y value
     */
    Vector2.prototype.add = function (v2, y) {
        const self = this;
        if (y !== undefined && typeof v2 === 'number' && typeof y === 'number') {
            self.x += v2;
            self.y += y;
        } else {
            self.x += v2.x;
            self.y += v2.y;
        }
        return self;
    };

    Vector2.prototype.sub = function (v2) {
        const self = this;
        self.x -= v2.x;
        self.y -= v2.y;
        return self;
    };

    Vector2.prototype.scale = function (n) {
        const self = this;
        self.x *= n;
        self.y *= n;
        return self;
    };

    Vector2.prototype.getLength = function () {
        const self = this;
        return Math.sqrt(self.x * self.x + self.y * self.y);
    };

    Vector2.prototype.toLength = function (n) {
        const self = this;
        const factor = n / self.getLength();
        self.x *= factor;
        self.y *= factor;
        return self;
    };

    Vector2.prototype.limit = function (n) {
        const self = this;
        const l = self.getLength();
        if (l > n) {
            let factor = n / l;
            self.x *= factor;
            self.y *= factor;
        }
        return self;
    };

    Vector2.prototype.normalize = function () {
        const self = this;
        const l = self.getLength();
        self.x *= self.x / l;
        self.y *= self.y / l;
        return self;
    };

    Vector2.prototype.clone = function () {
        const self = this;
        return new Vector2(self.x, self.y);
    };

    return Vector2;
})();