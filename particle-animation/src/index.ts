const GET_PARTICLE_COUNT = () => window.innerWidth * .08;
const PARTICLE_SIZE_MIN = 3;
const PARTICLE_SIZE_MAX = 7;
const PARTICLE_SPEED_MIN = .02;
const PARTICLE_SPEED_MAX = .08;
const EDGE_MAX_LENGTH = 150;
const EDGE_WIDTH = .3;  // edge stroke width

const SCREEN_MARGIN = 80;   // particles can move x pixels out of the screen before bouncing

// -- CONFIG FUNCTIONS --
const GET_CONFIG_SCHWEITZER = () => {
  const C_BG = 'hsla(215, 100%, 94%, 0.8)';
  const GET_C_PARTICLE = () => `hsla(218, ${random(100)}%, ${random(100)}%, 0.7)`;
  const GET_C_EDGE = (opacity: number) => `hsla(218, 80%, 2%, ${opacity})`

  return {C_BG, GET_C_PARTICLE, GET_C_EDGE};
}

const GET_CONFIG_IUCON_HR = () => {
  const C_BG = 'hsla(0, 0%, 0%)';

  const PARTICLE_COLORS = [
    'hsl(112, 100%, 36%)',
    'hsl(306, 100%, 36%)',
    'hsl(42, 100%, 45%)',
    'hsl(32, 100%, 38%)',
    'hsl(184, 100%, 43%)',
    'hsl(205, 99%, 39%)'
  ];

  // const GET_C_PARTICLE = () => `hsla(218, ${random(100)}%, ${random(100)}%, 0.7)`;
  const GET_C_PARTICLE = () => PARTICLE_COLORS[randInt(0, PARTICLE_COLORS.length)];
  const GET_C_EDGE = (opacity: number) => `hsla(0, 0%, 2%, ${opacity})`;

  return {C_BG, GET_C_PARTICLE, GET_C_EDGE};
}
const {C_BG, GET_C_PARTICLE, GET_C_EDGE} = GET_CONFIG_SCHWEITZER();

// -- HELPER METHODS --
const random = (min: number, max?: number) => {
  let _min, _max;
  if (max == null) {
    _min = 0;
    _max = min;
  } else {
    _min = min;
    _max = max;
  }
  return Math.random() * (_max - _min) + _min;
}
const randInt = (min: number, max?: number) => Math.round(random(min, max));
const degreeToRadians = (val: number) => val * Math.PI / 180;

// -- APP --

const _window = window as any;
_window.__Particle_app = class App {
  private particles: Particle[] = [];
  private edges: Edge[] = [];
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private lastAnimationFrame: number = -1;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Couldn't find canvas with id "${canvasId}"`);
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!this.ctx) throw new Error('Couldn\'t get context from canvas');
  }

  init() {
    this.particles = this.edges = [];
    for (let i = 0; i < GET_PARTICLE_COUNT(); i++) this.particles.push(Particle.create(this.canvas))
    this.edges = App.connectAllParticles(this.particles);
    this.mainloop();
  }

  destroy() {
    if (this.lastAnimationFrame !== -1) cancelAnimationFrame(this.lastAnimationFrame);
    this.lastAnimationFrame = -1;
    this.particles = [];
    this.edges = [];
  }

  mainloop() {
    this.update();
    this.render();
    this.lastAnimationFrame = window.requestAnimationFrame(this.mainloop.bind(this));
  }

  update() {
    this.particles.forEach(p => p.update(this.canvas));
    this.edges.forEach(e => e.update());
  }

  render() {
    this.ctx.fillStyle = C_BG;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fill();

    this.edges.forEach(e => e.render(this.ctx));
    this.particles.forEach(p => p.render(this.ctx));
  }

  static connectAllParticles(particles: Particle[]): Edge[] {
    let edges = [];
    for (let i = 0; i < particles.length - 1; i++) {
      let p0 = particles[i];
      for (let j = (i + 1); j < particles.length - 1; j++) {
        edges.push(new Edge(p0, particles[j]));
      }
    }
    return edges;
  }
}

class Particle {
  x: number;
  y: number;
  private readonly radius: number;
  private angle: number;              // angle in degrees
  private radians: number = 0;        // angle in radians
  private speed: number;
  private vx: number = 0;             // -> calc once, then don't use sin/cos each frame
  private vy: number = 0;             // -> calc once, then don't use sin/cos each frame
  private readonly color: string;

  constructor(x: number, y: number, radius: number, angle: number, speed: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angle = angle;
    this.speed = speed;
    this.color = color;

    this.updatePreCalculatedValues()
  }

  static create(canvas: HTMLCanvasElement) {
    const x = random(canvas.width);
    const y = random(canvas.height);
    const radius = random(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX);
    const angle = random(360);
    const speed = random(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX);
    const color = GET_C_PARTICLE();
    return new Particle(x, y, radius, angle, speed, color);
  }

  update(canvas: HTMLCanvasElement) {
    this.x += this.vx;
    this.y += this.vy;

    // check screen boundaries
    if (this.x < -SCREEN_MARGIN || this.x > canvas.width + SCREEN_MARGIN) {
      this.setAngle(180 - this.angle);
    } else if (this.y < -SCREEN_MARGIN || this.y > canvas.height + SCREEN_MARGIN) {
      this.setAngle(360 - this.angle);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    // ctx.closePath()
    ctx.fill();
  }

  setAngle(val: number) {
    this.angle = val;
    this.updatePreCalculatedValues();
  }

  setSpeed(val: number) {
    this.speed = val;
    this.updatePreCalculatedValues();
  }

  private updatePreCalculatedValues() {
    this.radians = degreeToRadians(this.angle);
    this.vx = Math.cos(this.radians) * this.speed;
    this.vy = Math.sin(this.radians) * this.speed;
  }
}

class Edge {
  private p0: Particle;
  private p1: Particle;
  private strength: number;

  constructor(p0: Particle, p1: Particle) {
    this.p0 = p0;
    this.p1 = p1;
    this.strength = 0;
  }

  update() {
    const dx = this.p0.x - this.p1.x;
    const dy = this.p0.y - this.p1.y;
    if (dx > EDGE_MAX_LENGTH || dy > EDGE_MAX_LENGTH) this.strength = 0
    else {
      const distance = Math.hypot(dx, dy);
      this.strength = 1 - (distance / EDGE_MAX_LENGTH)
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.strength <= 0) return;
    ctx.beginPath();
    ctx.strokeStyle = GET_C_EDGE(this.strength);
    ctx.lineWidth = EDGE_WIDTH;
    ctx.moveTo(this.p0.x, this.p0.y);
    ctx.lineTo(this.p1.x, this.p1.y);
    ctx.stroke();
  }
}
