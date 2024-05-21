import p5 from "p5";
import { handDetection } from "./handDetection";
import "./style.css";
import { sketch } from "./handDetectionP5";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = ``;
// const video = document.getElementById("video") as HTMLVideoElement;
const video = document.createElement("video");
video.autoplay = true;
video.id = "video";
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

new p5(sketch);
