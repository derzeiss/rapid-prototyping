const App = (function () {

    function App() {
        const self = this;
    }

    /**
     * Init application
     */
    App.prototype.init = function () {
        const self = this;
        self.canvas = document.getElementById('pixi-app');
        self.stage = new PIXI.Container();
        self.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {view: self.canvas});
        self.objects = {};

        for (let objId in self.objects) {
            if (!self.objects.hasOwnProperty(objId)) continue;
            self.stage.addChild(self.objects[objId]);
        }

        window.onresize = function () {
            self.renderer.resize(window.innerWidth, window.innerHeight);
        };

        console.log(self);
        self.update();
    };

    App.prototype.update = function () {
        const self = this;
        requestAnimationFrame(self.update.bind(self));

        let objId, obj;
        for (objId in self.objects) {
            if (!self.objects.hasOwnProperty(objId)) continue;
            obj = self.objects[objId];
            obj.update();
        }

        self.renderer.render(self.stage);
    };

    App.prototype.addObject = function (name, obj) {
        const self = this;
        self.objects[name] = obj;
        self.stage.addChild(obj);
    };


    App.prototype.addParallax = function () {
        const self = this;

        self.addObject('parallaxPage', new ParallaxObject(self)
            .addLayer(new ParallaxLayer({
                img: 'assets/img/page-complete.png',
                x: 0,
                y: 0,
                z: 0.1
            })));
    };

    App.prototype.addRocket = function () {
        const self = this;

        const rocket = new MouseRocket({
            app: self,
            speed: 2.5,
            turnAcc: .002,
            turnSpeedMax: .03,
            idleRadius: 50,
            scale: .3,
            rotationAdjustment: Math.PI / 2,
            img: 'assets/img/rocket.png'
        });
        rocket.x = 100;
        rocket.y = self.renderer.height - 120;
        rocket.rotation = -Math.PI / 2;

        self.addObject('rocket', rocket);

    };

    return App;
})();