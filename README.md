# ✋ 제스처 기반 인터랙티브 반응 시스템 (p5.js + ml5.js)

이 프로젝트는 **p5.js**와 **ml5.js(handpose 모델)**를 활용하여 **웹캠 기반 손 제스처로 동작하는 인터랙티브 반응 시스템**을 구현한 과제입니다.

---
## 🎥 과제 시연 영상
[👉 유튜브 링크 삽입 예정]
---

## 📌 과제 개요
- **손 제스처와 UI 버튼을 이용해 반응형 인터페이스를 구현**합니다.
- **칠판처럼 그림을 그리거나 글자를 출력**할 수 있으며,
- **특정 제스처를 통해 전체 지우기 및 텍스트 출력**이 가능합니다.
- **Virtual Camera를 통해 Zoom에서 활용**할 수 있도록 설계되었습니다.

---

## ✅ 구현 조건

### 1. 4개 이상의 반응 동작
| 동작 | 제스처 | 설명 |
|------|--------|------|
| ✏️ 그리기 | 엄지 + 검지 핌 | 검지로 자유롭게 그림을 그림 |
| 🧼 전체 지우기 | 주먹 | 화면의 모든 요소(선, 이모지, 텍스트) 삭제 |
| 👋 Hello 출력 | 손가락 4개 이상 핌 | 랜덤 위치에 “Hello” 텍스트 출력 |
| 🍎 이모지 떨어뜨리기 | 검지를 이모지 버튼 위에 올림 | 해당 이모지가 화면 위에서 아래로 떨어짐 |

### 2. 칠판처럼 글자/그림 작성 가능
- 검지 손가락을 사용해 마우스처럼 자유롭게 선을 그릴 수 있음

### 3. 작성한 글자/그림을 지울 수 있어야 함
- 주먹 제스처를 통해 전체 요소를 삭제할 수 있음

### 4. Virtual Camera 연동 가능
- OBS Studio의 **Virtual Camera 기능**을 활용하여 p5.js 출력화면을 Zoom 카메라로 사용 가능

### 5. Zoom 활용 시연 포함
- 실제 Zoom 화상회의에서 **해당 가상카메라로 손 제스처를 시연**하여 정상 동작을 확인함

---

## 📌 주요 코드 설명 (sketch.js)

- `getExtendedFingers()` : 어떤 손가락이 펴져 있는지 판별
- `handleGestures()` : 현재 손 제스처를 판단하여 그리기/지우기/텍스트 출력 등 동작을 수행
- `drawWithFinger()` : 그리기 모드일 경우, 검지 손가락 위치를 따라 선을 그림
- `checkButtonHover()` : 이모지 버튼 위에 손가락이 위치할 경우 반응 생성
