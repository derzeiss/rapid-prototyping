const ParticleSpawner = (function () {

    /**
     * @param ctx
     * @param options
     * @constructor
     */
    function ParticleSpawner(ctx, options) {
        const self = this;

        self.ctx = ctx;
        self.options = Util.extend({}, ParticleSpawner.defaultOptions, options);

        self.particles = [];
        self.isPlaying = false;
        self.isSpawning = false;
        self.framesTillNextSpawn = 0;

        if (self.options.spawnDelay.value === 0) {
            for (let i = 0; i < self.options.maxParticles; i++) {
                self.spawnParticle();
            }
        }
    }

    function applyJitter(prop) {
        return prop.value + Math.randrange(prop.jitter) - prop.jitter / 2;
    }

    ParticleSpawner.prototype.spawnParticle = function () {
        const self = this;
        if (!self.isSpawning) return false;

        let particle = self.options.particle;

        // convert speed / angle combination into velocity vector
        let speed = applyJitter(particle.v),
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
        const self = this;
        if (!self.isPlaying) return;

        // check if new particle must be spawned
        if (self.framesTillNextSpawn > 0) {
            self.framesTillNextSpawn--;
        } else if (self.framesTillNextSpawn <= 0 && self.particles.length < self.options.maxParticles) {
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
        const self = this;
        if (!self.isPlaying) return;

        self.ctx.lineCap = 'round';
        self.particles.forEach(function (p) {
            p.render();
        });
    };

    ParticleSpawner.prototype.play = function () {
        const self = this;
        self.isPlaying = true;
        self.playSpawning();
        return self;
    };

    ParticleSpawner.prototype.pause = function () {
        const self = this;
        self.isPlaying = false;
        self.pauseSpawning();
        return self;
    };

    ParticleSpawner.prototype.stop = function () {
        const self = this;
        self.isPlaying = false;
        self.pauseSpawning();
        self.particles.forEach(function (p) {
            p.reset();
        });
    };

    ParticleSpawner.prototype.pauseSpawning = function () {
        const self = this;
        self.isSpawning = false;
    };

    ParticleSpawner.prototype.playSpawning = function () {
        const self = this;
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
                jitter: 0,
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
})();