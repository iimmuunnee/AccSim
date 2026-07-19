# AccSim — AI Accelerator Simulator

> Systolic Array 기반 AI 가속기의 **사이클 정확도(cycle-accurate) 시뮬레이터**.
> 모든 연산 결과를 **PyTorch 레퍼런스와 수치 비교로 검증**하며(테스트 33건),
> 그 내부를 인터랙티브 웹 전시관에서 시각적으로 탐험할 수 있습니다.

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![pytest](https://img.shields.io/badge/pytest-33%20passed-0A9EDC?logo=pytest&logoColor=white)
![PyTorch](https://img.shields.io/badge/Reference-PyTorch-EE4C2C?logo=pytorch&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-float64-013243?logo=numpy&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)

**Live Demo: [https://acc-sim.vercel.app](https://acc-sim.vercel.app)**

---

## Project Overview

### AI 가속기란 무엇인가

AI 모델은 해마다 수십 배씩 커지고 있습니다. ChatGPT가 답을 생성하고, 자율주행 차가 주변을 판단하는 — 이 모든 것의 뒤에는 엄청난 양의 **행렬 곱셈(Matrix Multiplication)** 이 있습니다. CPU는 범용 작업용이고 GPU도 원래 그래픽 처리용이라, AI 연산의 규모가 수천억 번의 곱셈-덧셈에 이르자 속도와 전력 효율을 감당할 수 없게 되었습니다.

그래서 등장한 것이 **AI 전용 가속기**입니다. Google TPU, Tesla FSD Chip 같은 칩들의 핵심에는 **Systolic Array** — 수백 개의 작은 연산 유닛이 격자 형태로 배열되어, 데이터를 흘려보내며 동시에 계산하는 구조 — 가 있습니다.

### 왜 시뮬레이터인가

반도체 칩 하나를 만드는 데는 수개월과 수백억 원이 듭니다. 설계를 잘못하면 전부 다시 만들어야 하므로, 실제 칩 제작 전에 **소프트웨어로 먼저 "리허설"을 하는 것**이 필수입니다. AccSim은 가상의 가속기를 소프트웨어로 구현하고, 그 위에서 실제 AI 모델(태양광 발전량 예측 LSTM — [SolarX](https://github.com/iimmuunnee/SolarX) 프로젝트의 학습 모델)을 추론 실행합니다.

- 매 클럭 사이클마다 데이터 흐름, 연산 유닛(PE) 상태, 메모리 접근을 추적합니다
- PyTorch 모델 → 컴파일러(타일링·ISA 변환) → 시뮬레이션 → 성능 분석의 전체 파이프라인을 구현했습니다
- 결과를 인터랙티브 웹 전시관에서 시각화합니다

### 왜 만들었는가 — HW-SW Co-design 역량 시연

| 역량 | 시연 내용 |
|------|----------|
| **HW 아키텍처 이해** | Systolic Array(weight-stationary)를 사이클 단위로 직접 구현 |
| **컴파일러/스케줄링** | 모델 → 타일링 → ISA 명령어 스트림(9 opcodes) 변환 |
| **검증 방법론** | 전 계층을 PyTorch/NumPy 골든 레퍼런스와 수치 비교 (아래 Verification) |
| **성능 분석** | Roofline 모델, PE 활용률, 사이클 분석 |
| **시각화 & 커뮤니케이션** | 인터랙티브 웹 전시관으로 기술을 직관적으로 전달 |

---

## Verification — 시뮬레이터를 어떻게 믿을 수 있나

사이클 시뮬레이터는 **조용히 틀리기 가장 좋은 소프트웨어**입니다. 연산 결과가 그럴듯하면 데이터플로우가 미묘하게 어긋나도 겉으로 드러나지 않습니다. 그래서 AccSim은 "돌아간다"가 아니라 **"레퍼런스와 일치한다"** 를 개발 기준으로 삼고, 허용 오차를 먼저 정한 뒤 구현을 그 기준에 맞췄습니다.

**검증 기준** — 시뮬레이터의 모든 연산 결과를 골든 레퍼런스와 수치 비교합니다 (전 연산 `np.float64`):

| 검증 대상 | 골든 레퍼런스 | 허용 오차 |
|---|---|---|
| 행렬 곱셈 (Systolic Array 출력) | NumPy `A @ W` | **< 1e-10** |
| LSTM 추론 (게이트 · 은닉 상태) | PyTorch `nn.LSTM` | **< 1e-5** |

이 방식의 검증이 잡아내는 것은 전부 "결과가 그럴듯하게 틀리는" 유형입니다 — weight-stationary 데이터플로우에서 activation(좌→우)·psum(상→하) 진행이 어긋나는 경우, LSTM 게이트 순서(i, f, g, o)와 weight 행 배치가 PyTorch 규약과 다른 경우, 타일 경계에서 부분합이 누락되는 경우 등.

**테스트 33건 구성:**

| 파일 | 건수 | 검증 내용 |
|---|---|---|
| [`tests/test_pe.py`](tests/test_pe.py) | 5 | PE 단위 MAC 연산 |
| [`tests/test_systolic_array.py`](tests/test_systolic_array.py) | 7 | NxN 어레이의 사이클 정확 데이터플로우 |
| [`tests/test_memory.py`](tests/test_memory.py) | 8 | SRAM 3-buffer · DRAM 레이턴시 모델 |
| [`tests/test_controller.py`](tests/test_controller.py) | 4 | ISA 명령어 디스패치 · 실행 |
| [`tests/test_tiler.py`](tests/test_tiler.py) | 5 | 어레이 크기를 초과하는 행렬의 타일링 |
| [`tests/test_lstm.py`](tests/test_lstm.py) | 4 | LSTM end-to-end vs PyTorch 레퍼런스 |

```bash
python -m pytest tests/ -v   # 33 passed
```

---

## Quick Start

### 시뮬레이터 (Python)

```bash
pip install numpy matplotlib
pip install torch        # PyTorch 비교 검증용
pip install pytest       # 테스트용
pip install -e .

python -m pytest tests/ -v               # 테스트 33건
python examples/demo_matmul.py           # 행렬 곱셈 기본 동작
python examples/demo_lstm_inference.py   # 소규모 LSTM 추론
python examples/demo_solarx.py           # SolarX 모델 전체 파이프라인
```

### 웹 전시관 (Next.js + FastAPI)

```bash
# 백엔드
pip install fastapi uvicorn
cd accsim/web && uvicorn app:app --port 8080

# 프론트엔드 (새 터미널)
cd accsim/web/frontend && npm install && npm run dev
# → http://localhost:3000 (/ko/intro로 리다이렉트)
```

> 배포된 사이트에서 바로 체험할 수 있습니다: **[https://acc-sim.vercel.app](https://acc-sim.vercel.app)**
> 백엔드 없이 프론트엔드만 실행해도 내장 fallback 데이터로 Performance Lab·Live Demo가 동작합니다.

**버전 요구사항**: Python 3.11+ · Node.js 18+ · npm 9+

---

## System Architecture

```
PyTorch 모델 → Weight 추출 → 타일링(행렬을 어레이 크기 블록으로 분할)
  → 컴파일러/스케줄러(타일을 ISA 명령어 스트림으로 변환)
  → Controller가 명령어 실행 → Systolic Array 연산 (SRAM/DRAM 계층 경유)
  → 결과 검증(vs PyTorch) & 성능 분석 (Roofline·PE 활용률·사이클)
  → 웹 전시관에서 시각화 & 인터랙션
```

### 프로젝트 구조

```
accsim/
├── core/               # 시뮬레이션 엔진 (C++ 교체 경계)
│   ├── pe.py                   # Processing Element (MAC 연산, weight-stationary)
│   ├── systolic_array.py       # NxN Systolic Array, 사이클 정확 dataflow
│   ├── memory.py               # SRAM 3-buffer + DRAM 레이턴시 모델
│   ├── controller.py           # ISA 명령어 디스패치 & 실행
│   ├── clock.py                # 글로벌 사이클 카운터
│   └── datatypes.py            # 고정소수점 타입
├── compiler/           # 모델 → 명령어 변환
│   ├── instruction.py          # ISA 정의 (9 opcodes)
│   ├── tiler.py                # 행렬 타일링 전략
│   ├── scheduler.py            # 타일 → 명령어 스트림
│   ├── exporter.py             # PyTorch weight 추출
│   └── lstm_compiler.py        # LSTM 전용 컴파일 패스
├── analysis/           # 성능 분석 & 시각화 (Roofline·히트맵·HW vs SW 비교)
├── models/             # NumPy LSTM 레퍼런스 · SolarX 모델 연동
├── web/                # FastAPI 서버 + Next.js 14 전시관 (9 Halls)
└── config.py           # AcceleratorConfig 데이터클래스
```

**ISA (9 opcodes)**: `LOAD_WEIGHT` `LOAD_INPUT` `MATMUL` `STORE` `ACT_SIGMOID` `ACT_TANH` `ELEM_MUL` `ELEM_ADD` `NOP`

### API Endpoints

> **Base URL (배포):** `https://accsim.onrender.com`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | 서버 상태 확인 |
| `GET` | `/api/config` | 하드웨어 설정 조회 |
| `GET` | `/api/demo/{matmul\|lstm\|solarx}` | 데모 시뮬레이션 |
| `POST` | `/api/run` | 커스텀 시뮬레이션 (`array_size`, `batch_size`, `seq_len`, `precision`) |
| `POST` | `/api/run/matmul` | 커스텀 행렬 곱셈 |

---

## Web Exhibition — 결과를 전달하는 시각화 계층

시뮬레이터의 내부 동작을 **기술 전시관(Tech Exhibition)** 컨셉의 웹사이트로 시각화했습니다. 9개의 Hall을 Full-page 스크롤로 관람하며, 3D Systolic Array(Three.js), Roofline 차트·PE 히트맵(D3.js), 실시간 파라미터 실험실을 직접 조작할 수 있습니다. 한국어/영어를 지원하고(`/ko/*`, `/en/*`), 용어 툴팁은 Beginner/Intermediate/Expert 지식 수준별로 설명이 달라집니다.

| Hall | 이름 | 내용 |
|------|------|------|
| 1 | Intro | AI 연산 수요 폭발과 HW 성능 격차 — CPU vs GPU vs Accelerator 비교 경주 |
| 2 | Accelerator | 동일 행렬 연산의 순차/행 병렬/대각선 웨이브 처리 방식 비교 |
| 3 | Chip | Systolic Array 해부 — PE의 MAC 연산, Weight-Stationary 데이터플로우 3D 시각화 |
| 4 | Simulator | Model → Compiler → Simulator → Analysis 파이프라인 |
| 5 | Execution | LSTM 8단계 연산의 Gantt 차트 타임라인 (ISA opcode·사이클 수) |
| 6 | Performance Lab | 어레이 크기·배치·시퀀스 길이 조절 → Roofline·PE 히트맵 실시간 갱신 |
| 7 | Architecture | 6개 모듈의 PCB 스타일 인터랙티브 다이어그램 |
| 8 | Live Demo | 파라미터 선택 → 실제 시뮬레이션 실행 → 메트릭·차트 reveal |
| 9 | About | 프로젝트 요약·기술 스택·개발 동기 |

**Frontend**: Next.js 14 (App Router SSG) · React 18 · TypeScript · Tailwind · Framer Motion · Three.js/R3F · D3.js · next-intl · Zustand
**Backend**: FastAPI + Uvicorn · **배포**: Vercel(FE) + Render(BE)

---

## Troubleshooting

시뮬레이터 코어의 정합성 문제는 [Verification](#verification--시뮬레이터를-어떻게-믿을-수-있나)의 테스트가 개발 중 상시로 잡아냈습니다. 아래는 웹 전시관 구현에서 실제로 디버깅한 이슈들입니다.

### 1. 트랙패드 관성 스크롤과 Scroll Snap의 충돌

- **증상**: CSS `scroll-snap-type: y mandatory` 사용 시, 트랙패드 스와이프 한 번에 2~3개 섹션이 넘어갔다.
- **원인**: 트랙패드의 관성 스크롤이 수십 개의 휠 이벤트를 생성하고, 브라우저는 각각을 독립 스크롤로 처리해 연쇄 전환이 발생했다.
- **해결**: CSS scroll snap을 제거하고 JavaScript 커스텀 구현(`useSnapScroll`)으로 교체했다. 누적 deltaY 임계값 + **제스처 잠금(gesture lock)** 을 도입해 한 제스처에 정확히 한 전환만 발생하도록 제어했다 (제스처 종료는 800ms 무입력으로 판정).

### 2. 3D Canvas 줌과 스냅 스크롤의 이벤트 충돌

- **증상**: 3D Systolic Array 위에서 휠을 굴리면 OrbitControls 줌과 섹션 전환이 동시에 발생했다.
- **원인**: Canvas에서 발생한 휠 이벤트가 bubbling되어 `SnapContainer`의 `handleWheel`까지 도달했다.
- **해결**: `e.target.closest('canvas')` 검사로 Canvas 위 휠 이벤트는 스냅 스크롤에서 early return — OrbitControls가 온전히 줌을 처리하고, Canvas 밖에서는 기존 스냅 동작을 유지했다.

### 3. Hall 전환 시 스크롤 상태 미초기화

- **증상**: 다른 Hall로 이동한 뒤 첫 스크롤에서 마지막 섹션까지 점프하는 버그.
- **원인**: `SnapContainer`가 `layout.tsx`에 있어 페이지 이동 시 재마운트되지 않고, `currentIndex` ref가 이전 Hall의 값을 유지했다.
- **해결**: `useSnapScroll`에 `reset()`을 추가하고 `usePathname()`으로 경로 변경을 감지해 인덱스·스크롤·제스처 상태를 자동 초기화했다.

**그 외**: tooltip 대비·잘림 개선(backdrop-blur + 동적 위치), D3 차트 반응형 처리(viewBox + ResizeObserver), 모바일 레이아웃 대응(vh/vw 기반), Live Demo를 상태 머신(`idle → running → done`) 기반 3단계 UX로 재설계.

---

## Future Improvements

- **C++ 엔진 교체** — `accsim/core/` 전체를 C++로 재구현하고 pybind11로 Python API 유지 (현재 구조가 이 교체 경계를 기준으로 설계됨). 시뮬레이션 속도 10~100배 향상 예상
- **Transformer 지원** — Attention 연산의 가속기 실행·성능 분석
- **멀티 아키텍처 비교** — GPU vs TPU vs Custom Accelerator를 동일 워크로드로 비교
- **Multi-chip 시뮬레이션** — 칩 간 데이터 분산·통신 오버헤드 모델링

---

## Author

| | |
|------|------|
| **이름** | 임휘훈 |
| **학교** | 조선대학교 AI·SW학부 (컴퓨터공학전공) |
| **이메일** | limhwihoon@gmail.com |
| **GitHub** | [github.com/iimmuunnee](https://github.com/iimmuunnee) |

> AI 가속기 아키텍처와 시스템 소프트웨어에 관심이 있는 컴퓨터공학 학부생입니다.
> HW-SW Co-design을 통해 효율적인 AI 추론 시스템을 설계하는 것이 목표입니다.

---

## License

MIT
