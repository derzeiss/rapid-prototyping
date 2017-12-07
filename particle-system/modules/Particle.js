const Particle = (function () {

    Particle.Damp = .999;
    Particle.Gravity = .3;
    Particle.MaxSpeed = 20;

    Particle.defaultOptions = {
        x: 0,
        y: 0,
        v: new Vector2(),
        lifetime: 60,
        gravity: 1,
        width: 2,
        border: {
            width: 0,
            color: '#f00'
        },
        color: '#fff',
        animate: {
            alpha: {
                from: 1,
                to: .2
            }
        }
    };

    /**
     * @param ctx
     * @param options
     * @constructor
     */
    function Particle(ctx, options) {
        const self = this;
        self.options = Util.extend({}, Particle.defaultOptions, options);

        self.ctx = ctx;
        self.x = self.oldX = self.options.x;
        self.y = self.oldY = self.options.y;
        self.v = self.options.v.clone();
        self.lifetime = self.options.lifetime;
        self.gravity = self.options.gravity;

        self.width = self.options.width;
        self.border = null;
        self.color = new Color(self.options.color);
        self.setBorder(self.options.border);
    }

    Particle.prototype.setBorder = function (border) {
        const self = this;
        self.border = {
            width: border.width,
            strokeWidth: self.width + border.width * 2,
            color: new Color(border.color)
        }
    };

    Particle.prototype.update = function () {
        const self = this;

        self.lifetime--;
        if (self.lifetime <= 0) {
            self.reset();
            return true
        }
        else {
            self.v.scale(Particle.Damp);
            self.v.limit(Particle.MaxSpeed);
            if (self.gravity) self.applyGravity();

            self.oldX = self.x;
            self.oldY = self.y;

            self.x += self.v.x;
            self.y += self.v.y;
            return false;
        }
    };

    Particle.prototype.applyGravity = function () {
        const self = this;
        self.v.add(0, Particle.Gravity * self.gravity);
    };

    Particle.prototype.render = function () {
        const self = this;

        // set animated properties
        if (self.options.animate) {
            for (let animProp in self.options.animate) {
                if (!self.options.animate.hasOwnProperty(animProp)) continue;

                let func = self['animate' + animProp.capitalize()].bind(self);
                if (typeof func === 'function') func()
            }
        }

        // draw path
        self.ctx.beginPath();
        self.ctx.moveTo(self.oldX, self.oldY);
        self.ctx.lineTo(self.x, self.y);

        // draw border
        if (self.border.width > 0) {
            self.ctx.lineWidth = self.border.strokeWidth;
            self.ctx.strokeStyle = self.border.color.toRGBAString();
            self.ctx.stroke();
        }
        // draw inner
        self.ctx.lineWidth = self.options.width;
        self.ctx.strokeStyle = self.color.toRGBAString();
        self.ctx.stroke();
    };

    Particle.prototype.reset = function () {
        const self = this;
        self.x = self.oldX = self.options.x;
        self.y = self.oldY = self.options.y;
        self.v.set(self.options.v);
        self.lifetime = self.options.lifetime;
    };

    // animation
    Particle.prototype.animateAlpha = function () {
        const self = this;
        let alphaStart = self.options.animate.alpha.from,
            alphaEnd = self.options.animate.alpha.to,
            dAlpha = (alphaEnd - alphaStart),
            currAlpha = alphaStart + dAlpha * ( 1 - self.lifetime / self.options.lifetime);

        self.options.border.color.alpha = currAlpha;
        self.options.color.alpha = currAlpha;

        self.ctx.globalAlpha = currAlpha;
    };

    return Particle;
})();