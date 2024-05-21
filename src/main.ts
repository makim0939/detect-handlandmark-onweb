import { handDetection } from "./handDetection";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="canvas"></canvas>
  </div>
`;
// const video = document.getElementById("video") as HTMLVideoElement;
const video = document.createElement("video");
video.autoplay = true;
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

video.addEventListener("loadeddata", () => {
  canvas.style.width = "" + video.videoWidth;
  canvas.style.height = "" + video.videoHeight;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  handDetection(video, canvas, ctx);
});
