import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import p5 from "p5";

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "../node_modules/@mediapipe/tasks-vision/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "../hand_landmarker.task",
      //CPUだと若干重くなりました。
      delegate: "CPU",
      // delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  return handLandmarker;
};

export const sketch = (p: p5) => {
  let handLandmarker: HandLandmarker;
  let lastVideoTime = -1;
  let capture: p5.Element;
  let video: HTMLVideoElement;

  const setup = async () => {
    //handLandmarkの検出で利用
    handLandmarker = await createHandLandmarker();

    //キャンバスを生成し#App直下に配置
    const canvas = p.createCanvas(640, 480);
    const app = document.querySelector<HTMLDivElement>("#app")!;
    canvas.parent(app);

    //キャプチャ設定
    capture = p.createCapture("video");
    capture.size(640, 480);
    video = capture.elt;
    capture.hide();
  };
  const draw = () => {
    //必要なデータが揃っていない場合はdrawを見送り
    if (!handLandmarker || !video.srcObject) return;
    if (!video.videoWidth || !video.videoWidth) return;
    if (video.currentTime === lastVideoTime) return;

    p.pop();
    p.push();
    //キャンバスを反転
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.displayWidth = p.width;
    p.displayHeight = (p.width * capture.height) / capture.width;

    p.image(capture, 0, 0, p.displayWidth, p.displayHeight);
    //ここでhandLandmarkの検出を行う
    //result.handLandmarksは手ごとのhandLandmarkの配列
    const results = handLandmarker.detectForVideo(video, video.currentTime);
    lastVideoTime = video.currentTime;
    if (results.landmarks.length <= 0) return;
    for (const landmarks of results.landmarks) {
      for (let i = 0; i < landmarks.length; i++) {
        //全てのhandLandmarkを円で描画
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
  };

  p.setup = setup;
  p.draw = draw;
};
