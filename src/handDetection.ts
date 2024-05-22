import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

export const handDetection = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
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
    const drawingUtils = new DrawingUtils(ctx);
    return { handLandmarker, drawingUtils };
  };

  let lastVideoTime = -1;
  const renderLoop = (
    handLandmarker: HandLandmarker,
    drawingUtils: DrawingUtils
  ) => {
    if (video.currentTime !== lastVideoTime) {
      const results = handLandmarker.detectForVideo(video, video.currentTime);
      lastVideoTime = video.currentTime;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            {
              color: "#00FF00",
              lineWidth: 3,
            }
          );
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            radius: 2,
          });
        }
      }
      ctx.restore();

      //   ctx.save();
      //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      //   ctx.scale(-1, 1);
      //   ctx.translate(-canvas.width, 0);
      //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      //   if (results.landmarks.length > 0) {
      //     for (const landmarks of results.landmarks) {
      //       console.log(landmarks);
      //       for (const landmark of landmarks) {
      //         ctx.fillStyle = "#0000ff";
      //         ctx.fillRect(
      //           landmark.x * canvas.width,
      //           landmark.y * canvas.height,
      //           10,
      //           10
      //         );
      //       }
      //       for (let i = 0; i < connection.length; i++) {
      //         console.log(connection[i][0], connection[i][1]);
      //         ctx.beginPath();
      //         if (landmarks[connection[i][0]] && landmarks[connection[i][1]]) {
      //           ctx.moveTo(
      //             landmarks[connection[i][0]].x * canvas.width,
      //             landmarks[connection[i][0]].y * canvas.height
      //           );
      //           ctx.lineTo(
      //             landmarks[connection[i][1]].x * canvas.width,
      //             landmarks[connection[i][1]].y * canvas.height
      //           );
      //           ctx.stroke();
      //         }
      //       }
      //     }
      //   }
    }

    window.requestAnimationFrame(() =>
      renderLoop(handLandmarker, drawingUtils)
    );
  };
  const { handLandmarker, drawingUtils } = await initializeMediaPipe();
  renderLoop(handLandmarker, drawingUtils);
};
