String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substr(1);
};

Math.PI2 = 2 * Math.PI;

const KEY = {
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    q: 81,
    w: 87,
    a: 65,
    d: 68
};

const Entity = (() => {

    Entity.defaultOptions = {
        x: 0,
        y: 0,
        img: null
    };

    function Entity(game, options) {
        const self = this;
        self.options = Object.assign({}, Entity.defaultOptions, options);

        self.game = game;
        self.x = self.options.x;
        self.y = self.options.y;
        self.img = self.options.img;
        self.inCollisionGroups = [];

        self._type = 'Entity';
    }

    Entity.CollideRect = (a, b) => {
        let ax0 = a.x - a.img.width_2,
            ax1 = a.x + a.img.width_2,
            ay0 = a.y - a.img.height_2,
            ay1 = a.y + a.img.height_2,
            bx0 = b.x - b.img.width_2,
            bx1 = b.x + b.img.width_2,
            by0 = b.y - b.img.height_2,
            by1 = b.y + b.img.height_2;
        return !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
    };

    Entity.prototype.onCollision = function (entity, mapping) {
    };

    Entity.prototype.onRemove = function () {
    };

    Entity.prototype.update = function () {
    };

    Entity.prototype.render = function (ctx) {
        const self = this;
        ctx.drawImage(self.img, self.x - self.img.width_2, self.y - self.img.height_2);
    };

    Entity.prototype.removeFromList = function (list) {
        const self = this;
        let index = list.indexOf(self);
        if (index > -1) list.splice(index, 1);
    };

    return Entity;
})();

const Moveable = (function () {
    // extends Entity

    Moveable.defaultOptions = {
        vx: 0,      // speed on x-axis
        vy: 0,      // speed on y-axis
        a: 0,       // current acceleration
        aMax: .25,   // max acceleration
        vMax: 3,    // max speed
        r: 0,       // rotation [0, 2*Pi]
        rV: 0,      // current rotation speed
        rVMax: .08, // max rotation speed
        damp: .99   // speed damp factor (vNew = vOld * damp)
    };

    function Moveable(game, options) {
        const self = this;
        self.options = options = Object.assign({}, Moveable.defaultOptions, options);
        Entity.call(self, game, options);

        self.vx = self.options.vx;
        self.vy = self.options.vy;
        self.a = self.options.a;
        self.aMax = self.options.aMax;
        self.vMax = self.options.vMax;

        self.r = self.options.r;
        self.rV = self.options.rV;
        self.rVMax = self.options.rVMax;

        self.damp = self.options.damp;

        self._type = 'Moveable';
    }

    Moveable.prototype = Object.create(Entity.prototype);

    Moveable.prototype.update = function () {
        const self = this;
        self.r = (self.r + self.rV) % Math.PI2;

        self.vx = (self.vx + self.a * Math.cos(self.r)) * self.damp;
        self.vy = (self.vy + self.a * Math.sin(self.r)) * self.damp;

        self.x += self.vx;
        self.y += self.vy;
    };

    Moveable.prototype.render = function (ctx) {
        const self = this;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, self.x, self.y); // set translation
        ctx.rotate(self.r); // rotate image
        ctx.drawImage(self.img, -self.img.width_2, -self.img.height_2);
        ctx.restore();
    };

    return Moveable;
})();


const Player = (() => {
    // extends Moveable

    let idCounter = 1;

    Player.defaultOptions = {
        keys: {
            left: KEY.LEFT,
            right: KEY.RIGHT,
            acc: KEY.UP,
            shoot: KEY.SPACE
        }
    };

    function Player(game, options) {
        const self = this;
        self.options = options = Object.assign({}, Player.defaultOptions, options);
        Moveable.call(self, game, options);
        if(!self.name) self.name = `Player ${idCounter++}`;
        self.handler = {};

        self._type = 'Player';
        self.init();
    }

    Player.prototype = Object.create(Moveable.prototype);

    Player.prototype.init = function () {
        const self = this;

        // add listeners. The handlers are removed in onRemove()
        self.handler.keydown = self.onKeydown.bind(self);
        self.handler.keyup = self.onKeyup.bind(self);
        window.addEventListener('keydown', self.handler.keydown);
        window.addEventListener('keyup', self.handler.keyup);

        // add to collision group
        self.game.addToCollisionGroup('player', self);
    };

    Player.prototype.update = function () {
        const self = this;
        Moveable.prototype.update.call(self);

        if (self.x < 0) self.x = self.game.width;
        else if (self.x > self.game.width) self.x = 0;
        if (self.y < 0) self.y = self.game.height;
        else if (self.y > self.game.height) self.y = 0;
    };

    Player.prototype.onRemove = function () {
        const self = this;
        // remove listeners added in init()
        window.removeEventListener('keydown', self.handler.keydown);
        window.removeEventListener('keyup', self.handler.keyup);
    };

    Player.prototype.onCollision = function (entity) {
        const self = this;
        self.game.createEntity(Fx, 'explosionShip', self.x, self.y);
        self.game.removeEntity(self);

        if (entity._type === 'Player') {
            self.game.createEntity(Fx, 'explosionShip', entity.x, entity.y);
        }
        self.game.removeEntity(entity);
        self.game.loose();
    };

    Player.prototype.onKeydown = function (ev) {
        const self = this;
        if (ev.repeat) return;

        switch (ev.keyCode) {
            case self.options.keys.left:
                self.rotateLeft();
                break;
            case self.options.keys.right:
                self.rotateRight();
                break;
            case self.options.keys.acc:
                self.accelerate();
                break;
            case self.options.keys.shoot:
                self.shoot();
                break;
        }
    };

    Player.prototype.onKeyup = function (ev) {
        const self = this;

        switch (ev.keyCode) {
            case self.options.keys.left:
                self.stopRotateLeft();
                break;
            case self.options.keys.right:
                self.stopRotateRight();
                break;
            case self.options.keys.acc:
                self.stopAccelerate();
                break;
        }
    };

    Player.prototype.accelerate = function () {
        const self = this;
        self.a = self.aMax;
    };

    Player.prototype.rotateLeft = function () {
        const self = this;
        self.rV = -self.rVMax;
    };

    Player.prototype.rotateRight = function () {
        const self = this;
        self.rV = self.rVMax;
    };

    Player.prototype.stopRotateLeft = function () {
        const self = this;
        if (self.rV < 0) self.rV = 0;
    };

    Player.prototype.stopRotateRight = function () {
        const self = this;
        if (self.rV > 0) self.rV = 0;
    };

    Player.prototype.stopAccelerate = function () {
        const self = this;
        self.a = 0;
    };

    Player.prototype.shoot = function () {
        const self = this;
        let bullet = self.game.createEntityEx(Bullet, {
            gfx: 'bullet',
            player: self
        });
        self.game.addToCollisionGroup('bullets', bullet);
    };

    return Player;
})();

const Bullet = (function () {
    // extends Moveable

    Bullet.defaultOptions = {
        v0: 12,  // bullet speed (added to player speed)
        a: 0,
        damp: 1
    };

    function Bullet(game, options) {
        const self = this;
        self.options = Object.assign({}, Bullet.defaultOptions, options);
        Moveable.call(self, game, self.options);
        self._type = 'Bullet';

        self.init();
    }

    Bullet.prototype = Object.create(Moveable.prototype);

    Bullet.prototype.init = function () {
        const self = this;
        if (!self.options.player) throw new Error('No player option provided for bullet');
        let p = self.options.player,
            v0 = typeof self.options.v0 === 'number' ? self.options.v0 : 0;
        self.r = p.r;
        self.x = p.x;
        self.y = p.y;
        self.vx = v0 * Math.cos(self.r);
        self.vy = v0 * Math.sin(self.r);
    };

    Bullet.prototype.onCollision = function (entity) {
        const self = this;
        self.game.removeEntity(self);
        self.game.removeEntity(entity);
        self.game.setScore();

        self.game.createEntityEx(Fx, {
            gfx: 'explosion',
            x: entity.x,
            y: entity.y,
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
    };

    Bullet.prototype.update = function () {
        const self = this;
        Moveable.prototype.update.call(self);

        // remove bullet if it's out of screen bounds
        if (self.x < 0 || self.x > self.game.width || self.y < 0 || self.y > self.game.height) {
            self.game.removeEntity(self);
        }
    };

    return Bullet;
})();

const Comet = (function () {
    // extends Moveable

    Comet.defaultOptions = {
        a: 0,
        damp: 1,
        rGfx: 0,    // graphic rotation
        rGfxV: .02,    // graphic rotation speed
        isEnteringFrames: 120, // time in frames until a comet that did not enter the screen is removed
    };

    function Comet(game, options) {
        const self = this;
        self.options = Object.assign({}, Comet.defaultOptions, options);
        Moveable.call(self, game, self.options);
        self.rGfx = self.options.rGfx;
        self.rGfxV = self.options.rGfxV;

        // comet enters screen from out of bounds -> would usually be deleted instantly
        // -> decrease isEntering by 1 every frame comet is not in Bounds.
        //    If the comet gets inside bounds isEntering is set to 0 immediately (0 = false)
        //    If isEntering is 0 and comet gets out of bounds its removed
        self.isEntering = self.options.isEnteringFrames;

        self._type = 'Comet';
    }

    Comet.prototype = Object.create(Moveable.prototype);

    Comet.prototype.update = function () {
        const self = this;
        Moveable.prototype.update.call(self);

        // comet is out of screen bounds
        if (self.x < 0 || self.x > self.game.width || self.y < 0 || self.y > self.game.height) {
            // comet wasn't in bounds before and entering period ends this frame -> remove it
            if (self.isEntering === 1) self.game.removeEntity(self);

            // comet wasn't in bounds before but is still in entering period -> decrease time left to enter bounds
            if (self.isEntering > 0) self.isEntering--;

            // comet was in bounds before -> place it at the other end of the screen
            if (!self.isEntering) {
                if (self.x < 0) self.x = self.game.width;
                else if (self.x > self.game.width) self.x = 0;
                if (self.y < 0) self.y = self.game.height;
                else if (self.y > self.game.height) self.y = 0;
            }
        } else if (self.isEntering) {
            self.isEntering = 0;
        }

        // rotate gfx
        self.rGfx += self.rGfxV;
    };

    Comet.prototype.render = function (ctx) {
        const self = this;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, self.x, self.y); // set translation
        ctx.rotate(self.rGfx); // rotate image
        ctx.drawImage(self.img, -self.img.width_2, -self.img.height_2);
        ctx.restore();
    };

    return Comet;
})();

const Game = (() => {

    Game.defaultOptions = {
        canvasId: 'comet-shooter',
        width: 800,
        height: 600,
        showFps: true,
        cometSpawnRate: { // proximity per frame that a new comet spawns
            initial: .01,
            increase: .001,
            max: .2
        },
        maxComets: 10,
        cometMaxSpeed: 2,
        cometStartingPositionOffset: 30,  // offset in px from the screen edge
        gfx: {
            player: 'assets/img/shuttle-48.png',
            bullet: 'assets/img/bullet-16.png',
            comet32: 'assets/img/planet-32.png',
            comet48: 'assets/img/planet-48.png',
            comet64: 'assets/img/planet-64.png',
            explosion: 'assets/img/explosion-enemy-48.png',
            explosionShip: 'assets/img/rip-48.png'
        }
    };

    function Game(options) {
        const self = this;
        self.options = Object.assign({}, Game.defaultOptions, options);

        self.width = self.options.width;
        self.height = self.options.height;

        self.entities = [];
        self.isRunning = false;
        self.handler = {};
        self.collisionGroups = {};
        self.collisionGroupMappings = [];

        self.cometSpawnRate = null;  // set in init
        self.maxComets = self.options.maxComets;
        self.cometMaxSpeed = self.options.cometMaxSpeed;

        self.canvas = document.getElementById(self.options.canvasId);
        self.ctx = self.canvas.getContext('2d');
        self.canvas.width = self.width;
        self.canvas.height = self.height;

        self.statistics = {
            shots: 0,
            hits: 0
        };
        self.el = {};
        self.players = [];


        if (self.options.showFps) self.fps = new Fps();
        self.assets = new Assets();
        self.loadAssets();
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

        self.cometSpawnRate = self.options.cometSpawnRate.initial;

        // add player
        self.player = self.createEntity(Player, 'player', self.width / 2, self.height / 2);
        self.addToCollisionGroup('player', self.player);

        // add player 2
        self.player2 = self.createEntityEx(Player, {
            gfx: 'player',
            x: self.width / 5,
            y: self.height / 5,
            keys: {
                left: KEY.a,
                right: KEY.d,
                acc: KEY.w,
                shoot: KEY.q
            }
        });
        self.addToCollisionGroup('player', self.player2);


        self.addCollisionGroupMapping('player', 'player');
        self.addCollisionGroupMapping('player', 'comets');
        self.addCollisionGroupMapping('player', 'bullet');
        self.addCollisionGroupMapping('bullets', 'comets');

        self.canvas.addEventListener('click', self.reset.bind(self));
        self.isRunning = true;

        // create score counter
        let top = self.canvas.offsetTop + 10,
            right = window.innerWidth - (self.canvas.offsetLeft + self.canvas.offsetWidth) + 10 + 'px';
        self.el.score = self._createTextElement(top + 'px', right);
        self.el.accuracy = self._createTextElement(top + 20 + 'px', right);
        self.setScore(0);

        self.mainloop();
    };

    Game.prototype.createPlayer = function () {
        const self = this;

    };

    Game.prototype._createTextElement = function (pTop, pRight) {

        let el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.top = pTop;
        el.style.right = pRight;
        el.style.color = '#fff';
        el.style.font = '400 18px monospace';
        el.style.textShadow = '0 0 3px #000';
        document.body.appendChild(el);

        return el;
    };

    Game.prototype.reset = function () {
        const self = this;
        if (self.isRunning) return;

        Object.assign([], self.entities).forEach((e) => {
            self.removeEntity(e);
        });

        // self.scoreCounter.parentNode.removeChild(self.scoreCounter);
        self.init();
    };

    Game.prototype.mainloop = function () {
        const self = this;

        if (self.options.showFps) self.fps.increase();

        // handle collisions
        self.handleCollisions();

        // add new comets
        self.addComets();

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
        return entity;
    };

    Game.prototype.removeEntity = function (entity) {
        const self = this;

        // fire entity callback
        entity.onRemove();

        // remove from global entity list
        entity.removeFromList(self.entities);

        // remove from collision groups
        entity.inCollisionGroups.forEach((name) => {
            entity.removeFromList(self.collisionGroups[name]);
        });

        self.updateCollisionGroupMappings();

    };

    /**
     * Add entity to a collision group. Creates specified group if it doesn't exist
     * @param group {string} - collision group name
     * @param entity {Entity} - entity to add to group
     */
    Game.prototype.addToCollisionGroup = function (group, entity) {
        const self = this;
        if (entity.inCollisionGroups.indexOf(group) > -1) return;
        if (!self.collisionGroups[group]) self.collisionGroups[group] = [];
        self.collisionGroups[group].push(entity);
        entity.inCollisionGroups.push(group);
        self.updateCollisionGroupMappings();
    };

    /**
     * Map two collision groups together so that they'll be checked for collision.
     * @param group1 {string} - group name
     * @param group2 {string} - group name
     */
    Game.prototype.addCollisionGroupMapping = function (group1, group2) {
        const self = this;
        if (!group1 || !group2) return;
        let groups = Object.keys(self.collisionGroups),
            mapping = {g1: group1, g2: group2, isActive: true};
        if (groups.indexOf(group1) < 0 || groups.indexOf(group2) < 0) mapping.isActive = false;
        self.collisionGroupMappings.push(mapping);
    };

    /**
     * Update isActive flag of collision mappings. Check if there's at least one element on both collision groups
     */
    Game.prototype.updateCollisionGroupMappings = function () {
        const self = this;
        self.collisionGroupMappings.forEach((mapping) => {
            let g1 = self.collisionGroups[mapping.g1],
                g2 = self.collisionGroups[mapping.g2];
            mapping.isActive = (
                g1 !== undefined && g1 !== null && g1.length &&
                g2 !== undefined && g2 !== null && g2.length)
        })
    };

    Game.prototype.handleCollisions = function () {
        const self = this;
        self.collisionGroupMappings.forEach((mapping) => {
            if (!mapping.isActive) return;
            let g2 = self.collisionGroups[mapping.g2];
            self.collisionGroups[mapping.g1].forEach((entity1) => {
                for (let i = 0; i < g2.length; i++) {
                    let entity2 = g2[i];
                    if (entity1 !== entity2 && Entity.CollideRect(entity1, entity2)) {
                        entity1.onCollision(entity2, mapping);
                    }
                }
            });
        })
    };

    Game.prototype.addComets = function () {
        const self = this;
        if (!self.collisionGroups['comets']) self.collisionGroups.comets = [];
        if (self.collisionGroups['comets'].length >= self.maxComets) return;

        // don't add a comet every frame
        if (Math.random() < self.cometSpawnRate) {
            // but do increase spawn rate every frame (up to its cap)
            if (self.cometSpawnRate < self.options.cometSpawnRate.max) {
                self.cometSpawnRate += self.options.cometSpawnRate.increase;
            }

            let isXFixed = Math.random() < .5, // fix x or y axis for position (fixed x axis means it'll be spawned at the left or right screen edge)
                mulX = Math.random() < .5 ? -1 : 1, // speed multiplicator for x-axis
                mulY = Math.random() < .5 ? -1 : 1, // speed multiplicator for y-axis
                x, y, vx, vy;

            // starting position left or right from screen
            if (isXFixed) {
                if (mulX === -1) x = self.width + 1;
                else x = -1;
                y = Math.random() * self.height;
            }
            // starting position over or under screen
            else {
                if (mulY === -1) y = self.height + 1;
                else y = -1;
                x = Math.random() * self.width;
            }

            // random speed
            vx = Math.random() * self.cometMaxSpeed * mulX;
            vy = Math.random() * self.cometMaxSpeed * mulY;

            // random size / gfx
            let r = Math.random(),
                gfx;
            if (r < .33) gfx = 'comet32';
            else if (r < .66) gfx = 'comet48';
            else gfx = 'comet64';

            // create comet entity
            let c = self.createEntityEx(Comet, {
                gfx: gfx,
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                r: Math.random() * Math.PI,
                rGfxV: Math.random() * .06 - .03
            });
            self.addToCollisionGroup('comets', c);
        }
    };

    Game.prototype.setScore = function (val) {
        const self = this;
        if (val === undefined || val === null) val = self.score + 1;
        self.setElValue()
    };

    Game.prototype.setElValue = function (name, val) {
        const self = this;
        let el = self.el[name];
        if (!el) return;

        self.score = val;
        self.scoreCounter.innerHTML = `Score: ${self.score}`;
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

    Game.prototype.win = function(player) {
        const self = this;
        self.showText(`${player.name} wins!`);
        self.showMetaText('( click anywhere to play again )');
        self.isRunning = false;
    };

    Game.prototype.draw = function(player) {
        const self = this;
        self.showText(`Draw!`);
        self.showMetaText('( click anywhere to play again )');
        self.isRunning = false;
    };

    Game.prototype.loose = function () {
        const self = this;
        self.showText('GAME OVER');
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
                img.width_2 = img.width / 2;
                img.height_2 = img.height / 2;
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

new Game();