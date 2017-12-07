const MouseRocket = (function () {
    /**
     *
     * @param settings
     * @param settings.app
     * @param settings.speed
     * @param settings.turnAcc
     * @param settings.turnSpeedMax
     * @param settings.idleRadius
     * @param settings.img
     * @param settings.scale
     * @class
     * @constructor
     */
    function MouseRocket(settings) {
        const self = this;
        PIXI.Sprite.call(self);

        self.app = settings.app;
        self.speed = settings.speed;
        self.turnAcc = settings.turnAcc;
        self.turnSpeed = 0;
        self.turnSpeedMax = settings.turnSpeedMax;
        self.idleRadius = settings.idleRadius;
        self.scale = {x: settings.scale || 1, y: settings.scale || 1};
        self.anchor = {x: 0, y: .5};

        self.target = null;
        self.lastDeltaPhiSign = 0;

        // create extra shape for the rocket texture to place it over hte particles
        self.rocketSprite = PIXI.Sprite.fromImage('assets/img/rocket.png');
        self.rocketSprite.y = -122;
        self.injectorContainer = new PIXI.Container();
        self.addChild(self.injectorContainer);
        self.addChild(self.rocketSprite);

        self.injectorEmitter = new PIXI.particles.Emitter(self.injectorContainer, [
                PIXI.Texture.fromImage('assets/img/smoke1.png'),
                PIXI.Texture.fromImage('assets/img/smoke2.png'),
            ],
            {
                alpha: {
                    start: 0.5,
                    end: 0.1
                },
                scale: {
                    start: 1.5,
                    end: 1
                },
                color: {
                    start: "ddd7ce",
                    end: "ddd7ce"
                },
                speed: {
                    start: 200,
                    end: 100
                },
                startRotation: {
                    min: 130,
                    max: 230
                },
                lifetime: {
                    min: 0.5,
                    max: 1
                },
                frequency: 0.05,
                maxParticles: 100,
                pos: {
                    x: 50,
                    y: 0
                },
                addAtBack: false,
                spawnType: "circle",
                spawnCircle: {
                    x: 0,
                    y: 0,
                    r: 10
                }
            }
        );
        self.injectorEmitter.emit = true;
        self.injectorEmitter.elapsed = Date.now();
    }


    MouseRocket.prototype = Object.create(PIXI.Sprite.prototype);

    MouseRocket.prototype.update = function () {
        const self = this;
        let mouseX = self.app.renderer.plugins.interaction.mouse.global.x,
            mouseY = self.app.renderer.plugins.interaction.mouse.global.y;
        self.setTarget(mouseX, mouseY);
        self.pursueTarget();


        let now = Date.now();
        self.injectorEmitter.update((now - self.injectorEmitter.elapsed) * 0.001);
        self.injectorEmitter.elapsed = now;
    };

    MouseRocket.prototype.setTarget = function (x, y) {
        const self = this;
        self.target = {
            x: x,
            y: y
        };
    };

    MouseRocket.prototype.pursueTarget = function () {
        const self = this;
        if (!self.target) return;

        let pi2 = 2 * Math.PI,
            phi = self.angleTo(self.target.x, self.target.y),
            deltaPhi = ((phi % pi2 - self.rotation % pi2) + pi2) % pi2,
            deltaPhiSign = deltaPhi < Math.PI ? 1 : -1;

        // calc new turnSpeed
        if(self.lastDeltaPhiSign === deltaPhiSign) self.turnSpeed = Math.min(self.turnSpeed + self.turnAcc, self.turnSpeedMax);
        else self.turnSpeed = self.turnAcc;

        self.lastDeltaPhiSign = deltaPhiSign;

        // calc new rotation
        if (deltaPhi < self.turnSpeed) self.rotation = phi;
        else self.rotation = (self.rotation + deltaPhiSign * self.turnSpeed) % pi2;

        self.x += self.speed * Math.cos(self.rotation);
        self.y += self.speed * Math.sin(self.rotation);
    };

    MouseRocket.prototype.round = function (number, precision) {
        const self = this;
        let exp = Math.pow(10, precision);
        return Math.round(number * exp) / exp;
    };

    MouseRocket.prototype.angleTo = function (x, y) {
        const self = this;
        let dx = x - self.x,
            dy = y - self.y;
        return Math.atan2(dy, dx);
    };

    return MouseRocket;
})();