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
const connection: number[][] = [];
for (let i = 0; i < 20; i++) {
  if (i % 4 !== 0) {
    connection.push([i, i + 1]);
  } else {
    if (i < 4 || 16 < i) continue;
    connection.push([i + 1, i + 5]);
  }
}
connection.push([0, 1], [0, 5], [0, 17]);
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
        for (let i = 0; i < connection.length; i++) {
          console.log(connection[i][0], connection[i][1]);
          ctx.beginPath();
          if (landmarks[connection[i][0]] && landmarks[connection[i][1]]) {
            ctx.moveTo(
              landmarks[connection[i][0]].x * canvas.width,
              landmarks[connection[i][0]].y * canvas.height
            );
            ctx.lineTo(
              landmarks[connection[i][1]].x * canvas.width,
              landmarks[connection[i][1]].y * canvas.height
            );
            ctx.stroke();
          }
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
