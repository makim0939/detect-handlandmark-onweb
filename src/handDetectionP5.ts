import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import p5 from "p5";

export const sketch = (p: p5) => {
  let handLandmarker: HandLandmarker;
  let lastVideoTime = -1;
  let capture: p5.Element;
  let video: HTMLVideoElement;

  const setup = () => {
    (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "../node_modules/@mediapipe/tasks-vision/wasm"
      );
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "../hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
    })();

    const canvas = p.createCanvas(640, 480);
    capture = p.createCapture("video");
    const app = document.querySelector<HTMLDivElement>("#app")!;
    canvas.parent(app);
    video = capture.elt;
    video.style.display = "none";
  };
  const draw = () => {
    if (!handLandmarker || !video.srcObject) return;

    p.background(0);
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.displayWidth = p.width;
    p.displayHeight = (p.width * capture.height) / capture.width;
    p.image(capture, 0, 0, p.displayWidth, p.displayHeight);

    if (video.currentTime !== lastVideoTime) {
      const results = handLandmarker.detectForVideo(video, video.currentTime);
      lastVideoTime = video.currentTime;
      if (results.landmarks.length > 0) {
        p.fill(0, 0, 255);
        p.noStroke();
        for (const landmarks of results.landmarks) {
          for (let i = 0; i < landmarks.length; i++) {
            p.ellipse(
              landmarks[i].x * p.displayWidth,
              landmarks[i].y * p.displayHeight,
              10,
              10
            );
          }
        }
      }
    }
    p.pop();
  };

  p.setup = setup;
  p.draw = draw;
};
