const C = {
    particle: {
        speedMax: 12,
        radius: 1,
        color: '#fff'
    },
    orb: {
        defaultGravity: 0.05,
        radius: 5,
        color: '#f00'
    },
    app: {
        canvasId: "app",
        background: '#000'
    },
    debug: true
};

const debug = {
    log: function (...args) {
        if (C.debug) console.log(...args);
    }
};

Math.randrange = function (min, max) {
    console.log('T1', min, max);
    if (max === undefined || max === null) {
        max = min;
        min = 0;
    }
    let r = Math.random(),
        rr = Math.floor(r * (max - min) + min);
    console.log('T2', min, max, r, rr);
    return rr;
};

(function () {
    let result = {};
})();


/**
 * Vector
 */
const Vector = (function () {
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    // class methods
    Vector.sub = function (a, b) {
        return new Vector(a.x - b.x, a.y - b.y);
    };

    Vector.random = function () {
        return new Vector(Math.random(), Math.random());
    };

    // instance methods
    Vector.prototype.add = function (v) {

        this.x += v.x;
        this.y += v.y;
        return this;
    };

    Vector.prototype.scale = function (factor) {
        if (factor === undefined || factor === null) return this;
        this.x *= factor;
        this.y *= factor;
        return this;
    };

    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vector.prototype.normalize = function () {
        let len = this.length();
        if (len) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    };

    return Vector;
})();

/**
 * Particle
 */
const Particle = (function () {
    function Particle(x, y, speed) {
        Vector.call(this, x, y);
        this._latest = new Vector(x, y);

        // set speed
        if (speed) this._speed = speed;
        else this._speed = new Vector();
    }

    Particle.prototype = Object.create(Vector.prototype);

    Particle.prototype.update = function () {
        // limit speed
        if (this._speed.length() > C.particle.speedMax) {
            this._speed.normalize().scale(C.particle.speedMax);
        }

        // save latest pos
        this._latest.x = this.x;
        this._latest.y = this.y;

        // update position from speed
        this.add(this._speed);
    };

    Particle.prototype.accelerate = function (v) {
        this._speed.add(v);
    };

    Particle.prototype.render = function (ctx) {

        ctx.fillLine(this, this._latest, C.particle.radius * 2, C.particle.color);
        ctx.fillCircle(this, C.particle.radius, C.particle.color);
    };

    return Particle;
})();

/**
 * Orb
 */
const Orb = (function () {
    function Orb(x, y) {
        Vector.call(this, x, y);

        this.gravity = C.orb.defaultGravity;
    }

    Orb.prototype = Object.create(Vector.prototype);

    Orb.prototype.update = function (particles) {
        const self = this;
        let dv;
        particles.forEach(function (particle) {
            dv = Vector.sub(self, particle);
            particle.accelerate(dv.normalize().scale(this.gravity));
        });
    };

    Orb.prototype.render = function (ctx) {
        ctx.fillCircle(this, C.orb.radius, C.orb.color);
    };

    return Orb;
})();

const App = (function () {
    function App() {
        this.particles = [];
        this.orbs = [];
        this.width = 0;
        this.height = 0;

        this.canvas = document.getElementById(C.app.canvasId);
        this.ctx = this.getCtx(this.canvas);
    }

    /**
     * @param canvas {HTMLCanvasElement}
     * @returns {CanvasRenderingContext2D}
     */
    App.prototype.getCtx = function (canvas) {
        let ctx = canvas.getContext("2d");

        /**
         * @param v {Vector}
         * @param radius {int}
         * @param col {str}
         */
        ctx.fillCircle = function (v, radius, col) {
            ctx.save();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(v.x, v.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        };

        /**
         * @param v0 {Vector}
         * @param v1 {Vector}
         * @param width {int}
         * @param col {str}
         */
        ctx.fillLine = function (v0, v1, width, col) {
            ctx.save();
            ctx.lineWidth = width;
            ctx.strokeStyle = col;
            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.stroke();
            ctx.restore();
        };
        return ctx;
    };

    App.prototype.onResize = function () {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    };

    App.prototype.onClick = function(ev) {
        this.addOrb(ev.x, ev.y);
    };

    App.prototype.addOrb = function (x, y) {
        this.orbs.push(new Orb(x, y));
    };

    App.prototype.addParticle = function (x, y, speed) {
        this.particles.push(new Particle(x, y, speed));
    };

    App.prototype.init = function () {
        // add resize listener
        this.onResize();
        window.addEventListener('resize', this.onResize.bind(this));

        // add orb listeners
        window.addEventListener('click', this.onClick.bind(this));

        // add test entities
        for (let i = 0; i < 100; i++) {
            this.addParticle(Math.randrange(this.width), Math.randrange(this.height), Vector.random());
        }
        this.addOrb(Math.randrange(this.width), Math.randrange(this.height));

        // start mainloop
        this.mainloop();
    };

    App.prototype.mainloop = function () {
        const self = this;
        // update
        self.orbs.forEach(function (orb) {
            orb.update(self.particles);
        });

        self.particles.forEach(function (particle) {
            particle.update();
        });

        // render
        this.ctx.fillStyle = C.app.background;
        self.ctx.fillRect(0, 0, self.width, self.height);

        self.orbs.forEach(function (orb) {
            orb.render(self.ctx);
        });

        self.particles.forEach(function (particle) {
            particle.render(self.ctx);
        });

        // request next frame
        window.requestAnimationFrame(self.mainloop.bind(self));
    };

    return App;
})();

new App().init();
