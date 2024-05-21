import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import p5 from "p5";

const initializeMediaPipe = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "../node_modules/@mediapipe/tasks-vision/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "../hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  //   const drawingUtils = new DrawingUtils(ctx);
  //   return { handLandmarker, drawingUtils };
  return handLandmarker;
};

const handLandmarker = await initializeMediaPipe();

export const sketch = (p: p5) => {
  let handLandmarker: HandLandmarker;
  let lastVideoTime = -1;
  let video: HTMLVideoElement;
  let videoImage: p5.Graphics;

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
    })().then(() => {
      console.log(handLandmarker);
    });

    video = document.createElement("video");
    video.autoplay = true;
    video.id = "video";
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
    });
    const canvas = p.createCanvas(640, 480);
    const app = document.querySelector<HTMLDivElement>("#app")!;
    canvas.parent(app);
    videoImage = p.createGraphics(640, 480);
  };
  const draw = () => {
    if (!handLandmarker || !video.srcObject) return;
    p.clear();
    p.background(0, 100);
    videoImage.drawingContext.drawImage(
      video,
      0,
      0,
      videoImage.width,
      videoImage.height
    );
    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.displayWidth = p.width;
    p.displayHeight = (p.width * videoImage.height) / videoImage.width;
    p.image(videoImage, 0, 0, p.displayWidth, p.displayHeight);
    p.pop();

    if (video.currentTime !== lastVideoTime) {
      const results = handLandmarker.detectForVideo(video, video.currentTime);
      lastVideoTime = video.currentTime;
      if (results.landmarks.length > 0) {
        for (const landmarks of results.landmarks) {
          p.push();
          p.translate(p.width, 0);
          p.scale(-1, 1);
          p.beginShape();
          p.fill(150, 150, 255);
          p.ellipse(
            landmarks[8].x * p.displayWidth,
            landmarks[8].y * p.displayHeight,
            25,
            25
          );
          p.endShape(p.CLOSE);
          p.pop();

          //   for (const landmark of landmarks) {
          //     p.push();
          //     p.translate(p.width, 0);
          //     p.scale(-1, 1);
          //     p.beginShape();
          //     p.fill(150, 150, 255);
          //     p.ellipse(
          //       landmark.x * p.displayWidth,
          //       landmark.y * p.displayHeight,
          //       10,
          //       10
          //     );
          //     p.endShape(p.CLOSE);
          //     p.pop();
          //   }
        }
      }
    }
  };

  p.setup = setup;
  p.draw = draw;
};
