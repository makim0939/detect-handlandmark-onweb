import "./style.css";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <video id="video" autoplay></video>
  </div>
`;
const video = document.getElementById("video") as HTMLVideoElement;
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

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
    const detections = handLandmarker.detectForVideo(video, video.currentTime);
    detections.landmarks.forEach((landmarks) => {
      console.log(landmarks);
    });
    lastVideoTime = video.currentTime;
  }
  window.requestAnimationFrame(renderLoop);
}
video.addEventListener("loadeddata", renderLoop);
