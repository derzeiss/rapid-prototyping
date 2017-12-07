'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Color = function () {
    function Color(hex) {
        var self = this;
        self.hex = hex;
        self.rgb = Color.toRGB(hex);

        self.alpha = 1;
    }

    Color.toRGB = function (hex) {
        // remove starting #
        hex = hex.charAt(0) === '#' ? hex.substr(1) : hex;
        // convert 3 char code to 6 char code
        if (hex.length === 3) {
            var h = '';
            for (var i = 0; i < hex.length; i++) {
                h += hex[i] + hex[i];
            }
            hex = h;
        }
        if (hex.length === 6) {
            return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
        }
        return [];
    };

    Color.prototype.toRGBAString = function () {
        var self = this;
        return 'rgba(' + self.rgb.join(', ') + ', ' + self.alpha + ')';
    };

    return Color;
}();
/**
 * returns random int between min and max excluding max. Math.: [min, max[
 * returns random number between 0 and min if max is omitted.
 * @param min {int} - lower boundary
 * @param [max] [int} - upper boundary
 * @returns {int} - random int
 */
Math.randrange = function (min, max) {
    if (max === undefined || max === null) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;
};

/**
 * returns random int between min and max including max. Math.: [min, max]
 * returns random number between 0 and min if max is omitted.
 * @param min {int} - lower boundary
 * @param [max] [int} - upper boundary
 * @returns {int} - random int
 */
Math.randint = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Math.PI2 = Math.PI / 2;
var Particle = function () {

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
        var self = this;
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
        var self = this;
        self.border = {
            width: border.width,
            strokeWidth: self.width + border.width * 2,
            color: new Color(border.color)
        };
    };

    Particle.prototype.update = function () {
        var self = this;

        self.lifetime--;
        if (self.lifetime <= 0) {
            self.reset();
            return true;
        } else {
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
        var self = this;
        self.v.add(0, Particle.Gravity * self.gravity);
    };

    Particle.prototype.render = function () {
        var self = this;

        // set animated properties
        if (self.options.animate) {
            for (var animProp in self.options.animate) {
                if (!self.options.animate.hasOwnProperty(animProp)) continue;

                var func = self['animate' + animProp.capitalize()].bind(self);
                if (typeof func === 'function') func();
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
        var self = this;
        self.x = self.oldX = self.options.x;
        self.y = self.oldY = self.options.y;
        self.v.set(self.options.v);
        self.lifetime = self.options.lifetime;
    };

    // animation
    Particle.prototype.animateAlpha = function () {
        var self = this;
        var alphaStart = self.options.animate.alpha.from,
            alphaEnd = self.options.animate.alpha.to,
            dAlpha = alphaEnd - alphaStart,
            currAlpha = alphaStart + dAlpha * (1 - self.lifetime / self.options.lifetime);

        self.options.border.color.alpha = currAlpha;
        self.options.color.alpha = currAlpha;

        self.ctx.globalAlpha = currAlpha;
    };

    return Particle;
}();
var ParticleSpawner = function () {

    /**
     * @param ctx
     * @param options
     * @constructor
     */
    function ParticleSpawner(ctx, options) {
        var self = this;

        self.ctx = ctx;
        self.options = Util.extend({}, ParticleSpawner.defaultOptions, options);

        self.particles = [];
        self.isPlaying = false;
        self.isSpawning = false;
        self.framesTillNextSpawn = 0;

        if (self.options.spawnDelay.value === 0) {
            for (var i = 0; i < self.options.maxParticles; i++) {
                self.spawnParticle();
            }
        }
    }

    function applyJitter(prop) {
        return prop.value + Math.randrange(prop.jitter) - prop.jitter / 2;
    }

    ParticleSpawner.prototype.spawnParticle = function () {
        var self = this;
        if (!self.isSpawning) return false;

        var particle = self.options.particle;

        // convert speed / angle combination into velocity vector
        var speed = applyJitter(particle.v),
            angle = applyJitter(particle.angle),
            vx = speed * Math.cos(angle),
            vy = speed * Math.sin(angle),
            vVector = new Vector2(vx, vy);

        // add new particle
        self.particles.push(new Particle(self.ctx, {
            x: applyJitter(particle.x),
            y: applyJitter(particle.y),
            v: vVector,
            lifetime: applyJitter(particle.lifetime),
            gravity: applyJitter(particle.gravity),

            border: {
                width: applyJitter(particle.border.width),
                color: particle.border.color.value
            },
            width: applyJitter(particle.width),
            color: particle.color.value
        }));

        return true;
    };

    ParticleSpawner.prototype.update = function () {
        var self = this;
        if (!self.isPlaying) return;

        // check if new particle must be spawned
        if (self.framesTillNextSpawn > 0) {
            self.framesTillNextSpawn--;
        } else if (self.framesTillNextSpawn === 0 && self.particles.length < self.options.maxParticles) {
            self.spawnParticle();
            self.framesTillNextSpawn = Math.round(applyJitter(self.options.spawnDelay));
        }

        // update all particles
        self.particles.forEach(function (p, i) {
            // TODO make pauseSpawning and reset more elegant
            // was reset if returns true
            if (p.update() && !self.isSpawning) {
                delete self.particles[i];
                self.particles.splice(i, 1);
                if (self.framesTillNextSpawn < 0) self.framesTillNextSpawn = Math.round(applyJitter(self.options.spawnDelay));
            }
        });
    };

    ParticleSpawner.prototype.render = function () {
        var self = this;
        if (!self.isPlaying) return;

        self.ctx.lineCap = 'round';
        self.particles.forEach(function (p) {
            p.render();
        });
    };

    ParticleSpawner.prototype.play = function () {
        var self = this;
        self.isPlaying = true;
        self.playSpawning();
        return self;
    };

    ParticleSpawner.prototype.pause = function () {
        var self = this;
        self.isPlaying = false;
        self.pauseSpawning();
        return self;
    };

    ParticleSpawner.prototype.stop = function () {
        var self = this;
        self.isPlaying = false;
        self.pauseSpawning();
        self.particles.forEach(function (p) {
            p.reset();
        });
    };

    ParticleSpawner.prototype.pauseSpawning = function () {
        var self = this;
        self.isSpawning = false;
    };

    ParticleSpawner.prototype.playSpawning = function () {
        var self = this;
        self.isSpawning = true;
    };

    // TODO particle color jitter
    ParticleSpawner.defaultOptions = {
        maxParticles: 300,
        spawnDelay: {
            value: 1,
            jitter: 0
        },

        particle: {
            x: {
                value: 0,
                jitter: 0
            },
            y: {
                value: 0,
                jitter: 0
            },
            v: {
                value: 10,
                jitter: 1
            },
            angle: {
                value: -Math.PI2,
                jitter: .8
            },
            lifetime: {
                value: 60,
                jitter: 10
            },
            gravity: {
                value: 1,
                jitter: .2
            },
            width: {
                value: 2,
                jitter: 0
            },
            border: {
                width: {
                    value: 0,
                    jitter: 0
                },
                color: {
                    value: '#f00'
                }
            },
            color: {
                value: '#fff'
            }
        }
    };

    return ParticleSpawner;
}();
/**
 * Capitalize string.
 * Example: 'foo'.capitalize() -> 'Foo'
 * @returns {string} - capitalized string
 */
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substring(1);
};
var Util = {
    extend: function extend() {
        var target = arguments[0],
            obj = void 0,
            propName = void 0,
            prop = void 0;

        if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
            target = {};
        }

        for (var i = 1; i < arguments.length; i++) {

            // extend one object
            obj = arguments[i];

            for (propName in obj) {
                if (!obj.hasOwnProperty(propName)) continue;
                prop = obj[propName];

                // recurse if prop is an object // else set primitive prop directly
                if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
                    if (!target[propName]) target[propName] = new prop.constructor();
                    Util.extend(target[propName], prop);
                } else {
                    target[propName] = prop;
                }
            }
        }
        return target;
    }
};

var Vector2 = function () {
    function Vector2(x, y) {
        var self = this;
        self.x = x || 0;
        self.y = y || 0;
    }

    Vector2.prototype.set = function (v2) {
        var self = this;
        self.x = v2.x;
        self.y = v2.y;
    };

    /**
     * Adds either another Vector or two plain numbers to self
     * @param v2 [Vector2|int} - vector or plain x value
     * @param [y] {int} - plain y value
     */
    Vector2.prototype.add = function (v2, y) {
        var self = this;
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
        var self = this;
        self.x -= v2.x;
        self.y -= v2.y;
        return self;
    };

    Vector2.prototype.scale = function (n) {
        var self = this;
        self.x *= n;
        self.y *= n;
        return self;
    };

    Vector2.prototype.getLength = function () {
        var self = this;
        return Math.sqrt(self.x * self.x + self.y * self.y);
    };

    Vector2.prototype.toLength = function (n) {
        var self = this;
        var factor = n / self.getLength();
        self.x *= factor;
        self.y *= factor;
        return self;
    };

    Vector2.prototype.limit = function (n) {
        var self = this;
        var l = self.getLength();
        if (l > Particle.MaxSpeed) {
            var factor = n / l;
            self.x *= factor;
            self.y *= factor;
        }
        return self;
    };

    Vector2.prototype.normalize = function () {
        var self = this;
        var l = self.getLength();
        self.x *= self.x / l;
        self.y *= self.y / l;
        return self;
    };

    Vector2.prototype.clone = function () {
        var self = this;
        return new Vector2(self.x, self.y);
    };

    return Vector2;
}();