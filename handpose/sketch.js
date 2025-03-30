// ✅ 전체 코드 (불필요한 eraseMode 제거 & 제스처 기능: 주먹 = 전체삭제, 손 펴기 = Hello 출력)

let video, handpose, predictions = [];
let elements = []; // 화면에 그려질 요소들 (선, 텍스트, 이모지 등)
let drawMode = false; // 그리기 모드 상태
let drawPath = []; // 선을 구성하는 점들
let smoothPos = null; // 손가락 위치 부드럽게 만들기용
let lastGesture = ""; // 마지막으로 인식된 제스처
let gestureCooldown = 800; // 제스처 중복 방지 시간 간격(ms)
let lastGestureTime = 0; // 마지막 제스처 인식 시점

// 버튼들 정의 (이모지 떨어뜨리는 기능)
let buttons = [
  { label: "🍎", x: 40, y: 20, w: 60, h: 60, emoji: "🍎" },
  { label: "🌟", x: 120, y: 20, w: 60, h: 60, emoji: "🌟" }
];

function setup() {
  createCanvas(700, 500);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // ml5.js의 Handpose 모델 로드
  handpose = ml5.handpose(video, () => {
    console.log("🤖 Handpose model loaded!");
  });
  handpose.on("predict", results => predictions = results);

  textSize(16);
}

function draw() {
  background(255);

  // 좌우 반전된 웹캠 영상 출력
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, width - 670, 10, 640, 480);
  pop();

  drawKeypoints();    // 손가락 관절 시각화 (빨간 점)
  drawElements();     // 화면에 존재하는 요소 그리기
  drawWithFinger();   // 그리기 모드일 경우 검지로 그림
  drawButtons();      // 이모지 버튼 그리기
  checkButtonHover(); // 버튼 위에 손 올렸을 때 반응
  handleGestures();   // 제스처 인식 및 처리

  // 일정 시간이 지난 요소 제거 (선 제외)
  const now = millis();
  elements = elements.filter(e => now - e.time < 5000 || e.type === "line");
}

function drawKeypoints() {
  // 손 관절 위치에 작은 원을 그려 시각화
  predictions.forEach(hand => {
    hand.landmarks.forEach(([x, y]) => {
      const sx = map(video.width - x, 0, video.width, 30, 670);
      const sy = map(y, 0, video.height, 10, 490);
      fill(255, 0, 0);
      noStroke();
      circle(sx, sy, 6);
    });
  });
}

function drawElements() {
  // 화면에 있는 요소들을 반복하며 그림
  for (let e of elements) {
    if (e.type === "emoji") {
      // 이모지는 아래로 천천히 떨어짐
      textSize(40);
      text(e.content, e.x, e.y += 1);
    } else if (e.type === "text") {
      // 텍스트는 고정 위치에 표시
      textSize(24);
      fill(0);
      text(e.content, e.x, e.y);
    } else if (e.type === "line") {
      // 선은 drawPath의 점들을 연결하여 그림
      noFill();
      stroke(0);
      strokeWeight(3);
      beginShape();
      for (let pt of e.points) vertex(pt.x, pt.y);
      endShape();
    }
  }
  textSize(16);
}

function drawWithFinger() {
  // drawMode일 때 검지 위치로 선을 그림
  if (!drawMode || predictions.length === 0) return;

  const raw = predictions[0].landmarks[8]; // 검지 끝 위치
  let x = map(video.width - raw[0], 0, video.width, 30, 670);
  let y = map(raw[1], 0, video.height, 10, 490);

  // 이전 위치와 선형 보간하여 부드럽게
  if (smoothPos) {
    x = lerp(smoothPos.x, x, 0.3);
    y = lerp(smoothPos.y, y, 0.3);
  }
  smoothPos = { x, y };

  drawPath.push({ x, y }); // 현재 점 저장

  // 선 그리기
  stroke(0);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let pt of drawPath) vertex(pt.x, pt.y);
  endShape();
}

function drawButtons() {
  // 화면 상단의 이모지 버튼들
  for (let b of buttons) {
    fill(255);
    stroke(0);
    rect(b.x, b.y, b.w, b.h, 10);
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text(b.label, b.x + b.w / 2, b.y + b.h / 2);
  }
}

function checkButtonHover() {
  // 검지 위치가 버튼 위에 있을 경우 이모지를 추가
  if (predictions.length === 0) return;

  const raw = predictions[0].landmarks[8];
  const x = map(video.width - raw[0], 0, video.width, 30, 670);
  const y = map(raw[1], 0, video.height, 10, 490);

  for (let b of buttons) {
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
      elements.push({
        type: "emoji",
        content: b.emoji,
        x: random(100, 600),
        y: 80,
        time: millis()
      });
    }
  }
}

function getExtendedFingers(lm) {
  // 손가락이 펴졌는지 판단하여 리스트 반환
  const extended = [];
  if (lm[4][0] > lm[3][0] + 5) extended.push(1); // 엄지
  if (lm[8][1] < lm[6][1] - 5) extended.push(2); // 검지
  if (lm[12][1] < lm[10][1] - 5) extended.push(3); // 중지
  if (lm[16][1] < lm[14][1] - 5) extended.push(4); // 약지
  if (lm[20][1] < lm[18][1] - 5) extended.push(6); // 새끼
  return extended;
}

function handleGestures() {
  // 제스처 인식 및 각 기능 연결
  if (predictions.length === 0) return;

  const now = millis();
  const lm = predictions[0].landmarks.map(([x, y]) => [video.width - x, y]);
  const extended = getExtendedFingers(lm);

  let gesture = "";

  // ✏️ 엄지+검지 펴짐 → 그리기 모드 전환
  if (extended.includes(1) && extended.includes(2)) {
    gesture = "draw";
    drawMode = true;
  }
  // 👊 손가락 거의 다 접힘 → 전체 요소 삭제
  else if (extended.length <= 1) {
    gesture = "clear";
    elements = [];
    drawMode = false;
  }
  // ✋ 손가락 대부분 펴짐 → "Hello" 텍스트 출력
  else if (extended.length >= 4) {
    gesture = "hello";
    const centerX = random(100, 600);
    const centerY = random(100, 400);
    elements.push({ type: "text", content: "Hello", x: centerX, y: centerY, time: now });
    drawMode = false;
  }

  // 제스처가 바뀐 경우에만 반응 (중복 방지)
  if (gesture !== lastGesture && now - lastGestureTime > gestureCooldown) {
    // draw 제스처에서 손 뗐을 때 선 저장
    if (lastGesture === "draw" && drawPath.length > 0) {
      elements.push({ type: "line", points: [...drawPath], time: now });
      drawPath = [];
    }

    lastGesture = gesture;
    lastGestureTime = now;

    if (gesture === "draw") drawPath = [];
  }
}