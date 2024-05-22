import p5 from "p5";
import "./style.css";
import { sketch } from "./handDetectionP5";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = ``;
new p5(sketch);
