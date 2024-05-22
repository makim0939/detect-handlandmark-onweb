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
    capture.size(640, 480);
    const app = document.querySelector<HTMLDivElement>("#app")!;
    canvas.parent(app);
    video = capture.elt;
    capture.hide();
  };
  const draw = () => {
    if (!handLandmarker || !video.srcObject) return;

    if (video.currentTime === lastVideoTime) return;
    // p.background(0);
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.displayWidth = p.width;
    p.displayHeight = (p.width * capture.height) / capture.width;
    p.image(capture, 0, 0, p.displayWidth, p.displayHeight);
    const results = handLandmarker.detectForVideo(video, video.currentTime);
    lastVideoTime = video.currentTime;
    if (results.landmarks.length > 0) {
      console.log(results.landmarks);

      if (results.landmarks.length > 1) {
        p.beginShape();
        p.noFill();
        p.stroke(255);
        p.strokeWeight(3);
        p.vertex(
          results.landmarks[0][8].x * p.displayWidth,
          results.landmarks[0][8].y * p.displayHeight
        );
        p.vertex(
          results.landmarks[1][8].x * p.displayWidth,
          results.landmarks[1][8].y * p.displayHeight
        );
        p.vertex(
          results.landmarks[1][4].x * p.displayWidth,
          results.landmarks[1][4].y * p.displayHeight
        );
        p.vertex(
          results.landmarks[0][4].x * p.displayWidth,
          results.landmarks[0][4].y * p.displayHeight
        );
        p.vertex(
          results.landmarks[0][8].x * p.displayWidth,
          results.landmarks[0][8].y * p.displayHeight
        );
        p.endShape();
      }
      for (const landmarks of results.landmarks) {
        for (let i = 0; i < landmarks.length; i++) {
          p.fill(255, 0, 0);
          p.noStroke();
          p.ellipse(
            landmarks[i].x * p.displayWidth,
            landmarks[i].y * p.displayHeight,
            10,
            10
          );
        }
      }
      p.pop();
    }
  };

  p.setup = setup;
  p.draw = draw;
};
