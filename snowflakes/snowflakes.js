var startSnowflakes = function (id) {
  var canvas = document.getElementById(id);
  var ctx = canvas.getContext("2d");

  var options = {
    maxParticles: 200,
    minRadius: 1,
    maxRadius: 5,
    gravity: 0.6,
    windTurningSpeed: 0.001,
    windSpeed: 0.25,
  };

  // initialising constants
  var particles = [],
    W = window.innerWidth,
    H = window.innerHeight,
    H3 = H / 3,
    PI2 = Math.PI * 2,
    WBuff = W + options.maxRadius,
    HBuff = H + options.maxRadius;

  var phiWind = 0,
    vx = 0;

  canvas.width = W;
  canvas.height = H;

  // create particles
  for (var i = 0; i < options.maxParticles; i++) {
    var r = randrange(options.minRadius, options.maxRadius);
    particles.push({
      x: randrange(W),
      y: randrange(H),
      r: r,
      m: r * Math.random(),
      vy: options.gravity * r * 0.5,
    });
  }

  function randrange(min, max) {
    if (min && !max) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min) + min);
  }

  function update() {
    window.requestAnimationFrame(update);

    // calc new ax
    phiWind = (phiWind + options.windTurningSpeed) % PI2;
    vx = options.windSpeed * Math.cos(phiWind) * 0.2;

    particles.forEach(function (p) {
      p.x += vx * p.m * p.r;
      p.y += p.vy;

      // check if particle must be reset
      if (p.y > HBuff) {
        // particle at bottom
        p.y = -options.maxRadius * 3;
        p.x = randrange(W);
      } else if (p.x < -options.maxRadius) {
        // particle exit from the left -> reset on right side
        p.x = W;
      } else if (p.x > WBuff) {
        // particle exit from the right -> reset on left side
        p.x = 0;
      }
    });

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    particles.forEach(function (p) {
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, PI2, true);
    });
    ctx.fill();
  }

  update();
};
