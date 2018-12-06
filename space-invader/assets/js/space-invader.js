(() => {
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.substr(1);
    };

    const Entity = (() => {

        Entity.defaultOptions = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            speed: 3,
            img: null
        };

        function Entity(game, options) {
            const self = this;
            self.game = game;
            self.options = Object.assign({}, Entity.defaultOptions, options);
            self.x = self.options.x;
            self.y = self.options.y;
            self.vx = self.options.vx;
            self.vy = self.options.vy;
            self.speed = self.options.speed;
            self.img = self.options.img;
        }

        Entity.CollideRect = (a, b) => {
            let ax0 = a.x - a.img.width2,
                ax1 = a.x + a.img.width2,
                ay0 = a.y - a.img.height2,
                ay1 = a.y + a.img.height2,
                bx0 = b.x - b.img.width2,
                bx1 = b.x + b.img.width2,
                by0 = b.y - b.img.height2,
                by1 = b.y + b.img.height2;
            return !(ax1 < bx0
                || bx1 < ax0
                || ay1 < by0
                || by1 < ay0);
        };

        Entity.prototype.update = function () {
            const self = this;
            self.x += self.vx;
            self.y += self.vy;
        };

        Entity.prototype.render = function (ctx) {
            const self = this;
            ctx.drawImage(self.img, self.x - self.img.width2, self.y - self.img.height2);
        };

        Entity.prototype.goLeft = function () {
            const self = this;
            self.vx = -self.speed;
        };

        Entity.prototype.goRight = function () {
            const self = this;
            self.vx = self.speed;
        };

        Entity.prototype.stopLeft = function () {
            const self = this;
            if (self.vx < 0) self.vx = 0;
        };

        Entity.prototype.stopRight = function () {
            const self = this;
            if (self.vx > 0) self.vx = 0;
        };

        return Entity;
    })();

    const Player = (() => {

        function Player(game, options) {
            const self = this;
            Entity.call(self, game, options);
            self.reloadTime = 0;
        }

        Player.prototype = Object.create(Entity.prototype);

        Player.prototype.routeMovement = function (fnPrefix, ev) {
            const self = this;

            if (ev.repeat) return;

            switch (ev.keyCode) {
                case KEY.LEFT:
                    self[fnPrefix + 'Left']();
                    break;
                case KEY.RIGHT:
                    self[fnPrefix + 'Right']();
                    break;
                case KEY.SPACE:
                    if (fnPrefix === 'go') self.shoot();
                    break;
            }
        };

        Player.prototype.onKeydown = function (ev) {
            const self = this;
            self.routeMovement('go', ev);
        };

        Player.prototype.onKeyup = function (ev) {
            const self = this;
            self.routeMovement('stop', ev);
        };

        Player.prototype.shoot = function () {
            const self = this;
            if(self.reloadTime > 0) return;
            self.game.createEntity(Bullet, 'bullet', self.x, self.y);
            self.reloadTime = 30;

        };

        Player.prototype.update = function () {
            const self = this;
            self.reloadTime--;

            self.game.enemies.forEach((e) => {
                if (Entity.CollideRect(self, e)) {
                    self.game.createEntity(Fx, 'explosionShip', self.x, self.y);
                    self.game.removeEntity(self);
                    self.game.removeEntity(e);
                    self.game.loose();
                }
            });

            self.x = Math.min(self.game.width - self.img.width2, Math.max(self.img.width2, self.x + self.vx));
            self.y += self.vy;
        };

        return Player;
    })();

    const Enemy = (function () {
        Enemy.defaultOptions = {
            speed: 2
        };

        function Enemy(game, options) {
            const self = this;
            options = Object.assign({}, Enemy.defaultOptions, options);
            Entity.call(self, game, options);
        }

        Enemy.prototype = Object.create(Entity.prototype);

        return Enemy;
    })();

    const Bullet = (function () {
        Bullet.defaultOptions = {
            speed: -5,
            rotationSpeed: .2
        };

        function Bullet(game, options) {
            const self = this;
            options = Object.assign({}, Bullet.defaultOptions, options);
            Entity.call(self, game, options);
            self.vy = self.options.speed;
            self.visibleIn = {
                x0: 0 - self.img.width2,
                x1: self.game.width + self.img.width2,
                y0: 0 - self.img.height2,
                y1: self.game.height + self.img.height2
            };

            self.rotation = 0;
            self.rotationSpeed = self.options.rotationSpeed;
        }

        Bullet.prototype = Object.create(Entity.prototype);

        Bullet.prototype.update = function () {
            const self = this;
            self.rotation = (self.rotation + self.rotationSpeed) % 6.282;

            if (self.x < self.visibleIn.x0 || self.x > self.visibleIn.x1
                || self.y < self.visibleIn.y0 || self.y > self.visibleIn.y1) {
                self.game.removeEntity(self);
            } else {
                let hit = false;
                for (let i = 0; i < self.game.enemies.length; i++) {
                    let enemy = self.game.enemies[i];
                    if (Entity.CollideRect(self, enemy)) {
                        self.game.createEntityEx(Fx, {
                            gfx: 'explosion',
                            x: enemy.x,
                            y: enemy.y,
                            duration: 20,
                            from: {
                                scale: 0,
                                alpha: 1.4
                            },
                            to: {
                                scale: 2.3,
                                alpha: 0
                            }
                        });
                        self.game.removeEntity(self);
                        self.game.removeEntity(enemy);
                        hit = true;
                        break;
                    }
                }
                if (!hit) self.y += self.vy
            }
        };

        Bullet.prototype.render = function (ctx) {
            const self = this;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, self.x, self.y); // set translation
            ctx.rotate(self.rotation); // rotate image
            ctx.drawImage(self.img, -self.img.width / 2, -self.img.height / 2);
            ctx.restore();
        };


        return Bullet;
    })();

    const Text = (function () {

        Text.defaultOptions = {
            borderWidth: 1,
            borderColor: '#fff',
            color: '#000',
            fontSize: 50,
            fontFamily: 'monospace',
            maxWidth: null,
            textAlign: 'center',
            textBaseline: 'middle'
        };

        function Text(game, options) {
            const self = this;
            options = Object.assign({}, Text.defaultOptions, options);
            Entity.call(self, game, options);
            self.text = options.text;

            self.borderWidth = options.borderWidth;
            self.borderColor = options.borderColor;
            self.color = options.color;
            self.fontSize = options.fontSize;
            self.fontFamily = options.fontFamily;
            self.font = self.fontSize + 'px ' + self.fontFamily;
            self.maxWidth = options.maxWidth;
            self.textAlign = options.textAlign;
            self.textBaseline = options.textBaseline;
        }

        Text.prototype = Object.create(Entity.prototype);

        Text.prototype.update = function () {
        };

        Text.prototype.render = function (ctx) {
            const self = this;

            ctx.font = self.font;
            ctx.textAlign = self.textAlign;
            ctx.textBaseline = self.textBaseline;

            ctx.fillStyle = self.color;
            ctx.fillText(self.text, self.x, self.y, self.maxWidth);
            if (self.borderColor) {
                ctx.strokeStyle = self.borderColor;
                ctx.lineWidth = self.borderWidth;
                ctx.strokeText(self.text, self.x, self.y, self.maxWidth);
            }
        };

        return Text;
    })();

    const Fx = (function () {

        Fx.defaultOptions = {
            duration: 60,
            from: {
                dx: 0,
                dy: 0,
                alpha: .9
            },
            to: {
                dx: 0,
                dy: -10,
                alpha: 0
            }
        };

        function Fx(game, options) {
            const self = this;
            options = Object.assign({}, Fx.defaultOptions, options);
            Entity.call(self, game, options);

            self.duration = options.duration;
            self.from = options.from;
            self.to = options.to;

            self.x0 = self.x;
            self.y0 = self.y;
            self.width0 = self.width = self.img.width;
            self.height0 = self.height = self.img.height;

            self.lifetime = 0;
            self.animProps = [];

            self.init();
        }

        Fx.prototype = Object.create(Entity.prototype);

        Fx.prototype.init = function () {
            const self = this;

            let fromKeys = Object.keys(self.from),
                toKeys = Object.keys(self.to);
            fromKeys.forEach(function (prop) {
                if (toKeys.indexOf(prop) > -1) {
                    self.animProps.push(prop);
                    let fn = self['init' + prop.capitalize()];
                    if (typeof fn === 'function') fn.call(self);
                }
            });
        };

        Fx.prototype.update = function () {
            const self = this;
            if (self.lifetime > self.duration) return self.game.removeEntity(self);
            self.lifetime++;
        };

        Fx.prototype.render = function (ctx) {
            const self = this;

            ctx.save();

            self.animProps.forEach((prop) => {
                let fn = self['animate' + prop.capitalize()];
                if (typeof fn === 'function') fn.call(self, ctx);
            });

            ctx.drawImage(self.img, self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
            ctx.restore();
        };

        Fx.prototype.initDx = function () {
            const self = this;
            self.x += self.from.dx;
            self.dxStep = (self.to.dx - self.from.dx) / self.duration;
        };

        Fx.prototype.animateDx = function () {
            const self = this;
            self.x += self.dxStep;
        };

        Fx.prototype.initDy = function () {
            const self = this;
            self.y += self.from.dy;
            self.dyStep = (self.to.dy - self.from.dy) / self.duration;
        };

        Fx.prototype.animateDy = function () {
            const self = this;
            self.y += self.dyStep;
        };

        Fx.prototype.initAlpha = function () {
            const self = this;
            self.alpha = self.from.alpha;
            self.alphaStep = (self.to.alpha - self.from.alpha) / self.duration;
        };

        Fx.prototype.animateAlpha = function (ctx) {
            const self = this;
            ctx.globalAlpha = self.alpha;
            self.alpha = Math.max(0, self.alpha + self.alphaStep);
        };

        Fx.prototype.initScale = function () {
            const self = this;
            self.width *= self.from.scale;
            self.height *= self.from.scale;
            self.scale = self.from.scale;
            self.scaleStep = (self.to.scale - self.from.scale) / self.duration;
        };

        Fx.prototype.animateScale = function () {
            const self = this;
            self.width = self.width0 * self.scale;
            self.height = self.height0 * self.scale;
            self.scale += self.scaleStep;
        };


        return Fx;
    })();

    const Game = (() => {

        Game.defaultOptions = {
            canvasId: 'space-invader',
            width: 600,
            height: 400,
            showFps: false,
            gfx: {
                player: 'assets/img/worker-48.png',
                enemy: 'assets/img/home-48.png',
                bullet: 'assets/img/energy-meter-32.png',
                explosion: 'assets/img/idea-48.png',
                explosionShip: 'assets/img/rip-48.png'
            },
            enemies: {
                x: 6,
                y: 3,
                spacingX: 1.2,
                spacingY: 1
            }
        };

        function Game(options) {
            const self = this;
            self.options = Object.assign({}, Game.defaultOptions, options);
            self.canvas = document.getElementById(self.options.canvasId);
            self.ctx = self.canvas.getContext('2d');
            self.width = self.options.width;
            self.height = self.options.height;
            self.canvas.width = self.width;
            self.canvas.height = self.height;
            self.assets = new Assets();
            self.entities = [];
            self.enemies = [];
            self.enemyDirection = 1;
            self.isRunning = false;
            if (self.options.showFps) self.fps = new Fps();

            self.loadAssets();

            self.canvas.addEventListener('click', self.reset.bind(self));
        }

        Game.prototype.loadAssets = function () {
            const self = this;
            for (let name in self.options.gfx) {
                if (!self.options.gfx.hasOwnProperty(name)) continue;
                self.assets.add(name, self.options.gfx[name]);
            }
            self.assets.load(self.init.bind(self));
        };

        Game.prototype.init = function () {
            const self = this;

            // add player
            self.player = self.createEntity(Player, 'player', self.width / 2, self.height - self.assets.get('player').height2 - 20);
            self.handlerKeydown = self.player.onKeydown.bind(self.player);
            self.handlerKeyup = self.player.onKeyup.bind(self.player);
            window.addEventListener('keydown', self.handlerKeydown);
            window.addEventListener('keyup', self.handlerKeyup);

            // add enemies
            let img = self.assets.get('enemy'),
                spacingX = img.width * self.options.enemies.spacingX,
                spacingX2 = spacingX / 2,
                marginX = (self.width - self.options.enemies.x * spacingX) / 2,
                spacingY = img.height * self.options.enemies.spacingY,
                spacingY2 = spacingY / 2;
            for (let y = 0; y < self.options.enemies.y; y++) {
                for (let x = 0; x < self.options.enemies.x; x++) {
                    self.createEntity(Enemy, 'enemy', marginX + spacingX2 + x * spacingX, spacingY2 + y * spacingY, true);
                }
            }
            self.isRunning = true;

            self.mainloop();
        };

        Game.prototype.reset = function () {
            const self = this;
            if (self.isRunning) return;

            Object.assign([], self.entities).forEach((e) => {
                self.removeEntity(e);
            });
            window.removeEventListener('keydown', self.handlerKeydown);
            window.removeEventListener('keyup', self.handlerKeyup);
            self.init();
        };

        Game.prototype.mainloop = function () {
            const self = this;

            if (self.options.showFps) self.fps.increase();

            self.calcEnemyMovement();

            // update
            self.entities.forEach((e) => e.update());

            // render
            self.ctx.clearRect(0, 0, self.width, self.height);
            self.entities.forEach((e) => e.render(self.ctx));

            if (self.isRunning) window.requestAnimationFrame(self.mainloop.bind(self));
        };

        Game.prototype.createEntity = function (cls, gfx, x, y) {
            const self = this;
            return self.createEntityEx(cls, {
                x: x,
                y: y,
                gfx: gfx
            });
        };

        Game.prototype.createEntityEx = function (cls, options) {
            const self = this;
            if (options.gfx) options.img = self.assets.get(options.gfx);

            let entity = new cls(self, options);
            self.entities.push(entity);
            if (cls === Enemy) self.enemies.push(entity);
            return entity;
        };

        Game.prototype.removeEntity = function (entity) {
            const self = this;
            let index = self.entities.indexOf(entity);
            if (index < 0) return;
            self.entities.splice(index, 1);
            index = self.enemies.indexOf(entity);
            if (index > -1) {
                self.enemies.splice(index, 1);
                if (self.enemies.length <= 0 && self.isRunning) self.win();
            }
        };

        Game.prototype.calcEnemyMovement = function () {
            const self = this;
            let xMin = Number.MAX_VALUE,
                xMax = 0,
                img = self.assets.get('enemy'),
                vx = 0,
                vy = 0;

            // get leftmost and rightmost enemies x-coordinate
            self.enemies.forEach((e) => {
                if (e.x < xMin) xMin = e.x;
                if (e.x > xMax) xMax = e.x;

                // check if enemy sneaked through
                if (e.y > self.height) return self.loose();
            });

            // calc enemy x-movement
            if (self.enemyDirection > 0) {  // moving right
                if (xMax < self.width - img.width2) vx = 1;
                else {  // collided with screen border -> come one row closer
                    self.enemyDirection *= -1;
                    vy = 1;
                }
            } else { // moving left
                if (xMin > img.width2) vx = -1;  // keep moving
                else {  // collided with screen border -> come one row closer
                    self.enemyDirection *= -1;
                    vy = 1;
                }
            }

            self.enemies.forEach((e) => {
                e.vx = vx * e.speed;
                e.vy = vy ? e.img.height * self.options.enemies.spacingY : 0;
            });
        };

        Game.prototype.showText = function (text) {
            const self = this;

            self.createEntityEx(Text, {
                x: self.width / 2,
                y: self.height / 2,
                maxWidth: self.width,
                text: text
            });
        };

        Game.prototype.showMetaText = function (text) {
            const self = this;
            self.createEntityEx(Text, {
                x: self.width / 2,
                y: self.height / 2 + 55,
                borderColor: null,
                color: '#fff',
                fontSize: 20,
                maxWidth: self.width,
                text: text,
            });
        };

        Game.prototype.loose = function () {
            const self = this;
            self.showText('GAME OVER');
            self.showMetaText('( click anywhere to play again )');
            self.isRunning = false;
        };

        Game.prototype.win = function () {
            const self = this;
            self.showText('YOU WON!');
            self.showMetaText('( click anywhere to play again )');
            self.isRunning = false;
        };

        return Game;
    })();

    const Assets = (function () {
        function Assets() {
            const self = this;
            self.assets = {};
            self.queue = [];
            self.loaded = 0; // 0 = not loaded; 1 = loading; 2 = loaded;
            self.progress = null;
        }

        Assets.prototype.add = function (name, path) {
            const self = this;
            if (self.loaded) throw new Error('Asset added after assets are loaded');
            self.queue.push({name: name, path: path});
        };

        Assets.prototype.get = function (name) {
            const self = this;
            return self.assets[name];
        };

        Assets.prototype.load = function (cb) {
            const self = this;
            if (self.loaded) throw new Error('Asset loading already in progress');
            self.loaded = 1;
            self.progress = {
                total: Object.keys(self.queue).length,
                current: 0
            };
            if (self.queue.length === 0) {
                console.warn('No assets in queue');
                cb();
            }
            self.queue.forEach((item) => {
                let img = new Image();
                img.onload = () => {
                    img.width2 = img.width / 2;
                    img.height2 = img.height / 2;
                    if (self.assets[item.name]) console.warn(`Overwriting asset "${item.name}"`);
                    self.assets[item.name] = img;
                    if (self.onProgress()) cb();
                };
                img.src = item.path;
            });
        };

        Assets.prototype.onProgress = function () {
            const self = this;
            return ++self.progress.current >= self.progress.total;
        };

        return Assets;
    })();

    const Fps = (function () {
        function Fps() {
            const self = this;
            self._current = 0;
            setTimeout(self.print.bind(self), 1000);
        }

        Fps.prototype.print = function () {
            const self = this;
            console.log('FPS:', self._current);
            self._current = 0;
            setTimeout(self.print.bind(self), 1000);
        };

        Fps.prototype.increase = function () {
            const self = this;
            self._current++;
        };

        return Fps;
    })();

    const KEY = {
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    new Game();
})();