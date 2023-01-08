import { BoxGeometry, Mesh, MeshNormalMaterial } from "three";
import "../css/style.css";
import { Sketch } from "./sketch";

const cube = new Mesh(new BoxGeometry(25, 25, 25), new MeshNormalMaterial());

const onFixedUpdate = (_delta: number, elapsed: number) => {
  cube.rotation.set(elapsed, elapsed * 0.5, elapsed * 0.25);
};

const sketch = new Sketch({
  containerEl: document.querySelector("#app")!,
  onFixedUpdate,
});

sketch.scene.add(cube);
sketch.resume();
