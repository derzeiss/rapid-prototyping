var ParallaxObject = (function () {
    function ParallaxObject(app) {
        var self = this;
        PIXI.Sprite.call(self);
        self.app = app;
    }

    ParallaxObject.prototype = Object.create(PIXI.Sprite.prototype);

    /**
     * Add layer
     * @param layer
     */
    ParallaxObject.prototype.addLayer = function (layer) {
        var self = this;
        self.addChild(layer);
        return self;
    };

    /**
     * Called every frame.
     * Update all layer positions.
     */
    ParallaxObject.prototype.update = function () {
        var self = this;
        var mouseX = self.app.renderer.plugins.interaction.mouse.global.x,
            mouseY = self.app.renderer.plugins.interaction.mouse.global.y;

        self.children.forEach(function (layer) {
            layer.setPos(mouseX, mouseY);
        });
    };

    return ParallaxObject;
})();


var ParallaxLayer = (function () {
    /**
     * One layer for a ParallaxObject
     * @param settings
     * @param settings.img - path to the image file
     * @param settings.x
     * @param settings.y
     * @param settings.z - z-position // 0: Doesn't move at all // 1 -> moves 1:1 with the cursor
     * @class
     * @constructor
     */
    function ParallaxLayer(settings) {
        var self = this;
        var texture = PIXI.Texture.fromImage(settings.img);
        PIXI.Sprite.call(self, texture);
        self.x0 = settings.x;
        self.y0 = settings.y;
        self.z = settings.z;
        self.x = self.x0;
        self.y = self.y0;
    }

    ParallaxLayer.prototype = Object.create(PIXI.Sprite.prototype);

    /**
     * set image x.
     * @param x
     */
    ParallaxLayer.prototype.setX = function (x) {
        var self = this;
        self.x = self.x0 + (x - self.parent.app.renderer.width / 2) * self.z;
    };

    /**
     * set image y
     * @param y
     */
    ParallaxLayer.prototype.setY = function (y) {
        var self = this;
        self.y = self.y0 + (y - self.parent.app.renderer.height / 2) * self.z;
    };

    /**
     * set image x and y
     * @param x
     * @param y
     */
    ParallaxLayer.prototype.setPos = function (x, y) {
        var self = this;
        self.setX(x);
        self.setY(y);
    };

    return ParallaxLayer;
})();