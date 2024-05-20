import "./style.css";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  NormalizedLandmarkListList,
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <video id="video" autoplay></video>
    <canvas id="canvas"></canvas>
  </div>
`;
const video = document.getElementById("video") as HTMLVideoElement;
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const vision = await FilesetResolver.forVisionTasks(
  // path/to/wasm/root
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "../hand_landmarker.task",
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numHands: 2,
});

let lastVideoTime = -1;
function renderLoop() {
  if (video.currentTime !== lastVideoTime) {
    const results = handLandmarker.detectForVideo(video, video.currentTime);
    lastVideoTime = video.currentTime;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (results.landmarks.length > 0) {
      for (const landmarks of results.landmarks) {
        console.log(landmarks);

        for (const landmark of landmarks) {
          ctx.fillStyle = "#0000ff";
          ctx.fillRect(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            10,
            10
          );
        }
      }
    }
  }

  ctx.restore();
  window.requestAnimationFrame(renderLoop);
}
video.addEventListener("loadeddata", () => {
  canvas.style.width = "" + video.videoWidth;
  canvas.style.height = "" + video.videoHeight;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  renderLoop();
});
