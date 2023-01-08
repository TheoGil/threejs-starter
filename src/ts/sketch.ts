import gsap from "gsap";
import { Clock, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";

const settings = {
  renderer: {
    antialias: true,
    alpha: false,
    clearColor: 0xeeeeee,
    maxPixelRatio: 1,
    powerPreference: "high-performance",
  },
  camera: {
    fov: 45,
    near: 1,
    far: 1000,
    position: new Vector3(0, 0, 100),
  },
  fixedUpdateInterval: 1 / 60,
};

class Sketch {
  #containerEl!: HTMLElement;
  #renderer!: WebGLRenderer;
  #camera!: PerspectiveCamera;

  #boundUpdate: (delta: number, elapsed: number) => void;
  #onUpdate?: (delta: number, elapsed: number) => void;
  #onFixedUpdate?: (delta: number, elapsed: number) => void;

  #scene = new Scene();
  #clock = new Clock();
  #fixedTimeAcculumator = 0;

  ////////////////////
  // Setup methods
  ////////////////////

  constructor({
    containerEl,
    onFixedUpdate,
  }: {
    containerEl: HTMLElement;
    onUpdate?: (delta: number, elapsed: number) => void;
    onFixedUpdate?: (delta: number, elapsed: number) => void;
  }) {
    this.#boundUpdate = this.#update.bind(this);

    this.#containerEl = containerEl;
    this.#initRenderer();
    this.#initCamera();

    this.#onUpdate = onFixedUpdate;
    this.#onFixedUpdate = onFixedUpdate;
  }

  #initRenderer() {
    this.#renderer = new WebGLRenderer({
      antialias: settings.renderer.antialias,
      alpha: settings.renderer.alpha,
      powerPreference: settings.renderer.powerPreference,
    });

    // Ceil renderer pixel ratio to avoid over-expensive renders
    this.#renderer.setPixelRatio(
      Math.min(settings.renderer.maxPixelRatio, window.devicePixelRatio)
    );

    this.#renderer.setClearColor(settings.renderer.clearColor);

    this.#setRendererSize();

    this.#containerEl.appendChild(this.#renderer.domElement);
  }

  #setRendererSize() {
    const { width, height } = this.#containerEl.getBoundingClientRect();
    this.#renderer.setSize(width, height);
  }

  #initCamera() {
    this.#camera = new PerspectiveCamera(
      settings.camera.fov,
      this.#renderer.domElement.width / this.#renderer.domElement.height,
      settings.camera.near,
      settings.camera.far
    );

    this.#camera.position.copy(settings.camera.position);
  }

  ////////////////////
  // Lifecycle methods
  ////////////////////

  #update() {
    const delta = this.#clock.getDelta();
    const elapsed = this.#clock.getElapsedTime();

    this.#onUpdate?.(delta, elapsed);

    this.#fixedTimeAcculumator += delta;
    while (this.#fixedTimeAcculumator >= settings.fixedUpdateInterval) {
      this.#fixedTimeAcculumator -= settings.fixedUpdateInterval;

      this.#fixedUpdate(delta, elapsed);
    }

    this.#renderer.render(this.#scene, this.#camera);
  }

  #fixedUpdate(delta: number, elapsed: number) {
    this.#onFixedUpdate?.(delta, elapsed);
  }

  resume() {
    gsap.ticker.add(this.#boundUpdate);
  }

  pause() {
    gsap.ticker.remove(this.#boundUpdate);
  }

  ////////////////////
  // Getters / setters methods
  ////////////////////

  get scene() {
    return this.#scene;
  }
}

export { Sketch };
